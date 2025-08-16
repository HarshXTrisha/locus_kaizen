// PDF Processing Utility for Quiz Creation

export interface ExtractedQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface PDFProcessingResult {
  success: boolean;
  questions: ExtractedQuestion[];
  error?: string;
  totalQuestions: number;
  processingTime: number;
}

// Common question patterns to look for in PDF text
const QUESTION_PATTERNS = [
  /^\d+\.\s*(.+?)(?=\n\d+\.|$)/gms, // "1. Question text"
  /^Q\d+\.\s*(.+?)(?=\nQ\d+\.|$)/gms, // "Q1. Question text"
  /^Question\s*\d+\.\s*(.+?)(?=\nQuestion\s*\d+\.|$)/gms, // "Question 1. Question text"
  /^\(\d+\)\s*(.+?)(?=\n\(\d+\)|$)/gms, // "(1) Question text"
];

// Answer option patterns
const ANSWER_PATTERNS = [
  /^[A-D]\)\s*(.+?)(?=\n[A-D]\)|$)/gms, // "A) Option text"
  /^[A-D]\.\s*(.+?)(?=\n[A-D]\.|$)/gms, // "A. Option text"
  /^[A-D]\s*(.+?)(?=\n[A-D]\s|$)/gms, // "A Option text"
];

// Correct answer indicators
const CORRECT_ANSWER_INDICATORS = [
  /correct.*answer.*is.*([A-D])/i,
  /answer.*is.*([A-D])/i,
  /([A-D]).*correct/i,
  /([A-D]).*right/i,
];

/**
 * Process PDF text to extract questions and answers
 */
export async function processPDFText(pdfText: string): Promise<PDFProcessingResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Processing PDF text for questions...');
    
    // Clean the text
    const cleanedText = cleanText(pdfText);
    
    // Extract questions
    const questions = extractQuestions(cleanedText);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Extracted ${questions.length} questions in ${processingTime}ms`);
    
    return {
      success: true,
      questions,
      totalQuestions: questions.length,
      processingTime
    };
    
  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    return {
      success: false,
      questions: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      totalQuestions: 0,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Clean and normalize text from PDF
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract questions from cleaned text
 */
function extractQuestions(text: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];
  let questionIndex = 1;
  
  // Try different question patterns
  for (const pattern of QUESTION_PATTERNS) {
    const matches = text.matchAll(pattern);
    
    for (const match of matches) {
      const questionText = match[1]?.trim();
      if (!questionText) continue;
      
      // Extract answer options for this question
      const options = extractAnswerOptions(questionText);
      const correctAnswer = extractCorrectAnswer(questionText);
      
      const question: ExtractedQuestion = {
        id: `q${questionIndex}`,
        text: cleanQuestionText(questionText),
        type: options.length > 0 ? 'multiple-choice' : 'short-answer',
        options: options.length > 0 ? options : undefined,
        correctAnswer: correctAnswer || options[0] || '',
        points: 1
      };
      
      questions.push(question);
      questionIndex++;
    }
    
    // If we found questions with this pattern, break
    if (questions.length > 0) break;
  }
  
  // If no questions found with patterns, try to split by common delimiters
  if (questions.length === 0) {
    const questionBlocks = text.split(/\n\s*\n/);
    
    for (const block of questionBlocks) {
      const trimmedBlock = block.trim();
      if (trimmedBlock.length > 20) { // Minimum question length
        const question: ExtractedQuestion = {
          id: `q${questionIndex}`,
          text: trimmedBlock,
          type: 'short-answer',
          correctAnswer: '',
          points: 1
        };
        
        questions.push(question);
        questionIndex++;
      }
    }
  }
  
  return questions;
}

/**
 * Extract answer options from question text
 */
function extractAnswerOptions(questionText: string): string[] {
  const options: string[] = [];
  
  // Look for answer options in the question text
  for (const pattern of ANSWER_PATTERNS) {
    const matches = questionText.matchAll(pattern);
    
    for (const match of matches) {
      const optionText = match[1]?.trim();
      if (optionText && optionText.length > 1) {
        options.push(optionText);
      }
    }
    
    if (options.length > 0) break;
  }
  
  return options;
}

/**
 * Extract correct answer from question text
 */
function extractCorrectAnswer(questionText: string): string {
  for (const pattern of CORRECT_ANSWER_INDICATORS) {
    const match = questionText.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return '';
}

/**
 * Clean question text by removing answer options and indicators
 */
function cleanQuestionText(questionText: string): string {
  let cleanedText = questionText;
  
  // Remove answer options
  for (const pattern of ANSWER_PATTERNS) {
    cleanedText = cleanedText.replace(pattern, '');
  }
  
  // Remove correct answer indicators
  for (const pattern of CORRECT_ANSWER_INDICATORS) {
    cleanedText = cleanedText.replace(pattern, '');
  }
  
  // Clean up extra whitespace
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  return cleanedText;
}

/**
 * Validate extracted questions
 */
export function validateQuestions(questions: ExtractedQuestion[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (questions.length === 0) {
    errors.push('No questions were extracted from the PDF');
  }
  
  questions.forEach((question, index) => {
    if (!question.text || question.text.length < 10) {
      errors.push(`Question ${index + 1} has insufficient text`);
    }
    
    if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
      errors.push(`Question ${index + 1} is marked as multiple-choice but has insufficient options`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
