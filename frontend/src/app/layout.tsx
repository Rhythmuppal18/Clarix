'use client';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authRoutes = ['/', '/login', '/register', '/auth'];
  const isAuthRoute =
    authRoutes.includes(pathname) ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth');

  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-text-primary antialiased selection:bg-accent/30">
        <AuthProvider>
          {isAuthRoute ? (
            <main className="min-h-screen flex flex-col bg-background">
              {children}
            </main>
          ) : (
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              <main className="flex-1 flex flex-col overflow-y-auto bg-background">
                {children}
              </main>
            </div>
          )}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111111',
                color: '#e8e8e8',
                border: '1px solid #1f1f1f',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
