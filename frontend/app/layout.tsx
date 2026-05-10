import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ShelfMind AI — Intelligent Inventory Management",
  description:
    "AI-powered inventory forecasting, demand planning, and smart reorder recommendations for modern retail businesses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0f] font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster theme="dark" richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
