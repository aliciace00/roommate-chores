"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

const navTabs = [
  { href: '/', label: 'Chores' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export default function MonthlyStatsNav() {
  const pathname = usePathname();
  return (
    <div className="flex-1 flex justify-center">
      <div className="flex gap-8">
        {navTabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-base font-medium transition-colors pb-1 ${pathname === tab.href ? 'border-b-2 border-blue-400 text-blue-200' : 'border-b-2 border-transparent hover:text-blue-200'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
} 