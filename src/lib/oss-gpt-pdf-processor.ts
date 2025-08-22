/**
 * Enhanced PDF to JSON Quiz Converter using OSS GPT 20B
 * This service uses the powerful 20B parameter model to intelligently convert PDF content to structured quiz JSON
 */

import { aiConfig } from './config';

// QuestAI Platform JSON Template Interface
export interface QuestAIQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index (0, 1, 2, 3)
  explanation?: string;
}

export interface QuestAIQuiz {
  title: string;
  description: string;
  questions: QuestAIQuestion[];
}

// Enhanced metadata for processing
export interface ProcessingMetadata {
  sourceType: 'pdf';
  processingMethod: 'oss-gpt-20b';
  confidence: number; // 0-100
  warnings: string[];
  originalFileName: string;
  processingDate: string;
}

/**
 * Enhanced PDF to JSON converter using OSS GPT 20B
 */
export class OSSGPTPDFProcessor {
  
  /**
   * Convert extracted PDF text to QuestAI JSON template format using OSS GPT 20B
   */
  static async convertToQuestAIJSON(
    pdfText: string, 
    fileName: string,
    options: {
      questionCount?: number;
      includeExplanations?: boolean;
      subject?: string;
    } = {}
  ): Promise<{ quiz: QuestAIQuiz; metadata: ProcessingMetadata }> {
    
         const {
       questionCount = 10,
       includeExplanations = true,
       subject
     } = options;

         console.log('🚀 Starting OSS GPT 20B PDF to QuestAI JSON conversion...');
     console.log('📝 Text length:', pdfText.length);
     console.log('🎯 Target questions:', questionCount);
     console.log('📊 Include explanations:', includeExplanations);

    try {
             // Step 1: Analyze content and extract metadata
       const contentAnalysis = await this.analyzeContent(pdfText, subject);
       console.log('📊 Content analysis completed:', contentAnalysis);

       // Step 2: Generate QuestAI format quiz
       const quiz = await this.generateQuestAIQuiz(
         pdfText, 
         fileName, 
         contentAnalysis,
         {
           questionCount,
           includeExplanations
         }
       );

       // Step 3: Validate and enhance the quiz
       const validatedQuiz = await this.validateQuestAIQuiz(quiz);

       // Step 4: Create metadata
       const metadata: ProcessingMetadata = {
         sourceType: 'pdf',
         processingMethod: 'oss-gpt-20b',
         confidence: 85,
         warnings: [],
         originalFileName: fileName,
         processingDate: new Date().toISOString()
       };

       console.log('✅ OSS GPT 20B conversion completed successfully');
       return { quiz: validatedQuiz, metadata };

         } catch (error) {
       console.error('❌ OSS GPT 20B conversion failed:', error);
       
       // Fallback to basic processing
       const fallbackResult = await this.fallbackProcessing(pdfText, fileName, options);
       return fallbackResult;
     }
  }

  /**
   * Analyze PDF content to understand structure and topics
   */
  private static async analyzeContent(text: string, subject?: string): Promise<{
    mainTopics: string[];
    estimatedDifficulty: 'easy' | 'medium' | 'hard';
    contentType: string;
    keyTerms: string[];
    suggestedQuestionCount: number;
  }> {
    const { ossGptApiKey, ossGptApiUrl, ossGptModel, siteUrl, siteName } = aiConfig;

    if (!ossGptApiKey) {
      throw new Error('OSS GPT API key not configured');
    }

    const analysisPrompt = `Analyze this educational content and provide a structured analysis. Return ONLY valid JSON.

Content to analyze:
${text.substring(0, 3000)}...

${subject ? `Expected Subject: ${subject}` : ''}

Instructions:
1. Identify 3-5 main topics covered
2. Assess the difficulty level (easy/medium/hard)
3. Determine content type (textbook, lecture notes, study guide, etc.)
4. Extract 5-10 key terms/concepts
5. Suggest optimal number of questions (5-20)

Return ONLY this JSON structure:
{
  "mainTopics": ["topic1", "topic2", "topic3"],
  "estimatedDifficulty": "medium",
  "contentType": "textbook chapter",
  "keyTerms": ["term1", "term2", "term3"],
  "suggestedQuestionCount": 12
}

JSON:`;

    const response = await fetch(`${ossGptApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ossGptApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
      },
      body: JSON.stringify({
        model: ossGptModel,
        messages: [
          {
            role: 'system',
            content: 'You are an educational content analyzer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`Content analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid analysis response format');
    }

    return JSON.parse(jsonMatch[0]);
  }

     /**
    * Generate QuestAI format quiz using OSS GPT 20B
    */
   private static async generateQuestAIQuiz(
     text: string,
     fileName: string,
     contentAnalysis: any,
     options: any
   ): Promise<QuestAIQuiz> {
    const { ossGptApiKey, ossGptApiUrl, ossGptModel, siteUrl, siteName } = aiConfig;

         const quizPrompt = `Convert this educational content into a QuestAI quiz format. Generate exactly ${options.questionCount} multiple-choice questions.

Source Content:
${text.substring(0, 4000)}...

Content Analysis:
- Main Topics: ${contentAnalysis.mainTopics.join(', ')}
- Key Terms: ${contentAnalysis.keyTerms.join(', ')}

IMPORTANT: Follow the QuestAI JSON template format exactly:
- Each question must have exactly 4 options (A, B, C, D)
- correctAnswer must be a number (0, 1, 2, or 3) representing the 0-based index of the correct option
- 0 = first option, 1 = second option, 2 = third option, 3 = fourth option
- ${options.includeExplanations ? 'Include explanations for correct answers' : 'No explanations needed'}

Requirements:
1. Create EXACTLY ${options.questionCount} high-quality multiple-choice questions
2. Each question must have exactly 4 options
3. Use correctAnswer as 0-based index (0, 1, 2, 3)
4. ${options.includeExplanations ? 'Provide clear explanations for correct answers' : 'No explanations needed'}
5. Ensure questions cover different aspects of the content
6. Make questions challenging but fair
7. Follow the exact JSON structure below

Return ONLY this JSON structure:
{
  "title": "Quiz Title Based on Content",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      ${options.includeExplanations ? '"explanation": "Why this answer is correct...",' : ''}
    }
  ]
}

JSON:`;

    const response = await fetch(`${ossGptApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ossGptApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
      },
      body: JSON.stringify({
        model: ossGptModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz creator. Create high-quality educational questions that test understanding, not just memorization. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: quizPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Quiz generation failed: ${response.status}`);
    }

    const data = await response.json();
    const quizText = data.choices?.[0]?.message?.content;

    if (!quizText) {
      throw new Error('No quiz generated');
    }

    // Extract JSON from response
    const jsonMatch = quizText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid quiz response format');
    }

    const quiz = JSON.parse(jsonMatch[0]);
    
         // Ensure all questions have required fields in QuestAI format
     quiz.questions = quiz.questions.map((q: any, index: number) => ({
       question: q.question || q.text || `Question ${index + 1}`,
       options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
       correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0, // Ensure it's a number
       explanation: q.explanation || undefined
     }));

     return quiz;
  }

     /**
    * Validate and enhance the generated QuestAI quiz
    */
   private static async validateQuestAIQuiz(quiz: QuestAIQuiz): Promise<QuestAIQuiz> {
    const warnings: string[] = [];

    // Validate structure
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('No questions generated');
    }

         // Validate each question
     quiz.questions.forEach((question, index) => {
       if (!question.question || question.question.trim().length < 10) {
         warnings.push(`Question ${index + 1}: Text too short or missing`);
       }

       if (!question.options || question.options.length !== 4) {
         warnings.push(`Question ${index + 1}: Must have exactly 4 options`);
         // Fix by ensuring 4 options
         while (question.options.length < 4) {
           question.options.push(`Option ${String.fromCharCode(65 + question.options.length)}`);
         }
         question.options = question.options.slice(0, 4);
       }

       if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
         warnings.push(`Question ${index + 1}: Invalid correctAnswer index`);
         question.correctAnswer = 0; // Default to first option
       }
     });

     return quiz;
  }

     /**
    * Fallback processing if OSS GPT fails
    */
   private static async fallbackProcessing(
     text: string, 
     fileName: string, 
     options: any
   ): Promise<{ quiz: QuestAIQuiz; metadata: ProcessingMetadata }> {
    console.log('🔄 Using fallback processing...');
    
         // Use basic pattern matching as fallback
     const basicQuestions = this.extractBasicQuestions(text);
     
     const quiz: QuestAIQuiz = {
       title: fileName.replace('.pdf', '').replace(/[-_]/g, ' '),
       description: 'Quiz extracted using fallback processing',
       questions: basicQuestions.slice(0, options.questionCount || 10)
     };

     const metadata: ProcessingMetadata = {
       sourceType: 'pdf',
       processingMethod: 'fallback-pattern-matching',
       confidence: 60,
       warnings: ['Used fallback processing due to AI service unavailability'],
       originalFileName: fileName,
       processingDate: new Date().toISOString()
     };

     return { quiz, metadata };
  }

     /**
    * Basic pattern-based question extraction (fallback)
    */
      private static extractBasicQuestions(text: string): QuestAIQuestion[] {
     const questions: QuestAIQuestion[] = [];
     const lines = text.split('\n');
     
     let currentQuestion: Partial<QuestAIQuestion> | null = null;
     let questionCounter = 1;

     for (const line of lines) {
       const trimmed = line.trim();
       
       // Simple question detection
       const questionMatch = trimmed.match(/^\d+\.?\s*(.+)/);
       if (questionMatch && trimmed.includes('?')) {
         if (currentQuestion && currentQuestion.question) {
           questions.push(this.finalizeBasicQuestion(currentQuestion, questionCounter - 1));
         }
         
         currentQuestion = {
           question: questionMatch[1],
           options: [],
           correctAnswer: 0
         };
         questionCounter++;
       }
       
       // Simple option detection
       const optionMatch = trimmed.match(/^[A-D][\.)]\s*(.+)/);
       if (optionMatch && currentQuestion) {
         currentQuestion.options = currentQuestion.options || [];
         currentQuestion.options.push(optionMatch[1]);
       }
     }
     
     // Add last question
     if (currentQuestion && currentQuestion.question) {
       questions.push(this.finalizeBasicQuestion(currentQuestion, questionCounter - 1));
     }

     return questions;
   }

     /**
    * Finalize basic question structure
    */
   private static finalizeBasicQuestion(
     question: Partial<QuestAIQuestion>, 
     index: number
   ): QuestAIQuestion {
     return {
       question: question.question || `Question ${index + 1}`,
       options: question.options && question.options.length >= 4 ? question.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
       correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0
     };
   }
}
