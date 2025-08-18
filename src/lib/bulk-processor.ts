import { ExtractedQuiz, ExtractedQuestion } from './pdf-processor';
import { TextProcessor } from './text-processor';
import { PDFProcessor } from './pdf-processor';

export interface BulkProcessingResult {
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  totalQuestions: number;
  uniqueQuestions: number;
  duplicatesRemoved: number;
  mergedQuiz: ExtractedQuiz;
  fileResults: Array<{
    fileName: string;
    success: boolean;
    questions: number;
    errors?: string[];
  }>;
}

export interface DuplicateDetectionResult {
  duplicates: Array<{
    questionId: string;
    text: string;
    occurrences: number;
    files: string[];
  }>;
  uniqueQuestions: ExtractedQuestion[];
  duplicateCount: number;
}

export class BulkProcessor {
  /**
   * Process multiple files and merge them into a single quiz
   */
  static async processMultipleFiles(files: File[]): Promise<BulkProcessingResult> {
    const fileResults: BulkProcessingResult['fileResults'] = [];
    const allQuestions: ExtractedQuestion[] = [];
    let successfulFiles = 0;
    let failedFiles = 0;
    let totalQuestions = 0;

    console.log(`🔄 Processing ${files.length} files...`);

    // Process each file
    for (const file of files) {
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

        // Add questions to collection
        allQuestions.push(...quiz.questions);
        totalQuestions += quiz.questions.length;
        successfulFiles++;

        fileResults.push({
          fileName: file.name,
          success: true,
          questions: quiz.questions.length
        });

        console.log(`✅ ${file.name}: ${quiz.questions.length} questions extracted`);

      } catch (error) {
        console.error(`❌ Failed to process ${file.name}:`, error);
        failedFiles++;
        
        fileResults.push({
          fileName: file.name,
          success: false,
          questions: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }

    // Remove duplicates
    const duplicateResult = this.removeDuplicates(allQuestions);
    const uniqueQuestions = duplicateResult.uniqueQuestions;

    // Create merged quiz
    const mergedQuiz: ExtractedQuiz = {
      title: `Merged Quiz (${files.length} files)`,
      description: `Quiz created from ${successfulFiles} files with ${uniqueQuestions.length} unique questions`,
      subject: 'General',
      questions: uniqueQuestions
    };

    return {
      totalFiles: files.length,
      successfulFiles,
      failedFiles,
      totalQuestions,
      uniqueQuestions: uniqueQuestions.length,
      duplicatesRemoved: duplicateResult.duplicateCount,
      mergedQuiz,
      fileResults
    };
  }

  /**
   * Remove duplicate questions based on text similarity
   */
  static removeDuplicates(questions: ExtractedQuestion[]): DuplicateDetectionResult {
    const duplicates: DuplicateDetectionResult['duplicates'] = [];
    const uniqueQuestions: ExtractedQuestion[] = [];
    const processedTexts = new Set<string>();
    const duplicateMap = new Map<string, Array<{ question: ExtractedQuestion; file: string }>>();

    console.log(`🔍 Checking ${questions.length} questions for duplicates...`);

    questions.forEach(question => {
      // Normalize question text for comparison
      const normalizedText = this.normalizeText(question.text);
      
      if (processedTexts.has(normalizedText)) {
        // This is a duplicate
        const existing = duplicateMap.get(normalizedText);
        if (existing) {
          existing.push({ question, file: 'unknown' });
        } else {
          duplicateMap.set(normalizedText, [{ question, file: 'unknown' }]);
        }
      } else {
        // This is unique
        processedTexts.add(normalizedText);
        uniqueQuestions.push(question);
      }
    });

    // Build duplicate report
    duplicateMap.forEach((occurrences, text) => {
      if (occurrences.length > 1) {
        duplicates.push({
          questionId: occurrences[0].question.id,
          text: occurrences[0].question.text,
          occurrences: occurrences.length,
          files: [...new Set(occurrences.map(o => o.file))]
        });
      }
    });

    console.log(`✅ Found ${duplicates.length} duplicate questions`);
    console.log(`✅ Kept ${uniqueQuestions.length} unique questions`);

    return {
      duplicates,
      uniqueQuestions,
      duplicateCount: duplicates.reduce((sum, d) => sum + d.occurrences - 1, 0)
    };
  }

  /**
   * Normalize text for comparison (remove extra spaces, lowercase, etc.)
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  /**
   * Merge multiple quizzes into one
   */
  static mergeQuizzes(quizzes: ExtractedQuiz[]): ExtractedQuiz {
    const allQuestions: ExtractedQuestion[] = [];
    let totalQuestions = 0;

    quizzes.forEach(quiz => {
      allQuestions.push(...quiz.questions);
      totalQuestions += quiz.questions.length;
    });

    // Remove duplicates
    const duplicateResult = this.removeDuplicates(allQuestions);

    return {
      title: `Merged Quiz (${quizzes.length} sources)`,
      description: `Combined ${quizzes.length} quizzes with ${duplicateResult.uniqueQuestions.length} unique questions`,
      subject: 'General',
      questions: duplicateResult.uniqueQuestions
    };
  }

  /**
   * Validate bulk processing results
   */
  static validateBulkResult(result: BulkProcessingResult): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for failed files
    if (result.failedFiles > 0) {
      warnings.push(`${result.failedFiles} files failed to process`);
    }

    // Check for duplicates
    if (result.duplicatesRemoved > 0) {
      warnings.push(`${result.duplicatesRemoved} duplicate questions were removed`);
    }

    // Check for empty result
    if (result.uniqueQuestions === 0) {
      errors.push('No questions were successfully extracted from any files');
    }

    // Check for too many questions
    if (result.uniqueQuestions > 1000) {
      warnings.push(`Large quiz detected: ${result.uniqueQuestions} questions (consider splitting)`);
    }

    // Check success rate
    const successRate = result.successfulFiles / result.totalFiles;
    if (successRate < 0.5) {
      errors.push(`Low success rate: ${Math.round(successRate * 100)}% of files processed successfully`);
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Generate processing report
   */
  static generateReport(result: BulkProcessingResult): string {
    const validation = this.validateBulkResult(result);
    
    let report = `📊 BULK PROCESSING REPORT\n`;
    report += `========================\n\n`;
    
    report += `📁 Files Processed: ${result.totalFiles}\n`;
    report += `✅ Successful: ${result.successfulFiles}\n`;
    report += `❌ Failed: ${result.failedFiles}\n`;
    report += `📝 Total Questions: ${result.totalQuestions}\n`;
    report += `🔍 Unique Questions: ${result.uniqueQuestions}\n`;
    report += `🗑️ Duplicates Removed: ${result.duplicatesRemoved}\n\n`;

    if (validation.warnings.length > 0) {
      report += `⚠️ WARNINGS:\n`;
      validation.warnings.forEach(warning => {
        report += `  • ${warning}\n`;
      });
      report += `\n`;
    }

    if (validation.errors.length > 0) {
      report += `❌ ERRORS:\n`;
      validation.errors.forEach(error => {
        report += `  • ${error}\n`;
      });
      report += `\n`;
    }

    report += `📄 FILE DETAILS:\n`;
    result.fileResults.forEach(fileResult => {
      const status = fileResult.success ? '✅' : '❌';
      report += `  ${status} ${fileResult.fileName}: ${fileResult.questions} questions`;
      if (fileResult.errors) {
        report += ` (${fileResult.errors.join(', ')})`;
      }
      report += `\n`;
    });

    return report;
  }
}
