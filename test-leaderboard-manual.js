const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
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

async function testLeaderboard() {
  console.log('🧪 TESTING LEADERBOARD MANUALLY...\n');

  try {
    // Test quiz ID (you can replace this with an actual quiz ID)
    const testQuizId = 'test-quiz-123';
    
    // Create a test leaderboard
    console.log('📝 Creating test leaderboard...');
    const leaderboardData = {
      quizId: testQuizId,
             scores: [
         {
           userId: 'user1',
           userName: 'John Doe',
           score: 85,
           timestamp: new Date(),
           rank: 1
         },
         {
           userId: 'user2', 
           userName: 'Jane Smith',
           score: 92,
           timestamp: new Date(),
           rank: 2
         },
         {
           userId: 'user3',
           userName: 'Bob Johnson',
           score: 78,
           timestamp: new Date(),
           rank: 3
         }
       ],
      lastUpdated: serverTimestamp()
    };

    const leaderboardRef = doc(db, 'quiz-leaderboards', testQuizId);
    await setDoc(leaderboardRef, leaderboardData);
    console.log('✅ Test leaderboard created successfully!');

    // Read it back
    console.log('\n📖 Reading test leaderboard...');
    const leaderboardDoc = await getDoc(leaderboardRef);
    
    if (leaderboardDoc.exists()) {
      const data = leaderboardDoc.data();
      console.log('✅ Leaderboard data retrieved:');
      console.log('Quiz ID:', data.quizId);
      console.log('Scores count:', data.scores?.length || 0);
      console.log('Last updated:', data.lastUpdated?.toDate?.() || 'Unknown');
      
      if (data.scores && data.scores.length > 0) {
        console.log('\n📊 Scores:');
        data.scores.forEach((score, index) => {
          console.log(`${index + 1}. ${score.userName} - ${score.score}%`);
        });
      }
    } else {
      console.log('❌ Leaderboard not found!');
    }

    // Clean up - delete the test leaderboard
    console.log('\n🧹 Cleaning up test data...');
    // Note: We can't delete without admin permissions, so we'll just leave it for now
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

testLeaderboard().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
