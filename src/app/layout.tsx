import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationSystem } from "@/components/common/NotificationSystem";
import { ClientInit } from "@/components/common/ClientInit";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Locus - Quiz Management Platform",
  description: "A comprehensive quiz management platform for modern learning and assessment",
  keywords: ["quiz", "assessment", "learning", "education", "platform"],
  authors: [{ name: "Locus Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Locus - Quiz Management Platform",
    description: "A comprehensive quiz management platform for modern learning and assessment",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Locus - Quiz Management Platform",
    description: "A comprehensive quiz management platform for modern learning and assessment",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#20C997" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Locus" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <NotificationSystem />
          <ClientInit />
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
