import { create } from 'zustand';

export type TimerMode = 'Pomodoro' | 'Deep Work' | 'Custom';

interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  setMode: (mode: TimerMode, customDuration?: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: (newTimeLeft: number) => void;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  'Pomodoro': 25 * 60,
  'Deep Work': 90 * 60,
  'Custom': 25 * 60, // Default for custom
};

export const useTimerStore = create<TimerState>((set) => ({
  mode: 'Pomodoro',
  timeLeft: MODE_DURATIONS['Pomodoro'],
  isRunning: false,
  
  setMode: (mode, customDuration) => set((state) => ({
    mode,
    timeLeft: mode === 'Custom' && customDuration ? customDuration : MODE_DURATIONS[mode],
    isRunning: false
  })),

  startTimer: () => set({ isRunning: true }),
  
  pauseTimer: () => set({ isRunning: false }),
  
  resetTimer: () => set((state) => ({
    isRunning: false,
    timeLeft: state.mode === 'Custom' ? state.timeLeft : MODE_DURATIONS[state.mode] // In a real app we'd save the custom duration, but this works for now
  })),

  tick: (newTimeLeft) => set({ timeLeft: newTimeLeft })
}));
