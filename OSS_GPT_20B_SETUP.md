# OSS GPT 20B Setup Guide

This guide will help you set up the OSS GPT 20B model using OpenRouter for quiz analysis in your QuestAI application.

## 🚀 Quick Setup

### 1. Environment Variables

Create a `.env.local` file in your project root with the following configuration:

```env
# OSS GPT 20B Configuration (OpenRouter)
OPENROUTER_API_KEY=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
OSS_GPT_API_URL=https://openrouter.ai/api/v1
OSS_GPT_MODEL=openai/gpt-oss-20b:free
SITE_URL=http://localhost:3000
SITE_NAME=QuestAI
PREFERRED_AI_MODEL=oss-gpt

# Hugging Face Configuration (legacy/fallback)
HF_TOKEN=your_huggingface_token_here

# Firebase Configuration (your existing config)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Microsoft OAuth Configuration
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Test the Integration

Run the development server:
```bash
npm run dev
```

Test the API endpoint:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"answers": "Marketing: wrong, Finance: correct, HR: wrong, Operations: correct"}'
```

## 🔧 Configuration Details

### OSS GPT 20B Settings

- **API Key**: Your OpenRouter API key (already provided)
- **Model**: `openai/gpt-oss-20b:free` (free tier)
- **Base URL**: `https://openrouter.ai/api/v1`
- **Headers**: Includes site URL and name for OpenRouter analytics

### Model Comparison

| Feature | OSS GPT 20B | Hugging Face (Legacy) |
|---------|-------------|----------------------|
| **Model Size** | 20B parameters | ~250M parameters |
| **Performance** | Higher quality responses | Basic analysis |
| **Cost** | Free tier available | Free |
| **API Format** | OpenAI-compatible | Hugging Face Inference |
| **Response Time** | ~2-5 seconds | ~3-8 seconds |

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/api/analyze
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Quiz Analysis API",
  "model": "openai/gpt-oss-20b:free",
  "rateLimit": "disabled",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Analysis Test
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"answers": "Marketing: wrong, Finance: correct, HR: wrong, Operations: correct"}'
```

Expected response:
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

## 🔄 Fallback Configuration

The system automatically falls back to Hugging Face if OSS GPT is unavailable:

1. **Primary**: OSS GPT 20B (OpenRouter)
2. **Fallback**: Hugging Face (if OSS GPT fails)

To force Hugging Face usage:
```env
PREFERRED_AI_MODEL=huggingface
```

## 📊 Usage Monitoring

### OpenRouter Dashboard
- Visit [OpenRouter Dashboard](https://openrouter.ai/keys)
- Monitor your API usage and costs
- View request analytics

### Application Logs
Check your application logs for:
- `🤖 Using OSS GPT 20B model for analysis...`
- `✅ OSS GPT Analysis completed successfully`
- Any error messages

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**
   ```
   ❌ OSS GPT API key not configured
   ```
   **Solution**: Ensure `OPENROUTER_API_KEY` is set in `.env.local`

2. **Model Not Found**
   ```
   ❌ OSS GPT API Error: 404 - Model not found
   ```
   **Solution**: Verify the model name is `openai/gpt-oss-20b:free`

3. **Rate Limit Exceeded**
   ```
   ❌ OSS GPT API Error: 429 - Rate limit exceeded
   ```
   **Solution**: Check your OpenRouter usage limits

4. **Network Error**
   ```
   ❌ Error in OSS GPT analysis: fetch failed
   ```
   **Solution**: Check internet connection and OpenRouter service status

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
DEBUG=true
```

## 🔒 Security Notes

- Your API key is stored in `.env.local` (not committed to git)
- The key is only used server-side in API routes
- OpenRouter provides usage analytics and monitoring
- Consider setting up usage alerts in OpenRouter dashboard

## 📈 Performance Optimization

### Response Time
- OSS GPT 20B typically responds in 2-5 seconds
- Larger model provides higher quality analysis
- Consider caching results for repeated queries

### Cost Management
- Free tier includes generous limits
- Monitor usage in OpenRouter dashboard
- Set up billing alerts if needed

## 🎯 Next Steps

1. **Test the integration** with sample quiz data
2. **Monitor performance** in your application
3. **Set up alerts** in OpenRouter dashboard
4. **Consider caching** for frequently analyzed patterns
5. **Update documentation** for your team

## 📞 Support

For issues with:
- **OSS GPT Integration**: Check this guide and application logs
- **OpenRouter API**: Visit [OpenRouter Support](https://openrouter.ai/support)
- **Application Issues**: Check your application error logs

---

**Note**: This setup uses the free tier of OSS GPT 20B through OpenRouter. For production use, consider upgrading to paid tiers for higher rate limits and priority access.
