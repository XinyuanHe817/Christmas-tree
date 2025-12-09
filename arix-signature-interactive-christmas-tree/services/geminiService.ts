import { GreetingResponse } from '../types';

// We no longer need the AI SDK for a fixed message, but keeping the signature compatible
// so we don't break imports in App.tsx

export const generateLuxuryGreeting = async (): Promise<GreetingResponse> => {
  // Simulate a quick network delay for effect (optional, or just return immediately)
  // Returning a fixed, curated high-end message as requested.
  return Promise.resolve({
    message: "May the golden glow of this season illuminate your path with joy, warmth, and eternal elegance.",
    signature: "The Arix Collection"
  });
};