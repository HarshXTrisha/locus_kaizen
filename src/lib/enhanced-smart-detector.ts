import { ExtractedQuestion } from './pdf-processor';

export interface EnhancedFormatDetectionResult {
  detectedFormat: 'mcq' | 'true-false' | 'short-answer' | 'mixed' | 'unknown';
  confidence: number;
  suggestions: string[];
  corrections: string[];
  issues: string[];
  formatPatterns: {
    questionPattern: string;
    optionPattern: string;
    answerPattern: string;
  };
  statistics: {
    totalLines: number;
    questionLines: number;
    optionLines: number;
    answerLines: number;
    emptyLines: number;
  };
}

export interface CustomFormatTemplate {
  id: string;
  name: string;
  description: string;
  patterns: {
    question: string;
    options: string;
    answer: string;
  };
  examples: string[];
  confidence: number;
}

export interface RealTimePreview {
  detectedFormat: string;
  confidence: number;
  previewQuestions: Array<{
    text: string;
    options?: string[];
    correctAnswer?: string;
    confidence: number;
  }>;
  issues: string[];
  suggestions: string[];
}

export class EnhancedSmartDetector {
  private static enhancedPatterns = {
    // Enhanced question patterns
    questionPatterns: {
      numbered: /^(?:Q|Question)?(\d+)[\.:\)]?\s*(.+)$/i,
      lettered: /^[A-Z][\.:\)]?\s*(.+)$/i,
      roman: /^[IVX]+[\.:\)]?\s*(.+)$/i,
      bulleted: /^[\-\*•]\s*(.+)$/i,
      parenthetical: /^\(\d+\)\s*(.+)$/i,
      bracketed: /^\[\d+\]\s*(.+)$/i,
      dash: /^[\-\u2013\u2014]\s*(.+)$/i,
      dot: /^(\d+)\.\s*(.+)$/i,
      colon: /^(\d+):\s*(.+)$/i,
      parenthesis: /^(\d+)\)\s*(.+)$/i
    },

    // Enhanced option patterns
    optionPatterns: {
      lettered: /^[A-Z][\.:\)]\s*(.+?)(?:\s*[✓*]|$)/i,
      numbered: /^\d+[\.:\)]\s*(.+?)(?:\s*[✓*]|$)/i,
      letteredBrackets: /^\[[A-Z]\]\s*(.+?)(?:\s*[✓*]|$)/i,
      numberedBrackets: /^\[\d+\]\s*(.+?)(?:\s*[✓*]|$)/i,
      letteredParentheses: /^\([A-Z]\)\s*(.+?)(?:\s*[✓*]|$)/i,
      numberedParentheses: /^\(\d+\)\s*(.+?)(?:\s*[✓*]|$)/i,
      dash: /^[\-\u2013\u2014]\s*(.+?)(?:\s*[✓*]|$)/i,
      bullet: /^[\-\*•]\s*(.+?)(?:\s*[✓*]|$)/i,
      dot: /^•\s*(.+?)(?:\s*[✓*]|$)/i
    },

    // Enhanced answer patterns
    answerPatterns: {
      answerKey: /^(?:ANSWERS?|ANSWER KEY|Answer):\s*$/i,
      answerKeyEntry: /^(?:Q|Question)?(\d+)[\.:\)]?\s*[A-Z0-9][\.:\)]?\s*(.+)$/i,
      answerLine: /^Answer:\s*[A-Z0-9][\.:\)]?\s*(.+)$/i,
      correctMark: /[✓*]/g,
      correctBracket: /\[✓\]|\[correct\]|\[right\]/gi,
      correctParenthesis: /\(✓\)|\(correct\)|\(right\)/gi
    },

    // Common issues and their fixes
    commonIssues: {
      missingSpaces: /([A-Z0-9])\)([A-Za-z])/g,
      extraSpaces: /\s{2,}/g,
      inconsistentPunctuation: /[\.:\)]+/g,
      missingQuestionMarks: /^(?!.*\?$).*$/,
      inconsistentNumbering: /^(?!\d+[\.:\)]).*$/,
      malformedOptions: /^[A-Z][^A-Z]*$/,
      missingCorrectAnswer: /(?:✓|\*|correct|right)/i
    }
  };

  private static customTemplates: CustomFormatTemplate[] = [
    {
      id: 'standard-mcq',
      name: 'Standard MCQ',
      description: 'Traditional multiple choice with A, B, C, D options',
      patterns: {
        question: '^(?:Q|Question)?(\\d+)[\\.:\\)]?\\s*(.+)$',
        options: '^[A-D][\\.:\\)]\\s*(.+?)(?:\\s*[✓*]|$)$',
        answer: '^(?:ANSWERS?|Answer):\\s*$'
      },
      examples: [
        'Q1. What is the capital of France?',
        'A) London',
        'B) Paris ✓',
        'C) Berlin',
        'D) Madrid'
      ],
      confidence: 0.95
    },
    {
      id: 'numbered-options',
      name: 'Numbered Options',
      description: 'Questions with numbered options (1, 2, 3, 4)',
      patterns: {
        question: '^(?:Q|Question)?(\\d+)[\\.:\\)]?\\s*(.+)$',
        options: '^\\d+[\\.:\\)]\\s*(.+?)(?:\\s*[✓*]|$)$',
        answer: '^(?:ANSWERS?|Answer):\\s*$'
      },
      examples: [
        'Q1. What is the capital of France?',
        '1) London',
        '2) Paris ✓',
        '3) Berlin',
        '4) Madrid'
      ],
      confidence: 0.90
    },
    {
      id: 'true-false',
      name: 'True/False',
      description: 'True or false questions',
      patterns: {
        question: '^(?:Q|Question)?(\\d+)[\\.:\\)]?\\s*(.+)$',
        options: '^(True|False)(?:\\s*[✓*]|$)$',
        answer: '^(?:ANSWERS?|Answer):\\s*$'
      },
      examples: [
        'Q1. Paris is the capital of France.',
        'True ✓',
        'False'
      ],
      confidence: 0.85
    }
  ];

  /**
   * Enhanced format detection with multiple strategies
   */
  static detectFormat(text: string): EnhancedFormatDetectionResult {
    console.log('🔍 Enhanced format detection starting...');
    
    const lines = text.split('\n').filter(line => line.trim());
    const result: EnhancedFormatDetectionResult = {
      detectedFormat: 'unknown',
      confidence: 0,
      suggestions: [],
      corrections: [],
      issues: [],
      formatPatterns: {
        questionPattern: '',
        optionPattern: '',
        answerPattern: ''
      },
      statistics: {
        totalLines: lines.length,
        questionLines: 0,
        optionLines: 0,
        answerLines: 0,
        emptyLines: 0
      }
    };

    // Analyze text structure
    const analysis = this.analyzeTextStructure(lines);
    result.statistics = analysis.statistics;

    // Detect format using multiple strategies
    const formatResults = this.detectFormatStrategies(lines, analysis);
    
    // Select best format
    const bestFormat = this.selectBestFormat(formatResults);
    result.detectedFormat = bestFormat.format;
    result.confidence = bestFormat.confidence;
    result.formatPatterns = bestFormat.patterns;

    // Detect issues and generate suggestions
    const issues = this.detectIssues(lines, bestFormat.format);
    result.issues = issues.issues;
    result.suggestions = issues.suggestions;
    result.corrections = issues.corrections;

    console.log(`✅ Format detected: ${result.detectedFormat} (confidence: ${result.confidence})`);
    return result;
  }

  /**
   * Analyze text structure
   */
  private static analyzeTextStructure(lines: string[]): {
    statistics: EnhancedFormatDetectionResult['statistics'];
    patterns: { [key: string]: number };
  } {
    const statistics = {
      totalLines: lines.length,
      questionLines: 0,
      optionLines: 0,
      answerLines: 0,
      emptyLines: 0
    };

    const patterns: { [key: string]: number } = {};

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        statistics.emptyLines++;
        return;
      }

      // Count question patterns
      Object.values(this.enhancedPatterns.questionPatterns).forEach(pattern => {
        if (pattern.test(trimmedLine)) {
          statistics.questionLines++;
          patterns['question'] = (patterns['question'] || 0) + 1;
        }
      });

      // Count option patterns
      Object.values(this.enhancedPatterns.optionPatterns).forEach(pattern => {
        if (pattern.test(trimmedLine)) {
          statistics.optionLines++;
          patterns['option'] = (patterns['option'] || 0) + 1;
        }
      });

      // Count answer patterns
      Object.values(this.enhancedPatterns.answerPatterns).forEach(pattern => {
        if (pattern.test(trimmedLine)) {
          statistics.answerLines++;
          patterns['answer'] = (patterns['answer'] || 0) + 1;
        }
      });
    });

    return { statistics, patterns };
  }

  /**
   * Detect format using multiple strategies
   */
  private static detectFormatStrategies(
    lines: string[],
    analysis: { statistics: any; patterns: { [key: string]: number } }
  ): Array<{ format: string; confidence: number; patterns: any }> {
    const results: Array<{ format: string; confidence: number; patterns: any }> = [];

    // Strategy 1: Pattern-based detection
    const patternResult = this.patternBasedDetection(lines, analysis);
    results.push(patternResult);

    // Strategy 2: Template matching
    const templateResult = this.templateMatching(lines);
    results.push(templateResult);

    // Strategy 3: Statistical analysis
    const statisticalResult = this.statisticalAnalysis(analysis);
    results.push(statisticalResult);

    // Strategy 4: Content analysis
    const contentResult = this.contentAnalysis(lines);
    results.push(contentResult);

    return results;
  }

  /**
   * Pattern-based format detection
   */
  private static patternBasedDetection(
    lines: string[],
    analysis: { statistics: any; patterns: { [key: string]: number } }
  ): { format: string; confidence: number; patterns: any } {
    const { statistics, patterns } = analysis;
    
    let format = 'unknown';
    let confidence = 0;
    let detectedPatterns = { questionPattern: '', optionPattern: '', answerPattern: '' };

    // Determine format based on pattern distribution
    if (patterns['question'] && patterns['option']) {
      if (patterns['option'] >= patterns['question'] * 2) {
        format = 'mcq';
        confidence = Math.min(0.9, patterns['option'] / (patterns['question'] * 4));
        detectedPatterns = {
          questionPattern: 'numbered',
          optionPattern: 'lettered',
          answerPattern: 'answerKey'
        };
      }
    }

    // Check for true/false
    const trueFalseLines = lines.filter(line => 
      /^(True|False)(?:\s*[✓*]|$)/i.test(line.trim())
    );
    if (trueFalseLines.length > 0 && trueFalseLines.length >= statistics.questionLines * 0.5) {
      format = 'true-false';
      confidence = Math.max(confidence, 0.8);
      detectedPatterns.optionPattern = 'trueFalse';
    }

    // Check for short answer
    if (patterns['question'] && !patterns['option'] && !patterns['answer']) {
      format = 'short-answer';
      confidence = 0.7;
      detectedPatterns.questionPattern = 'numbered';
    }

    return { format, confidence, patterns: detectedPatterns };
  }

  /**
   * Template matching
   */
  private static templateMatching(lines: string[]): { format: string; confidence: number; patterns: any } {
    let bestMatch = { format: 'unknown', confidence: 0, patterns: {} };

    this.customTemplates.forEach(template => {
      const matchScore = this.calculateTemplateMatch(lines, template);
      if (matchScore > bestMatch.confidence) {
        bestMatch = {
          format: template.id,
          confidence: matchScore,
          patterns: template.patterns
        };
      }
    });

    return bestMatch;
  }

  /**
   * Calculate template match score
   */
  private static calculateTemplateMatch(lines: string[], template: CustomFormatTemplate): number {
    let matchCount = 0;
    let totalLines = lines.length;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check question pattern
      if (new RegExp(template.patterns.question, 'i').test(trimmedLine)) {
        matchCount++;
      }
      
      // Check option pattern
      if (new RegExp(template.patterns.options, 'i').test(trimmedLine)) {
        matchCount++;
      }
      
      // Check answer pattern
      if (new RegExp(template.patterns.answer, 'i').test(trimmedLine)) {
        matchCount++;
      }
    });

    return matchCount / totalLines;
  }

  /**
   * Statistical analysis
   */
  private static statisticalAnalysis(analysis: { statistics: any; patterns: { [key: string]: number } }): {
    format: string;
    confidence: number;
    patterns: any;
  } {
    const { statistics } = analysis;
    
    let format = 'unknown';
    let confidence = 0;

    // Calculate ratios
    const questionRatio = statistics.questionLines / statistics.totalLines;
    const optionRatio = statistics.optionLines / statistics.totalLines;
    const answerRatio = statistics.answerLines / statistics.totalLines;

    if (questionRatio > 0.1 && optionRatio > 0.2) {
      format = 'mcq';
      confidence = Math.min(0.8, (questionRatio + optionRatio) / 2);
    } else if (questionRatio > 0.1 && optionRatio < 0.1) {
      format = 'short-answer';
      confidence = 0.6;
    }

    return { format, confidence, patterns: {} };
  }

  /**
   * Content analysis
   */
  private static contentAnalysis(lines: string[]): { format: string; confidence: number; patterns: any } {
    let format = 'unknown';
    let confidence = 0;

    // Look for specific content indicators
    const text = lines.join(' ').toLowerCase();
    
    if (text.includes('true') && text.includes('false')) {
      format = 'true-false';
      confidence = 0.7;
    } else if (text.includes('a)') && text.includes('b)') && text.includes('c)')) {
      format = 'mcq';
      confidence = 0.8;
    } else if (text.includes('1)') && text.includes('2)') && text.includes('3)')) {
      format = 'mcq';
      confidence = 0.75;
    }

    return { format, confidence, patterns: {} };
  }

  /**
   * Select best format from multiple strategies
   */
  private static selectBestFormat(
    results: Array<{ format: string; confidence: number; patterns: any }>
  ): { format: 'mcq' | 'true-false' | 'short-answer' | 'mixed' | 'unknown'; confidence: number; patterns: any } {
    // Sort by confidence
    const sortedResults = results.sort((a, b) => b.confidence - a.confidence);
    
    // Return the best result with proper type casting
    const bestResult = sortedResults[0];
    return {
      format: bestResult.format as 'mcq' | 'true-false' | 'short-answer' | 'mixed' | 'unknown',
      confidence: bestResult.confidence,
      patterns: bestResult.patterns
    };
  }

  /**
   * Detect issues and generate suggestions
   */
  private static detectIssues(
    lines: string[],
    format: string
  ): { issues: string[]; suggestions: string[]; corrections: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const corrections: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for common issues
      if (this.enhancedPatterns.commonIssues.missingSpaces.test(trimmedLine)) {
        issues.push(`Line ${index + 1}: Missing space after option letter`);
        corrections.push(trimmedLine.replace(/([A-Z0-9])\)([A-Za-z])/g, '$1) $2'));
      }

      if (this.enhancedPatterns.commonIssues.extraSpaces.test(trimmedLine)) {
        issues.push(`Line ${index + 1}: Multiple consecutive spaces`);
        corrections.push(trimmedLine.replace(/\s{2,}/g, ' '));
      }

      if (this.enhancedPatterns.commonIssues.missingQuestionMarks.test(trimmedLine) && 
          trimmedLine.includes('?')) {
        issues.push(`Line ${index + 1}: Question should end with question mark`);
        suggestions.push('Add question mark at the end of questions');
      }
    });

    // Generate format-specific suggestions
    if (format === 'mcq') {
      suggestions.push('Ensure all questions have 4 options (A, B, C, D)');
      suggestions.push('Mark correct answers with ✓ or *');
      suggestions.push('Include an answer key section at the end');
    } else if (format === 'true-false') {
      suggestions.push('Use "True" and "False" as options');
      suggestions.push('Mark correct answers with ✓ or *');
    }

    return { issues, suggestions, corrections };
  }

  /**
   * Real-time format preview
   */
  static generateRealTimePreview(text: string): RealTimePreview {
    const lines = text.split('\n').filter(line => line.trim());
    const formatResult = this.detectFormat(text);
    
    const previewQuestions: RealTimePreview['previewQuestions'] = [];
    let currentQuestion: any = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check if this is a question
      const questionMatch = trimmedLine.match(this.enhancedPatterns.questionPatterns.numbered);
      if (questionMatch) {
        if (currentQuestion) {
          previewQuestions.push(currentQuestion);
        }
        currentQuestion = {
          text: questionMatch[2],
          options: [],
          correctAnswer: undefined,
          confidence: 0.8
        };
      }

      // Check if this is an option
      if (currentQuestion) {
        const optionMatch = trimmedLine.match(this.enhancedPatterns.optionPatterns.lettered);
        if (optionMatch) {
          currentQuestion.options.push(optionMatch[1]);
          
          // Check if this option is marked as correct
          if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
            currentQuestion.correctAnswer = optionMatch[1];
          }
        }
      }
    });

    // Add the last question
    if (currentQuestion) {
      previewQuestions.push(currentQuestion);
    }

    return {
      detectedFormat: formatResult.detectedFormat,
      confidence: formatResult.confidence,
      previewQuestions,
      issues: formatResult.issues,
      suggestions: formatResult.suggestions
    };
  }

  /**
   * Add custom format template
   */
  static addCustomTemplate(template: CustomFormatTemplate): void {
    this.customTemplates.push(template);
    console.log(`✅ Added custom template: ${template.name}`);
  }

  /**
   * Get available custom templates
   */
  static getCustomTemplates(): CustomFormatTemplate[] {
    return this.customTemplates;
  }

  /**
   * Validate custom template
   */
  static validateCustomTemplate(template: CustomFormatTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (!template.patterns.question || !template.patterns.options) {
      errors.push('Question and option patterns are required');
    }

    // Validate regex patterns
    try {
      new RegExp(template.patterns.question);
      new RegExp(template.patterns.options);
      if (template.patterns.answer) {
        new RegExp(template.patterns.answer);
      }
    } catch (error) {
      errors.push('Invalid regex pattern');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get format detection statistics
   */
  static getDetectionStats(): {
    totalDetections: number;
    formatDistribution: { [key: string]: number };
    averageConfidence: number;
    commonIssues: string[];
  } {
    // This would typically track statistics over time
    // For now, return mock data
    return {
      totalDetections: 0,
      formatDistribution: {
        'mcq': 0,
        'true-false': 0,
        'short-answer': 0,
        'unknown': 0
      },
      averageConfidence: 0,
      commonIssues: []
    };
  }
}
