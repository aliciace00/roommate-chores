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

      {/* Add Chore Form */}
      {showAddChore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Chore</h2>
            <form onSubmit={addChore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chore Name</label>
                <input
                  type="text"
                  value={newChore.name}
                  onChange={e => setNewChore({ ...newChore, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Frequency (days)</label>
                <input
                  type="number"
                  value={newChore.frequency}
                  onChange={e => setNewChore({ ...newChore, frequency: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded text-white"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Assigned To</label>
                <select
                  value={newChore.assignedTo}
                  onChange={e => setNewChore({ ...newChore, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded text-white"
                  required
                >
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChore(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white rounded hover:bg-blue-500 transition-colors"
                >
                  Add Chore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chore Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowAddChore(!showAddChore)}
          className="bg-[#2563eb] text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
} 