import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MonthlyStatsNav from "./MonthlyStatsNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roommate Chores",
  description: "Track and manage household chores with your roommates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation bar at the top */}
        <nav className="w-full bg-[#18181b] text-white py-3 px-6 flex items-center shadow mb-8 border-b border-[#232323] justify-between">
          <MonthlyStatsNav />
        </nav>
        {children}
      </body>
    </html>
  );
}
