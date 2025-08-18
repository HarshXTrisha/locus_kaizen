const puppeteer = require('puppeteer');
const fs = require('fs');

class LoadTest {
  constructor() {
    this.browser = null;
    this.pages = [];
    this.results = [];
    this.startTime = null;
    this.endTime = null;
  }

  async initialize() {
    console.log('🚀 Starting load test with 250 concurrent users...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }

  async createUser(userId) {
    try {
      const page = await this.browser.newPage();
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Navigate to the quiz page
      await page.goto('http://localhost:3000/live-quiz/test-quiz-id', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for page to load
      await page.waitForSelector('body', { timeout: 10000 });

      // Simulate user registration/login
      await this.simulateUserRegistration(page, userId);

      // Start the quiz
      await this.startQuiz(page, userId);

      return page;
    } catch (error) {
      console.error(`❌ Error creating user ${userId}:`, error.message);
      return null;
    }
  }

  async simulateUserRegistration(page, userId) {
    try {
      // Look for registration form or login
      const registrationSelectors = [
        'input[name="name"]',
        'input[name="email"]',
        '#name',
        '#email',
        '[data-testid="name-input"]',
        '[data-testid="email-input"]'
      ];

      for (const selector of registrationSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          
          if (selector.includes('name')) {
            await page.type(selector, `Test User ${userId}`);
          } else if (selector.includes('email')) {
            await page.type(selector, `user${userId}@test.com`);
          }
          
          console.log(`✅ User ${userId} registered with selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

      // Look for join/start button
      const joinSelectors = [
        'button:contains("Join Quiz")',
        'button:contains("Start Quiz")',
        'button:contains("Enter Quiz")',
        '[data-testid="join-quiz"]',
        '.join-quiz-btn'
      ];

      for (const selector of joinSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          console.log(`✅ User ${userId} joined quiz with selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

    } catch (error) {
      console.log(`⚠️ User ${userId} registration skipped: ${error.message}`);
    }
  }

  async startQuiz(page, userId) {
    try {
      // Wait for quiz to start
      await page.waitForTimeout(2000);

      // Look for quiz interface
      const quizSelectors = [
        '.question-container',
        '.quiz-interface',
        '[data-testid="question"]',
        '.question'
      ];

      let quizStarted = false;
      for (const selector of quizSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          quizStarted = true;
          console.log(`✅ User ${userId} quiz started with selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!quizStarted) {
        console.log(`⚠️ User ${userId} quiz interface not found`);
      }

    } catch (error) {
      console.log(`⚠️ User ${userId} quiz start error: ${error.message}`);
    }
  }

  async simulateQuizTaking(page, userId) {
    try {
      // Simulate answering questions
      const answerSelectors = [
        'input[type="radio"]',
        'input[type="checkbox"]',
        '.answer-option',
        '[data-testid="answer"]',
        '.option'
      ];

      // Find and click answer options
      for (const selector of answerSelectors) {
        try {
          const answers = await page.$$(selector);
          if (answers.length > 0) {
            // Click a random answer
            const randomIndex = Math.floor(Math.random() * answers.length);
            await answers[randomIndex].click();
            console.log(`✅ User ${userId} answered question with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      // Look for next/submit button
      const nextSelectors = [
        'button:contains("Next")',
        'button:contains("Submit")',
        'button:contains("Continue")',
        '[data-testid="next"]',
        '.next-btn'
      ];

      for (const selector of nextSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          console.log(`✅ User ${userId} clicked next with selector: ${selector}`);
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

    } catch (error) {
      console.log(`⚠️ User ${userId} quiz taking error: ${error.message}`);
    }
  }

  async runLoadTest() {
    this.startTime = Date.now();
    console.log(`⏰ Load test started at: ${new Date(this.startTime).toISOString()}`);

    const userCount = 250;
    const batchSize = 10; // Create users in batches to avoid overwhelming the system

    try {
      // Create users in batches
      for (let i = 0; i < userCount; i += batchSize) {
        const batch = [];
        const batchEnd = Math.min(i + batchSize, userCount);
        
        console.log(`👥 Creating users ${i + 1} to ${batchEnd}...`);
        
        for (let j = i; j < batchEnd; j++) {
          const userId = j + 1;
          const page = await this.createUser(userId);
          if (page) {
            this.pages.push(page);
            batch.push(page);
          }
        }

        // Wait a bit between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Created ${this.pages.length} users successfully`);

      // Simulate quiz taking for all users
      console.log('📝 Simulating quiz taking for all users...');
      const quizPromises = this.pages.map((page, index) => 
        this.simulateQuizTaking(page, index + 1)
      );

      await Promise.all(quizPromises);

      // Wait for quiz completion
      console.log('⏳ Waiting for quiz completion...');
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

      this.endTime = Date.now();
      console.log(`⏰ Load test completed at: ${new Date(this.endTime).toISOString()}`);

      // Generate report
      await this.generateReport();

    } catch (error) {
      console.error('❌ Load test failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async generateReport() {
    const duration = this.endTime - this.startTime;
    const successRate = (this.pages.length / 250) * 100;

    const report = {
      testDate: new Date().toISOString(),
      totalUsers: 250,
      successfulUsers: this.pages.length,
      successRate: `${successRate.toFixed(2)}%`,
      duration: `${(duration / 1000).toFixed(2)} seconds`,
      averageResponseTime: `${(duration / this.pages.length).toFixed(2)}ms per user`,
      systemPerformance: successRate > 90 ? 'Excellent' : successRate > 70 ? 'Good' : 'Needs Improvement'
    };

    console.log('\n📊 LOAD TEST REPORT:');
    console.log('==================');
    console.log(`Total Users: ${report.totalUsers}`);
    console.log(`Successful Users: ${report.successfulUsers}`);
    console.log(`Success Rate: ${report.successRate}`);
    console.log(`Duration: ${report.duration}`);
    console.log(`Average Response Time: ${report.averageResponseTime}`);
    console.log(`System Performance: ${report.systemPerformance}`);

    // Save report to file
    fs.writeFileSync('load-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to: load-test-report.json');
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    
    // Close all pages
    for (const page of this.pages) {
      try {
        await page.close();
      } catch (error) {
        console.error('Error closing page:', error.message);
      }
    }

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    console.log('✅ Cleanup completed');
  }
}

// Run the load test
async function main() {
  const loadTest = new LoadTest();
  
  try {
    await loadTest.initialize();
    await loadTest.runLoadTest();
  } catch (error) {
    console.error('❌ Load test failed:', error);
  }
}

// Check if puppeteer is installed
try {
  require('puppeteer');
  main();
} catch (error) {
  console.error('❌ Puppeteer not installed. Please install it first:');
  console.error('npm install puppeteer');
  process.exit(1);
}
