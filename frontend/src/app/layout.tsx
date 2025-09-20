import type { Metadata } from "next";
import {
  ClerkProvider
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { dark } from "@clerk/themes";
import { ReactQueryProvider } from "@/lib/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anim",
  description: "AI animation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      appearance={{ theme: dark}} 
      signInFallbackRedirectUrl={'/chat'}
      signUpFallbackRedirectUrl={'/chat'}
      // allowedRedirectOrigins={[process.env.NEXT_PUBLIC_API_URL!]}
    >
      <ReactQueryProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
        >
          {children}
          <Toaster position="bottom-right" richColors theme="dark"/>
        </body>
      </html>
      </ReactQueryProvider>
    </ClerkProvider>
  );
}
