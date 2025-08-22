/**
 * OSS GPT 20B API Service for Quiz Analysis
 * Uses OSS GPT 20B model for intelligent quiz result analysis
 */

interface QuizAnalysisResponse {
  weak_topics: string[];
  strong_topics: string[];
  score: number;
  recommendation: string;
}

interface OSSGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Analyzes quiz answers using OSS GPT 20B model
 * @param answers - String containing quiz answers in format "Topic: result, Topic: result"
 * @returns Promise<QuizAnalysisResponse> - Structured analysis of quiz performance
 */
export async function analyzeQuizWithOSSGPT(answers: string): Promise<QuizAnalysisResponse> {
  const { ossGptApiKey, ossGptApiUrl, ossGptModel, siteUrl, siteName } = await import('./config').then(m => m.aiConfig);

  if (!ossGptApiKey) {
    throw new Error('OSS GPT API key not configured');
  }

  // Construct the prompt for OSS GPT
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
    console.log('🤖 Sending request to OSS GPT API...');
    
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
            content: 'You are an AI assistant that analyzes quiz results and provides structured feedback. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OSS GPT API Error:', response.status, errorText);
      throw new Error(`OSS GPT API error: ${response.status} - ${errorText}`);
    }

    const data: OSSGPTResponse = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response generated from OSS GPT API');
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
      throw new Error('Invalid response structure from OSS GPT API');
    }

    // Ensure score is within valid range
    analysis.score = Math.max(0, Math.min(100, analysis.score));

    console.log('✅ OSS GPT Analysis completed successfully');
    return analysis;

  } catch (error) {
    console.error('❌ Error in OSS GPT analysis:', error);
    
    // Return fallback response
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
 * @param answers - String containing quiz answers
 * @returns boolean - True if format is valid
 */
export function validateQuizAnswers(answers: string): boolean {
  // Check if answers contain the expected format: "Topic: result, Topic: result"
  const pattern = /^[^:]+:\s*(correct|wrong)(?:\s*,\s*[^:]+:\s*(correct|wrong))*$/i;
  return pattern.test(answers.trim());
}

/**
 * Formats quiz answers for better AI analysis
 * @param answers - Raw quiz answers string
 * @returns string - Formatted answers
 */
export function formatQuizAnswers(answers: string): string {
  return answers.trim().replace(/\s+/g, ' ');
}
