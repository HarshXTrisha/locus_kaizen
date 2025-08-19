# 🎯 200-User Load Test Guide for QuestAI

## Quick Start

### Prerequisites
- Node.js installed
- K6 installed (`npm install -g k6`)
- QuestAI development server running

### Step 1: Start Development Server
```bash
cd questai
npm run dev
```

### Step 2: Run the 200-User Test
```bash
# Option 1: Simple test runner (recommended)
npm run test:200-users:run

# Option 2: Direct K6 test
npm run test:200-users

# Option 3: Monitor only
npm run test:200-users:monitor
```

## 📊 Test Configuration

### Test Parameters
- **Target Users**: 200 concurrent users
- **Questions per User**: 100 questions each
- **Total Questions**: 20,000 questions
- **Test Duration**: 18 minutes
- **Ramp Up**: 6 minutes (0 → 200 users)
- **Steady State**: 10 minutes (200 users)
- **Ramp Down**: 2 minutes (200 → 0 users)

### Performance Targets
- **Response Time**: 95% under 500ms
- **Error Rate**: Less than 1%
- **Success Rate**: Above 98%
- **Question Load Time**: Under 300ms
- **Answer Submit Time**: Under 400ms

## 🔍 What the Test Does

### 1. User Simulation
- Creates 200 unique test users
- Each user has unique email, name, and avatar
- Simulates realistic user behavior

### 2. Quiz Flow
- **Authentication**: Simulated login for each user
- **Join Quiz**: Users join the live quiz session
- **Answer Questions**: Each user answers 100 questions
- **Leaderboard**: Check leaderboard every 10 questions
- **Submit Results**: Final score submission

### 3. Question Types
- **Multiple Choice**: 33% of questions
- **True/False**: 33% of questions  
- **Short Answer**: 33% of questions
- **Subjects**: Math, Science, History, Literature, Geography

## 📈 Monitoring

### Real-Time Metrics
- Active users count
- Completed users count
- Questions answered
- Average response time
- Success/error rates
- System health status

### Test Results
- Detailed performance report
- Success rate analysis
- Response time distribution
- Error analysis
- Recommendations

## 🛠️ Customization

### Modify Test Parameters
Edit `200-user-test.js`:
```javascript
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Change ramp up
    { duration: '2m', target: 100 },  // Change ramp up
    { duration: '2m', target: 200 },  // Change ramp up
    { duration: '10m', target: 200 }, // Change steady state
    { duration: '2m', target: 0 },    // Change ramp down
  ],
  // ... other options
};
```

### Change Question Count
```javascript
// In the main function, change the loop:
for (let questionNum = 1; questionNum <= 50; questionNum++) { // Change to 50 questions
```

### Modify User Count
```javascript
// Change the testUsers array size:
for (let i = 0; i < 100; i++) { // Change to 100 users
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Development server is not running"
```bash
# Start the server first
npm run dev
# Then run the test
npm run test:200-users:run
```

#### 2. "K6 not found"
```bash
# Install K6 globally
npm install -g k6
# Or use npx
npx k6 run 200-user-test.js
```

#### 3. "Firebase connection issues"
- Check Firebase configuration
- Ensure Firestore rules allow test operations
- Verify network connectivity

#### 4. "High error rates"
- Check server logs for errors
- Monitor Firebase console
- Reduce user count for testing
- Check database connection limits

### Performance Optimization

#### If Response Times Are High
1. **Database Optimization**
   - Add indexes to Firestore
   - Use batch operations
   - Optimize queries

2. **Caching**
   - Implement Redis caching
   - Cache frequently accessed data
   - Use CDN for static assets

3. **Connection Pooling**
   - Optimize Firebase connections
   - Use connection pooling
   - Implement request batching

## 📊 Expected Results

### Excellent Performance
- Success Rate: >95%
- Avg Response Time: <500ms
- Error Rate: <1%
- Questions/Second: >100

### Good Performance  
- Success Rate: 90-95%
- Avg Response Time: 500-1000ms
- Error Rate: 1-2%
- Questions/Second: 50-100

### Needs Improvement
- Success Rate: <90%
- Avg Response Time: >1000ms
- Error Rate: >2%
- Questions/Second: <50

## 🎉 Success Criteria

The test is considered successful if:
- ✅ All 200 users complete the quiz
- ✅ Success rate >95%
- ✅ Average response time <500ms
- ✅ Error rate <1%
- ✅ System remains stable throughout

## 📄 Generated Reports

After the test completes, you'll get:
- `test-report-[timestamp].json` - Detailed test results
- `test-results.json` - K6 performance metrics
- Console output with real-time monitoring

## 🔄 Running Multiple Tests

### Sequential Tests
```bash
# Run multiple tests with different configurations
npm run test:200-users:run
# Wait for completion, then:
npm run test:200-users:run
```

### Parallel Tests (Advanced)
```bash
# Run multiple instances (be careful with resources)
npm run test:200-users:run &
npm run test:200-users:run &
npm run test:200-users:run &
```

## 💡 Tips for Best Results

1. **Run during off-peak hours** to avoid interference
2. **Monitor system resources** (CPU, memory, network)
3. **Check Firebase console** for real-time metrics
4. **Start with smaller tests** before running 200 users
5. **Keep test data clean** by using test mode
6. **Monitor error logs** for debugging issues

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for errors
3. Monitor Firebase console for issues
4. Reduce test parameters and try again
5. Check network connectivity and firewall settings

---

**Ready to test your QuestAI platform with 200 concurrent users? Run `npm run test:200-users:run` and watch the magic happen! 🚀**
