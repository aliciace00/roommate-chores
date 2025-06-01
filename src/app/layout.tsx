import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import MonthlyStatsNav from "./MonthlyStatsNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roommate Chores App",
  description: "Track and assign chores for roommates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation bar at the top */}
        <nav className="w-full bg-[#18181b] text-white py-3 px-6 flex items-center shadow mb-8 border-b border-[#232323] justify-between">
          <MonthlyStatsNav />
        </nav>
        {children}
      </body>
    </html>
  );
}
