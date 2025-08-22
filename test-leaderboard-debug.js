// Comprehensive debug script for leaderboard functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Firebase config (replace with your actual config)
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

async function debugLeaderboard() {
  try {
    console.log('🔍 Starting comprehensive leaderboard debug...\n');
    
    // 1. Check all quizzes and their sources
    console.log('1. Checking all quizzes and their sources...');
    const allQuizzesQuery = query(collection(db, 'quizzes'));
    const allQuizzesSnapshot = await getDocs(allQuizzesQuery);
    
    console.log(`Total quizzes found: ${allQuizzesSnapshot.size}`);
    
    const quizzesBySource = {};
    allQuizzesSnapshot.forEach(doc => {
      const data = doc.data();
      const source = data.source || 'main';
      if (!quizzesBySource[source]) {
        quizzesBySource[source] = [];
      }
      quizzesBySource[source].push({
        id: doc.id,
        title: data.title,
        source: source
      });
    });
    
    Object.keys(quizzesBySource).forEach(source => {
      console.log(`  ${source}: ${quizzesBySource[source].length} quizzes`);
      quizzesBySource[source].forEach(quiz => {
        console.log(`    - ${quiz.title} (${quiz.id})`);
      });
    });
    
    // 2. Check all quiz results and their sources
    console.log('\n2. Checking all quiz results and their sources...');
    const allResultsQuery = query(collection(db, 'quizResults'));
    const allResultsSnapshot = await getDocs(allResultsQuery);
    
    console.log(`Total quiz results found: ${allResultsSnapshot.size}`);
    
    const resultsBySource = {};
    allResultsSnapshot.forEach(doc => {
      const data = doc.data();
      const source = data.source || 'main';
      if (!resultsBySource[source]) {
        resultsBySource[source] = [];
      }
      resultsBySource[source].push({
        id: doc.id,
        quizId: data.quizId,
        userId: data.userId,
        score: data.score,
        source: source
      });
    });
    
    Object.keys(resultsBySource).forEach(source => {
      console.log(`  ${source}: ${resultsBySource[source].length} results`);
      resultsBySource[source].forEach(result => {
        console.log(`    - Quiz: ${result.quizId}, User: ${result.userId}, Score: ${result.score}%`);
      });
    });
    
    // 3. Check all leaderboards
    console.log('\n3. Checking all leaderboards...');
    const allLeaderboardsQuery = query(collection(db, 'quiz-leaderboards'));
    const allLeaderboardsSnapshot = await getDocs(allLeaderboardsQuery);
    
    console.log(`Total leaderboards found: ${allLeaderboardsSnapshot.size}`);
    
    for (const leaderboardDoc of allLeaderboardsSnapshot.docs) {
      const leaderboardData = leaderboardDoc.data();
      console.log(`\n  Leaderboard for quiz: ${leaderboardData.quizId}`);
      console.log(`  Entries: ${leaderboardData.scores?.length || 0}`);
      
      if (leaderboardData.scores && leaderboardData.scores.length > 0) {
        console.log('  Top 5 scores:');
        leaderboardData.scores.slice(0, 5).forEach((entry, index) => {
          console.log(`    ${index + 1}. ${entry.userName} - ${entry.score}%`);
        });
      }
    }
    
    // 4. Check specific IIMB-BBA-DBE data
    console.log('\n4. Checking IIMB-BBA-DBE specific data...');
    
    // Check IIMB-BBA-DBE quizzes
    const iimbQuizzesQuery = query(
      collection(db, 'quizzes'),
      where('source', '==', 'iimb-bba-dbe')
    );
    const iimbQuizzesSnapshot = await getDocs(iimbQuizzesQuery);
    
    console.log(`IIMB-BBA-DBE quizzes: ${iimbQuizzesSnapshot.size}`);
    iimbQuizzesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.title} (${doc.id})`);
    });
    
    // Check IIMB-BBA-DBE results
    const iimbResultsQuery = query(
      collection(db, 'quizResults'),
      where('source', '==', 'iimb-bba-dbe')
    );
    const iimbResultsSnapshot = await getDocs(iimbResultsQuery);
    
    console.log(`IIMB-BBA-DBE results: ${iimbResultsSnapshot.size}`);
    iimbResultsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - Quiz: ${data.quizId}, User: ${data.userId}, Score: ${data.score}%`);
    });
    
    // 5. Check if leaderboards exist for IIMB-BBA-DBE quizzes
    console.log('\n5. Checking leaderboards for IIMB-BBA-DBE quizzes...');
    for (const quizDoc of iimbQuizzesSnapshot.docs) {
      const quizId = quizDoc.id;
      const leaderboardRef = doc(db, 'quiz-leaderboards', quizId);
      const leaderboardDoc = await getDoc(leaderboardRef);
      
      if (leaderboardDoc.exists()) {
        const leaderboardData = leaderboardDoc.data();
        console.log(`✅ Leaderboard exists for quiz ${quizId}:`);
        console.log(`  Entries: ${leaderboardData.scores?.length || 0}`);
        if (leaderboardData.scores && leaderboardData.scores.length > 0) {
          console.log('  Top scores:');
          leaderboardData.scores.slice(0, 3).forEach((entry, index) => {
            console.log(`    ${index + 1}. ${entry.userName} - ${entry.score}%`);
          });
        }
      } else {
        console.log(`❌ No leaderboard found for quiz ${quizId}`);
      }
    }
    
    console.log('\n✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugLeaderboard();
