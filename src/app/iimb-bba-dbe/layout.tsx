import { AuthProvider } from '@/lib/auth-context';

export default function IIMBBBADBELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </div>
    </AuthProvider>
  );
}
