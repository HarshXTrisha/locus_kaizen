const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDK0NLMysqFRE_S2xhuVDa1aA6YnPIYutI",
  authDomain: "locus-8b4e8.firebaseapp.com",
  projectId: "locus-8b4e8",
  storageBucket: "locus-8b4e8.firebasestorage.app",
  messagingSenderId: "5682995815",
  appId: "1:5682995815:web:eb32cee9007c4674e2aac2",
  measurementId: "G-GXSXV4NNE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugLeaderboardIssues() {
  console.log('🔍 DEBUGGING LEADERBOARD ISSUES...\n');

  try {
    // 1. Check all quizzes with source 'iimb-bba-dbe'
    console.log('📋 1. Checking IIMB-BBA-DBE quizzes...');
    const quizzesQuery = query(
      collection(db, 'quizzes'),
      where('source', '==', 'iimb-bba-dbe')
    );
    const quizzesSnapshot = await getDocs(quizzesQuery);
    
    const iimbQuizzes = [];
    quizzesSnapshot.forEach(doc => {
      const data = doc.data();
      iimbQuizzes.push({
        id: doc.id,
        title: data.title,
        source: data.source,
        createdBy: data.createdBy
      });
    });
    
    console.log(`Found ${iimbQuizzes.length} IIMB-BBA-DBE quizzes:`);
    iimbQuizzes.forEach(quiz => {
      console.log(`  - ${quiz.title} (ID: ${quiz.id})`);
    });

    // 2. Check all quiz results with source 'iimb-bba-dbe'
    console.log('\n📊 2. Checking IIMB-BBA-DBE quiz results...');
    const resultsQuery = query(
      collection(db, 'quizResults'),
      where('source', '==', 'iimb-bba-dbe')
    );
    const resultsSnapshot = await getDocs(resultsQuery);
    
    const iimbResults = [];
    resultsSnapshot.forEach(doc => {
      const data = doc.data();
      iimbResults.push({
        id: doc.id,
        quizId: data.quizId,
        userId: data.userId,
        userName: data.userName,
        score: data.score,
        source: data.source,
        completedAt: data.completedAt?.toDate?.() || 'Unknown'
      });
    });
    
    console.log(`Found ${iimbResults.length} IIMB-BBA-DBE quiz results:`);
    iimbResults.forEach(result => {
      console.log(`  - User: ${result.userName} (${result.userId}) - Score: ${result.score} - Quiz: ${result.quizId}`);
    });

    // 3. Check all leaderboards
    console.log('\n🏆 3. Checking all leaderboards...');
    const leaderboardsQuery = query(collection(db, 'quiz-leaderboards'));
    const leaderboardsSnapshot = await getDocs(leaderboardsQuery);
    
    const leaderboards = [];
    leaderboardsSnapshot.forEach(doc => {
      const data = doc.data();
      leaderboards.push({
        id: doc.id,
        quizId: data.quizId,
        scoresCount: data.scores?.length || 0,
        lastUpdated: data.lastUpdated?.toDate?.() || 'Unknown'
      });
    });
    
    console.log(`Found ${leaderboards.length} leaderboards:`);
    leaderboards.forEach(lb => {
      console.log(`  - Quiz: ${lb.quizId} - Scores: ${lb.scoresCount} - Updated: ${lb.lastUpdated}`);
    });

    // 4. Check specific leaderboard for each IIMB quiz
    console.log('\n🎯 4. Checking specific leaderboards for IIMB quizzes...');
    for (const quiz of iimbQuizzes) {
      console.log(`\nChecking leaderboard for quiz: ${quiz.title} (${quiz.id})`);
      
      const leaderboardDoc = await getDoc(doc(db, 'quiz-leaderboards', quiz.id));
      if (leaderboardDoc.exists()) {
        const data = leaderboardDoc.data();
        console.log(`  ✅ Leaderboard exists with ${data.scores?.length || 0} scores`);
        
        if (data.scores && data.scores.length > 0) {
          console.log('  📊 Top scores:');
          data.scores.slice(0, 5).forEach((score, index) => {
            console.log(`    ${index + 1}. ${score.userName} - ${score.score}%`);
          });
        }
      } else {
        console.log(`  ❌ No leaderboard found for quiz ${quiz.id}`);
        
        // Check if there are results for this quiz
        const quizResults = iimbResults.filter(r => r.quizId === quiz.id);
        console.log(`  📝 Found ${quizResults.length} results for this quiz`);
        
        if (quizResults.length > 0) {
          console.log('  🚨 ISSUE: Quiz has results but no leaderboard!');
          console.log('  📋 Results:');
          quizResults.forEach(result => {
            console.log(`    - ${result.userName}: ${result.score}%`);
          });
        }
      }
    }

    // 5. Check for any results without proper source
    console.log('\n🔍 5. Checking for results with missing/incorrect source...');
    const allResultsQuery = query(collection(db, 'quizResults'));
    const allResultsSnapshot = await getDocs(allResultsQuery);
    
    const allResults = [];
    allResultsSnapshot.forEach(doc => {
      const data = doc.data();
      allResults.push({
        id: doc.id,
        quizId: data.quizId,
        userId: data.userId,
        userName: data.userName,
        score: data.score,
        source: data.source || 'MISSING',
        completedAt: data.completedAt?.toDate?.() || 'Unknown'
      });
    });
    
    const missingSourceResults = allResults.filter(r => !r.source || r.source === 'MISSING');
    console.log(`Found ${missingSourceResults.length} results with missing source:`);
    missingSourceResults.forEach(result => {
      console.log(`  - ${result.userName}: ${result.score}% (Quiz: ${result.quizId})`);
    });

    // 6. Summary and recommendations
    console.log('\n📋 SUMMARY:');
    console.log(`- IIMB-BBA-DBE quizzes: ${iimbQuizzes.length}`);
    console.log(`- IIMB-BBA-DBE results: ${iimbResults.length}`);
    console.log(`- Total leaderboards: ${leaderboards.length}`);
    console.log(`- Results with missing source: ${missingSourceResults.length}`);

    if (iimbResults.length > 0 && leaderboards.length === 0) {
      console.log('\n🚨 CRITICAL ISSUE: No leaderboards exist despite having results!');
      console.log('This suggests the updateLeaderboard function is not being called properly.');
    }

    if (missingSourceResults.length > 0) {
      console.log('\n⚠️ WARNING: Some results have missing source field!');
      console.log('This could cause leaderboard updates to fail.');
    }

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

debugLeaderboardIssues().then(() => {
  console.log('\n✅ Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
