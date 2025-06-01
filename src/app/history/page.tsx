"use client";
// History page for completed chores
// This page shows who completed each chore and when, with a bar chart and date filter

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { supabase } from '@/lib/supabase';
import type { Roommate } from '@/lib/supabase';

// Temporary household ID for testing - we'll replace this with real auth later
const TEST_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000000';

interface ChoreHistory {
  id: string;
  chore_id: string;
  chore_name: string;
  completed_by: string;
  completed_by_name: string;
  completed_at: string;
}

function getFilteredHistory(
  history: ChoreHistory[], 
  start: string, 
  end: string,
  selectedRoommate: string | null,
  selectedChore: string | null
) {
  return history.filter(item => {
    const dateInRange = item.completed_at >= start && item.completed_at <= end;
    const roommateMatch = !selectedRoommate || item.completed_by_name === selectedRoommate;
    const choreMatch = !selectedChore || item.chore_name === selectedChore;
    return dateInRange && roommateMatch && choreMatch;
  });
}

function getCounts(filteredHistory: ChoreHistory[], roommates: Roommate[]) {
  const counts: Record<string, number> = {};
  roommates.forEach(rm => { counts[rm.name] = 0; });
  filteredHistory.forEach(item => {
    counts[item.completed_by_name] = (counts[item.completed_by_name] || 0) + 1;
  });
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ChoreHistory[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoommate, setSelectedRoommate] = useState<string | null>(null);
  const [selectedChore, setSelectedChore] = useState<string | null>(null);

  // Default window: last 30 days
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Changed from 7 to 30 days
    return d.toISOString().split('T')[0];
  });
  const [end, setEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // Add 30 days to include future dates
    return d.toISOString().split('T')[0];
  });

  // Fetch history and roommates
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch roommates
        const { data: roommatesData, error: roommatesError } = await supabase
          .from('roommates')
          .select('*')
          .eq('household_id', TEST_HOUSEHOLD_ID);

        if (roommatesError) throw roommatesError;
        setRoommates(roommatesData || []);

        // Fetch chore history
        const { data: historyData, error: historyError } = await supabase
          .from('chore_history')
          .select(`
            id,
            chore_id,
            completed_by,
            completed_at,
            chores (
              name
            ),
            roommates (
              name
            )
          `)
          .eq('household_id', TEST_HOUSEHOLD_ID)
          .order('completed_at', { ascending: false });

        if (historyError) {
          console.error('History fetch error:', historyError);
          throw historyError;
        }

        console.log('Raw history data:', historyData);

        // Transform the data to match our interface
        const transformedHistory = (historyData || []).map(item => {
          console.log('Processing history item:', item);
          return {
            id: item.id,
            chore_id: item.chore_id,
            chore_name: (item.chores as unknown as { name: string }).name,
            completed_by: item.completed_by,
            completed_by_name: (item.roommates as unknown as { name: string }).name,
            completed_at: item.completed_at
          };
        });

        console.log('Transformed history:', transformedHistory);
        setHistory(transformedHistory);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center min-h-screen p-4">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 px-3 py-1.5 bg-[#2563eb] text-white rounded hover:bg-blue-500 text-xs font-medium transition"
        >
          Dismiss
        </button>
      </div>
    );
  }

  const filteredHistory = getFilteredHistory(history, start, end, selectedRoommate, selectedChore);
  const chartData = getCounts(filteredHistory, roommates);

  // Get unique chore names for the filter
  const uniqueChores = Array.from(new Set(history.map(item => item.chore_name)));

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Chart Section */}
      <div className="mb-6">
        <div className="bg-[#232323] rounded p-4 w-full">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis allowDecimals={false} stroke="#ccc" />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #333', color: '#fff' }} labelStyle={{ color: '#fff' }} />
              <Bar dataKey="count" fill="#2563eb">
                <LabelList dataKey="count" position="top" fill="#fff" style={{ fontSize: 20, fontWeight: 700, textShadow: '0 1px 4px #000' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="text-sm text-gray-300">Filter by:</span>
        <div className="flex flex-wrap gap-4">
          <label className="text-xs text-gray-400">Date Range
            <div className="flex gap-2 mt-1">
              <input 
                type="date" 
                className="border border-gray-600 rounded px-2 py-1 bg-[#18181b] text-white text-xs" 
                value={start} 
                onChange={e => setStart(e.target.value)} 
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                className="border border-gray-600 rounded px-2 py-1 bg-[#18181b] text-white text-xs" 
                value={end} 
                onChange={e => setEnd(e.target.value)} 
              />
            </div>
          </label>
          <label className="text-xs text-gray-400">Roommate
            <select 
              className="ml-1 border border-gray-600 rounded px-2 py-1 bg-[#18181b] text-white text-xs"
              value={selectedRoommate || ''}
              onChange={e => setSelectedRoommate(e.target.value || null)}
            >
              <option value="">All Roommates</option>
              {roommates.map(rm => (
                <option key={rm.id} value={rm.name}>{rm.name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gray-400">Chore
            <select 
              className="ml-1 border border-gray-600 rounded px-2 py-1 bg-[#18181b] text-white text-xs"
              value={selectedChore || ''}
              onChange={e => setSelectedChore(e.target.value || null)}
            >
              <option value="">All Chores</option>
              {uniqueChores.map(chore => (
                <option key={chore} value={chore}>{chore}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300 border-separate border-spacing-y-1">
          <thead>
            <tr className="bg-[#232323]">
              <th className="px-3 py-2 font-semibold">Chore</th>
              <th className="px-3 py-2 font-semibold">Completed By</th>
              <th className="px-3 py-2 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 py-4">No chores completed in this date range.</td>
              </tr>
            ) : (
              filteredHistory.map(item => (
                <tr key={item.id} className="bg-[#18181b] hover:bg-[#232323]">
                  <td className="px-3 py-2 whitespace-nowrap text-white">{item.chore_name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-blue-300">{item.completed_by_name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-400">{new Date(item.completed_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 