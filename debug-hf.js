/**
 * Debug script for testing multiple Hugging Face models for PDF-to-JSON conversion
 */

const HF_TOKEN = process.env.HF_TOKEN || 'your_huggingface_token_here';

// Test various models that might be better for JSON generation
const MODELS_TO_TEST = [
  'https://api-inference.huggingface.co/models/facebook/bart-large',
  'https://api-inference.huggingface.co/models/facebook/bart-base',
  'https://api-inference.huggingface.co/models/t5-small',
  'https://api-inference.huggingface.co/models/t5-base',
  'https://api-inference.huggingface.co/models/microsoft/prophetnet-large-uncased',
  'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
  'https://api-inference.huggingface.co/models/facebook/blenderbot_small-90M',
  'https://api-inference.huggingface.co/models/microsoft/unilm-base-cased',
  'https://api-inference.huggingface.co/models/allenai/unifiedqa-t5-small',
  'https://api-inference.huggingface.co/models/valhalla/t5-small-qa-qg-hl'
];

async function testModelAvailability(modelUrl) {
  const modelName = modelUrl.split('/').pop();
  console.log(`\n🔍 Testing: ${modelName}`);
  
  try {
    const response = await fetch(modelUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
      },
    });

    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log(`✅ Available: ${modelName}`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ Not available: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

async function testJSONGeneration(modelUrl) {
  const modelName = modelUrl.split('/').pop();
  console.log(`\n🧪 Testing JSON generation with: ${modelName}`);
  
  try {
    const jsonPrompt = `Generate a valid JSON object for a quiz question about leadership. Return ONLY valid JSON in this format:
{
  "question": "What is leadership?",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "explanation": "Brief explanation",
  "topic": "Leadership"
}

JSON:`;
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: jsonPrompt,
        parameters: {
          max_length: 200,
          temperature: 0.1,
          do_sample: false,
        }
      }),
    });

    console.log(`📊 Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return { success: false, reason: 'API Error' };
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text || '';
    console.log(`📝 Generated: ${generatedText.substring(0, 200)}...`);
    
    // Check for JSON structure
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ Valid JSON generated!`);
        console.log(`📋 JSON: ${JSON.stringify(parsed, null, 2)}`);
        return { success: true, model: modelName, json: parsed };
      } catch (e) {
        console.log(`⚠️ JSON-like structure but invalid: ${e.message}`);
        return { success: false, reason: 'Invalid JSON' };
      }
    } else {
      console.log(`❌ No JSON structure found`);
      return { success: false, reason: 'No JSON structure' };
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

async function testPDFToQuizConversion(modelUrl) {
  const modelName = modelUrl.split('/').pop();
  console.log(`\n📄 Testing PDF-to-Quiz conversion with: ${modelName}`);
  
  try {
    const pdfContent = `Business Management: Leadership is crucial for business success. Effective leaders motivate teams and drive results.`;
    
    const quizPrompt = `Convert this content into a quiz question JSON:

Content: ${pdfContent}

Create ONE quiz question in valid JSON format:
{
  "question": "Question about the content?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Why this is correct",
  "topic": "Leadership"
}

JSON:`;
    
    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: quizPrompt,
        parameters: {
          max_length: 300,
          temperature: 0.1,
          do_sample: false,
        }
      }),
    });

    if (!response.ok) {
      return { success: false, reason: 'API Error' };
    }

    const data = await response.json();
    const generatedText = data[0]?.generated_text || '';
    
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`✅ PDF-to-Quiz JSON generated!`);
        console.log(`🎯 Quiz: ${JSON.stringify(parsed, null, 2)}`);
        return { success: true, model: modelName, quiz: parsed };
      } catch (e) {
        return { success: false, reason: 'Invalid JSON' };
      }
    } else {
      return { success: false, reason: 'No JSON structure' };
    }
    
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

async function runModelTests() {
  console.log('🚀 Testing Multiple Models for PDF-to-JSON Conversion\n');
  console.log('📝 Token:', HF_TOKEN ? 'Present' : 'Missing');
  
  const availableModels = [];
  const jsonCapableModels = [];
  const pdfQuizCapableModels = [];
  
  // Phase 1: Test availability
  console.log('\n📋 Phase 1: Testing Model Availability');
  for (const modelUrl of MODELS_TO_TEST) {
    const isAvailable = await testModelAvailability(modelUrl);
    if (isAvailable) {
      availableModels.push(modelUrl);
    }
  }
  
  console.log(`\n✅ Found ${availableModels.length} available models`);
  
  if (availableModels.length === 0) {
    console.log('❌ No models available for testing');
    return;
  }
  
  // Phase 2: Test JSON generation
  console.log('\n📋 Phase 2: Testing JSON Generation Capability');
  for (const modelUrl of availableModels.slice(0, 5)) { // Test first 5 available
    const result = await testJSONGeneration(modelUrl);
    if (result.success) {
      jsonCapableModels.push({ url: modelUrl, name: result.model });
    }
  }
  
  console.log(`\n✅ Found ${jsonCapableModels.length} JSON-capable models`);
  
  if (jsonCapableModels.length === 0) {
    console.log('❌ No models can generate valid JSON');
    return;
  }
  
  // Phase 3: Test PDF-to-Quiz conversion
  console.log('\n📋 Phase 3: Testing PDF-to-Quiz Conversion');
  for (const model of jsonCapableModels) {
    const result = await testPDFToQuizConversion(model.url);
    if (result.success) {
      pdfQuizCapableModels.push({ ...model, quiz: result.quiz });
    }
  }
  
  // Final Results
  console.log('\n🎯 FINAL RESULTS:');
  console.log(`📊 Available models: ${availableModels.length}`);
  console.log(`📊 JSON-capable models: ${jsonCapableModels.length}`);
  console.log(`📊 PDF-to-Quiz capable models: ${pdfQuizCapableModels.length}`);
  
  if (pdfQuizCapableModels.length > 0) {
    console.log('\n🚀 RECOMMENDED MODELS FOR PDF-TO-QUIZ CONVERSION:');
    pdfQuizCapableModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} - ✅ SUITABLE`);
    });
    
    const bestModel = pdfQuizCapableModels[0];
    console.log(`\n🎯 BEST MODEL: ${bestModel.name}`);
    console.log(`🔗 URL: ${bestModel.url}`);
  } else {
    console.log('\n❌ NO SUITABLE MODELS FOUND for PDF-to-Quiz conversion');
    console.log('💡 Consider using template-based approach or local models');
  }
  
  console.log('\n✨ Model testing completed!');
}

runModelTests();
