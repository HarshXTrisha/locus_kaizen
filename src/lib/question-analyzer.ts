import { ExtractedQuestion } from './pdf-processor';

export interface QuestionAnalysis {
  questionId: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  suggestions: string[];
  issues: string[];
  strengths: string[];
  readabilityScore: number;
  optionBalanceScore: number;
  clarityScore: number;
}

export interface QuizAnalysis {
  totalQuestions: number;
  averageScore: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  categoryDistribution: { [key: string]: number };
  overallSuggestions: string[];
  qualityIssues: string[];
  strengths: string[];
}

export class QuestionAnalyzer {
  private static difficultyKeywords = {
    easy: [
      'what', 'when', 'where', 'who', 'which', 'name', 'identify', 'list',
      'basic', 'simple', 'common', 'obvious', 'well-known'
    ],
    medium: [
      'explain', 'describe', 'compare', 'contrast', 'analyze', 'discuss',
      'how', 'why', 'because', 'reason', 'cause', 'effect'
    ],
    hard: [
      'evaluate', 'critique', 'assess', 'justify', 'argue', 'prove',
      'complex', 'advanced', 'sophisticated', 'theoretical', 'abstract'
    ]
  };

  private static questionCategories = {
    'factual': ['what', 'when', 'where', 'who', 'which', 'name'],
    'conceptual': ['explain', 'describe', 'define', 'identify'],
    'analytical': ['analyze', 'compare', 'contrast', 'examine'],
    'evaluative': ['evaluate', 'assess', 'critique', 'judge'],
    'application': ['apply', 'use', 'demonstrate', 'show'],
    'synthesis': ['create', 'design', 'develop', 'construct']
  };

  /**
   * Analyze a single question
   */
  static analyzeQuestion(question: ExtractedQuestion): QuestionAnalysis {
    const text = question.text.toLowerCase();
    const options = question.options || [];
    
    // Calculate scores
    const readabilityScore = this.calculateReadabilityScore(question);
    const optionBalanceScore = this.calculateOptionBalanceScore(question);
    const clarityScore = this.calculateClarityScore(question);
    
    // Overall score (weighted average)
    const score = Math.round(
      (readabilityScore * 0.3) + 
      (optionBalanceScore * 0.4) + 
      (clarityScore * 0.3)
    );

    // Determine difficulty
    const difficulty = this.determineDifficulty(text);

    // Determine category
    const category = this.determineCategory(text);

    // Generate analysis
    const suggestions: string[] = [];
    const issues: string[] = [];
    const strengths: string[] = [];

    // Analyze readability
    if (readabilityScore < 60) {
      issues.push('Question text is difficult to read');
      suggestions.push('Use simpler language and shorter sentences');
    } else if (readabilityScore > 80) {
      strengths.push('Question is very readable');
    }

    // Analyze option balance
    if (optionBalanceScore < 60) {
      issues.push('Options are imbalanced');
      suggestions.push('Make options more similar in length and complexity');
    } else if (optionBalanceScore > 80) {
      strengths.push('Options are well-balanced');
    }

    // Analyze clarity
    if (clarityScore < 60) {
      issues.push('Question lacks clarity');
      suggestions.push('Make the question more specific and unambiguous');
    } else if (clarityScore > 80) {
      strengths.push('Question is clear and specific');
    }

    // Check for specific issues
    this.checkForSpecificIssues(question, issues, suggestions, strengths);

    return {
      questionId: question.id,
      score,
      difficulty,
      category,
      suggestions,
      issues,
      strengths,
      readabilityScore,
      optionBalanceScore,
      clarityScore
    };
  }

  /**
   * Analyze entire quiz
   */
  static analyzeQuiz(questions: ExtractedQuestion[]): QuizAnalysis {
    const analyses = questions.map(q => this.analyzeQuestion(q));
    
    const totalQuestions = questions.length;
    const averageScore = Math.round(
      analyses.reduce((sum, a) => sum + a.score, 0) / totalQuestions
    );

    // Difficulty distribution
    const difficultyDistribution = {
      easy: analyses.filter(a => a.difficulty === 'easy').length,
      medium: analyses.filter(a => a.difficulty === 'medium').length,
      hard: analyses.filter(a => a.difficulty === 'hard').length
    };

    // Category distribution
    const categoryDistribution: { [key: string]: number } = {};
    analyses.forEach(analysis => {
      categoryDistribution[analysis.category] = (categoryDistribution[analysis.category] || 0) + 1;
    });

    // Overall suggestions
    const overallSuggestions: string[] = [];
    const qualityIssues: string[] = [];
    const strengths: string[] = [];

    // Analyze patterns
    this.analyzeQuizPatterns(analyses, overallSuggestions, qualityIssues, strengths);

    return {
      totalQuestions,
      averageScore,
      difficultyDistribution,
      categoryDistribution,
      overallSuggestions,
      qualityIssues,
      strengths
    };
  }

  /**
   * Calculate readability score (0-100)
   */
  private static calculateReadabilityScore(question: ExtractedQuestion): number {
    const text = question.text;
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = this.countSyllables(text);

    // Flesch Reading Ease formula
    const fleschScore = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
    
    // Convert to 0-100 scale
    return Math.max(0, Math.min(100, fleschScore));
  }

  /**
   * Calculate option balance score (0-100)
   */
  private static calculateOptionBalanceScore(question: ExtractedQuestion): number {
    const options = question.options || [];
    if (options.length < 2) return 0;

    const lengths = options.map(opt => opt.length);
    const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const standardDeviation = Math.sqrt(variance);

    // Score based on how similar option lengths are
    const balanceScore = Math.max(0, 100 - (standardDeviation * 2));
    
    // Bonus for having 4 options
    const optionBonus = options.length === 4 ? 10 : 0;
    
    return Math.min(100, balanceScore + optionBonus);
  }

  /**
   * Calculate clarity score (0-100)
   */
  private static calculateClarityScore(question: ExtractedQuestion): number {
    let score = 100;
    const text = question.text.toLowerCase();

    // Deduct for vague words
    const vagueWords = ['thing', 'stuff', 'something', 'anything', 'everything', 'nothing'];
    const vagueCount = vagueWords.filter(word => text.includes(word)).length;
    score -= vagueCount * 10;

    // Deduct for very long questions
    if (question.text.length > 200) score -= 20;
    if (question.text.length > 300) score -= 20;

    // Deduct for very short questions
    if (question.text.length < 10) score -= 30;

    // Bonus for specific terms
    const specificTerms = ['because', 'since', 'although', 'however', 'therefore'];
    const specificCount = specificTerms.filter(term => text.includes(term)).length;
    score += specificCount * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine question difficulty
   */
  private static determineDifficulty(text: string): 'easy' | 'medium' | 'hard' {
    let easyScore = 0;
    let mediumScore = 0;
    let hardScore = 0;

    // Count difficulty keywords
    this.difficultyKeywords.easy.forEach(keyword => {
      if (text.includes(keyword)) easyScore++;
    });

    this.difficultyKeywords.medium.forEach(keyword => {
      if (text.includes(keyword)) mediumScore++;
    });

    this.difficultyKeywords.hard.forEach(keyword => {
      if (text.includes(keyword)) hardScore++;
    });

    // Determine difficulty based on scores
    if (hardScore > mediumScore && hardScore > easyScore) return 'hard';
    if (mediumScore > easyScore) return 'medium';
    return 'easy';
  }

  /**
   * Determine question category
   */
  private static determineCategory(text: string): string {
    let maxScore = 0;
    let bestCategory = 'factual';

    Object.entries(this.questionCategories).forEach(([category, keywords]) => {
      const score = keywords.filter(keyword => text.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    });

    return bestCategory;
  }

  /**
   * Check for specific issues in questions
   */
  private static checkForSpecificIssues(
    question: ExtractedQuestion, 
    issues: string[], 
    suggestions: string[], 
    strengths: string[]
  ): void {
    const text = question.text.toLowerCase();
    const options = question.options || [];

    // Check for obvious wrong answers
    const obviousWrong = options.some(opt => 
      opt.toLowerCase().includes('none') || 
      opt.toLowerCase().includes('all') ||
      opt.toLowerCase().includes('both') ||
      opt.toLowerCase().includes('neither')
    );
    if (obviousWrong) {
      issues.push('Contains potentially obvious wrong answers');
      suggestions.push('Review options for "all of the above" or "none of the above" patterns');
    }

    // Check for negative questions
    if (text.includes('not') || text.includes('except') || text.includes('least')) {
      issues.push('Negative question detected');
      suggestions.push('Consider rephrasing as a positive question for clarity');
    }

    // Check for "all of the above" or "none of the above"
    const allNoneOptions = options.some(opt => 
      opt.toLowerCase().includes('all of the above') ||
      opt.toLowerCase().includes('none of the above')
    );
    if (allNoneOptions) {
      issues.push('Contains "all/none of the above" options');
      suggestions.push('These options can make questions easier to guess');
    }

    // Check for option length imbalance
    if (options.length > 0) {
      const lengths = options.map(opt => opt.length);
      const maxLength = Math.max(...lengths);
      const minLength = Math.min(...lengths);
      if (maxLength / minLength > 3) {
        issues.push('Significant option length imbalance');
        suggestions.push('Make options more similar in length');
      }
    }

    // Check for question clarity
    if (text.includes('?')) {
      strengths.push('Question ends with proper punctuation');
    } else {
      issues.push('Question lacks proper punctuation');
      suggestions.push('End questions with a question mark');
    }

    // Check for appropriate question length
    if (question.text.length >= 20 && question.text.length <= 100) {
      strengths.push('Question length is appropriate');
    }
  }

  /**
   * Analyze patterns across the entire quiz
   */
  private static analyzeQuizPatterns(
    analyses: QuestionAnalysis[],
    suggestions: string[],
    issues: string[],
    strengths: string[]
  ): void {
    const totalQuestions = analyses.length;

    // Check difficulty distribution
    const easyCount = analyses.filter(a => a.difficulty === 'easy').length;
    const hardCount = analyses.filter(a => a.difficulty === 'hard').length;
    const easyPercentage = (easyCount / totalQuestions) * 100;
    const hardPercentage = (hardCount / totalQuestions) * 100;

    if (easyPercentage > 70) {
      issues.push('Quiz is heavily weighted toward easy questions');
      suggestions.push('Consider adding more medium and hard questions for better assessment');
    }

    if (hardPercentage > 50) {
      issues.push('Quiz is heavily weighted toward hard questions');
      suggestions.push('Consider adding more easy and medium questions for accessibility');
    }

    // Check average quality
    const averageScore = analyses.reduce((sum, a) => sum + a.score, 0) / totalQuestions;
    if (averageScore < 60) {
      issues.push('Overall question quality is low');
      suggestions.push('Review and improve questions based on individual analysis');
    } else if (averageScore > 80) {
      strengths.push('Overall question quality is high');
    }

    // Check for variety
    const categories = new Set(analyses.map(a => a.category));
    if (categories.size < 3) {
      issues.push('Limited variety in question types');
      suggestions.push('Include more diverse question categories');
    } else {
      strengths.push('Good variety in question types');
    }

    // Check for common issues
    const commonIssues = analyses.flatMap(a => a.issues);
    const issueCounts = commonIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    Object.entries(issueCounts).forEach(([issue, count]) => {
      if (count > totalQuestions * 0.3) {
        suggestions.push(`Address common issue: ${issue} (appears in ${count} questions)`);
      }
    });
  }

  /**
   * Count syllables in text (approximate)
   */
  private static countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((total, word) => {
      // Simple syllable counting algorithm
      const syllables = word.replace(/[^aeiouy]/g, '').length;
      return total + Math.max(1, syllables);
    }, 0);
  }

  /**
   * Generate improvement suggestions for a question
   */
  static generateImprovementSuggestions(question: ExtractedQuestion): string[] {
    const analysis = this.analyzeQuestion(question);
    const suggestions: string[] = [];

    // Add analysis-based suggestions
    suggestions.push(...analysis.suggestions);

    // Add format-specific suggestions
    if (question.options && question.options.length > 0) {
      if (question.options.length < 4) {
        suggestions.push('Consider adding more options for better assessment');
      }
      
      if (question.options.length > 4) {
        suggestions.push('Consider reducing to 4 options for optimal choice');
      }
    }

    // Add content-specific suggestions
    if (question.text.length < 20) {
      suggestions.push('Expand question to provide more context');
    }

    if (question.text.length > 150) {
      suggestions.push('Consider breaking long question into multiple parts');
    }

    return suggestions;
  }
}
