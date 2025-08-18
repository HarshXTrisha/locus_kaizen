// PDF Processing Utility for Quiz Creation
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface ExtractedQuiz {
  title: string;
  description?: string;
  subject: string;
  questions: ExtractedQuestion[];
}

export class PDFProcessor {
  private static questionPatterns = {
    questionNumber: /^Q(\d+)\.?\s*(.+)$/i,
    optionA: /^A\)\s*(.+)$/i,
    optionB: /^B\)\s*(.+)$/i,
    optionC: /^C\)\s*(.+)$/i,
    optionD: /^D\)\s*(.+)$/i,
    trueFalse: /^(True|False)$/i,
  };

  /**
   * Process PDF file and extract quiz data
   */
  static async processPDF(file: File): Promise<ExtractedQuiz> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        allText += pageText + '\n';
      }

      return this.parseQuizText(allText, file.name);
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  /**
   * Parse extracted text into structured quiz data
   */
  private static parseQuizText(text: string, fileName: string): ExtractedQuiz {
    const lines = text.split('\n').filter(line => line.trim());
    const questions: ExtractedQuestion[] = [];
    let currentQuestion: Partial<ExtractedQuestion> | null = null;
    let questionCounter = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for question number
      const questionMatch = trimmedLine.match(this.questionPatterns.questionNumber);
      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.text) {
          questions.push(this.finalizeQuestion(currentQuestion, questionCounter - 1));
        }
        
        // Start new question
        currentQuestion = {
          id: `q${questionCounter}`,
          text: questionMatch[2].trim(),
          type: 'multiple-choice',
          options: [],
          correctAnswer: '',
          points: 1
        };
        questionCounter++;
        continue;
      }

      // Check for options
      if (currentQuestion) {
        const optionAMatch = trimmedLine.match(this.questionPatterns.optionA);
        const optionBMatch = trimmedLine.match(this.questionPatterns.optionB);
        const optionCMatch = trimmedLine.match(this.questionPatterns.optionC);
        const optionDMatch = trimmedLine.match(this.questionPatterns.optionD);

        if (optionAMatch) {
          currentQuestion.options = currentQuestion.options || [];
          currentQuestion.options.push(optionAMatch[1].trim());
        } else if (optionBMatch) {
          currentQuestion.options = currentQuestion.options || [];
          currentQuestion.options.push(optionBMatch[1].trim());
        } else if (optionCMatch) {
          currentQuestion.options = currentQuestion.options || [];
          currentQuestion.options.push(optionCMatch[1].trim());
        } else if (optionDMatch) {
          currentQuestion.options = currentQuestion.options || [];
          currentQuestion.options.push(optionDMatch[1].trim());
        } else if (trimmedLine && currentQuestion.text) {
          // Append to question text if it's not an option
          currentQuestion.text += ' ' + trimmedLine;
        }
      }
    }

    // Add the last question
    if (currentQuestion && currentQuestion.text) {
      questions.push(this.finalizeQuestion(currentQuestion, questionCounter - 1));
    }

    return {
      title: this.extractTitle(fileName),
      description: `Quiz extracted from ${fileName}`,
      subject: 'General',
      questions: questions
    };
  }

  /**
   * Finalize question structure and set default correct answer
   */
  private static finalizeQuestion(question: Partial<ExtractedQuestion>, index: number): ExtractedQuestion {
    const options = question.options || [];
    
    // Set default correct answer to first option if available
    const correctAnswer = options.length > 0 ? options[0] : '';
    
    // Determine question type
    let type: 'multiple-choice' | 'true-false' | 'short-answer' = 'multiple-choice';
    if (options.length === 2 && options.every(opt => this.questionPatterns.trueFalse.test(opt))) {
      type = 'true-false';
    } else if (options.length === 0) {
      type = 'short-answer';
    }

    return {
      id: question.id || `q${index}`,
      text: question.text || '',
      type,
      options: options.length > 0 ? options : undefined,
      correctAnswer,
      points: question.points || 1
    };
  }

  /**
   * Extract title from filename
   */
  private static extractTitle(fileName: string): string {
    const nameWithoutExt = fileName.replace(/\.pdf$/i, '');
    return nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Validate extracted quiz data
   */
  static validateQuiz(quiz: ExtractedQuiz): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!quiz.title.trim()) {
      errors.push('Quiz title is required');
    }

    if (quiz.questions.length === 0) {
      errors.push('No questions found in PDF');
    }

    quiz.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        errors.push(`Question ${index + 1} has no text`);
      }

      if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
        errors.push(`Question ${index + 1} needs at least 2 options`);
      }

      if (!question.correctAnswer.trim()) {
        errors.push(`Question ${index + 1} has no correct answer`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
