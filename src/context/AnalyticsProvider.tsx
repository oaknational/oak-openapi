import { createContext, useEffect, useContext, ReactNode } from 'react';
import posthog from 'posthog-js';

interface PostHogContextType {
  posthog: typeof posthog | null;
}

const PostHogContext = createContext<PostHogContextType>({ posthog: null });

interface PostHogProviderProps {
  children: ReactNode;
}

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;

    if (!apiKey) {
      console.error('NEXT_PUBLIC_POSTHOG_API_KEY is not defined');
      return;
    }

    if (typeof window !== 'undefined') {
      posthog.init(apiKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_API_HOST,
        autocapture: true,
      });
    }
  }, []);

  return (
    <PostHogContext.Provider value={{ posthog }}>
      {children}
    </PostHogContext.Provider>
  );
};

export const usePostHog = () => useContext(PostHogContext);
