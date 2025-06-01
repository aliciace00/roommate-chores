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
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
  const [showAddChoreModal, setShowAddChoreModal] = useState(false);
  const [showAddRoommateModal, setShowAddRoommateModal] = useState(false);
  const [newRoommate, setNewRoommate] = useState({ name: '' });

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

  // Add a new chore
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

  // Edit a chore
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

  // Handle adding a new chore
  const handleAddChore = async (e: React.FormEvent) => {
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
      setShowAddChoreModal(false);
    } catch (err) {
      console.error('Add chore error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add chore');
    }
  };

  // Handle updating a roommate
  const handleUpdateRoommate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoommate) return;

    try {
      const { error } = await supabase
        .from('roommates')
        .update({ name: selectedRoommate.name })
        .eq('id', selectedRoommate.id);

      if (error) throw error;

      setRoommates(roommates.map(rm =>
        rm.id === selectedRoommate.id ? { ...rm, name: selectedRoommate.name } : rm
      ));
      setSelectedRoommate(null);
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update roommate');
    }
  };

  // Handle adding a new roommate
  const handleAddRoommate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoommate.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('roommates')
        .insert([
          {
            name: newRoommate.name,
            household_id: TEST_HOUSEHOLD_ID
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setRoommates([...roommates, data]);
      setNewRoommate({ name: '' });
      setShowAddRoommateModal(false);
    } catch (err) {
      console.error('Add roommate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add roommate');
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-4 w-full justify-center px-8 md:px-24 lg:px-48">
        {roommates.map(col => (
          <div key={col.id} className="flex-1 min-w-[180px] bg-[#18181b] rounded-lg shadow p-3 border border-[#232323]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">{col.name}</h3>
              <button
                onClick={() => setSelectedRoommate(col)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-400">Chores</h4>
              <button
                onClick={() => {
                  setNewChore({ name: '', assignedTo: col.id, frequency: 7 });
                  setShowAddChoreModal(true);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <ul className="space-y-2">
              {chores
                .filter(chore => chore.assigned_to === col.id)
                .map(chore => (
                  <li key={chore.id} className="bg-[#232323] rounded p-2 flex items-center justify-between">
                    <span className="text-white text-sm">{chore.name}</span>
                    <button
                      onClick={() => removeChore(chore.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Add Chore Modal */}
      {showAddChoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Chore</h2>
            <form onSubmit={handleAddChore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Chore Name</label>
                <input
                  type="text"
                  value={newChore.name}
                  onChange={e => setNewChore(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Frequency (days)</label>
                <input
                  type="number"
                  value={newChore.frequency}
                  onChange={e => setNewChore(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
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
                  <option value="">Select a roommate</option>
                  {roommates.map(rm => (
                    <option key={rm.id} value={rm.id}>{rm.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChoreModal(false)}
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

      {/* Edit Roommate Modal */}
      {selectedRoommate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Roommate</h2>
            <form onSubmit={handleUpdateRoommate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedRoommate.name}
                  onChange={e => setSelectedRoommate(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoommate(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white rounded hover:bg-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Roommate Modal */}
      {showAddRoommateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Roommate</h2>
            <form onSubmit={handleAddRoommate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newRoommate.name}
                  onChange={e => setNewRoommate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#232323] border border-gray-600 rounded text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoommateModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] text-white rounded hover:bg-blue-500 transition-colors"
                >
                  Add Roommate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Roommate Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowAddRoommateModal(true)}
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