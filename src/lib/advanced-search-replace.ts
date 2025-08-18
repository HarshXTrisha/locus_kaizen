import { ExtractedQuestion } from './pdf-processor';

export interface SearchResult {
  questionId: string;
  questionIndex: number;
  field: 'text' | 'options' | 'correctAnswer' | 'all';
  matchIndex: number;
  originalText: string;
  highlightedText: string;
  context: string;
  lineNumber: number;
}

export interface ReplaceOperation {
  questionId: string;
  field: 'text' | 'options' | 'correctAnswer';
  originalText: string;
  newText: string;
  matchIndex: number;
  applied: boolean;
}

export interface SearchFilters {
  questionType?: 'multiple-choice' | 'true-false' | 'short-answer';
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
  hasOptions?: boolean;
  textLength?: {
    min?: number;
    max?: number;
  };
}

export interface SearchOptions {
  caseSensitive: boolean;
  useRegex: boolean;
  wholeWord: boolean;
  searchInOptions: boolean;
  searchInCorrectAnswer: boolean;
  maxResults: number;
  filters?: SearchFilters;
}

export interface BulkEditOperation {
  type: 'replace' | 'append' | 'prepend' | 'remove' | 'capitalize' | 'lowercase' | 'trim';
  target: 'text' | 'options' | 'correctAnswer' | 'all';
  searchPattern: string;
  replaceText?: string;
  condition?: string;
  applyTo: 'all' | 'selected' | 'filtered';
}

export class AdvancedSearchReplace {
  private static defaultSearchOptions: SearchOptions = {
    caseSensitive: false,
    useRegex: false,
    wholeWord: false,
    searchInOptions: true,
    searchInCorrectAnswer: true,
    maxResults: 100
  };

  /**
   * Global search across all questions
   */
  static searchInQuiz(
    questions: ExtractedQuestion[],
    searchTerm: string,
    options: Partial<SearchOptions> = {}
  ): SearchResult[] {
    const searchOptions = { ...this.defaultSearchOptions, ...options };
    const results: SearchResult[] = [];
    let resultCount = 0;

    console.log(`🔍 Searching for: "${searchTerm}" with options:`, searchOptions);

    for (let i = 0; i < questions.length && resultCount < searchOptions.maxResults; i++) {
      const question = questions[i];
      
      // Apply filters
      if (searchOptions.filters && !this.matchesFilters(question, searchOptions.filters)) {
        continue;
      }

      // Search in question text
      const textResults = this.searchInText(
        question.text,
        searchTerm,
        searchOptions,
        question.id,
        i,
        'text'
      );
      results.push(...textResults);
      resultCount += textResults.length;

      // Search in options
      if (searchOptions.searchInOptions && question.options) {
        for (let j = 0; j < question.options.length; j++) {
          const optionResults = this.searchInText(
            question.options[j],
            searchTerm,
            searchOptions,
            question.id,
            i,
            'options',
            j
          );
          results.push(...optionResults);
          resultCount += optionResults.length;
        }
      }

      // Search in correct answer
      if (searchOptions.searchInCorrectAnswer && question.correctAnswer) {
        const answerResults = this.searchInText(
          question.correctAnswer,
          searchTerm,
          searchOptions,
          question.id,
          i,
          'correctAnswer'
        );
        results.push(...answerResults);
        resultCount += answerResults.length;
      }
    }

    console.log(`✅ Found ${results.length} matches`);
    return results;
  }

  /**
   * Search in specific text with highlighting
   */
  private static searchInText(
    text: string,
    searchTerm: string,
    options: SearchOptions,
    questionId: string,
    questionIndex: number,
    field: 'text' | 'options' | 'correctAnswer',
    optionIndex?: number
  ): SearchResult[] {
    const results: SearchResult[] = [];
    
    if (!text || !searchTerm) return results;

    let searchPattern: RegExp;
    let flags = options.caseSensitive ? 'g' : 'gi';

    if (options.useRegex) {
      try {
        searchPattern = new RegExp(searchTerm, flags);
      } catch (error) {
        console.warn('Invalid regex pattern:', searchTerm);
        return results;
      }
    } else {
      let pattern = searchTerm;
      if (options.wholeWord) {
        pattern = `\\b${this.escapeRegex(searchTerm)}\\b`;
      } else {
        pattern = this.escapeRegex(searchTerm);
      }
      searchPattern = new RegExp(pattern, flags);
    }

    let match;
    let matchIndex = 0;
    
    while ((match = searchPattern.exec(text)) !== null && results.length < 10) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 20);
      const context = text.substring(start, end);
      
      const highlightedText = text.replace(
        new RegExp(this.escapeRegex(match[0]), options.caseSensitive ? 'g' : 'gi'),
        `<mark class="search-highlight">${match[0]}</mark>`
      );

      results.push({
        questionId,
        questionIndex,
        field,
        matchIndex: matchIndex++,
        originalText: match[0],
        highlightedText,
        context: `...${context}...`,
        lineNumber: this.getLineNumber(text, match.index)
      });
    }

    return results;
  }

  /**
   * Replace text in questions
   */
  static replaceInQuiz(
    questions: ExtractedQuestion[],
    searchTerm: string,
    replaceTerm: string,
    options: Partial<SearchOptions> = {}
  ): { updatedQuestions: ExtractedQuestion[]; operations: ReplaceOperation[] } {
    const searchOptions = { ...this.defaultSearchOptions, ...options };
    const operations: ReplaceOperation[] = [];
    const updatedQuestions = questions.map(question => ({ ...question }));

    console.log(`🔄 Replacing "${searchTerm}" with "${replaceTerm}"`);

    for (let i = 0; i < updatedQuestions.length; i++) {
      const question = updatedQuestions[i];
      
      // Apply filters
      if (searchOptions.filters && !this.matchesFilters(question, searchOptions.filters)) {
        continue;
      }

      // Replace in question text
      const textResult = this.replaceInText(
        question.text,
        searchTerm,
        replaceTerm,
        searchOptions,
        question.id,
        'text'
      );
      if (textResult.changed) {
        question.text = textResult.newText;
        operations.push(textResult.operation);
      }

      // Replace in options
      if (searchOptions.searchInOptions && question.options) {
        for (let j = 0; j < question.options.length; j++) {
          const optionResult = this.replaceInText(
            question.options[j],
            searchTerm,
            replaceTerm,
            searchOptions,
            question.id,
            'options'
          );
          if (optionResult.changed) {
            question.options[j] = optionResult.newText;
            operations.push(optionResult.operation);
          }
        }
      }

      // Replace in correct answer
      if (searchOptions.searchInCorrectAnswer && question.correctAnswer) {
        const answerResult = this.replaceInText(
          question.correctAnswer,
          searchTerm,
          replaceTerm,
          searchOptions,
          question.id,
          'correctAnswer'
        );
        if (answerResult.changed) {
          question.correctAnswer = answerResult.newText;
          operations.push(answerResult.operation);
        }
      }
    }

    console.log(`✅ Applied ${operations.length} replacements`);
    return { updatedQuestions, operations };
  }

  /**
   * Replace text in specific field
   */
  private static replaceInText(
    text: string,
    searchTerm: string,
    replaceTerm: string,
    options: SearchOptions,
    questionId: string,
    field: 'text' | 'options' | 'correctAnswer'
  ): { changed: boolean; newText: string; operation: ReplaceOperation } {
    if (!text || !searchTerm) {
      return { changed: false, newText: text, operation: null as any };
    }

    let searchPattern: RegExp;
    let flags = options.caseSensitive ? 'g' : 'gi';

    if (options.useRegex) {
      try {
        searchPattern = new RegExp(searchTerm, flags);
      } catch (error) {
        console.warn('Invalid regex pattern:', searchTerm);
        return { changed: false, newText: text, operation: null as any };
      }
    } else {
      let pattern = searchTerm;
      if (options.wholeWord) {
        pattern = `\\b${this.escapeRegex(searchTerm)}\\b`;
      } else {
        pattern = this.escapeRegex(searchTerm);
      }
      searchPattern = new RegExp(pattern, flags);
    }

    const newText = text.replace(searchPattern, replaceTerm);
    const changed = newText !== text;

    const operation: ReplaceOperation = {
      questionId,
      field,
      originalText: text,
      newText,
      matchIndex: 0,
      applied: changed
    };

    return { changed, newText, operation };
  }

  /**
   * Bulk edit operations
   */
  static bulkEdit(
    questions: ExtractedQuestion[],
    operations: BulkEditOperation[]
  ): { updatedQuestions: ExtractedQuestion[]; appliedOperations: number } {
    const updatedQuestions = questions.map(question => ({ ...question }));
    let appliedOperations = 0;

    console.log(`🔄 Applying ${operations.length} bulk edit operations`);

    for (const operation of operations) {
      for (let i = 0; i < updatedQuestions.length; i++) {
        const question = updatedQuestions[i];
        
        // Apply to question text
        if (operation.target === 'text' || operation.target === 'all') {
          const result = this.applyBulkOperation(question.text, operation);
          if (result.changed) {
            question.text = result.newText;
            appliedOperations++;
          }
        }

        // Apply to options
        if ((operation.target === 'options' || operation.target === 'all') && question.options) {
          for (let j = 0; j < question.options.length; j++) {
            const result = this.applyBulkOperation(question.options[j], operation);
            if (result.changed) {
              question.options[j] = result.newText;
              appliedOperations++;
            }
          }
        }

        // Apply to correct answer
        if ((operation.target === 'correctAnswer' || operation.target === 'all') && question.correctAnswer) {
          const result = this.applyBulkOperation(question.correctAnswer, operation);
          if (result.changed) {
            question.correctAnswer = result.newText;
            appliedOperations++;
          }
        }
      }
    }

    console.log(`✅ Applied ${appliedOperations} bulk operations`);
    return { updatedQuestions, appliedOperations };
  }

  /**
   * Apply single bulk operation
   */
  private static applyBulkOperation(
    text: string,
    operation: BulkEditOperation
  ): { changed: boolean; newText: string } {
    if (!text) return { changed: false, newText: text };

    let newText = text;
    let changed = false;

    switch (operation.type) {
      case 'replace':
        if (operation.searchPattern && operation.replaceText) {
          const pattern = new RegExp(operation.searchPattern, 'gi');
          newText = text.replace(pattern, operation.replaceText);
          changed = newText !== text;
        }
        break;

      case 'append':
        if (operation.replaceText) {
          newText = text + operation.replaceText;
          changed = true;
        }
        break;

      case 'prepend':
        if (operation.replaceText) {
          newText = operation.replaceText + text;
          changed = true;
        }
        break;

      case 'remove':
        if (operation.searchPattern) {
          const pattern = new RegExp(operation.searchPattern, 'gi');
          newText = text.replace(pattern, '');
          changed = newText !== text;
        }
        break;

      case 'capitalize':
        newText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        changed = newText !== text;
        break;

      case 'lowercase':
        newText = text.toLowerCase();
        changed = newText !== text;
        break;

      case 'trim':
        newText = text.trim();
        changed = newText !== text;
        break;
    }

    return { changed, newText };
  }

  /**
   * Check if question matches filters
   */
  private static matchesFilters(question: ExtractedQuestion, filters: SearchFilters): boolean {
    if (filters.questionType && question.type !== filters.questionType) {
      return false;
    }

    if (filters.hasOptions !== undefined) {
      const hasOptions = question.options && question.options.length > 0;
      if (filters.hasOptions !== hasOptions) {
        return false;
      }
    }

    if (filters.textLength) {
      const textLength = question.text.length;
      if (filters.textLength.min && textLength < filters.textLength.min) {
        return false;
      }
      if (filters.textLength.max && textLength > filters.textLength.max) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get line number for match position
   */
  private static getLineNumber(text: string, position: number): number {
    return text.substring(0, position).split('\n').length;
  }

  /**
   * Escape regex special characters
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate search suggestions
   */
  static generateSearchSuggestions(questions: ExtractedQuestion[]): string[] {
    const suggestions = new Set<string>();
    
    // Extract common words and phrases
    const words = new Map<string, number>();
    
    questions.forEach(question => {
      const textWords = question.text.toLowerCase().match(/\b\w+\b/g) || [];
      textWords.forEach(word => {
        if (word.length > 3) { // Only meaningful words
          words.set(word, (words.get(word) || 0) + 1);
        }
      });
    });

    // Get most common words
    const sortedWords = Array.from(words.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    sortedWords.forEach(word => suggestions.add(word));

    // Add common patterns
    suggestions.add('Q\\d+'); // Question numbers
    suggestions.add('A\\)|B\\)|C\\)|D\\)'); // Option markers
    suggestions.add('Answer:'); // Answer indicators

    return Array.from(suggestions);
  }

  /**
   * Validate search term
   */
  static validateSearchTerm(searchTerm: string, useRegex: boolean): { isValid: boolean; error?: string } {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { isValid: false, error: 'Search term cannot be empty' };
    }

    if (useRegex) {
      try {
        new RegExp(searchTerm);
      } catch (error) {
        return { isValid: false, error: 'Invalid regex pattern' };
      }
    }

    return { isValid: true };
  }

  /**
   * Get search statistics
   */
  static getSearchStats(questions: ExtractedQuestion[]): {
    totalQuestions: number;
    totalWords: number;
    averageWordsPerQuestion: number;
    commonWords: Array<{ word: string; count: number }>;
  } {
    const words = new Map<string, number>();
    let totalWords = 0;

    questions.forEach(question => {
      const textWords = question.text.toLowerCase().match(/\b\w+\b/g) || [];
      textWords.forEach(word => {
        if (word.length > 2) {
          words.set(word, (words.get(word) || 0) + 1);
          totalWords++;
        }
      });
    });

    const commonWords = Array.from(words.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return {
      totalQuestions: questions.length,
      totalWords,
      averageWordsPerQuestion: questions.length > 0 ? Math.round(totalWords / questions.length) : 0,
      commonWords
    };
  }
}
