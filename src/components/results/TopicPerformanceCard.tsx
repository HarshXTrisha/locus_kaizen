'use client';

import { Quiz, QuizResult } from '@/lib/firebase-quiz';
import { BarChart3, CheckCircle, XCircle, Clock, Target } from 'lucide-react';

interface QuestionTypeAnalysisProps {
  result: QuizResult;
  quiz: Quiz;
}

export function QuestionTypeAnalysis({ result, quiz }: QuestionTypeAnalysisProps) {
  // Analyze performance by question type
  const analyzeQuestionTypes = () => {
    const typeStats: { [key: string]: { correct: number; total: number; avgTime: number } } = {};
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = result.answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer?.isCorrect || false;
      
      if (!typeStats[question.type]) {
        typeStats[question.type] = { correct: 0, total: 0, avgTime: 0 };
      }
      
      typeStats[question.type].total++;
      if (isCorrect) {
        typeStats[question.type].correct++;
      }
    });

    // Calculate percentages and format data
    return Object.entries(typeStats).map(([type, stats]) => ({
      type: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      percentage: Math.round((stats.correct / stats.total) * 100),
      correct: stats.correct,
      total: stats.total,
      color: (stats.correct / stats.total) >= 0.7 ? 'text-green-600' : 
             (stats.correct / stats.total) >= 0.5 ? 'text-yellow-600' : 'text-red-600',
      bgColor: (stats.correct / stats.total) >= 0.7 ? 'bg-green-100' : 
               (stats.correct / stats.total) >= 0.5 ? 'bg-yellow-100' : 'bg-red-100',
      barColor: (stats.correct / stats.total) >= 0.7 ? 'bg-green-500' : 
                (stats.correct / stats.total) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
    }));
  };

  const questionTypeStats = analyzeQuestionTypes();

  // Calculate overall statistics
  const totalQuestions = quiz.questions.length;
  const correctAnswers = result.correctAnswers;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const avgTimePerQuestion = Math.round(result.timeTaken / totalQuestions);

  // Performance insights
  const getPerformanceInsight = () => {
    if (accuracy >= 90) return { message: "Excellent performance! You've mastered this material.", icon: "🎯" };
    if (accuracy >= 80) return { message: "Great work! You have a solid understanding.", icon: "👍" };
    if (accuracy >= 70) return { message: "Good effort! Some areas need more practice.", icon: "📚" };
    if (accuracy >= 60) return { message: "You're on the right track. Keep practicing!", icon: "💪" };
    return { message: "Don't worry! Review the material and try again.", icon: "🔄" };
  };

  const performanceInsight = getPerformanceInsight();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Question Type Analysis</h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>

      {/* Overall Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
          <div className="text-sm text-gray-600">Overall Accuracy</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</div>
          <div className="text-sm text-gray-600">Correct Answers</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{avgTimePerQuestion}s</div>
          <div className="text-sm text-gray-600">Avg Time/Question</div>
        </div>
      </div>

      {/* Performance Insight */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{performanceInsight.icon}</span>
          <p className="text-gray-700 font-medium">{performanceInsight.message}</p>
        </div>
      </div>

      {/* Question Type Breakdown */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 mb-3">Performance by Question Type</h4>
        {questionTypeStats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${stat.bgColor}`}>
                  {stat.percentage >= 70 ? (
                    <CheckCircle className={`h-4 w-4 ${stat.color}`} />
                  ) : (
                    <XCircle className={`h-4 w-4 ${stat.color}`} />
                  )}
                </div>
                <span className="font-medium text-gray-700">{stat.type}</span>
                <span className="text-sm text-gray-500">({stat.correct}/{stat.total})</span>
              </div>
              <span className={`font-semibold ${stat.color}`}>{stat.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${stat.barColor} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${stat.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Target className="h-4 w-4 text-blue-500 mt-0.5" />
            <span className="text-gray-600">Focus on question types where you scored below 70%</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-green-500 mt-0.5" />
            <span className="text-gray-600">Practice time management for better efficiency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
