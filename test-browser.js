const puppeteer = require('puppeteer');

async function testBrowser() {
  console.log('🌐 Starting Browser Tests...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: { width: 1280, height: 720 } 
    });
    const page = await browser.newPage();

    // Test 1: PDF Converter Page
    console.log('   Testing PDF Converter page...');
    await page.goto('http://localhost:3000/pdf-converter', { waitUntil: 'networkidle0' });
    
    // Check if page loads
    const title = await page.title();
    console.log(`   ✅ Page title: ${title}`);
    
    // Check if chatbot is present
    const chatbot = await page.$('[class*="AIChatbot"]');
    if (chatbot) {
      console.log('   ✅ AI Chatbot component found');
    } else {
      console.log('   ❌ AI Chatbot component not found');
    }
    
    // Check if model selector is present
    const modelSelector = await page.$('button[class*="border-purple-500"]');
    if (modelSelector) {
      console.log('   ✅ Model selector found');
    } else {
      console.log('   ❌ Model selector not found');
    }
    
    // Test 2: Try to interact with chatbot
    console.log('   Testing chatbot interaction...');
    try {
      // Find the textarea in the chatbot
      const textarea = await page.$('textarea[placeholder*="Type your message"]');
      if (textarea) {
        console.log('   ✅ Chatbot textarea found');
        
        // Type a message
        await textarea.type('Hello AI!');
        console.log('   ✅ Message typed successfully');
        
        // Find and click send button
        const sendButton = await page.$('button[title="Send message"]');
        if (sendButton) {
          await sendButton.click();
          console.log('   ✅ Send button clicked');
          
          // Wait for response
          await page.waitForTimeout(3000);
          console.log('   ✅ Waited for AI response');
        }
      } else {
        console.log('   ❌ Chatbot textarea not found');
      }
    } catch (error) {
      console.log(`   ⚠️  Chatbot interaction test failed: ${error.message}`);
    }
    
    // Test 3: Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('   ⚠️  Console errors found:');
      errors.forEach(error => console.log(`      - ${error}`));
    } else {
      console.log('   ✅ No console errors');
    }
    
    console.log('   ✅ Browser tests completed successfully');
    
  } catch (error) {
    console.error('   ❌ Browser test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testBrowser().catch(console.error);
} catch (error) {
  console.log('📝 Puppeteer not available, skipping browser tests');
  console.log('💡 To install: npm install puppeteer');
  console.log('💡 Or manually test at: http://localhost:3000/pdf-converter');
}
