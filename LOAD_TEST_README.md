# 🧪 Load Testing Guide for QuestAI

This load test simulates 80 concurrent users taking a 60-question quiz on both desktop and mobile versions of the QuestAI test portal.

## 📊 Test Configuration

- **Total Users**: 80 concurrent users
- **Questions per User**: 60 questions each
- **Test Duration**: 22 minutes total
- **Device Mix**: 50% desktop, 50% mobile users
- **Question Time**: 10-60 seconds per question (realistic simulation)

## 🎯 Test Stages

1. **Ramp Up (2m)**: 0 → 20 users
2. **Ramp Up (3m)**: 20 → 40 users  
3. **Ramp Up (5m)**: 40 → 80 users
4. **Sustained Load (10m)**: 80 users (peak load)
5. **Ramp Down (2m)**: 80 → 0 users

## 📈 Performance Thresholds

- **Response Time**: 95% of requests < 5 seconds
- **Error Rate**: < 10%
- **Success Rate**: > 90%

## 🛠️ Prerequisites

1. **Install k6**:
   ```bash
   npm install -g k6
   ```

2. **Start the QuestAI application**:
   ```bash
   npm run dev
   ```

3. **Upload the test quiz** (optional):
   - Use the `test-quiz-60-questions.json` file
   - Upload via the upload page or API

## 🚀 Running the Load Test

### Local Testing
```bash
npm run load-test-local
```

### Production Testing
```bash
npm run load-test-prod
```

### Custom URL
```bash
k6 run --env BASE_URL=https://your-domain.com load-test-80-users-60-questions.js
```

## 📱 What the Test Simulates

### Desktop Users (50%)
- Chrome, Firefox, Safari browsers
- Full desktop experience
- Larger screen interactions

### Mobile Users (50%)
- iPhone Safari, Android Chrome
- Mobile-optimized interface
- Touch interactions

### Test Flow for Each User
1. **Load Main Page** - Simulates landing on the site
2. **Load Quiz Page** - Navigate to the test quiz
3. **Answer 60 Questions** - Realistic question answering with:
   - 10-60 seconds per question
   - Random answer selection
   - 10% chance of flagging questions
4. **Submit Quiz** - Complete the test
5. **View Results** - Check the results page

## 📊 Expected Results

### Performance Metrics
- **Throughput**: ~2,400 questions/minute at peak
- **Response Time**: < 3 seconds for most requests
- **Error Rate**: < 5%
- **Success Rate**: > 95%

### System Impact
- **Database Load**: High read/write operations
- **Memory Usage**: Increased due to concurrent sessions
- **CPU Usage**: Moderate to high during peak load
- **Network**: Significant bandwidth usage

## 🔍 Monitoring During Test

### Key Metrics to Watch
1. **Response Times** - Should stay under 5 seconds
2. **Error Rates** - Should remain below 10%
3. **System Resources** - CPU, Memory, Database connections
4. **User Experience** - Both desktop and mobile flows

### What to Look For
- **Performance Degradation** - Slower response times
- **Error Spikes** - Increased error rates
- **Resource Bottlenecks** - High CPU/Memory usage
- **Database Issues** - Connection timeouts or slow queries

## 🛠️ Troubleshooting

### Common Issues
1. **k6 not found**: Install k6 globally
2. **Connection refused**: Ensure app is running on correct port
3. **High error rates**: Check server logs for issues
4. **Slow performance**: Monitor system resources

### Debug Commands
```bash
# Check if k6 is installed
k6 version

# Test with fewer users first
k6 run --vus 10 --duration 1m load-test-80-users-60-questions.js

# Check app status
curl http://localhost:3000/api/health
```

## 📈 Interpreting Results

### Good Performance
- Response times < 3 seconds
- Error rate < 5%
- Success rate > 95%
- System resources stable

### Areas for Improvement
- Response times > 5 seconds
- Error rate > 10%
- Success rate < 90%
- System resource exhaustion

## 🔧 Customization

### Modify Test Parameters
Edit `load-test-80-users-60-questions.js`:

```javascript
// Change number of users
stages: [
  { duration: '2m', target: 50 },  // Reduce to 50 users
  // ...
]

// Change question count
for (let i = 0; i < 30; i++) {  // Reduce to 30 questions
  // ...
}

// Change device mix
const isMobile = Math.random() > 0.7;  // 30% mobile, 70% desktop
```

### Add Custom Metrics
```javascript
const customMetric = new Rate('custom_metric');
// Add your custom tracking logic
```

## 📝 Test Report

After running the test, k6 will provide a detailed report including:
- **HTTP metrics** (response times, error rates)
- **Custom metrics** (success/error rates)
- **System metrics** (CPU, memory usage)
- **Performance trends** over time

## 🎯 Next Steps

Based on test results:
1. **Optimize bottlenecks** identified during testing
2. **Scale infrastructure** if needed
3. **Implement caching** for better performance
4. **Database optimization** for high concurrent loads
5. **CDN implementation** for static assets

---

**Note**: This load test is designed to stress-test the system. Monitor your application closely during testing and be prepared to stop the test if issues arise.
