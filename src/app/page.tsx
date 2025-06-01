"use client";
// Home page for the Roommate Chores app
// Shows and manages tasks directly on the home page

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Chore, Roommate } from '@/lib/supabase';

// Temporary household ID for testing - we'll replace this with real auth later
const TEST_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000000';

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

export default function Home() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chores and roommates
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

        // Fetch chores
        const { data: choresData, error: choresError } = await supabase
          .from('chores')
          .select('*')
          .eq('household_id', TEST_HOUSEHOLD_ID);

        if (choresError) throw choresError;
        console.log('Fetched chores:', choresData);
        setChores(choresData || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Mark a chore as done and rotate it
  const markDone = async (chore: Chore) => {
    try {
      // Get the next roommate in rotation
      const currentIndex = roommates.findIndex(rm => rm.id === chore.assigned_to);
      const nextRoommate = roommates[(currentIndex + 1) % roommates.length];

      console.log('Marking chore as done:', {
        chore_id: chore.id,
        chore_name: chore.name,
        household_id: TEST_HOUSEHOLD_ID,
        completed_by: chore.assigned_to,
        next_roommate_id: nextRoommate.id,
        next_roommate_name: nextRoommate.name
      });

      // Start a transaction
      const { data, error: transactionError } = await supabase.rpc('mark_chore_done', {
        p_chore_id: chore.id,
        p_household_id: TEST_HOUSEHOLD_ID,
        p_completed_by: chore.assigned_to,
        p_next_roommate_id: nextRoommate.id
      });

      if (transactionError) {
        console.error('Transaction error details:', {
          error: transactionError,
          message: transactionError.message,
          details: transactionError.details,
          hint: transactionError.hint
        });
        throw transactionError;
      }

      console.log('Chore marked as done successfully:', data);

      // Update local state
      setChores(chores.map(c => 
        c.id === chore.id 
          ? { ...c, assigned_to: nextRoommate.id, last_completed: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      console.error('Mark done error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        details: err instanceof Error ? (err as any).details : undefined,
        hint: err instanceof Error ? (err as any).hint : undefined
      });
      setError(err instanceof Error ? err.message : 'Failed to mark chore as done');
    }
  };

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

  // Group chores by roommate
  const choresByRoommate = roommates.map(rm => ({
    name: rm.name,
    id: rm.id,
    chores: chores.filter(chore => chore.assigned_to === rm.id),
  }));

  const today = new Date();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 gap-4">
      <div className="flex gap-4 w-full justify-center px-8 md:px-24 lg:px-48">
        {choresByRoommate.map(col => (
          <div key={col.id} className="flex-1 min-w-[180px] bg-[#18181b] rounded-lg shadow p-3 border border-[#232323]">
            <h3 className="text-base font-semibold text-white mb-2 text-left">{col.name}</h3>
            {col.chores.length === 0 ? (
              <div className="text-gray-500 text-center py-4 text-sm">No chores</div>
            ) : (
              <ul className="space-y-2">
                {col.chores.map(chore => {
                  const dueDate = addDays(chore.last_completed || chore.created_at, chore.frequency);
                  const isOverdue = dueDate < today;
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                  let dueText = dueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                  if (!isOverdue) {
                    if (daysUntilDue === 0) dueText = 'Today';
                    else if (daysUntilDue > 0 && daysUntilDue < 7) dueText = `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`;
                  }
                  return (
                    <li key={chore.id} className="bg-[#232323] rounded p-2 flex flex-col shadow">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-white text-sm font-semibold truncate">{chore.name}</span>
                          <span className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400 font-bold' : 'text-gray-400'}`}>Due: {dueText}{isOverdue ? ' (Overdue!)' : ''}</span>
                        </div>
                        <button
                          className="ml-3 px-3 py-1.5 rounded bg-[#2563eb] text-white hover:bg-blue-500 text-xs font-medium shadow transition-opacity opacity-80 hover:opacity-100"
                          onClick={() => markDone(chore)}
                        >
                          Mark Done
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
