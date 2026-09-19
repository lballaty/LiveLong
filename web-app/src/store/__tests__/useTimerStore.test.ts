import { renderHook, act } from '@testing-library/react';
import { useTimerStore } from '../useTimerStore';

describe('useTimerStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.resetTimer();
    });
  });

  it('should initialize with default Pomodoro settings', () => {
    const { result } = renderHook(() => useTimerStore());
    expect(result.current.mode).toBe('Pomodoro');
    expect(result.current.timeLeft).toBe(25 * 60);
    expect(result.current.isRunning).toBe(false);
  });

  it('should change mode and update timeLeft accordingly', () => {
    const { result } = renderHook(() => useTimerStore());
    
    act(() => {
      result.current.setMode('Deep Work');
    });

    expect(result.current.mode).toBe('Deep Work');
    expect(result.current.timeLeft).toBe(90 * 60);
  });

  it('should start the timer', () => {
    const { result } = renderHook(() => useTimerStore());
    
    act(() => {
      result.current.startTimer();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('should pause the timer', () => {
    const { result } = renderHook(() => useTimerStore());
    
    act(() => {
      result.current.startTimer();
    });
    
    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should update timeLeft via tick', () => {
    const { result } = renderHook(() => useTimerStore());
    
    act(() => {
      result.current.tick(1500 - 1); // Mock 1 second passed
    });

    expect(result.current.timeLeft).toBe(1499);
  });
});
