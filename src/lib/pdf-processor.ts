// Conditional import for pdf.js to avoid SSR issues
let pdfjsLib: any = null;

if (typeof window !== 'undefined') {
  // Only import pdf.js on the client side
  import('pdfjs-dist').then((module) => {
    pdfjsLib = module;
    // Configure pdf.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  });
}

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
    optionA: /^A\)\s*(.+?)(?:\s*[✓*]|$)/i,
    optionB: /^B\)\s*(.+?)(?:\s*[✓*]|$)/i,
    optionC: /^C\)\s*(.+?)(?:\s*[✓*]|$)/i,
    optionD: /^D\)\s*(.+?)(?:\s*[✓*]|$)/i,
    trueFalse: /^(True|False)$/i,
    answerKey: /^(?:ANSWERS?|ANSWER KEY):\s*$/i,
    answerKeyEntry: /^Q(\d+):\s*([A-D])$/i,
  };

  /**
   * Process PDF file and extract quiz data
   */
  static async processPDF(file: File): Promise<ExtractedQuiz> {
    if (typeof window === 'undefined') {
      throw new Error('PDF processing is only available on the client side');
    }

    if (!pdfjsLib) {
      // Wait for pdf.js to load
      await new Promise(resolve => {
        const checkPdfJs = () => {
          if (pdfjsLib) {
            resolve(true);
          } else {
            setTimeout(checkPdfJs, 100);
          }
        };
        checkPdfJs();
      });
    }

    try {
      console.log('Processing PDF file:', file.name, 'Size:', file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, pages:', pdf.numPages);
      
      let allText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        allText += pageText + '\n';
        console.log(`Page ${pageNum} text length:`, pageText.length);
      }

      console.log('Total extracted text length:', allText.length);
      console.log('First 500 characters:', allText.substring(0, 500));

      const result = this.parseQuizText(allText, file.name);
      console.log('Parsed quiz:', result);
      
      return result;
    } catch (error) {
      console.error('Error processing PDF:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to process PDF file: ${error.message}`);
    }
  }

  /**
   * Parse extracted text into structured quiz data
   */
  private static parseQuizText(text: string, fileName: string): ExtractedQuiz {
    console.log('Parsing text with length:', text.length);
    
    const lines = text.split('\n').filter(line => line.trim());
    console.log('Number of non-empty lines:', lines.length);
    
    const questions: ExtractedQuestion[] = [];
    let currentQuestion: Partial<ExtractedQuestion> | null = null;
    let questionCounter = 1;
    let answerKey: { [key: number]: string } = {};
    let inAnswerKey = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      console.log(`Line ${i + 1}:`, trimmedLine);
      
      // Check for answer key section
      if (this.questionPatterns.answerKey.test(trimmedLine)) {
        console.log('Found answer key section');
        inAnswerKey = true;
        continue;
      }

      // Parse answer key entries
      if (inAnswerKey) {
        const answerMatch = trimmedLine.match(this.questionPatterns.answerKeyEntry);
        if (answerMatch) {
          const questionNum = parseInt(answerMatch[1]);
          const correctOption = answerMatch[2];
          answerKey[questionNum] = correctOption;
          console.log(`Answer key: Q${questionNum} = ${correctOption}`);
        }
        continue;
      }
      
      // Check for question number
      const questionMatch = trimmedLine.match(this.questionPatterns.questionNumber);
      if (questionMatch) {
        console.log(`Found question ${questionCounter}:`, questionMatch[2]);
        
        // Save previous question if exists
        if (currentQuestion && currentQuestion.text) {
          const finalizedQuestion = this.finalizeQuestion(currentQuestion, questionCounter - 1, answerKey[questionCounter - 1]);
          questions.push(finalizedQuestion);
          console.log(`Added question ${questionCounter - 1}:`, finalizedQuestion);
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
          const optionText = optionAMatch[1].trim();
          currentQuestion.options.push(optionText);
          console.log(`Added option A:`, optionText);
          // Check if this option is marked as correct
          if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
            currentQuestion.correctAnswer = optionText;
            console.log(`Marked A as correct:`, optionText);
          }
        } else if (optionBMatch) {
          currentQuestion.options = currentQuestion.options || [];
          const optionText = optionBMatch[1].trim();
          currentQuestion.options.push(optionText);
          console.log(`Added option B:`, optionText);
          // Check if this option is marked as correct
          if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
            currentQuestion.correctAnswer = optionText;
            console.log(`Marked B as correct:`, optionText);
          }
        } else if (optionCMatch) {
          currentQuestion.options = currentQuestion.options || [];
          const optionText = optionCMatch[1].trim();
          currentQuestion.options.push(optionText);
          console.log(`Added option C:`, optionText);
          // Check if this option is marked as correct
          if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
            currentQuestion.correctAnswer = optionText;
            console.log(`Marked C as correct:`, optionText);
          }
        } else if (optionDMatch) {
          currentQuestion.options = currentQuestion.options || [];
          const optionText = optionDMatch[1].trim();
          currentQuestion.options.push(optionText);
          console.log(`Added option D:`, optionText);
          // Check if this option is marked as correct
          if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
            currentQuestion.correctAnswer = optionText;
            console.log(`Marked D as correct:`, optionText);
          }
        } else if (trimmedLine && currentQuestion.text && !trimmedLine.match(/^[A-D]\)/)) {
          // Append to question text if it's not an option and not empty
          currentQuestion.text += ' ' + trimmedLine;
          console.log(`Appended to question text:`, trimmedLine);
        }
      }
    }

    // Add the last question
    if (currentQuestion && currentQuestion.text) {
      const finalizedQuestion = this.finalizeQuestion(currentQuestion, questionCounter - 1, answerKey[questionCounter - 1]);
      questions.push(finalizedQuestion);
      console.log(`Added final question:`, finalizedQuestion);
    }

    const result = {
      title: this.extractTitle(fileName),
      description: `Quiz extracted from ${fileName}`,
      subject: 'General',
      questions: questions
    };
    
    console.log('Final parsed result:', result);
    return result;
  }

  /**
   * Finalize question structure and set default correct answer
   */
  private static finalizeQuestion(question: Partial<ExtractedQuestion>, index: number, answerKeyOption?: string): ExtractedQuestion {
    const options = question.options || [];
    
    // Determine correct answer
    let correctAnswer = question.correctAnswer || '';
    
    // If we have an answer key option, use it to find the correct answer
    if (answerKeyOption && options.length > 0) {
      const optionIndex = answerKeyOption.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      if (optionIndex >= 0 && optionIndex < options.length) {
        correctAnswer = options[optionIndex];
      }
    }
    
    // If still no correct answer, default to first option
    if (!correctAnswer && options.length > 0) {
      correctAnswer = options[0];
    }
    
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
