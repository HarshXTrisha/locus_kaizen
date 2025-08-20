/**
 * Test script for PDF to Quiz Conversion
 * Tests the specialized PDF-to-JSON conversion endpoint
 */

const BASE_URL = 'http://localhost:3000';

// Sample PDF text for testing
const samplePDFText = `
Business Management Fundamentals

Leadership is a critical component of successful business management. 
Effective leaders inspire their teams, set clear goals, and drive organizational success.

Key concepts in business management include:
1. Strategic Planning - Setting long-term objectives and action plans
2. Financial Management - Budgeting, forecasting, and financial analysis
3. Human Resources - Recruiting, training, and employee development
4. Operations Management - Streamlining processes and improving efficiency
5. Marketing Strategy - Understanding customer needs and market positioning

Innovation plays a vital role in modern business. Companies must continuously 
adapt to changing market conditions and technological advancements.

Quality management ensures that products and services meet customer expectations 
while maintaining operational efficiency.
`;

/**
 * Test the PDF-to-Quiz conversion endpoint
 */
async function testPDFToQuizConversion() {
  console.log('🧪 Testing PDF to Quiz Conversion...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-to-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText: samplePDFText,
        title: "Business Management Quiz"
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Conversion Successful!');
      console.log('📊 Quiz Template Generated:');
      console.log(`   Title: ${data.data.title}`);
      console.log(`   Description: ${data.data.description}`);
      console.log(`   Total Questions: ${data.data.metadata.totalQuestions}`);
      console.log(`   Topics: ${data.data.metadata.topics.join(', ')}`);
      console.log(`   Difficulty: ${data.data.metadata.difficulty}`);
      console.log(`   Estimated Time: ${data.data.metadata.estimatedTime} minutes`);
      
      console.log('\n📝 Sample Questions:');
      data.data.questions.slice(0, 2).forEach((question, index) => {
        console.log(`   ${index + 1}. ${question.question}`);
        console.log(`      Options: ${question.options.join(', ')}`);
        console.log(`      Correct: ${question.correctAnswer}`);
        console.log(`      Topic: ${question.topic}`);
        console.log('');
      });
      
      console.log('🎯 Full JSON Template:');
      console.log(JSON.stringify(data.data, null, 2));
      
    } else {
      console.log('❌ Conversion Failed:', data.error);
      console.log('Message:', data.message);
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

/**
 * Test the health check endpoint
 */
async function testHealthCheck() {
  console.log('🏥 Testing PDF-to-Quiz Health Check...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/pdf-to-quiz`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health Check Passed!');
      console.log('Service:', data.service);
      console.log('Model:', data.model);
      console.log('Features:', data.features.join(', '));
    } else {
      console.log('❌ Health Check Failed:', data);
    }
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 PDF to Quiz Conversion Test Suite\n');
  
  // Test health check first
  await testHealthCheck();
  console.log('');
  
  // Test main functionality
  await testPDFToQuizConversion();
  
  console.log('\n✨ Test suite completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testPDFToQuizConversion, testHealthCheck };
