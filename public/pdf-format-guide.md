# PDF Format Guide for Quiz Upload

## 📋 Supported Format

Your PDF should contain questions in the following format for automatic extraction:

### Basic Question Format (with correct answers)
```
Q1. What is the capital of France?
A) London
B) Paris ✓
C) Berlin
D) Madrid

Q2. Which planet is closest to the Sun?
A) Venus
B) Mercury ✓
C) Earth
D) Mars
```

### Alternative Format (with answer key)
```
Q1. What is 2 + 2?
A) 3
B) 4
C) 5
D) 6

Q2. Who wrote "Romeo and Juliet"?
A) Charles Dickens
B) William Shakespeare
C) Jane Austen
D) Mark Twain

ANSWERS:
Q1: B
Q2: B
```

### Advanced Question Format
```
Question 1: What is the capital of Japan?
A) Beijing
B) Seoul
C) Tokyo ✓
D) Bangkok

Question 2: What is the largest ocean on Earth?
A) Atlantic
B) Indian
C) Arctic
D) Pacific ✓
```

## ✅ Supported Patterns

The system automatically detects these patterns:

1. **Question Numbers**: `Q1`, `Q2`, `Question 1`, `Question 2`, etc.
2. **Option Letters**: `A)`, `B)`, `C)`, `D)` or `A.`, `B.`, `C.`, `D.`
3. **Correct Answer Indicators**: `✓`, `*`, `(correct)`, `[correct]`
4. **Answer Key**: Separate section with `ANSWERS:` or `ANSWER KEY:`
5. **Mixed Formats**: You can mix different question numbering styles

## 📝 Best Practices

### ✅ DO:
- Use clear question numbering (Q1, Q2, etc.)
- Use standard option letters (A, B, C, D)
- Keep questions and options on separate lines
- Use consistent formatting throughout
- Include 4 options per question (A, B, C, D)
- **Mark correct answers** using ✓, *, or (correct)
- Or provide a separate answer key section

### ❌ DON'T:
- Use complex formatting or tables
- Include images or diagrams
- Use non-standard option letters (E, F, etc.)
- Mix different question formats in the same document
- Use bullet points or special characters for options
- Forget to mark correct answers

## 📄 Example PDF Structure

```
QUIZ TITLE: Basic Mathematics Quiz

Q1. What is the result of 5 + 3?
A) 6
B) 7
C) 8 ✓
D) 9

Q2. Which of the following is an even number?
A) 7
B) 9
C) 11
D) 12 ✓

Q3. What is the square root of 16?
A) 2
B) 3
C) 4 ✓
D) 5

Q4. Which operation comes first in PEMDAS?
A) Addition
B) Subtraction
C) Parentheses ✓
D) Multiplication

Q5. What is 10% of 50?
A) 5 ✓
B) 10
C) 15
D) 20

ANSWER KEY:
Q1: C
Q2: D
Q3: C
Q4: C
Q5: A
```

## 🔧 Technical Requirements

- **File Size**: Maximum 10MB
- **File Format**: PDF only
- **Text Type**: Searchable text (not scanned images)
- **Language**: English (currently supported)
- **Processing**: Client-side only (PDF never leaves your device)

## 🚀 How It Works

1. **Upload**: Select your PDF file
2. **Process**: System extracts text and identifies questions/options
3. **Preview**: Review extracted questions before creating quiz
4. **Create**: Generate quiz with extracted content

## 📞 Support

If you have questions about the format or encounter issues:
- Check that your PDF contains searchable text
- Ensure questions follow the supported patterns
- **Make sure correct answers are marked** with ✓, *, or in answer key
- Try with a simple test file first
- Contact support if problems persist

---

**Note**: The system processes PDFs entirely in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security.
