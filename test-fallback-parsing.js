require('dotenv').config({ path: '.env.local' });

// Sample data from the user's file
const sampleText = `Which planet is known as the Red Planet?  A) Venus  B) Mars  C) Jupiter  D) Saturn  Answer: B) Mars  2. Who is known as the Father of Economics?  A) Karl Marx  B) John Maynard Keynes  C) Adam Smith  D) David Ricardo  Answer: C) Adam Smith  3. In which year did India gain independence?  A) 1945  B) 1946  C) 1947  D) 1948  Answer: C) 1947  4. Which gas is most abundant in the Earth's atmosphere?  A) Oxygen  B) Carbon Dioxide  C) Nitrogen  D) Hydrogen  Answer: C) Nitrogen  5. Who developed the theory of relativity?  A) Isaac Newton  B) Nikola Tesla  C) Albert Einstein  D) Galileo Galilei  Answer: C) Albert Einstein`;

// Import the OSS GPT PDF processor
const { OSSGPTPDFProcessor } = require('./src/lib/oss-gpt-pdf-processor.ts');

async function testFallbackParsing() {
  console.log('🧪 Testing Improved Fallback Parsing...\n');
  
  try {
    // Test the fallback processing
    const result = await OSSGPTPDFProcessor.convertToQuestAIJSON(
      sampleText,
      'test-mcq.pdf',
      {
        questionCount: 5,
        includeExplanations: true
      }
    );
    
    console.log('✅ Fallback Processing Result:');
    console.log('📊 Questions Generated:', result.quiz.questions.length);
    console.log('🎯 Confidence:', result.metadata.confidence + '%');
    console.log('🔧 Method:', result.metadata.processingMethod);
    
    console.log('\n📝 Parsed Questions:');
    result.quiz.questions.forEach((question, index) => {
      console.log(`\nQuestion ${index + 1}:`);
      console.log(`Q: ${question.question}`);
      console.log(`Options:`);
      question.options.forEach((option, optIndex) => {
        const marker = optIndex === question.correctAnswer ? '✅' : '  ';
        console.log(`  ${marker} ${String.fromCharCode(65 + optIndex)}) ${option}`);
      });
      if (question.explanation) {
        console.log(`Explanation: ${question.explanation}`);
      }
    });
    
    console.log('\n🎉 Fallback parsing test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFallbackParsing();
