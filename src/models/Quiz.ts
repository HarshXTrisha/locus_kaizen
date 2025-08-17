import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  image?: string;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  subject: string;
  questions: IQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  totalPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string; // Firebase UID
  isPublished: boolean;
  isPublic: boolean;
  allowRetakes: boolean;
  maxAttempts: number;
  startDate?: Date;
  endDate?: Date;
  stats: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    averageTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    required: true,
  },
  options: [{
    type: String,
    trim: true,
  }],
  correctAnswer: {
    type: Schema.Types.Mixed, // Can be string or array of strings
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  explanation: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
  },
});

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  questions: [QuestionSchema],
  timeLimit: {
    type: Number,
    required: true,
    min: 1,
    max: 480, // 8 hours max
    default: 60,
  },
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 70,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  createdBy: {
    type: String,
    required: true,
    index: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  allowRetakes: {
    type: Boolean,
    default: true,
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  stats: {
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    averageTime: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
QuizSchema.index({ createdBy: 1, createdAt: -1 });
QuizSchema.index({ isPublished: 1, isPublic: 1 });
QuizSchema.index({ subject: 1 });
QuizSchema.index({ tags: 1 });

// Virtual for question count
QuizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Virtual for estimated time
QuizSchema.virtual('estimatedTime').get(function() {
  return this.questions.length * 2; // 2 minutes per question average
});

// Pre-save middleware to calculate total points
QuizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((sum, question) => sum + question.points, 0);
  this.updatedAt = new Date();
  next();
});

// Static method to get quizzes by user
QuizSchema.statics.findByUser = function(firebaseUid: string) {
  return this.find({ createdBy: firebaseUid }).sort({ createdAt: -1 });
};

// Static method to get public quizzes
QuizSchema.statics.findPublic = function() {
  return this.find({ isPublished: true, isPublic: true }).sort({ createdAt: -1 });
};

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
