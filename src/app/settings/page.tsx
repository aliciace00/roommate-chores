"use client";
// Settings page for managing chores and assignments
// Allows adding, editing, assigning chores, and setting frequency

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Chore, Roommate } from '@/lib/supabase';

// Temporary household ID for testing - we'll replace this with real auth later
const TEST_HOUSEHOLD_ID = '00000000-0000-0000-0000-000000000000';

export default function SettingsPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [newChore, setNewChore] = useState({ name: '', assignedTo: '', frequency: 7 });
  const [showAddChore, setShowAddChore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch roommates and chores from Supabase
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

        // Set initial assignedTo if we have roommates
        if (roommatesData && roommatesData.length > 0) {
          setNewChore(prev => ({ ...prev, assignedTo: roommatesData[0].id }));
        }

        // Fetch chores
        const { data: choresData, error: choresError } = await supabase
          .from('chores')
          .select('*')
          .eq('household_id', TEST_HOUSEHOLD_ID);

        if (choresError) throw choresError;
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

  const addChore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChore.name.trim()) return;

    try {
      console.log('Adding chore:', {
        name: newChore.name,
        assigned_to: newChore.assignedTo,
        frequency: newChore.frequency,
        household_id: TEST_HOUSEHOLD_ID
      });

      const { data, error } = await supabase
        .from('chores')
        .insert([
          {
            name: newChore.name,
            assigned_to: newChore.assignedTo,
            frequency: newChore.frequency,
            household_id: TEST_HOUSEHOLD_ID
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setChores([...chores, data]);
      setNewChore({ name: '', assignedTo: roommates[0]?.id || '', frequency: 7 });
      setShowAddChore(false);
    } catch (err) {
      console.error('Add chore error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add chore');
    }
  };

  const editChore = async (id: number, field: string, value: string | number) => {
    try {
      const { error } = await supabase
        .from('chores')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setChores(chores.map(chore =>
        chore.id === id ? { ...chore, [field]: value } : chore
      ));
    } catch (err) {
      console.error('Edit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update chore');
    }
  };

  // Remove a chore
  const removeChore = async (id: number) => {
    try {
      const { error } = await supabase
        .from('chores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setChores(chores.filter(chore => chore.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete chore');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowAddChore(!showAddChore)}
          className="px-3 py-1.5 bg-[#2563eb] text-white rounded hover:bg-blue-500 text-xs font-medium transition"
        >
          {showAddChore ? 'Cancel' : 'Add Chore'}
        </button>
      </div>

      {showAddChore && (
        <form onSubmit={addChore} className="flex items-center gap-2 mb-8 bg-[#18181b] p-4 rounded-lg border border-[#232323] shadow">
          <input
            className="px-2 py-1 rounded bg-[#232323] border-none text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 placeholder-gray-500 flex-1"
            placeholder="Chore name"
            value={newChore.name}
            onChange={e => setNewChore({ ...newChore, name: e.target.value })}
          />
          <div className="flex gap-2">
            <label className="text-gray-400 text-xs">Assign to
              <select
                className="ml-1 px-2 py-1 rounded bg-[#232323] border-none text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
                value={newChore.assignedTo}
                onChange={e => setNewChore({ ...newChore, assignedTo: e.target.value })}
              >
                {roommates.map(rm => (
                  <option key={rm.id} value={rm.id}>{rm.name}</option>
                ))}
              </select>
            </label>
            <label className="text-gray-400 text-xs">Frequency (days)
              <input
                type="number"
                min={1}
                className="ml-1 w-16 px-2 py-1 rounded bg-[#232323] border-none text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
                value={newChore.frequency}
                onChange={e => setNewChore({ ...newChore, frequency: Number(e.target.value) })}
              />
            </label>
          </div>
          <button type="submit" className="px-3 py-1.5 bg-[#2563eb] text-white rounded hover:bg-blue-500 text-xs font-medium transition">Add</button>
        </form>
      )}

      <ul className="divide-y divide-[#232323] bg-[#18181b] rounded-lg border border-[#232323] shadow">
        {chores.map(chore => (
          <li key={chore.id} className="flex items-center gap-2 px-4 py-3">
            <input
              className="px-2 py-1 rounded bg-[#232323] border-none text-white flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 placeholder-gray-500"
              value={chore.name}
              onChange={e => editChore(chore.id, 'name', e.target.value)}
              placeholder="Chore name"
            />
            <select
              className="px-2 py-1 rounded bg-[#232323] border-none text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={chore.assigned_to}
              onChange={e => editChore(chore.id, 'assigned_to', e.target.value)}
            >
              {roommates.map(rm => (
                <option key={rm.id} value={rm.id}>{rm.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="w-16 px-2 py-1 rounded bg-[#232323] border-none text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={chore.frequency}
              onChange={e => editChore(chore.id, 'frequency', Number(e.target.value))}
              placeholder="Days"
            />
            <button
              className="ml-2 text-gray-500 hover:text-red-500 p-1 rounded transition"
              onClick={() => removeChore(chore.id)}
              title="Remove"
              aria-label="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.47-10.53a.75.75 0 00-1.06 0L10 8.94 8.59 7.47a.75.75 0 10-1.06 1.06L8.94 10l-1.41 1.47a.75.75 0 101.06 1.06L10 11.06l1.41 1.47a.75.75 0 101.06-1.06L11.06 10l1.41-1.47a.75.75 0 000-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-xs text-gray-500 ml-2">every {chore.frequency} days</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 