import { useAuth } from '@/contexts/AuthContext';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/callback')({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    // Monitor authentication state changes
    if (isAuthenticated) {
      setStatus('success');
      // Redirect to home page after successful authentication
      const timer = setTimeout(() => {
        navigate({ to: '/' });
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Give the auth context time to process the callback
    // Check every 500ms for up to 10 seconds (20 attempts)
    if (checkAttempts < 20) {
      const timer = setTimeout(() => {
        setCheckAttempts((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // After 10 seconds, if still not authenticated, show error
      if (!isAuthenticated && status === 'processing') {
        setStatus('error');
      }
    }
  }, [isAuthenticated, navigate, status, checkAttempts]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <h2 className="text-2xl font-bold app-text-strong mb-2">
            Completing sign in...
          </h2>
          <p className="app-text-subtle">Please wait while we authenticate you</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold app-text-strong mb-2">
            Authentication Failed
          </h2>
          <p className="app-text-subtle mb-4">
            There was an error signing you in
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-600 dark:text-green-400 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold app-text-strong mb-2">
          Sign in successful!
        </h2>
        <p className="app-text-subtle">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
