
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCrypto } from '@/contexts/CryptoContext';

const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refreshData } = useCrypto();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the session from URL
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting auth session:', error);
        setError(error.message);
        return;
      }
      
      if (data?.session) {
        // Session found, refresh user data
        refreshData();
        
        // Check if profile is completed
        navigate('/auth/profile');
      } else {
        // No session found, redirect to auth page
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, refreshData]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 p-4 rounded-lg border border-destructive max-w-md w-full">
          <h2 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h2>
          <p className="text-destructive-foreground">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/auth')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
