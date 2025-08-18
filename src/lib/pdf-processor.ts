// Conditional import for pdf.js to avoid SSR issues
let pdfjsLib: any = null;

if (typeof window !== 'undefined') {
  // Only import pdf.js on the client side
  import('pdfjs-dist').then((module) => {
    pdfjsLib = module;
    // Set worker source to local file to avoid CDN issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('PDF.js initialized with worker:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  }).catch((error) => {
    console.error('Failed to load PDF.js:', error);
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
    // More flexible question patterns - support various formats
    questionNumber: /^(?:Q|Question)?(\d+)[\.:\)]?\s*(.+)$/i,
    // Option patterns - more flexible with various formats (handle extra parentheses)
    optionA: /^A[\.:\)]\s*(.+?)(?:\s*[✓*]|\s*\)|$)/i,
    optionB: /^B[\.:\)]\s*(.+?)(?:\s*[✓*]|\s*\)|$)/i,
    optionC: /^C[\.:\)]\s*(.+?)(?:\s*[✓*]|\s*\)|$)/i,
    optionD: /^D[\.:\)]\s*(.+?)(?:\s*[✓*]|\s*\)|$)/i,
    // Answer patterns
    answerKey: /^(?:ANSWERS?|ANSWER KEY|Answer):\s*$/i,
    answerKeyEntry: /^(?:Q|Question)?(\d+)[\.:\)]?\s*[A-D][\.:\)]?\s*(.+)$/i,
    // Alternative answer format
    answerLine: /^Answer:\s*[A-D][\.:\)]?\s*(.+)$/i,
    // Additional patterns for better question detection
    questionStart: /^(?:Q|Question)?(\d+)[\.:\)]?\s*$/i,
    // Enhanced patterns for better detection
    questionWithNumber: /^(?:Q|Question)?(\d+)[\.:\)]?\s*(.+)$/i,
    questionWithoutNumber: /^(?:Q|Question)?(\d+)[\.:\)]?\s*$/i,
    // Multiple options on same line (handle extra parentheses)
    multiOptions: /([A-D])[\.:\)]\s*([^A-D]+?)(?=\s*[✓*]|\s*\)|\s+[A-D][\.:\)]|$)/gi,
    // Correct answer indicators
    correctAnswer: /[✓*]/g,
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

    // Ensure worker is properly configured - use a more reliable approach
    try {
      // Try to set worker to local file first
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      console.log('PDF.js library loaded:', !!pdfjsLib);
      console.log('Worker source set to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    } catch (error) {
      // If that fails, disable worker
      console.log('Worker setup failed, disabling worker');
      pdfjsLib.GlobalWorkerOptions.workerSrc = false;
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
       console.log('🔍 FULL EXTRACTED TEXT:');
       console.log('---START OF TEXT---');
       console.log(allText);
       console.log('---END OF TEXT---');

      const result = this.parseQuizText(allText, file.name);
      console.log('Parsed quiz:', result);
      
      return result;
    } catch (error) {
      console.error('Error processing PDF:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Failed to process PDF file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse extracted text into structured quiz data with enhanced error handling and validation
   */
  private static parseQuizText(text: string, fileName: string): ExtractedQuiz {
    console.log('🔍 Starting enhanced PDF parsing...');
    console.log('Parsing text with length:', text.length);
    
    // CRITICAL #3: User Feedback & Debugging
    const parsingStats = {
      totalLines: 0,
      questionsFound: 0,
      optionsFound: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };
    
    // ENHANCED: Handle continuous text without line breaks
    let processedText = text;
    
    // If we have very few lines but lots of text, it's likely continuous
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length <= 3 && text.length > 100) {
      console.log('🔧 Detected continuous text - applying enhanced parsing...');
      // Add spaces before question numbers to help with parsing
      processedText = text.replace(/([A-D]\))([A-Z])/g, '$1 $2');
      processedText = processedText.replace(/(\d+\.)([A-Z])/g, '$1 $2');
      processedText = processedText.replace(/(Q\d+\.)([A-Z])/g, '$1 $2');
    }
    
    const processedLines = processedText.split('\n').filter(line => line.trim());
    parsingStats.totalLines = processedLines.length;
    console.log('Number of non-empty lines:', processedLines.length);
    
    // CRITICAL #4: Fallback Mechanisms - Multiple parsing strategies
    const questions: ExtractedQuestion[] = [];
    let currentQuestion: Partial<ExtractedQuestion> | null = null;
    let questionCounter = 1;
    let answerKey: { [key: number]: string } = {};
    let inAnswerKey = false;
    let parsingStrategy = 'standard'; // Track which strategy we're using

    for (let i = 0; i < processedLines.length; i++) {
      const line = processedLines[i];
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

      // Check for standalone answer lines (e.g., "Answer: C) Tokyo")
      const answerLineMatch = trimmedLine.match(this.questionPatterns.answerLine);
      if (answerLineMatch) {
        console.log(`Found answer line:`, trimmedLine);
        // Extract the option letter (A, B, C, or D)
        const optionMatch = trimmedLine.match(/Answer:\s*([A-D])[\.:\)]?\s*(.+)$/i);
        if (optionMatch && currentQuestion) {
          const optionLetter = optionMatch[1];
          const answerText = optionMatch[2].trim();
          // Find the corresponding option text
          const optionIndex = optionLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          if (currentQuestion.options && currentQuestion.options[optionIndex]) {
            currentQuestion.correctAnswer = currentQuestion.options[optionIndex];
            console.log(`Set correct answer to:`, currentQuestion.correctAnswer);
          }
        }
        continue;
      }
      
             // CRITICAL #2: Robust Question Boundary Detection
       console.log(`🔍 Testing line "${trimmedLine}" against question pattern:`, this.questionPatterns.questionNumber);
       const questionMatch = trimmedLine.match(this.questionPatterns.questionNumber);
       if (questionMatch) {
        console.log(`✅ Found question ${questionCounter}:`, questionMatch[2]);
        parsingStats.questionsFound++;
        
        // CRITICAL #1: Error Correction & Validation - Validate previous question before saving
        if (currentQuestion && currentQuestion.text) {
          const validation = this.validateQuestion(currentQuestion, questionCounter - 1);
          if (validation.isValid) {
            const finalizedQuestion = this.finalizeQuestion(currentQuestion, questionCounter - 1, answerKey[questionCounter - 1]);
            questions.push(finalizedQuestion);
            console.log(`✅ Added validated question ${questionCounter - 1}:`, finalizedQuestion);
          } else {
            parsingStats.errors.push(`Question ${questionCounter - 1}: ${validation.errors.join(', ')}`);
            console.warn(`⚠️ Question ${questionCounter - 1} validation failed:`, validation.errors);
          }
        }
        
        // Start new question with enhanced validation
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

      // ENHANCED: Handle continuous text by splitting on question patterns
      if (lines.length <= 3 && text.length > 100) {
        // Try to split the entire text into questions
        const questionSplits = trimmedLine.split(/(?=Q\d+\.|Question\d+\.|\d+\.)/i);
        if (questionSplits.length > 1) {
          console.log(`🔧 Found ${questionSplits.length} potential questions in continuous text`);
          parsingStrategy = 'continuous-text';
          
          for (const split of questionSplits) {
            if (split.trim().length < 10) continue; // Skip very short splits
            
            // Process each split as a potential question
            const questionText = split.trim();
            console.log(`🔍 Processing split:`, questionText.substring(0, 50) + '...');
            
            // Extract question number and text
            const qMatch = questionText.match(/^(?:Q|Question)?(\d+)[\.:\)]?\s*(.+)$/i);
            if (qMatch) {
              const qNum = parseInt(qMatch[1]);
              const qText = qMatch[2];
              
              // Save previous question if exists
              if (currentQuestion && currentQuestion.text) {
                const validation = this.validateQuestion(currentQuestion, questionCounter - 1);
                if (validation.isValid) {
                  const finalizedQuestion = this.finalizeQuestion(currentQuestion, questionCounter - 1, answerKey[questionCounter - 1]);
                  questions.push(finalizedQuestion);
                  console.log(`✅ Added validated question ${questionCounter - 1}:`, finalizedQuestion);
                }
              }
              
              // Start new question
              currentQuestion = {
                id: `q${qNum}`,
                text: qText.trim(),
                type: 'multiple-choice',
                options: [],
                correctAnswer: '',
                points: 1
              };
              questionCounter = qNum + 1;
              parsingStats.questionsFound++;
            }
          }
          continue;
        }
      }

      // Check for question number without text (e.g., "Q1." on one line, question text on next)
      const questionStartMatch = trimmedLine.match(this.questionPatterns.questionStart);
      if (questionStartMatch) {
        console.log(`Found question start ${questionCounter}:`, trimmedLine);
        
        // Save previous question if exists
        if (currentQuestion && currentQuestion.text) {
          const finalizedQuestion = this.finalizeQuestion(currentQuestion, questionCounter - 1, answerKey[questionCounter - 1]);
          questions.push(finalizedQuestion);
          console.log(`Added question ${questionCounter - 1}:`, finalizedQuestion);
        }
        
        // Start new question with empty text (will be filled by next line)
        currentQuestion = {
          id: `q${questionCounter}`,
          text: '',
          type: 'multiple-choice',
          options: [],
          correctAnswer: '',
          points: 1
        };
        questionCounter++;
        continue;
      }

      // Fallback: If we find options without a question number, create a question
      const hasOptions = this.questionPatterns.optionA.test(trimmedLine) || 
                        this.questionPatterns.optionB.test(trimmedLine) || 
                        this.questionPatterns.optionC.test(trimmedLine) || 
                        this.questionPatterns.optionD.test(trimmedLine);
      
      if (hasOptions && !currentQuestion) {
        console.log(`Found options without question number, creating question ${questionCounter}`);
        currentQuestion = {
          id: `q${questionCounter}`,
          text: `Question ${questionCounter}`, // Default text
          type: 'multiple-choice',
          options: [],
          correctAnswer: '',
          points: 1
        };
        questionCounter++;
      }

             // Check for options
       if (currentQuestion) {
         console.log(`🔍 Testing line "${trimmedLine}" for options...`);
         const optionAMatch = trimmedLine.match(this.questionPatterns.optionA);
         const optionBMatch = trimmedLine.match(this.questionPatterns.optionB);
         const optionCMatch = trimmedLine.match(this.questionPatterns.optionC);
         const optionDMatch = trimmedLine.match(this.questionPatterns.optionD);

                 if (optionAMatch) {
           currentQuestion.options = currentQuestion.options || [];
           let optionText = optionAMatch[1].trim();
           // Remove trailing parentheses and checkmarks
           optionText = optionText.replace(/\s*[✓*]\s*\)?\s*$/, '');
           currentQuestion.options.push(optionText);
           parsingStats.optionsFound++;
           console.log(`✅ Added option A:`, optionText);
           // Check if this option is marked as correct
           if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
             currentQuestion.correctAnswer = optionText;
             console.log(`🎯 Marked A as correct:`, optionText);
           }
         } else if (optionBMatch) {
           currentQuestion.options = currentQuestion.options || [];
           let optionText = optionBMatch[1].trim();
           // Remove trailing parentheses and checkmarks
           optionText = optionText.replace(/\s*[✓*]\s*\)?\s*$/, '');
           currentQuestion.options.push(optionText);
           parsingStats.optionsFound++;
           console.log(`✅ Added option B:`, optionText);
           // Check if this option is marked as correct
           if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
             currentQuestion.correctAnswer = optionText;
             console.log(`🎯 Marked B as correct:`, optionText);
           }
         } else if (optionCMatch) {
           currentQuestion.options = currentQuestion.options || [];
           let optionText = optionCMatch[1].trim();
           // Remove trailing parentheses and checkmarks
           optionText = optionText.replace(/\s*[✓*]\s*\)?\s*$/, '');
           currentQuestion.options.push(optionText);
           parsingStats.optionsFound++;
           console.log(`✅ Added option C:`, optionText);
           // Check if this option is marked as correct
           if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
             currentQuestion.correctAnswer = optionText;
             console.log(`🎯 Marked C as correct:`, optionText);
           }
         } else if (optionDMatch) {
           currentQuestion.options = currentQuestion.options || [];
           let optionText = optionDMatch[1].trim();
           // Remove trailing parentheses and checkmarks
           optionText = optionText.replace(/\s*[✓*]\s*\)?\s*$/, '');
           currentQuestion.options.push(optionText);
           parsingStats.optionsFound++;
           console.log(`✅ Added option D:`, optionText);
           // Check if this option is marked as correct
           if (trimmedLine.includes('✓') || trimmedLine.includes('*')) {
             currentQuestion.correctAnswer = optionText;
             console.log(`🎯 Marked D as correct:`, optionText);
           }
        } else {
                     // Check if this line contains multiple options (e.g., "B) Osaka C) Tokyo D) Hiroshima")
           const multiOptionMatch = trimmedLine.match(/([A-D])[\.:\)]\s*([^A-D]+?)(?=\s*[✓*]|\s*\)|\s+[A-D][\.:\)]|$)/gi);
           if (multiOptionMatch && currentQuestion && currentQuestion.options) {
             console.log(`Found multiple options on same line:`, trimmedLine);
             // Parse each option
             multiOptionMatch.forEach(match => {
               const optionMatch = match.match(/([A-D])[\.:\)]\s*(.+)/i);
               if (optionMatch && currentQuestion) {
                 const optionLetter = optionMatch[1];
                 let optionText = optionMatch[2].trim();
                 // Remove trailing parentheses and checkmarks
                 optionText = optionText.replace(/\s*[✓*]\s*\)?\s*$/, '');
                 const optionIndex = optionLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                 
                 // Ensure we have enough options
                 while (currentQuestion.options!.length <= optionIndex) {
                   currentQuestion.options!.push('');
                 }
                 currentQuestion.options![optionIndex] = optionText;
                 console.log(`Added option ${optionLetter}:`, optionText);
               }
             });
          } else if (trimmedLine && !trimmedLine.match(/^[A-D]\)/) && !trimmedLine.match(/^Answer:/i) && !trimmedLine.match(/^ANSWERS?/i)) {
            // Only append to question text if it's not an option, answer line, or answer key
            // and if we haven't started collecting options yet
            if (currentQuestion.options && currentQuestion.options.length === 0) {
              currentQuestion.text += ' ' + trimmedLine;
              console.log(`Appended to question text:`, trimmedLine);
            }
          }
        }
      }
    }

    // CRITICAL #1: Error Correction & Validation - Validate and add the last question
    if (currentQuestion && currentQuestion.text) {
      const validation = this.validateQuestion(currentQuestion, questionCounter - 1);
      if (validation.isValid) {
        const finalizedQuestion = this.finalizeQuestion(currentQuestion, questionCounter - 1, answerKey[questionCounter - 1]);
        questions.push(finalizedQuestion);
        console.log(`✅ Added final validated question:`, finalizedQuestion);
      } else {
        parsingStats.errors.push(`Final question: ${validation.errors.join(', ')}`);
        console.warn(`⚠️ Final question validation failed:`, validation.errors);
      }
    }

    // CRITICAL #5: Data Integrity Checks - Validate entire quiz before returning
    const result = {
      title: this.extractTitle(fileName),
      description: `Quiz extracted from ${fileName}`,
      subject: 'General',
      questions: questions
    };

    // Enhanced validation and user feedback
    const quizValidation = this.validateQuiz(result);
    if (!quizValidation.isValid) {
      parsingStats.errors.push(...quizValidation.errors);
    }

    // CRITICAL #3: User Feedback & Debugging - Log comprehensive parsing results
    console.log('📊 PARSING STATISTICS:', {
      totalLines: parsingStats.totalLines,
      questionsFound: parsingStats.questionsFound,
      optionsFound: parsingStats.optionsFound,
      errors: parsingStats.errors.length,
      warnings: parsingStats.warnings.length,
      parsingStrategy,
      finalQuestionCount: questions.length
    });

    if (parsingStats.errors.length > 0) {
      console.error('❌ PARSING ERRORS:', parsingStats.errors);
    }
    if (parsingStats.warnings.length > 0) {
      console.warn('⚠️ PARSING WARNINGS:', parsingStats.warnings);
    }

    console.log('🎯 Final parsed result:', result);
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
    if (options.length === 2 && options.every(opt => /^(True|False)$/i.test(opt))) {
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
   * CRITICAL #1: Validate individual question during parsing
   */
  private static validateQuestion(question: Partial<ExtractedQuestion>, index: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check question text
    if (!question.text || !question.text.trim()) {
      errors.push('Question text is missing or empty');
    }

    // Check options for multiple choice
    if (question.type === 'multiple-choice' || !question.type) {
      if (!question.options || question.options.length < 2) {
        errors.push(`Question needs at least 2 options (found: ${question.options?.length || 0})`);
      }
      
      // Check for empty options
      if (question.options) {
        const emptyOptions = question.options.filter(opt => !opt || !opt.trim());
        if (emptyOptions.length > 0) {
          errors.push(`Question has ${emptyOptions.length} empty option(s)`);
        }
      }
    }

    // Check correct answer
    if (!question.correctAnswer || !question.correctAnswer.trim()) {
      errors.push('Question has no correct answer');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * CRITICAL #5: Validate extracted quiz data with enhanced checks
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

      // Additional integrity checks
      if (question.options && question.options.length > 0) {
        const duplicateOptions = question.options.filter((opt, i) => 
          question.options!.indexOf(opt) !== i
        );
        if (duplicateOptions.length > 0) {
          errors.push(`Question ${index + 1} has duplicate options`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
