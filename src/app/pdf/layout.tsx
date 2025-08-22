import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuestAI PDF Converter - AI-Powered PDF to Quiz Conversion',
  description: 'Convert your PDF content into intelligent quizzes using OSS GPT 20B. Support for textbooks, research papers, manuals, and more.',
  keywords: 'PDF converter, quiz generation, AI, OSS GPT 20B, educational content',
  robots: 'noindex, nofollow', // Hide from search engines
};

export default function PDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
