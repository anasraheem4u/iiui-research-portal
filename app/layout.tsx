import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "RDMS | International Islamic University Islamabad",
  description: "Research Document Management System for International Islamic University Islamabad (IIUI)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} font-display antialiased bg-background text-foreground`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
