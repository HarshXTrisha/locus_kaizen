# Hugging Face Quiz Analysis Integration

This document explains the AI-powered quiz analysis feature using Hugging Face's flan-t5-base model.

## 🎯 Overview

The quiz analysis feature provides intelligent insights into quiz performance by analyzing answer patterns and providing personalized recommendations.

## 🚀 Features

- **AI-Powered Analysis**: Uses Google's flan-t5-base model for intelligent analysis
- **Rate Limiting**: 25 requests per user per hour
- **JSON Output**: Structured responses for easy integration
- **Error Handling**: Comprehensive error handling and fallback responses
- **Production Ready**: Clean, well-documented code with proper validation

## 📋 API Endpoints

### POST `/api/analyze`

Analyzes quiz answers and returns AI-powered insights.

**Request:**
```json
{
  "answers": "Marketing: wrong, Finance: correct, HR: wrong, Operations: correct"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weak_topics": ["Marketing", "HR"],
    "strong_topics": ["Finance", "Operations"],
    "score": 50,
    "recommendation": "Focus on improving your Marketing and HR knowledge..."
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/analyze`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Quiz Analysis API",
  "model": "google/flan-t5-base",
  "rateLimit": "25 requests per hour",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 Setup

### 1. Environment Variables

Add your Hugging Face token to `.env.local`:
```env
HF_TOKEN=your_huggingface_token_here
```

### 2. Dependencies

The following dependencies are required:
```bash
npm install express-rate-limit
```

## 📁 File Structure

```
src/
├── lib/
│   └── huggingface-service.ts    # Core analysis service
├── app/
│   └── api/
│       └── analyze/
│           └── route.ts          # API endpoint
└── components/
    └── quiz/
        └── QuizAnalysis.tsx      # Frontend component
```

## 🧪 Testing

### Run Test Suite

```bash
npm run test:analyze
```

### Manual Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the health check:
   ```bash
   curl http://localhost:3000/api/analyze
   ```

3. Test analysis with sample data:
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -H "x-user-id: test-user" \
     -d '{"answers": "Marketing: wrong, Finance: correct, HR: wrong, Operations: correct"}'
   ```

## 🔒 Rate Limiting

- **Limit**: 25 requests per user per hour
- **Storage**: In-memory (use Redis for production)
- **Header**: `x-user-id` for user identification

## 🎨 Frontend Integration

### Basic Usage

```tsx
import QuizAnalysis from '@/components/quiz/QuizAnalysis';

function QuizResults() {
  const quizAnswers = "Marketing: wrong, Finance: correct, HR: wrong, Operations: correct";
  
  return (
    <QuizAnalysis 
      quizAnswers={quizAnswers}
      onAnalysisComplete={(result) => {
        console.log('Analysis complete:', result);
      }}
    />
  );
}
```

### Custom Integration

```tsx
const analyzeQuiz = async (answers: string) => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user-123', // Replace with actual user ID
    },
    body: JSON.stringify({ answers })
  });
  
  const data = await response.json();
  return data.data;
};
```

## 🚨 Error Handling

### Common Errors

1. **Rate Limit Exceeded (429)**
   ```json
   {
     "error": "Rate limit exceeded",
     "message": "You have exceeded the limit of 25 requests per hour. Please try again later.",
     "retryAfter": 3600
   }
   ```

2. **Invalid Input (400)**
   ```json
   {
     "error": "Invalid format",
     "message": "Answers must be in format: 'Topic: result, Topic: result'"
   }
   ```

3. **Service Unavailable (503)**
   ```json
   {
     "error": "Service unavailable",
     "message": "AI analysis service is temporarily unavailable"
   }
   ```

### Fallback Response

If the AI service fails, a fallback response is returned:
```json
{
  "weak_topics": ["Unable to analyze"],
  "strong_topics": ["Unable to analyze"],
  "score": 0,
  "recommendation": "Analysis service temporarily unavailable. Please try again later."
}
```

## 🔧 Configuration

### Model Parameters

The flan-t5-base model is configured with:
- **Max Length**: 500 tokens
- **Temperature**: 0.3 (for consistent JSON output)
- **Do Sample**: false (deterministic output)

### Prompt Engineering

The prompt is designed to force JSON output:
```
Analyze these quiz results and return ONLY a valid JSON object with no explanations:

Quiz Results: [answers]

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

JSON:
```

## 🚀 Production Considerations

1. **Rate Limiting**: Use Redis or database for persistent rate limiting
2. **Caching**: Cache analysis results for similar quiz patterns
3. **Monitoring**: Add logging and monitoring for API usage
4. **Security**: Validate user authentication and authorization
5. **Backup**: Implement fallback analysis methods

## 📊 Performance

- **Response Time**: ~2-5 seconds (depends on Hugging Face API)
- **Throughput**: Limited by rate limiting (25/hour per user)
- **Reliability**: High with fallback responses

## 🤝 Contributing

When modifying the analysis logic:

1. Update the prompt in `huggingface-service.ts`
2. Test with various answer patterns
3. Validate JSON output structure
4. Update documentation

## 📞 Support

For issues with the Hugging Face integration:

1. Check the browser console for error messages
2. Verify the HF_TOKEN is correctly set
3. Test the health check endpoint
4. Review rate limiting status
