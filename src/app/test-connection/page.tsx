'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase
          .from('roommates')
          .select('*')
          .limit(1);

        if (error) throw error;
        setStatus('success');
      } catch (err) {
        console.error('Connection test error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#18181b] text-white">
      <div className="p-8 rounded-lg bg-[#232323] shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        {status === 'loading' && (
          <p className="text-blue-400">Testing connection...</p>
        )}
        {status === 'success' && (
          <p className="text-green-400">Successfully connected to Supabase!</p>
        )}
        {status === 'error' && (
          <div>
            <p className="text-red-400">Failed to connect to Supabase</p>
            {error && <p className="text-red-300 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
} 