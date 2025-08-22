// Test script to verify leaderboard functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testLeaderboard() {
  try {
    console.log('🔍 Testing Leaderboard Functionality...');
    
    // 1. Check if there are any IIMB-BBA-DBE quizzes
    console.log('\n1. Checking for IIMB-BBA-DBE quizzes...');
    const quizzesQuery = query(
      collection(db, 'quizzes'),
      where('source', '==', 'iimb-bba-dbe')
    );
    const quizzesSnapshot = await getDocs(quizzesQuery);
    
    if (quizzesSnapshot.empty) {
      console.log('❌ No IIMB-BBA-DBE quizzes found');
      return;
    }
    
    console.log(`✅ Found ${quizzesSnapshot.size} IIMB-BBA-DBE quizzes`);
    
    // 2. Check quiz results for IIMB-BBA-DBE
    console.log('\n2. Checking IIMB-BBA-DBE quiz results...');
    const resultsQuery = query(
      collection(db, 'quizResults'),
      where('source', '==', 'iimb-bba-dbe')
    );
    const resultsSnapshot = await getDocs(resultsQuery);
    
    console.log(`✅ Found ${resultsSnapshot.size} IIMB-BBA-DBE quiz results`);
    
    // 3. Check leaderboards
    console.log('\n3. Checking leaderboards...');
    const leaderboardsQuery = query(collection(db, 'quiz-leaderboards'));
    const leaderboardsSnapshot = await getDocs(leaderboardsQuery);
    
    console.log(`✅ Found ${leaderboardsSnapshot.size} leaderboards total`);
    
    // 4. Check specific leaderboards for IIMB-BBA-DBE quizzes
    for (const quizDoc of quizzesSnapshot.docs) {
      const quizId = quizDoc.id;
      const quizData = quizDoc.data();
      
      console.log(`\n📊 Checking leaderboard for quiz: ${quizData.title} (${quizId})`);
      
      const leaderboardRef = doc(db, 'quiz-leaderboards', quizId);
      const leaderboardDoc = await getDoc(leaderboardRef);
      
      if (leaderboardDoc.exists()) {
        const leaderboardData = leaderboardDoc.data();
        console.log(`✅ Leaderboard exists with ${leaderboardData.scores?.length || 0} entries`);
        
        if (leaderboardData.scores && leaderboardData.scores.length > 0) {
          console.log('🏆 Top 5 scores:');
          leaderboardData.scores.slice(0, 5).forEach((entry, index) => {
            console.log(`  ${index + 1}. ${entry.userName} - ${entry.score}%`);
          });
        }
      } else {
        console.log('❌ No leaderboard found for this quiz');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing leaderboard:', error);
  }
}

// Run the test
testLeaderboard();
