import { ExtractedQuiz, ExtractedQuestion } from './pdf-processor';

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt' | 'html' | 'markdown';
  includeMetadata: boolean;
  includeAnswers: boolean;
  includePoints: boolean;
  customTemplate?: string;
  filename?: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  size: number;
}

export class ExportProcessor {
  private static defaultExportOptions: ExportOptions = {
    format: 'json',
    includeMetadata: true,
    includeAnswers: true,
    includePoints: true,
    filename: 'quiz-export'
  };

  /**
   * Export quiz to various formats
   */
  static exportQuiz(
    quiz: ExtractedQuiz,
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const exportOptions = { ...this.defaultExportOptions, ...options };
    
    console.log(`📤 Exporting quiz "${quiz.title}" to ${exportOptions.format} format`);

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportOptions.format) {
      case 'json':
        content = this.exportToJSON(quiz, exportOptions);
        filename = `${exportOptions.filename}.json`;
        mimeType = 'application/json';
        break;
      
      case 'csv':
        content = this.exportToCSV(quiz, exportOptions);
        filename = `${exportOptions.filename}.csv`;
        mimeType = 'text/csv';
        break;
      
      case 'txt':
        content = this.exportToTXT(quiz, exportOptions);
        filename = `${exportOptions.filename}.txt`;
        mimeType = 'text/plain';
        break;
      
      case 'html':
        content = this.exportToHTML(quiz, exportOptions);
        filename = `${exportOptions.filename}.html`;
        mimeType = 'text/html';
        break;
      
      case 'markdown':
        content = this.exportToMarkdown(quiz, exportOptions);
        filename = `${exportOptions.filename}.md`;
        mimeType = 'text/markdown';
        break;
      
      default:
        throw new Error(`Unsupported export format: ${exportOptions.format}`);
    }

    return {
      content,
      filename,
      mimeType,
      size: new Blob([content]).size
    };
  }

  /**
   * Export to JSON format
   */
  private static exportToJSON(quiz: ExtractedQuiz, options: ExportOptions): string {
    const exportData: any = {};

    if (options.includeMetadata) {
      exportData.metadata = {
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        questionCount: quiz.questions.length,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
    }

    exportData.questions = quiz.questions.map(q => {
      const questionData: any = {
        id: q.id,
        text: q.text,
        type: q.type
      };

      if (q.options && q.options.length > 0) {
        questionData.options = q.options;
      }

      if (options.includeAnswers) {
        questionData.correctAnswer = q.correctAnswer;
      }

      if (options.includePoints) {
        questionData.points = q.points;
      }

      return questionData;
    });

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export to CSV format
   */
  private static exportToCSV(quiz: ExtractedQuiz, options: ExportOptions): string {
    const lines: string[] = [];

    // Add metadata if requested
    if (options.includeMetadata) {
      lines.push('Quiz Title,Description,Subject,Question Count');
      lines.push(`"${quiz.title}","${quiz.description || ''}","${quiz.subject}",${quiz.questions.length}`);
      lines.push(''); // Empty line
    }

    // Add headers
    const headers = ['Question Number', 'Question Text', 'Question Type'];
    if (options.includePoints) headers.push('Points');
    
    // Add option headers
    const maxOptions = Math.max(...quiz.questions.map(q => q.options?.length || 0));
    for (let i = 1; i <= maxOptions; i++) {
      headers.push(`Option ${i}`);
    }
    
    if (options.includeAnswers) headers.push('Correct Answer');
    
    lines.push(headers.join(','));

    // Add question data
    quiz.questions.forEach((question, index) => {
      const row: string[] = [
        (index + 1).toString(),
        `"${this.escapeCSV(question.text)}"`,
        question.type
      ];

      if (options.includePoints) {
        row.push(question.points.toString());
      }

      // Add options
      if (question.options) {
        for (let i = 0; i < maxOptions; i++) {
          const option = question.options[i] || '';
          row.push(`"${this.escapeCSV(option)}"`);
        }
      } else {
        // Fill empty options
        for (let i = 0; i < maxOptions; i++) {
          row.push('');
        }
      }

      if (options.includeAnswers) {
        row.push(`"${this.escapeCSV(question.correctAnswer)}"`);
      }

      lines.push(row.join(','));
    });

    return lines.join('\n');
  }

  /**
   * Export to plain text format
   */
  private static exportToTXT(quiz: ExtractedQuiz, options: ExportOptions): string {
    const lines: string[] = [];

    // Add metadata
    if (options.includeMetadata) {
      lines.push(`QUIZ: ${quiz.title}`);
      if (quiz.description) lines.push(`Description: ${quiz.description}`);
      lines.push(`Subject: ${quiz.subject}`);
      lines.push(`Total Questions: ${quiz.questions.length}`);
      lines.push(`Exported: ${new Date().toLocaleString()}`);
      lines.push(''); // Empty line
      lines.push('='.repeat(50));
      lines.push(''); // Empty line
    }

    // Add questions
    quiz.questions.forEach((question, index) => {
      lines.push(`Question ${index + 1}:`);
      lines.push(question.text);
      lines.push('');

      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optionIndex) => {
          const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D...
          lines.push(`${optionLetter}) ${option}`);
        });
        lines.push('');
      }

      if (options.includeAnswers) {
        lines.push(`Answer: ${question.correctAnswer}`);
        lines.push('');
      }

      if (options.includePoints) {
        lines.push(`Points: ${question.points}`);
        lines.push('');
      }

      lines.push('-'.repeat(30));
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export to HTML format
   */
  private static exportToHTML(quiz: ExtractedQuiz, options: ExportOptions): string {
    const lines: string[] = [];

    lines.push('<!DOCTYPE html>');
    lines.push('<html lang="en">');
    lines.push('<head>');
    lines.push('    <meta charset="UTF-8">');
    lines.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    lines.push(`    <title>${quiz.title}</title>`);
    lines.push('    <style>');
    lines.push('        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }');
    lines.push('        .question { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }');
    lines.push('        .question-text { font-weight: bold; margin-bottom: 10px; }');
    lines.push('        .options { margin-left: 20px; }');
    lines.push('        .option { margin: 5px 0; }');
    lines.push('        .answer { color: green; font-weight: bold; margin-top: 10px; }');
    lines.push('        .points { color: blue; font-size: 0.9em; }');
    lines.push('        .metadata { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }');
    lines.push('    </style>');
    lines.push('</head>');
    lines.push('<body>');

    // Add metadata
    if (options.includeMetadata) {
      lines.push('    <div class="metadata">');
      lines.push(`        <h1>${quiz.title}</h1>`);
      if (quiz.description) lines.push(`        <p><strong>Description:</strong> ${quiz.description}</p>`);
      lines.push(`        <p><strong>Subject:</strong> ${quiz.subject}</p>`);
      lines.push(`        <p><strong>Total Questions:</strong> ${quiz.questions.length}</p>`);
      lines.push(`        <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>`);
      lines.push('    </div>');
    }

    // Add questions
    quiz.questions.forEach((question, index) => {
      lines.push(`    <div class="question">`);
      lines.push(`        <div class="question-text">Question ${index + 1}: ${question.text}</div>`);
      
      if (question.options && question.options.length > 0) {
        lines.push('        <div class="options">');
        question.options.forEach((option, optionIndex) => {
          const optionLetter = String.fromCharCode(65 + optionIndex);
          lines.push(`            <div class="option">${optionLetter}) ${option}</div>`);
        });
        lines.push('        </div>');
      }

      if (options.includeAnswers) {
        lines.push(`        <div class="answer">Answer: ${question.correctAnswer}</div>`);
      }

      if (options.includePoints) {
        lines.push(`        <div class="points">Points: ${question.points}</div>`);
      }

      lines.push('    </div>');
    });

    lines.push('</body>');
    lines.push('</html>');

    return lines.join('\n');
  }

  /**
   * Export to Markdown format
   */
  private static exportToMarkdown(quiz: ExtractedQuiz, options: ExportOptions): string {
    const lines: string[] = [];

    // Add metadata
    if (options.includeMetadata) {
      lines.push(`# ${quiz.title}`);
      lines.push('');
      if (quiz.description) {
        lines.push(quiz.description);
        lines.push('');
      }
      lines.push(`**Subject:** ${quiz.subject}`);
      lines.push(`**Total Questions:** ${quiz.questions.length}`);
      lines.push(`**Exported:** ${new Date().toLocaleString()}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    // Add questions
    quiz.questions.forEach((question, index) => {
      lines.push(`## Question ${index + 1}`);
      lines.push('');
      lines.push(question.text);
      lines.push('');

      if (question.options && question.options.length > 0) {
        question.options.forEach((option, optionIndex) => {
          const optionLetter = String.fromCharCode(65 + optionIndex);
          lines.push(`**${optionLetter})** ${option}`);
        });
        lines.push('');
      }

      if (options.includeAnswers) {
        lines.push(`**Answer:** ${question.correctAnswer}`);
        lines.push('');
      }

      if (options.includePoints) {
        lines.push(`**Points:** ${question.points}`);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Batch export multiple quizzes
   */
  static batchExport(
    quizzes: ExtractedQuiz[],
    options: Partial<ExportOptions> = {}
  ): ExportResult[] {
    console.log(`📤 Batch exporting ${quizzes.length} quizzes`);

    return quizzes.map((quiz, index) => {
      const quizOptions = {
        ...options,
        filename: `${options.filename || 'quiz'}-${index + 1}`
      };
      return this.exportQuiz(quiz, quizOptions);
    });
  }

  /**
   * Export with custom template
   */
  static exportWithTemplate(
    quiz: ExtractedQuiz,
    template: string,
    options: Partial<ExportOptions> = {}
  ): ExportResult {
    const exportOptions = { ...this.defaultExportOptions, ...options };
    
    console.log(`📤 Exporting quiz with custom template`);

    // Replace template variables
    let content = template
      .replace(/\{\{title\}\}/g, quiz.title)
      .replace(/\{\{description\}\}/g, quiz.description || '')
      .replace(/\{\{subject\}\}/g, quiz.subject)
      .replace(/\{\{questionCount\}\}/g, quiz.questions.length.toString())
      .replace(/\{\{exportDate\}\}/g, new Date().toLocaleString());

    // Replace questions
    const questionsHtml = quiz.questions.map((question, index) => {
      let questionHtml = `<div class="question">
        <h3>Question ${index + 1}</h3>
        <p>${question.text}</p>`;

      if (question.options && question.options.length > 0) {
        questionHtml += '<ul>';
        question.options.forEach((option, optionIndex) => {
          const optionLetter = String.fromCharCode(65 + optionIndex);
          questionHtml += `<li><strong>${optionLetter})</strong> ${option}</li>`;
        });
        questionHtml += '</ul>';
      }

      if (exportOptions.includeAnswers) {
        questionHtml += `<p><strong>Answer:</strong> ${question.correctAnswer}</p>`;
      }

      if (exportOptions.includePoints) {
        questionHtml += `<p><strong>Points:</strong> ${question.points}</p>`;
      }

      questionHtml += '</div>';
      return questionHtml;
    }).join('');

    content = content.replace(/\{\{questions\}\}/g, questionsHtml);

    return {
      content,
      filename: `${exportOptions.filename || 'quiz'}.html`,
      mimeType: 'text/html',
      size: new Blob([content]).size
    };
  }

  /**
   * Escape CSV values
   */
  private static escapeCSV(value: string): string {
    return value.replace(/"/g, '""');
  }

  /**
   * Get available export formats
   */
  static getAvailableFormats(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'json', label: 'JSON', description: 'Structured data format for applications' },
      { value: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheets' },
      { value: 'txt', label: 'Plain Text', description: 'Simple text format for reading' },
      { value: 'html', label: 'HTML', description: 'Web page format with styling' },
      { value: 'markdown', label: 'Markdown', description: 'Formatted text for documentation' }
    ];
  }

  /**
   * Validate export options
   */
  static validateExportOptions(options: Partial<ExportOptions>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.format && !['json', 'csv', 'txt', 'html', 'markdown'].includes(options.format)) {
      errors.push('Invalid export format');
    }

    if (options.filename && options.filename.length === 0) {
      errors.push('Filename cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get export statistics
   */
  static getExportStats(quiz: ExtractedQuiz): {
    questionCount: number;
    totalOptions: number;
    averageOptionsPerQuestion: number;
    questionTypes: { [key: string]: number };
    estimatedSize: number;
  } {
    const questionTypes: { [key: string]: number } = {};
    let totalOptions = 0;

    quiz.questions.forEach(question => {
      questionTypes[question.type] = (questionTypes[question.type] || 0) + 1;
      if (question.options) {
        totalOptions += question.options.length;
      }
    });

    const averageOptionsPerQuestion = quiz.questions.length > 0 ? 
      Math.round(totalOptions / quiz.questions.length) : 0;

    // Rough size estimation
    const estimatedSize = JSON.stringify(quiz).length;

    return {
      questionCount: quiz.questions.length,
      totalOptions,
      averageOptionsPerQuestion,
      questionTypes,
      estimatedSize
    };
  }
}
