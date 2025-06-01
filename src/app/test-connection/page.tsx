'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('households').select('count').limit(1);
        
        if (error) throw error;
        
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="p-4 rounded-lg bg-[#18181b] border border-[#232323]">
        {status === 'loading' && (
          <p className="text-gray-400">Testing connection...</p>
        )}
        {status === 'success' && (
          <p className="text-green-500">✅ Successfully connected to Supabase!</p>
        )}
        {status === 'error' && (
          <div>
            <p className="text-red-500">❌ Failed to connect to Supabase</p>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
} 