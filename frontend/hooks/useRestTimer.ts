import { useState, useEffect, useCallback } from "react";
import { playBeep } from "../lib/audio";

interface UseRestTimerOptions {
  duration?: number;
  onComplete?: () => void;
}

interface UseRestTimerReturn {
  isOpen: boolean;
  timeLeft: number;
  start: () => void;
  stop: () => void;
  skip: () => void;
  formatTime: (seconds: number) => string;
}

export function useRestTimer({ 
  duration = 90, 
  onComplete 
}: UseRestTimerOptions = {}): UseRestTimerReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  const start = useCallback(() => {
    setTimeLeft(duration);
    setIsOpen(true);
  }, [duration]);

  const stop = useCallback(() => {
    setIsOpen(false);
    setTimeLeft(duration);
  }, [duration]);

  const skip = useCallback(() => {
    stop();
  }, [stop]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          setTimeout(() => {
            setIsOpen(false);
            onComplete?.();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  return {
    isOpen,
    timeLeft,
    start,
    stop,
    skip,
    formatTime
  };
}
