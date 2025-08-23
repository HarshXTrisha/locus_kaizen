/**
 * Enhanced PDF to JSON Quiz Converter using OSS GPT 20B
 * This service uses the powerful 20B parameter model to intelligently convert PDF content to structured quiz JSON
 */

import { aiConfig } from './config';
import { GeminiService } from './gemini-service';

// QuestAI Platform JSON Template Interface
export interface QuestAIQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index (0, 1, 2, 3) for test portal compatibility
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
  processingMethod: 'oss-gpt-20b' | 'gemini' | 'fallback-pattern-matching';
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
    * Convert extracted PDF text to QuestAI JSON template format using selected AI model
    */
  static async convertToQuestAIJSON(
    pdfText: string, 
    fileName: string,
    options: {
      questionCount?: number;
      includeExplanations?: boolean;
      subject?: string;
      aiModel?: 'oss-gpt' | 'gemini' | 'auto';
    } = {}
  ): Promise<{ quiz: QuestAIQuiz; metadata: ProcessingMetadata }> {
    
    const {
      questionCount = 10,
      includeExplanations = true,
      subject,
      aiModel = 'auto'
    } = options;

    console.log('🚀 Starting PDF to QuestAI JSON conversion...');
    console.log('📝 Text length:', pdfText.length);
    console.log('🎯 Target questions:', questionCount);
    console.log('📊 Include explanations:', includeExplanations);
    console.log('🤖 Selected AI model:', aiModel);

    // Determine which AI model to use
    const selectedModel = aiModel === 'auto' ? aiConfig.preferredModel : aiModel;

    try {
      if (selectedModel === 'gemini') {
        return await this.processWithGemini(pdfText, fileName, options);
      } else {
        return await this.processWithOSSGPT(pdfText, fileName, options);
      }
    } catch (error) {
      console.error(`❌ ${selectedModel.toUpperCase()} conversion failed:`, error);
      
      // Try fallback models
      if (selectedModel === 'gemini') {
        try {
          console.log('🔄 Trying OSS GPT as fallback...');
          return await this.processWithOSSGPT(pdfText, fileName, options);
        } catch (fallbackError) {
          console.error('❌ OSS GPT fallback also failed:', fallbackError);
        }
      } else if (selectedModel === 'oss-gpt') {
        try {
          console.log('🔄 Trying Gemini as fallback...');
          return await this.processWithGemini(pdfText, fileName, options);
        } catch (fallbackError) {
          console.error('❌ Gemini fallback also failed:', fallbackError);
        }
      }
      
      // Final fallback to pattern matching
      const fallbackResult = await this.fallbackProcessing(pdfText, fileName, options);
      return fallbackResult;
        }
  }

  /**
    * Process PDF with Gemini AI
    */
  private static async processWithGemini(
    pdfText: string,
    fileName: string,
    options: any
  ): Promise<{ quiz: QuestAIQuiz; metadata: ProcessingMetadata }> {
    console.log('🤖 Processing with Gemini AI...');
    
    const { questionCount, includeExplanations } = options;
    
    try {
      // Generate quiz using Gemini
      const geminiResponse = await GeminiService.generateQuizQuestions(
        pdfText,
        questionCount,
        includeExplanations
      );
      
      if (!geminiResponse.success) {
        throw new Error(`Gemini processing failed: ${geminiResponse.error}`);
      }
      
      // Extract JSON from response
      const jsonMatch = geminiResponse.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid Gemini response format');
      }
      
      const quiz = JSON.parse(jsonMatch[0]);
      
      // Ensure all questions have required fields in QuestAI format
      quiz.questions = quiz.questions.map((q: any, index: number) => ({
        question: q.question || q.text || `Question ${index + 1}`,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0, // Ensure it's 0-based
        explanation: q.explanation || undefined
      }));
      
      // Validate the quiz
      const validatedQuiz = await this.validateQuestAIQuiz(quiz);
      
      const metadata: ProcessingMetadata = {
        sourceType: 'pdf',
        processingMethod: 'gemini',
        confidence: 90,
        warnings: [],
        originalFileName: fileName,
        processingDate: new Date().toISOString()
      };
      
      console.log('✅ Gemini AI conversion completed successfully');
      return { quiz: validatedQuiz, metadata };
      
    } catch (error) {
      console.error('❌ Gemini processing failed:', error);
      throw error;
    }
  }

  /**
    * Process PDF with OSS GPT 20B
    */
  private static async processWithOSSGPT(
    pdfText: string,
    fileName: string,
    options: any
  ): Promise<{ quiz: QuestAIQuiz; metadata: ProcessingMetadata }> {
    console.log('🤖 Processing with OSS GPT 20B...');
    
    const { questionCount, includeExplanations, subject } = options;
    
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
      console.error('❌ OSS GPT processing failed:', error);
      throw error;
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
       correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0, // Ensure it's 0-based
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
         question.correctAnswer = 0; // Default to first option (0-based)
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
    
    // Use enhanced pattern matching as fallback
    const basicQuestions = this.extractBasicQuestions(text);
    
    // If no questions extracted, create questions from content
    let questions = basicQuestions;
    if (questions.length === 0) {
      questions = this.generateQuestionsFromContent(text, options.questionCount || 10);
    }
    
    const quiz: QuestAIQuiz = {
      title: fileName.replace('.pdf', '').replace(/[-_]/g, ' '),
      description: 'Quiz extracted using enhanced fallback processing',
      questions: questions.slice(0, options.questionCount || 10)
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
    * Generate questions from content when no structured questions are found
    */
  private static generateQuestionsFromContent(text: string, questionCount: number): QuestAIQuestion[] {
    const questions: QuestAIQuestion[] = [];
    
    // Extract key terms and concepts from the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyTerms = this.extractKeyTerms(text);
    
    // Generate questions based on content
    for (let i = 0; i < Math.min(questionCount, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (sentence.length < 30) continue;
      
      // Create a question from the sentence
      const question = this.createQuestionFromSentence(sentence, keyTerms, i);
      if (question) {
        questions.push(question);
      }
    }
    
    return questions;
  }

  /**
    * Extract key terms from text
    */
  private static extractKeyTerms(text: string): string[] {
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordCount: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
    * Create a question from a sentence
    */
  private static createQuestionFromSentence(sentence: string, keyTerms: string[], index: number): QuestAIQuestion | null {
    // Simple question generation logic
    const words = sentence.split(' ');
    if (words.length < 5) return null;
    
    // Create a basic question
    const questionText = `What is the main topic discussed in: "${sentence.substring(0, 100)}..."?`;
    
    // Generate options based on key terms
    const options = [
      keyTerms[0] || 'Topic A',
      keyTerms[1] || 'Topic B', 
      keyTerms[2] || 'Topic C',
      keyTerms[3] || 'Topic D'
    ];
    
    // Ensure unique options
    const uniqueOptions = [...new Set(options)].slice(0, 4);
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`Option ${String.fromCharCode(65 + uniqueOptions.length)}`);
    }
    
    return {
      question: questionText,
      options: uniqueOptions,
      correctAnswer: 0 // Default to first option
    };
  }

  /**
    * Enhanced pattern-based question extraction (fallback)
    */
  private static extractBasicQuestions(text: string): QuestAIQuestion[] {
    const questions: QuestAIQuestion[] = [];
    
    // Try multiple parsing strategies
    let questionBlocks: string[] = [];
    
    // Strategy 1: Split by question numbers (1., 2., etc.)
    questionBlocks = text.split(/\d+\./).filter(block => block.trim().length > 20);
    
    // Strategy 2: If no question numbers, try splitting by "Q1.", "Q2.", etc.
    if (questionBlocks.length <= 1) {
      questionBlocks = text.split(/Q\d+\./i).filter(block => block.trim().length > 20);
    }
    
    // Strategy 3: If still no questions, try splitting by "Question" followed by number
    if (questionBlocks.length <= 1) {
      questionBlocks = text.split(/Question\s+\d+/i).filter(block => block.trim().length > 20);
    }
    
    // Strategy 4: If no structured questions found, create questions from content chunks
    if (questionBlocks.length <= 1) {
      questionBlocks = this.createQuestionsFromContent(text);
    }
    
    console.log(`📝 Found ${questionBlocks.length} potential question blocks`);
    
    for (let i = 0; i < questionBlocks.length && questions.length < 20; i++) {
      const block = questionBlocks[i].trim();
      
      try {
        const question = this.parseQuestionBlock(block);
        if (question && question.question.length > 10) {
          questions.push(question);
        }
      } catch (error) {
        console.log(`Failed to parse question block ${i + 1}:`, error);
      }
    }
    
    return questions;
  }

  /**
    * Create questions from content chunks when no structured questions are found
    */
  private static createQuestionsFromContent(text: string): string[] {
    const chunks: string[] = [];
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Group sentences into chunks
    for (let i = 0; i < sentences.length; i += 3) {
      const chunk = sentences.slice(i, i + 3).join('. ').trim();
      if (chunk.length > 30) {
        chunks.push(chunk);
      }
    }
    
    return chunks;
  }

  /**
    * Parse a single question block into QuestAI format
    */
  private static parseQuestionBlock(block: string): QuestAIQuestion | null {
    // Look for question text (ends with ?)
    const questionMatch = block.match(/([^?]+\?)/);
    if (!questionMatch) return null;
    
    const questionText = questionMatch[1].trim();
    
    // Extract options and answer using improved parsing
    const { options, correctAnswer } = this.extractOptionsAndAnswer(block);
    
    // Ensure we have exactly 4 valid options
    const validOptions = this.ensureValidOptions(options);
    
    // Validate correct answer index
    const validCorrectAnswer = correctAnswer >= 0 && correctAnswer <= validOptions.length - 1 ? correctAnswer : 0;
    
    return {
      question: questionText,
      options: validOptions,
      correctAnswer: validCorrectAnswer
    };
  }

  /**
    * Extract options and answer from question block
    */
  private static extractOptionsAndAnswer(block: string): { options: string[], correctAnswer: number } {
    const options: string[] = [];
    let correctAnswer = 0; // Default to first option (0-based)
    
    // Look for answer pattern first: Answer: [A-D]
    const answerMatch = block.match(/Answer:\s*([A-D])/i);
    if (answerMatch) {
      const answerLetter = answerMatch[1].toUpperCase();
      correctAnswer = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3 (0-based)
    }
    
    // Look for answer pattern with checkmark: [A-D] ✓
    const checkmarkMatch = block.match(/([A-D])\s*[✓✔]/i);
    if (checkmarkMatch) {
      const answerLetter = checkmarkMatch[1].toUpperCase();
      correctAnswer = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3 (0-based)
    }
    
    // Simple approach: split by option letters and extract content
    const parts = block.split(/(?=[A-D]\))/);
    
    for (const part of parts) {
      const optionMatch = part.match(/^[A-D]\)\s*(.+?)(?=\s+[A-D]\)|Answer:|$)/i);
      if (optionMatch) {
        const optionText = optionMatch[1].trim();
        if (optionText.length > 0) {
          options.push(optionText);
        }
      }
    }
    
    // If simple approach didn't work, try regex extraction
    if (options.length === 0) {
      const optionMatches = block.matchAll(/[A-D]\)\s*([^A-D]+?)(?=[A-D]\)|Answer:|$)/g);
      for (const match of optionMatches) {
        const optionText = match[1].trim();
        if (optionText.length > 0) {
          options.push(optionText);
        }
      }
    }
    
    // If still no options found, try inline parsing
    if (options.length === 0) {
      const inlineOptions = this.parseInlineOptions(block);
      if (inlineOptions.length > 0) {
        options.push(...inlineOptions);
      }
    }
    
    return { options, correctAnswer };
  }

  /**
    * Ensure we have exactly 4 valid options
    */
  private static ensureValidOptions(options: string[]): string[] {
    // Remove empty or invalid options
    const validOptions = options.filter(opt => opt && opt.trim().length > 0 && opt.trim() !== '');
    
    // Ensure exactly 4 options
    while (validOptions.length < 4) {
      validOptions.push(`Option ${String.fromCharCode(65 + validOptions.length)}`);
    }
    
    // Trim to 4 options if more
    if (validOptions.length > 4) {
      validOptions.splice(4);
    }
    
    // Remove duplicates while preserving order
    const uniqueOptions: string[] = [];
    for (const option of validOptions) {
      if (!uniqueOptions.includes(option)) {
        uniqueOptions.push(option);
      }
    }
    
    // Fill remaining slots if needed
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`Option ${String.fromCharCode(65 + uniqueOptions.length)}`);
    }
    
    return uniqueOptions.slice(0, 4);
  }

  /**
    * Parse inline options when standard format fails
    */
  private static parseInlineOptions(block: string): string[] {
    const options: string[] = [];
    
    // Look for patterns like "A) Venus B) Mars C) Jupiter D) Saturn"
    const inlineMatch = block.match(/A\)\s*([^B]+?)\s*B\)\s*([^C]+?)\s*C\)\s*([^D]+?)\s*D\)\s*([^Answer]+?)/i);
    
    if (inlineMatch) {
      options.push(
        inlineMatch[1].trim(),
        inlineMatch[2].trim(),
        inlineMatch[3].trim(),
        inlineMatch[4].trim()
      );
    } else {
      // Try alternative pattern for the specific format in your PDF
      // Pattern: "A) Venus  B) Mars  C) Jupiter  D) Saturn"
      const altMatch = block.match(/A\)\s*([^B]+?)\s+B\)\s*([^C]+?)\s+C\)\s*([^D]+?)\s+D\)\s*([^Answer]+?)/i);
      
      if (altMatch) {
        options.push(
          altMatch[1].trim(),
          altMatch[2].trim(),
          altMatch[3].trim(),
          altMatch[4].trim()
        );
      }
    }
    
    return options;
  }


}
