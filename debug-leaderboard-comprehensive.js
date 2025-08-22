// Comprehensive Leaderboard Debugging Script
// Run this in browser console on /iimb-bba-dbe page

console.log('🔍 COMPREHENSIVE LEADERBOARD DEBUGGING...');

// Step 1: Check if we're on the right page
console.log('\n📋 Step 1: Page Check');
console.log('Current URL:', window.location.href);
console.log('Are we on IIMB-BBA-DBE page?', window.location.pathname.includes('iimb-bba-dbe'));

// Step 2: Check if user is authenticated
console.log('\n📋 Step 2: Authentication Check');
if (typeof window !== 'undefined' && window.firebase) {
  console.log('✅ Firebase is available');
  // Try to get current user
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('✅ User is authenticated:', user.email);
      console.log('User ID:', user.uid);
    } else {
      console.log('❌ User is NOT authenticated');
    }
  });
} else {
  console.log('❌ Firebase not available');
}

// Step 3: Check for existing IIMB quizzes
console.log('\n📋 Step 3: Check for IIMB Quizzes');
console.log('Look for quizzes with source: "iimb-bba-dbe" in the quiz list');

// Step 4: Manual test instructions
console.log('\n📋 Step 4: Manual Test Instructions');
console.log('1. Create a new quiz in the IIMB portal');
console.log('2. Take the quiz');
console.log('3. Submit the quiz');
console.log('4. Check console for these EXACT logs:');
console.log('   - "Result source: iimb-bba-dbe"');
console.log('   - "Source comparison: true"');
console.log('   - "✅ This is an IIMB-BBA-DBE quiz, updating leaderboard..."');
console.log('   - "🔍 updateLeaderboard: Starting update for quiz: [quizId]"');
console.log('   - "✅ Leaderboard successfully saved to database for quiz: [quizId]"');

// Step 5: Common failure points
console.log('\n📋 Step 5: Common Failure Points');
console.log('❌ If you see "Result source: main" instead of "iimb-bba-dbe":');
console.log('   → Quiz source is not being set correctly');
console.log('❌ If you see "Source comparison: false":');
console.log('   → The comparison is failing');
console.log('❌ If you see "❌ Not an IIMB-BBA-DBE quiz, skipping leaderboard update":');
console.log('   → The condition is not being met');
console.log('❌ If you see "❌ Error updating leaderboard:"');
console.log('   → Firebase permissions or data structure issue');

// Step 6: Quick diagnostic
console.log('\n📋 Step 6: Quick Diagnostic');
console.log('Run this after taking a quiz:');
console.log(`
// Check if any leaderboards exist
firebase.firestore().collection('quiz-leaderboards').get().then(snapshot => {
  console.log('Total leaderboards:', snapshot.size);
  snapshot.forEach(doc => {
    console.log('Leaderboard for quiz:', doc.id, 'Scores:', doc.data().scores?.length || 0);
  });
});
`);

console.log('\n✅ Run this test and tell me EXACTLY what you see in the console!');
