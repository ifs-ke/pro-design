'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Something went wrong!</h1>
        <p className="mt-4 text-lg text-muted-foreground">{error.message || 'An unexpected error occurred.'}</p>
        <Button onClick={reset} className="mt-8">
          Try again
        </Button>
      </div>
    </div>
  );
}
