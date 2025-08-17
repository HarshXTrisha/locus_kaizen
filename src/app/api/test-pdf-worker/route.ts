import { NextResponse } from 'next/server';

export async function GET() {
  const pdfjsVersion = '5.4.54'; // This should match your package.json version
  
  return NextResponse.json({
    success: true,
    message: 'PDF Worker Configuration Test',
    production: {
      workerUrl: `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`,
      description: 'This URL will be used in production on Vercel'
    },
    development: {
      workerUrl: '/pdf.worker.min.js',
      description: 'This URL will be used in development'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}
