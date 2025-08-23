// Test script to verify paste functionality
const testJSON = {
  title: "Test MCQ Quiz",
  description: "A test quiz for debugging",
  subject: "Test Subject",
  questions: [
    {
      id: "q1",
      text: "What is the capital of France?",
      type: "multiple-choice",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      points: 1
    },
    {
      id: "q2", 
      text: "Which planet is known as the Red Planet?",
      type: "multiple-choice",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: "Mars",
      points: 1
    }
  ]
};

const testTXT = `Q1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Correct Answer: C

Q2. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Saturn
Correct Answer: B`;

console.log('Test JSON:', JSON.stringify(testJSON, null, 2));
console.log('\nTest TXT:', testTXT);
console.log('\nBoth formats are ready for testing in the paste functionality!');
