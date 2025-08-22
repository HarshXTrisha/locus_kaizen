/**
 * Test script for OSS GPT 20B PDF to JSON conversion
 * Run with: node test-pdf-to-json.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const testPDFToJSON = async () => {
  console.log('🧪 Testing OSS GPT 20B PDF to QuestAI JSON Conversion...\n');

  const baseUrl = 'http://localhost:3000';
  
  // Sample PDF content (simulating extracted text)
  const samplePDFText = `
    Chapter 3: Photosynthesis

    Photosynthesis is the process by which plants convert sunlight into energy. This biological process occurs in the chloroplasts of plant cells and involves two main stages: the light-dependent reactions and the Calvin cycle.

    Q1. What is the primary function of photosynthesis?
    A) To produce oxygen for animals
    B) To convert sunlight into chemical energy
    C) To remove carbon dioxide from the atmosphere
    D) To create water molecules

    Q2. Where does photosynthesis occur in plant cells?
    A) Mitochondria
    B) Nucleus
    C) Chloroplasts
    D) Ribosomes

    Q3. Which of the following is NOT a product of photosynthesis?
    A) Glucose
    B) Oxygen
    C) Carbon dioxide
    D) Water

    The light-dependent reactions occur in the thylakoid membranes and produce ATP and NADPH. The Calvin cycle occurs in the stroma and uses ATP and NADPH to fix carbon dioxide into glucose.

    Chlorophyll is the green pigment that captures light energy. Plants also contain other pigments like carotenoids that help capture different wavelengths of light.
  `;

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${baseUrl}/api/pdf-to-quiz`);
    const healthData = await healthResponse.json();
    
    console.log('✅ Health Check Response:', JSON.stringify(healthData, null, 2));

    // Test 2: Basic Conversion
    console.log('\n2️⃣ Testing Basic PDF to JSON Conversion...');
    const basicResponse = await fetch(`${baseUrl}/api/pdf-to-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
             body: JSON.stringify({
         pdfText: samplePDFText,
         fileName: 'photosynthesis-chapter.pdf',
         questionCount: 8,
         subject: 'Biology',
         includeExplanations: true
       })
    });

    const basicData = await basicResponse.json();
    
    if (basicResponse.ok) {
      console.log('✅ Basic Conversion Response:', JSON.stringify(basicData, null, 2));
      
             // Validate the quiz structure
       if (basicData.success && basicData.data) {
         const quiz = basicData.data;
         console.log('\n📊 QuestAI Quiz Validation:');
         console.log(`  Title: ${quiz.title}`);
         console.log(`  Questions: ${quiz.questions.length}`);
         console.log(`  Confidence: ${basicData.metadata.confidence}%`);
         console.log(`  Warnings: ${basicData.metadata.warnings.length}`);
         
         // Validate each question
         quiz.questions.forEach((q, i) => {
           console.log(`\n  Question ${i + 1}:`);
           console.log(`    Question: ${q.question.substring(0, 50)}...`);
           console.log(`    Options: ${q.options?.length || 0}`);
           console.log(`    Correct Answer Index: ${q.correctAnswer}`);
           console.log(`    Has Explanation: ${!!q.explanation}`);
         });
       }
    } else {
      console.log('❌ Basic Conversion failed:', basicData);
    }

         // Test 3: Different Settings
     console.log('\n3️⃣ Testing with Different Settings...');
     const advancedResponse = await fetch(`${baseUrl}/api/pdf-to-quiz`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         pdfText: samplePDFText,
         fileName: 'advanced-biology.pdf',
         questionCount: 5,
         subject: 'Advanced Biology',
         includeExplanations: false
       })
     });

     const advancedData = await advancedResponse.json();
     
     if (advancedResponse.ok) {
       console.log('✅ Advanced Conversion Summary:');
       console.log(`  Questions Generated: ${advancedData.data.questions.length}`);
       console.log(`  Confidence: ${advancedData.metadata.confidence}%`);
       console.log(`  Processing Method: ${advancedData.metadata.processingMethod}`);
     } else {
       console.log('❌ Advanced Conversion failed:', advancedData);
     }

    // Test 4: Error Handling
    console.log('\n4️⃣ Testing Error Handling...');
    const errorResponse = await fetch(`${baseUrl}/api/pdf-to-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText: '', // Empty text should trigger error
        fileName: 'empty.pdf'
      })
    });

    const errorData = await errorResponse.json();
    console.log('✅ Error Response:', JSON.stringify(errorData, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('💡 Make sure your development server is running with: npm run dev');
  }
};

// Test different types of PDFs
const testDifferentPDFTypes = async () => {
  console.log('\n🎯 Testing Different PDF Types...\n');

  const pdfTypes = [
    {
      name: 'Textbook Chapter',
      content: `
        Chapter 5: World War II (1939-1945)
        
        World War II was a global conflict that involved most of the world's nations. The war began in 1939 with Germany's invasion of Poland and ended in 1945 with the surrender of Japan.
        
        Key events included the Battle of Britain, the attack on Pearl Harbor, D-Day invasion, and the atomic bombings of Hiroshima and Nagasaki. The war resulted in the deaths of millions of people and significant changes to the global political landscape.
        
        The Allied Powers, led by the United States, Soviet Union, and United Kingdom, defeated the Axis Powers, which included Germany, Italy, and Japan.
      `,
      subject: 'History'
    },
    {
      name: 'Scientific Research Paper',
      content: `
        Abstract: This study investigates the effects of climate change on coral reef ecosystems.
        
        Introduction: Coral reefs are among the most diverse and productive ecosystems on Earth. They provide habitat for thousands of marine species and support coastal communities through fishing and tourism.
        
        Methods: We conducted field surveys at 15 reef sites across the Pacific Ocean, measuring coral cover, species diversity, and water temperature over a 5-year period.
        
        Results: Our findings indicate a significant decline in coral cover associated with rising sea temperatures. Species diversity decreased by 23% at sites experiencing the highest temperature increases.
        
        Discussion: These results suggest that climate change poses a serious threat to coral reef ecosystems worldwide.
      `,
      subject: 'Marine Biology'
    },
    {
      name: 'Business Case Study',
      content: `
        Case Study: Apple Inc. - Innovation and Market Leadership
        
        Apple Inc. was founded in 1976 by Steve Jobs and Steve Wozniak. The company revolutionized the personal computer industry with the introduction of the Macintosh in 1984.
        
        Key success factors include:
        - Strong brand identity and customer loyalty
        - Vertical integration of hardware and software
        - Focus on design and user experience
        - Strategic partnerships and acquisitions
        
        The company's product portfolio includes iPhones, iPads, Mac computers, and various software services. Apple's market capitalization exceeded $2 trillion in 2020.
        
        Challenges faced by Apple include:
        - Intense competition in the smartphone market
        - Supply chain disruptions
        - Regulatory scrutiny over app store policies
      `,
      subject: 'Business Management'
    },
    {
      name: 'Technical Manual',
      content: `
        User Manual: Advanced Database Management System
        
        This system provides comprehensive database management capabilities for enterprise applications.
        
        Installation Requirements:
        - Minimum 8GB RAM
        - 100GB available disk space
        - Windows 10 or Linux Ubuntu 18.04+
        
        Configuration Steps:
        1. Run the installer as administrator
        2. Configure database connection parameters
        3. Set up user authentication
        4. Initialize backup procedures
        
        Security Features:
        - Role-based access control
        - Data encryption at rest and in transit
        - Audit logging and monitoring
        - Automated vulnerability scanning
        
        Performance Optimization:
        - Index optimization
        - Query caching
        - Connection pooling
        - Load balancing
      `,
      subject: 'Information Technology'
    }
  ];

  for (const pdfType of pdfTypes) {
    console.log(`\n📄 Testing: ${pdfType.name}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/pdf-to-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfText: pdfType.content,
          fileName: `${pdfType.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          questionCount: 6,
          subject: pdfType.subject,
          includeExplanations: true
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`  ✅ Generated ${data.data.questions.length} questions`);
        console.log(`  📊 Confidence: ${data.metadata.confidence}%`);
        console.log(`  🔧 Method: ${data.metadata.processingMethod}`);
        
        // Show first question as example
        if (data.data.questions.length > 0) {
          const q = data.data.questions[0];
          console.log(`  📝 Sample: "${q.question.substring(0, 60)}..."`);
          console.log(`  🎯 Correct Answer: Option ${q.correctAnswer + 1}`);
        }
      } else {
        console.log(`  ❌ Failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting OSS GPT 20B PDF to QuestAI JSON Test Suite\n');
  
  await testPDFToJSON();
  await testDifferentPDFTypes();
  
  console.log('\n🎉 Test Suite Complete!');
  console.log('\n💡 Next Steps:');
  console.log('1. Try uploading real PDFs through the web interface');
  console.log('2. Experiment with different question counts and subjects');
  console.log('3. Test with various content types (textbooks, research papers, manuals)');
  console.log('4. Monitor the AI confidence scores and download the generated JSON');
  console.log('5. The system supports a wide variety of PDF formats!');
};

runAllTests().catch(console.error);
