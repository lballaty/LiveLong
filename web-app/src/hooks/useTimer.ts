import { useEffect, useRef } from 'react';
import { useTimerStore } from '../store/useTimerStore';

export const useTimer = () => {
  const { isRunning, timeLeft, tick, pauseTimer } = useTimerStore();
  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>();

  useEffect(() => {
    const updateTimer = () => {
      if (!isRunning) return;

      const now = Date.now();
      const deltaTime = now - (lastUpdateRef.current || now);
      
      // Update once a second has passed
      if (deltaTime >= 1000) {
        const store = useTimerStore.getState();
        const newTimeLeft = Math.max(0, store.timeLeft - Math.floor(deltaTime / 1000));
        
        if (newTimeLeft === 0) {
          store.tick(0);
          store.pauseTimer();
          // In the future, play audio chime here
        } else {
          store.tick(newTimeLeft);
        }
        
        lastUpdateRef.current = now;
      }
      
      requestRef.current = requestAnimationFrame(updateTimer);
    };

    if (isRunning) {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = Date.now();
      }
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      lastUpdateRef.current = undefined;
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  return { isRunning, timeLeft };
};
