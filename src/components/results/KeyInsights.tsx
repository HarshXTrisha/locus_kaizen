'use client';

import { Quiz, QuizResult } from '@/lib/firebase-quiz';
import { Lightbulb, TrendingUp, AlertCircle, Clock, Target } from 'lucide-react';

interface KeyInsightsProps {
  result: QuizResult;
  quiz: Quiz;
}

export function KeyInsights({ result, quiz }: KeyInsightsProps) {
  const isPassed = result.score >= quiz.passingScore;
  const timePerQuestion = result.timeTaken / result.totalQuestions;
  const minutesPerQuestion = timePerQuestion / 60;

  // Analyze question types performance
  const questionTypeAnalysis = () => {
    const typeStats: { [key: string]: { correct: number; total: number } } = {};
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = result.answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer?.isCorrect || false;
      
      if (!typeStats[question.type]) {
        typeStats[question.type] = { correct: 0, total: 0 };
      }
      
      typeStats[question.type].total++;
      if (isCorrect) {
        typeStats[question.type].correct++;
      }
    });

    return typeStats;
  };

  const typeStats = questionTypeAnalysis();

  // Find best and worst performing question types
  const getBestPerformingType = () => {
    let bestType = '';
    let bestScore = 0;
    
    Object.entries(typeStats).forEach(([type, stats]) => {
      const score = (stats.correct / stats.total) * 100;
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    });
    
    return { type: bestType, score: bestScore };
  };

  const getWorstPerformingType = () => {
    let worstType = '';
    let worstScore = 100;
    
    Object.entries(typeStats).forEach(([type, stats]) => {
      const score = (stats.correct / stats.total) * 100;
      if (score < worstScore) {
        worstScore = score;
        worstType = type;
      }
    });
    
    return { type: worstType, score: worstScore };
  };

  const bestType = getBestPerformingType();
  const worstType = getWorstPerformingType();

  // Time analysis
  const getTimeAnalysis = () => {
    const avgTimePerQuestion = quiz.timeLimit * 60 / quiz.questions.length; // seconds
    const userAvgTime = timePerQuestion;
    
    if (userAvgTime < avgTimePerQuestion * 0.7) {
      return { status: 'fast', message: 'You completed questions quickly, showing good familiarity with the topics.' };
    } else if (userAvgTime > avgTimePerQuestion * 1.3) {
      return { status: 'slow', message: 'You took more time than average, which might indicate careful consideration or difficulty with some questions.' };
    } else {
      return { status: 'normal', message: 'Your pace was well-balanced, showing good time management.' };
    }
  };

  const timeAnalysis = getTimeAnalysis();

  const insights = [
    {
      icon: isPassed ? <TrendingUp className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-red-600" />,
      title: isPassed ? 'Great Job!' : 'Needs Improvement',
      description: `You ${isPassed ? 'passed' : 'failed'} this quiz with a score of ${result.score}%. The passing score was ${quiz.passingScore}%.`,
      color: isPassed ? 'bg-green-50' : 'bg-red-50',
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: 'Time Management',
      description: timeAnalysis.message,
      color: 'bg-blue-50',
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-yellow-600" />,
      title: 'Performance Insight',
      description: `You answered ${result.correctAnswers} out of ${result.totalQuestions} questions correctly. ${result.correctAnswers === result.totalQuestions ? 'Perfect score!' : `Keep practicing to improve your accuracy.`}`,
      color: 'bg-yellow-50',
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      title: 'Efficiency Score',
      description: `You completed the quiz in ${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s. That's ${((result.timeTaken / (quiz.timeLimit * 60)) * 100).toFixed(0)}% of the allocated time.`,
      color: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg ${insight.color}`}>
            <div className="flex items-start gap-4">
              <div>{insight.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Performance Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{result.correctAnswers}</div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctAnswers}</div>
            <div className="text-gray-600">Incorrect Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{minutesPerQuestion.toFixed(1)}</div>
            <div className="text-gray-600">Min/Question</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Object.keys(typeStats).length}</div>
            <div className="text-gray-600">Question Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}
