export interface FormatDetectionResult {
  detectedFormat: 'mcq' | 'true-false' | 'short-answer' | 'mixed' | 'unknown';
  confidence: number;
  suggestions: string[];
  corrections: string[];
  issues: string[];
}

export interface AutoCorrectionResult {
  correctedText: string;
  corrections: Array<{
    line: number;
    original: string;
    corrected: string;
    type: 'spacing' | 'punctuation' | 'numbering' | 'formatting';
  }>;
}

export class SmartFormatDetector {
  private static formatPatterns = {
    // Question patterns with confidence scores
    mcqPatterns: [
      { pattern: /^Q\d+\.\s*[A-Z][^A-Z]+A\)\s*[^A-Z]+B\)\s*[^A-Z]+C\)\s*[^A-Z]+D\)\s*[^A-Z]+/i, score: 0.9 },
      { pattern: /^Question\s*\d+[\.:\)]\s*[A-Z][^A-Z]+A[\.:\)]\s*[^A-Z]+B[\.:\)]\s*[^A-Z]+C[\.:\)]\s*[^A-Z]+D[\.:\)]\s*[^A-Z]+/i, score: 0.85 },
      { pattern: /^\d+[\.:\)]\s*[A-Z][^A-Z]+A\)\s*[^A-Z]+B\)\s*[^A-Z]+C\)\s*[^A-Z]+D\)\s*[^A-Z]+/i, score: 0.8 },
    ],
    trueFalsePatterns: [
      { pattern: /^Q\d+\.\s*[A-Z][^A-Z]+A\)\s*(True|False)\s*B\)\s*(True|False)/i, score: 0.95 },
      { pattern: /^Question\s*\d+[\.:\)]\s*[A-Z][^A-Z]+A[\.:\)]\s*(True|False)\s*B[\.:\)]\s*(True|False)/i, score: 0.9 },
    ],
    shortAnswerPatterns: [
      { pattern: /^Q\d+\.\s*[A-Z][^A-Z]+(?!A\)|B\)|C\)|D\))/i, score: 0.7 },
      { pattern: /^Question\s*\d+[\.:\)]\s*[A-Z][^A-Z]+(?!A[\.:\)]|B[\.:\)]|C[\.:\)]|D[\.:\)])/i, score: 0.65 },
    ]
  };

  private static commonIssues = {
    missingSpaces: [
      { pattern: /([A-Z])\)([A-Z])/g, fix: '$1) $2' },
      { pattern: /(\d+\.)([A-Z])/g, fix: '$1 $2' },
      { pattern: /([A-Z][\.:\)])([A-Z])/g, fix: '$1 $2' },
    ],
    wrongPunctuation: [
      { pattern: /^Q(\d+)[^\.:\)]/, fix: 'Q$1.' },
      { pattern: /^Question(\d+)[^\.:\)]/, fix: 'Question $1.' },
      { pattern: /^(\d+)[^\.:\)]/, fix: '$1.' },
    ],
    inconsistentNumbering: [
      { pattern: /^Q(\d+)/, fix: 'Q$1.' },
      { pattern: /^Question(\d+)/, fix: 'Question $1.' },
    ]
  };

  /**
   * Detect the format of quiz content
   */
  static detectFormat(text: string): FormatDetectionResult {
    const lines = text.split('\n').filter(line => line.trim());
    let mcqScore = 0;
    let trueFalseScore = 0;
    let shortAnswerScore = 0;
    const suggestions: string[] = [];
    const issues: string[] = [];

    console.log('🔍 Analyzing format for', lines.length, 'lines');

    // Analyze each line
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check MCQ patterns
      this.formatPatterns.mcqPatterns.forEach(pattern => {
        if (pattern.pattern.test(trimmedLine)) {
          mcqScore += pattern.score;
        }
      });

      // Check True/False patterns
      this.formatPatterns.trueFalsePatterns.forEach(pattern => {
        if (pattern.pattern.test(trimmedLine)) {
          trueFalseScore += pattern.score;
        }
      });

      // Check Short Answer patterns
      this.formatPatterns.shortAnswerPatterns.forEach(pattern => {
        if (pattern.pattern.test(trimmedLine)) {
          shortAnswerScore += pattern.score;
        }
      });

      // Detect common issues
      this.detectIssues(trimmedLine, index + 1, issues);
    });

    // Calculate confidence and determine format
    const totalLines = lines.length;
    const mcqConfidence = mcqScore / totalLines;
    const trueFalseConfidence = trueFalseScore / totalLines;
    const shortAnswerConfidence = shortAnswerScore / totalLines;

    let detectedFormat: FormatDetectionResult['detectedFormat'] = 'unknown';
    let confidence = 0;

    if (mcqConfidence > 0.3) {
      detectedFormat = 'mcq';
      confidence = mcqConfidence;
    } else if (trueFalseConfidence > 0.3) {
      detectedFormat = 'true-false';
      confidence = trueFalseConfidence;
    } else if (shortAnswerConfidence > 0.3) {
      detectedFormat = 'short-answer';
      confidence = shortAnswerConfidence;
    }

    // Generate suggestions based on detected issues
    this.generateSuggestions(issues, suggestions, detectedFormat);

    return {
      detectedFormat,
      confidence: Math.min(confidence, 1),
      suggestions,
      corrections: [],
      issues
    };
  }

  /**
   * Auto-correct common formatting issues
   */
  static autoCorrect(text: string): AutoCorrectionResult {
    const lines = text.split('\n');
    const corrections: AutoCorrectionResult['corrections'] = [];
    const correctedLines: string[] = [];

    lines.forEach((line, index) => {
      let correctedLine = line;
      let lineCorrections: AutoCorrectionResult['corrections'] = [];

      // Apply spacing corrections
      this.commonIssues.missingSpaces.forEach(issue => {
        const original = correctedLine;
        correctedLine = correctedLine.replace(issue.pattern, issue.fix);
        if (original !== correctedLine) {
          lineCorrections.push({
            line: index + 1,
            original,
            corrected: correctedLine,
            type: 'spacing'
          });
        }
      });

      // Apply punctuation corrections
      this.commonIssues.wrongPunctuation.forEach(issue => {
        const original = correctedLine;
        correctedLine = correctedLine.replace(issue.pattern, issue.fix);
        if (original !== correctedLine) {
          lineCorrections.push({
            line: index + 1,
            original,
            corrected: correctedLine,
            type: 'punctuation'
          });
        }
      });

      // Apply numbering corrections
      this.commonIssues.inconsistentNumbering.forEach(issue => {
        const original = correctedLine;
        correctedLine = correctedLine.replace(issue.pattern, issue.fix);
        if (original !== correctedLine) {
          lineCorrections.push({
            line: index + 1,
            original,
            corrected: correctedLine,
            type: 'numbering'
          });
        }
      });

      correctedLines.push(correctedLine);
      corrections.push(...lineCorrections);
    });

    return {
      correctedText: correctedLines.join('\n'),
      corrections
    };
  }

  /**
   * Detect common formatting issues
   */
  private static detectIssues(line: string, lineNumber: number, issues: string[]): void {
    // Missing spaces after punctuation
    if (/[A-Z]\)[A-Z]/.test(line)) {
      issues.push(`Line ${lineNumber}: Missing space after option letter`);
    }

    // Missing punctuation after question numbers
    if (/^Q\d+[^\.:\)]/.test(line)) {
      issues.push(`Line ${lineNumber}: Missing punctuation after question number`);
    }

    // Inconsistent option formatting
    if (/A\)[^A-Z]/.test(line) && !/B\)[^A-Z]/.test(line)) {
      issues.push(`Line ${lineNumber}: Inconsistent option formatting`);
    }

    // Missing correct answer indicators
    if (/A\)[^✓*]/.test(line) && /B\)[^✓*]/.test(line) && /C\)[^✓*]/.test(line) && /D\)[^✓*]/.test(line)) {
      issues.push(`Line ${lineNumber}: No correct answer indicator found`);
    }
  }

  /**
   * Generate format-specific suggestions
   */
  private static generateSuggestions(issues: string[], suggestions: string[], format: string): void {
    if (issues.length > 0) {
      suggestions.push(`Found ${issues.length} formatting issues that can be auto-corrected`);
    }

    switch (format) {
      case 'mcq':
        suggestions.push('✅ Detected Multiple Choice format');
        suggestions.push('💡 Tip: Use ✓ or * to mark correct answers');
        suggestions.push('💡 Tip: Ensure all options (A, B, C, D) are present');
        break;
      case 'true-false':
        suggestions.push('✅ Detected True/False format');
        suggestions.push('💡 Tip: Use "True" and "False" as options');
        break;
      case 'short-answer':
        suggestions.push('✅ Detected Short Answer format');
        suggestions.push('💡 Tip: Provide clear, concise questions');
        break;
      default:
        suggestions.push('❓ Format not clearly detected');
        suggestions.push('💡 Tip: Use consistent formatting (Q1., A), B), etc.)');
        suggestions.push('💡 Tip: Include correct answer indicators (✓ or *)');
    }
  }

  /**
   * Validate and suggest improvements for questions
   */
  static validateQuestions(questions: any[]): Array<{
    questionId: string;
    score: number;
    suggestions: string[];
    issues: string[];
  }> {
    return questions.map(question => {
      const score = this.calculateQuestionScore(question);
      const suggestions: string[] = [];
      const issues: string[] = [];

      // Check question length
      if (question.text.length < 10) {
        issues.push('Question text is too short');
        suggestions.push('Make question more descriptive');
      } else if (question.text.length > 200) {
        issues.push('Question text is too long');
        suggestions.push('Consider breaking into multiple questions');
      }

      // Check options balance
      if (question.options && question.options.length > 0) {
        const optionLengths = question.options.map((opt: string) => opt.length);
        const avgLength = optionLengths.reduce((a: number, b: number) => a + b, 0) / optionLengths.length;
        const maxLength = Math.max(...optionLengths);
        const minLength = Math.min(...optionLengths);

        if (maxLength / minLength > 3) {
          issues.push('Options are imbalanced in length');
          suggestions.push('Make options more similar in length');
        }
      }

      // Check for obvious wrong answers
      if (question.options && question.options.length > 0) {
        const hasObviousWrong = question.options.some((opt: string) => 
          opt.toLowerCase().includes('none') || 
          opt.toLowerCase().includes('all') ||
          opt.toLowerCase().includes('both')
        );
        if (hasObviousWrong) {
          suggestions.push('Consider reviewing options for obvious wrong answers');
        }
      }

      return {
        questionId: question.id,
        score,
        suggestions,
        issues
      };
    });
  }

  /**
   * Calculate question quality score (0-100)
   */
  private static calculateQuestionScore(question: any): number {
    let score = 100;

    // Deduct for short questions
    if (question.text.length < 10) score -= 20;
    if (question.text.length < 20) score -= 10;

    // Deduct for very long questions
    if (question.text.length > 200) score -= 15;

    // Deduct for missing options in MCQ
    if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
      score -= 30;
    }

    // Deduct for missing correct answer
    if (!question.correctAnswer || question.correctAnswer.trim() === '') {
      score -= 25;
    }

    // Bonus for good formatting
    if (question.text.length >= 20 && question.text.length <= 100) score += 10;
    if (question.options && question.options.length >= 4) score += 5;

    return Math.max(0, Math.min(100, score));
  }
}
