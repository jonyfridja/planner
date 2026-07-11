/// <reference types="vite/client" />

interface Window {
  umami?: {
    track: (eventNameOrProperties?: string | Record<string, unknown>, eventData?: Record<string, unknown>) => void;
  };
}
