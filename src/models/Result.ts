import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  points: number;
  timeSpent: number; // in seconds
}

export interface IResult extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: string; // Firebase UID
  score: number; // percentage
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  earnedPoints: number;
  timeTaken: number; // in seconds
  answers: IAnswer[];
  completedAt: Date;
  startedAt: Date;
  status: 'in-progress' | 'completed' | 'abandoned' | 'timeout';
  feedback?: string;
  metadata: {
    userAgent: string;
    ipAddress?: string;
    deviceType: string;
  };
}

const AnswerSchema = new Schema<IAnswer>({
  questionId: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: Schema.Types.Mixed, // Can be string or array of strings
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const ResultSchema = new Schema<IResult>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  totalQuestions: {
    type: Number,
    required: true,
    min: 1,
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 1,
  },
  earnedPoints: {
    type: Number,
    required: true,
    min: 0,
  },
  timeTaken: {
    type: Number,
    required: true,
    min: 0,
  },
  answers: [AnswerSchema],
  completedAt: {
    type: Date,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'timeout'],
    default: 'completed',
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  metadata: {
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile'],
      default: 'desktop',
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
ResultSchema.index({ userId: 1, completedAt: -1 });
ResultSchema.index({ quizId: 1, completedAt: -1 });
ResultSchema.index({ status: 1 });
ResultSchema.index({ score: -1 });

// Virtual for pass/fail status
ResultSchema.virtual('isPassed').get(function() {
  return this.score >= 70; // Default passing score
});

// Virtual for time taken in minutes
ResultSchema.virtual('timeTakenMinutes').get(function() {
  return Math.round(this.timeTaken / 60);
});

// Virtual for average time per question
ResultSchema.virtual('averageTimePerQuestion').get(function() {
  return this.totalQuestions > 0 ? Math.round(this.timeTaken / this.totalQuestions) : 0;
});

// Pre-save middleware to calculate score
ResultSchema.pre('save', function(next) {
  if (this.totalPoints > 0) {
    this.score = Math.round((this.earnedPoints / this.totalPoints) * 100);
  }
  next();
});

// Static method to get results by user
ResultSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ completedAt: -1 });
};

// Static method to get results by quiz
ResultSchema.statics.findByQuiz = function(quizId: string) {
  return this.find({ quizId }).sort({ completedAt: -1 });
};

// Static method to get user's best score for a quiz
ResultSchema.statics.findBestScore = function(userId: string, quizId: string) {
  return this.findOne({ userId, quizId }).sort({ score: -1 });
};

// Static method to get quiz statistics
ResultSchema.statics.getQuizStats = function(quizId: string) {
  return this.aggregate([
    { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: '$score' },
        averageTime: { $avg: '$timeTaken' },
        bestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
      },
    },
  ]);
};

export default mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
