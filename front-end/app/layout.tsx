'use client';

import "./globals.css";
import { Footer } from "./(marketing)/footer";
import { Toaster } from "@/components/ui/sonner";
import {Inter} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/components/features/auth/auth-provider";
import { AuthGuard } from "@/lib/auth-guard";
// inter
const inter = Inter({ subsets: ["latin"]});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}
      >
        <AuthProvider>
          <ThemeProvider>
            <AuthGuard>
              <div className="fixed right-4 bottom-4 z-50">
                <ThemeToggle />
              </div>
              {children}
              <Footer />
              <Toaster />
            </AuthGuard>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
