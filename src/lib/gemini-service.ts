/**
 * Gemini AI Service for QuestAI
 * Handles interactions with Google's Gemini AI model
 */

import { aiConfig } from './config';

export interface GeminiResponse {
  content: string;
  success: boolean;
  error?: string;
}

export class GeminiService {
  
  /**
   * Send a request to Gemini AI
   */
  static async sendRequest(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      topK?: number;
    } = {}
  ): Promise<GeminiResponse> {
    const { geminiApiKey, geminiApiUrl, geminiModel } = aiConfig;
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }
    
    const {
      temperature = 0.4,
      maxTokens = 4000,
      topP = 0.8,
      topK = 40
    } = options;
    
    try {
      console.log('🤖 Sending request to Gemini AI...');
      
      const response = await fetch(`${geminiApiUrl}/${geminiModel}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP,
            topK
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini');
      }
      
      const content = data.candidates[0].content.parts[0].text;
      
      console.log('✅ Gemini AI response received');
      return {
        content,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Gemini AI request failed:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Test Gemini AI connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendRequest('Hello! Please respond with "OK" if you can hear me.');
      return response.success && response.content.toLowerCase().includes('ok');
    } catch (error) {
      console.error('❌ Gemini connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Generate quiz questions using Gemini
   */
  static async generateQuizQuestions(
    content: string,
    questionCount: number = 10,
    includeExplanations: boolean = true
  ): Promise<GeminiResponse> {
    const prompt = `Convert this educational content into a quiz format. Generate exactly ${questionCount} multiple-choice questions.

Content:
${content.substring(0, 4000)}...

Requirements:
1. Create EXACTLY ${questionCount} high-quality multiple-choice questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Use correctAnswer as 0-based index (0, 1, 2, 3)
4. ${includeExplanations ? 'Include explanations for correct answers' : 'No explanations needed'}
5. Ensure questions cover different aspects of the content
6. Make questions challenging but fair

Return ONLY this JSON structure:
{
  "title": "Quiz Title Based on Content",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      ${includeExplanations ? '"explanation": "Why this answer is correct...",' : ''}
    }
  ]
}

JSON:`;

    return await this.sendRequest(prompt, {
      temperature: 0.3,
      maxTokens: 4000
    });
  }
}
