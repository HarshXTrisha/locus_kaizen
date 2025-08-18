import { ExtractedQuiz, ExtractedQuestion } from './pdf-processor';
import { TextProcessor } from './text-processor';
import { PDFProcessor } from './pdf-processor';

export type MergeStrategy = 'append' | 'replace' | 'merge-by-topic' | 'smart-merge';

export interface MergeConflict {
  questionId: string;
  originalText: string;
  newText: string;
  sourceFile: string;
  conflictType: 'duplicate' | 'similar' | 'format-mismatch';
  resolution?: 'keep-original' | 'use-new' | 'merge' | 'skip';
}

export interface EnhancedBulkResult {
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  totalQuestions: number;
  uniqueQuestions: number;
  duplicatesRemoved: number;
  conflicts: MergeConflict[];
  mergeStrategy: MergeStrategy;
  mergedQuiz: ExtractedQuiz;
  fileResults: Array<{
    fileName: string;
    success: boolean;
    questions: number;
    errors?: string[];
    processingTime: number;
  }>;
  processingStats: {
    totalTime: number;
    averageTimePerFile: number;
    memoryUsage: string;
  };
}

export interface FileValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  estimatedQuestions: number;
  fileSize: string;
  format: 'pdf' | 'txt' | 'unknown';
}

export class EnhancedBulkProcessor {
  private static mergeStrategies = {
    append: 'Add all questions from new files to existing quiz',
    replace: 'Replace existing quiz with new files',
    'merge-by-topic': 'Merge questions by topic/subject similarity',
    'smart-merge': 'Intelligently merge based on content analysis'
  };

  /**
   * Enhanced bulk processing with smart merge strategies
   */
  static async processMultipleFiles(
    files: File[], 
    strategy: MergeStrategy = 'smart-merge',
    existingQuiz?: ExtractedQuiz
  ): Promise<EnhancedBulkResult> {
    const startTime = Date.now();
    const fileResults: EnhancedBulkResult['fileResults'] = [];
    const allQuestions: ExtractedQuestion[] = [];
    const conflicts: MergeConflict[] = [];
    
    let successfulFiles = 0;
    let failedFiles = 0;
    let totalQuestions = 0;

    console.log(`🔄 Processing ${files.length} files with strategy: ${strategy}`);

    // Validate files first
    const validationResults = await this.validateFiles(files);
    const validFiles = files.filter((_, index) => validationResults[index].isValid);

    // Process each file
    for (const file of validFiles) {
      const fileStartTime = Date.now();
      
      try {
        console.log(`📄 Processing ${file.name}...`);
        
        let quiz: ExtractedQuiz;
        const isPDF = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
        const isTXT = file.type.includes('text/plain') || file.name.toLowerCase().endsWith('.txt');

        if (isPDF) {
          quiz = await PDFProcessor.processPDF(file);
        } else if (isTXT) {
          quiz = await TextProcessor.processTextFile(file);
        } else {
          throw new Error('Unsupported file type');
        }

        // Use questions directly
        const questionsWithSource = quiz.questions;

        // Apply merge strategy
        const mergeResult = await this.applyMergeStrategy(
          strategy, 
          allQuestions, 
          questionsWithSource, 
          existingQuiz
        );

        allQuestions.push(...mergeResult.newQuestions);
        conflicts.push(...mergeResult.conflicts);
        
        totalQuestions += quiz.questions.length;
        successfulFiles++;

        const processingTime = Date.now() - fileStartTime;
        fileResults.push({
          fileName: file.name,
          success: true,
          questions: quiz.questions.length,
          processingTime
        });

        console.log(`✅ ${file.name}: ${quiz.questions.length} questions (${processingTime}ms)`);

      } catch (error) {
        console.error(`❌ Failed to process ${file.name}:`, error);
        failedFiles++;
        
        const processingTime = Date.now() - fileStartTime;
        fileResults.push({
          fileName: file.name,
          success: false,
          questions: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          processingTime
        });
      }
    }

    // Remove duplicates and resolve conflicts
    const deduplicationResult = this.smartDeduplication(allQuestions);
    const uniqueQuestions = deduplicationResult.uniqueQuestions;
    conflicts.push(...deduplicationResult.conflicts);

    // Create merged quiz
    const mergedQuiz: ExtractedQuiz = {
      title: this.generateMergedTitle(files, strategy),
      description: this.generateMergedDescription(files, strategy, uniqueQuestions.length),
      subject: this.detectMergedSubject(uniqueQuestions),
      questions: uniqueQuestions
    };

    const totalTime = Date.now() - startTime;

    return {
      totalFiles: files.length,
      successfulFiles,
      failedFiles,
      totalQuestions,
      uniqueQuestions: uniqueQuestions.length,
      duplicatesRemoved: totalQuestions - uniqueQuestions.length,
      conflicts,
      mergeStrategy: strategy,
      mergedQuiz,
      fileResults,
      processingStats: {
        totalTime,
        averageTimePerFile: totalTime / files.length,
        memoryUsage: this.getMemoryUsage()
      }
    };
  }

  /**
   * Validate files before processing
   */
  static async validateFiles(files: File[]): Promise<FileValidationResult[]> {
    const results: FileValidationResult[] = [];

    for (const file of files) {
      const result: FileValidationResult = {
        isValid: true,
        warnings: [],
        errors: [],
        estimatedQuestions: 0,
        fileSize: this.formatFileSize(file.size),
        format: 'unknown'
      };

      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        result.errors.push('File size exceeds 10MB limit');
        result.isValid = false;
      }

      // Check file type
      const isPDF = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
      const isTXT = file.type.includes('text/plain') || file.name.toLowerCase().endsWith('.txt');
      
      if (isPDF) {
        result.format = 'pdf';
      } else if (isTXT) {
        result.format = 'txt';
      } else {
        result.errors.push('Unsupported file format');
        result.isValid = false;
      }

      // Estimate questions (rough calculation)
      if (result.isValid) {
        result.estimatedQuestions = Math.ceil(file.size / 1000); // Rough estimate
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Apply merge strategy to combine questions
   */
  private static async applyMergeStrategy(
    strategy: MergeStrategy,
    existingQuestions: ExtractedQuestion[],
    newQuestions: ExtractedQuestion[],
    existingQuiz?: ExtractedQuiz
  ): Promise<{
    newQuestions: ExtractedQuestion[];
    conflicts: MergeConflict[];
  }> {
    const conflicts: MergeConflict[] = [];

    switch (strategy) {
      case 'append':
        return {
          newQuestions: [...existingQuestions, ...newQuestions],
          conflicts: []
        };

      case 'replace':
        return {
          newQuestions: newQuestions,
          conflicts: []
        };

      case 'merge-by-topic':
        return this.mergeByTopic(existingQuestions, newQuestions, conflicts);

      case 'smart-merge':
        return this.smartMerge(existingQuestions, newQuestions, conflicts);

      default:
        return {
          newQuestions: [...existingQuestions, ...newQuestions],
          conflicts: []
        };
    }
  }

  /**
   * Merge questions by topic similarity
   */
  private static mergeByTopic(
    existing: ExtractedQuestion[],
    newQuestions: ExtractedQuestion[],
    conflicts: MergeConflict[]
  ): { newQuestions: ExtractedQuestion[]; conflicts: MergeConflict[] } {
    const merged: ExtractedQuestion[] = [...existing];
    
    newQuestions.forEach(newQ => {
      const similarQuestion = this.findSimilarQuestion(newQ, existing);
      
      if (similarQuestion) {
                 conflicts.push({
           questionId: newQ.id,
           originalText: similarQuestion.text,
           newText: newQ.text,
           sourceFile: 'unknown',
           conflictType: 'similar',
           resolution: 'skip'
         });
      } else {
        merged.push(newQ);
      }
    });

    return { newQuestions: merged, conflicts };
  }

  /**
   * Smart merge with content analysis
   */
  private static smartMerge(
    existing: ExtractedQuestion[],
    newQuestions: ExtractedQuestion[],
    conflicts: MergeConflict[]
  ): { newQuestions: ExtractedQuestion[]; conflicts: MergeConflict[] } {
    const merged: ExtractedQuestion[] = [...existing];
    
    newQuestions.forEach(newQ => {
      const duplicate = this.findDuplicateQuestion(newQ, existing);
      const similar = this.findSimilarQuestion(newQ, existing);
      
      if (duplicate) {
               conflicts.push({
         questionId: newQ.id,
         originalText: duplicate.text,
         newText: newQ.text,
         sourceFile: 'unknown',
         conflictType: 'duplicate',
         resolution: 'skip'
       });
      } else if (similar) {
                 conflicts.push({
           questionId: newQ.id,
           originalText: similar.text,
           newText: newQ.text,
           sourceFile: 'unknown',
           conflictType: 'similar',
           resolution: 'merge'
         });
        // Merge similar questions
        const mergedQuestion = this.mergeQuestions(similar, newQ);
        const index = merged.findIndex(q => q.id === similar.id);
        if (index !== -1) {
          merged[index] = mergedQuestion;
        }
      } else {
        merged.push(newQ);
      }
    });

    return { newQuestions: merged, conflicts };
  }

  /**
   * Smart deduplication with conflict detection
   */
  private static smartDeduplication(questions: ExtractedQuestion[]): {
    uniqueQuestions: ExtractedQuestion[];
    conflicts: MergeConflict[];
  } {
    const uniqueQuestions: ExtractedQuestion[] = [];
    const conflicts: MergeConflict[] = [];
    const processedTexts = new Set<string>();

    questions.forEach(question => {
      const normalizedText = this.normalizeText(question.text);
      
      if (processedTexts.has(normalizedText)) {
        const existingQuestion = uniqueQuestions.find(q => 
          this.normalizeText(q.text) === normalizedText
        );
        
        if (existingQuestion) {
                   conflicts.push({
           questionId: question.id,
           originalText: existingQuestion.text,
           newText: question.text,
           sourceFile: 'unknown',
           conflictType: 'duplicate',
           resolution: 'skip'
         });
        }
      } else {
        processedTexts.add(normalizedText);
        uniqueQuestions.push(question);
      }
    });

    return { uniqueQuestions, conflicts };
  }

  /**
   * Find duplicate questions
   */
  private static findDuplicateQuestion(
    question: ExtractedQuestion,
    existing: ExtractedQuestion[]
  ): ExtractedQuestion | null {
    const normalizedText = this.normalizeText(question.text);
    
    return existing.find(q => this.normalizeText(q.text) === normalizedText) || null;
  }

  /**
   * Find similar questions (fuzzy matching)
   */
  private static findSimilarQuestion(
    question: ExtractedQuestion,
    existing: ExtractedQuestion[]
  ): ExtractedQuestion | null {
    const similarityThreshold = 0.8;
    
    for (const existingQ of existing) {
      const similarity = this.calculateSimilarity(question.text, existingQ.text);
      if (similarity > similarityThreshold) {
        return existingQ;
      }
    }
    
    return null;
  }

  /**
   * Calculate text similarity (simple implementation)
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Merge two similar questions
   */
  private static mergeQuestions(q1: ExtractedQuestion, q2: ExtractedQuestion): ExtractedQuestion {
         return {
       ...q1,
       text: q1.text.length > q2.text.length ? q1.text : q2.text,
       options: q1.options && q2.options ? 
         [...new Set([...q1.options, ...q2.options])] : 
         q1.options || q2.options,
       correctAnswer: q1.correctAnswer || q2.correctAnswer
     };
  }

  /**
   * Generate merged quiz title
   */
  private static generateMergedTitle(files: File[], strategy: MergeStrategy): string {
    const fileNames = files.map(f => f.name.replace(/\.[^/.]+$/, ''));
    
    switch (strategy) {
      case 'append':
        return `Merged Quiz (${files.length} files)`;
      case 'replace':
        return `Quiz from ${fileNames[0]}`;
      case 'merge-by-topic':
        return `Topic-Based Quiz (${files.length} sources)`;
      case 'smart-merge':
        return `Smart Merged Quiz (${files.length} files)`;
      default:
        return `Merged Quiz (${files.length} files)`;
    }
  }

  /**
   * Generate merged quiz description
   */
  private static generateMergedDescription(
    files: File[], 
    strategy: MergeStrategy, 
    questionCount: number
  ): string {
    return `Quiz created from ${files.length} files using ${strategy} strategy. Contains ${questionCount} unique questions.`;
  }

  /**
   * Detect subject from merged questions
   */
  private static detectMergedSubject(questions: ExtractedQuestion[]): string {
    // Since ExtractedQuestion doesn't have subject, default to 'General'
    return 'General';
  }

  /**
   * Normalize text for comparison
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  /**
   * Format file size
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get memory usage (approximate)
   */
  private static getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`;
    }
    return 'Unknown';
  }

  /**
   * Get available merge strategies
   */
  static getMergeStrategies(): { [key: string]: string } {
    return this.mergeStrategies;
  }

  /**
   * Resolve merge conflicts
   */
  static resolveConflicts(
    conflicts: MergeConflict[],
    resolutions: { [questionId: string]: 'keep-original' | 'use-new' | 'merge' | 'skip' }
  ): MergeConflict[] {
    return conflicts.map(conflict => ({
      ...conflict,
      resolution: resolutions[conflict.questionId] || 'skip'
    }));
  }
}
