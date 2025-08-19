import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { NotificationProvider } from '@/components/common/NotificationSystem';
import { ClientInit } from '@/components/common/ClientInit';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { PageTransition } from '@/components/common/PageTransition';
import { PerformanceMonitor } from '@/components/common/PerformanceMonitor';
import { QueryProvider } from '@/lib/query-client';
import { MobileAppWrapper } from '@/components/mobile/MobileAppWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Locus - Quiz Platform',
  description: 'Create, take, and analyze quizzes with ease',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <NotificationProvider>
              <ClientInit />
              <PerformanceMonitor />
              <PageTransition>
                <MobileAppWrapper>
                  {children}
                </MobileAppWrapper>
              </PageTransition>
            </NotificationProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
