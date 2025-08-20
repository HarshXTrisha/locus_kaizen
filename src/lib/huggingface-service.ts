/**
 * Hugging Face API Service for Quiz Analysis
 * Uses flan-t5-base model for intelligent quiz result analysis
 */

interface QuizAnalysisResponse {
  weak_topics: string[];
  strong_topics: string[];
  score: number;
  recommendation: string;
}

interface HuggingFaceResponse {
  [0]: {
    generated_text: string;
  };
}

/**
 * Analyzes quiz answers using Hugging Face flan-t5-base model
 * @param answers - String containing quiz answers in format "Topic: result, Topic: result"
 * @returns Promise<QuizAnalysisResponse> - Structured analysis of quiz performance
 */
export async function analyzeQuiz(answers: string): Promise<QuizAnalysisResponse> {
  const HF_TOKEN = process.env.HF_TOKEN;
  const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-base';

  if (!HF_TOKEN) {
    throw new Error('Hugging Face token not configured');
  }

  // Construct the prompt to force JSON output
  const prompt = `Analyze these quiz results and return ONLY a valid JSON object with no explanations:

Quiz Results: ${answers}

Instructions: 
1. Identify weak topics (where answers were wrong)
2. Identify strong topics (where answers were correct) 
3. Calculate score as percentage (0-100)
4. Provide a personalized recommendation for improvement

Return ONLY a valid JSON object in this exact format:
{
  "weak_topics": ["topic1", "topic2"],
  "strong_topics": ["topic3", "topic4"], 
  "score": 75,
  "recommendation": "Focus on improving weak topics..."
}

JSON:`;

  try {
    console.log('🤖 Sending request to Hugging Face API...');
    
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.3, // Lower temperature for more consistent JSON output
          do_sample: false, // Deterministic output
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Hugging Face API Error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const data: HuggingFaceResponse = await response.json();
    const generatedText = data[0]?.generated_text;

    if (!generatedText) {
      throw new Error('No response generated from Hugging Face API');
    }

    console.log('📝 Raw AI Response:', generatedText);

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const jsonString = jsonMatch[0];
    console.log('🔍 Extracted JSON:', jsonString);

    // Parse the JSON response
    const analysis: QuizAnalysisResponse = JSON.parse(jsonString);

    // Validate the response structure
    if (!analysis.weak_topics || !analysis.strong_topics || 
        typeof analysis.score !== 'number' || !analysis.recommendation) {
      throw new Error('Invalid response structure from AI model');
    }

    console.log('✅ Quiz analysis completed successfully');
    return analysis;

  } catch (error) {
    console.error('❌ Error analyzing quiz:', error);
    
    // Return fallback response if AI analysis fails
    return {
      weak_topics: ['Unable to analyze'],
      strong_topics: ['Unable to analyze'],
      score: 0,
      recommendation: 'Analysis service temporarily unavailable. Please try again later.'
    };
  }
}

/**
 * Validates quiz answers format
 * @param answers - String to validate
 * @returns boolean - True if format is valid
 */
export function validateQuizAnswers(answers: string): boolean {
  if (!answers || typeof answers !== 'string') {
    return false;
  }

  // Check if it contains the expected format (topic: result)
  const pattern = /[^:]+:\s*(correct|wrong|incorrect)/i;
  return pattern.test(answers);
}

/**
 * Formats quiz answers for better AI analysis
 * @param answers - Raw quiz answers
 * @returns string - Formatted answers
 */
export function formatQuizAnswers(answers: string): string {
  return answers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
