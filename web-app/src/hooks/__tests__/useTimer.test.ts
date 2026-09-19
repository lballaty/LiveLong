import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';
import { useTimerStore } from '../../store/useTimerStore';

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    return setTimeout(() => cb(Date.now()), 16) as any;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    clearTimeout(id);
  });
});

afterAll(() => {
  (window.requestAnimationFrame as jest.Mock).mockRestore();
  (window.cancelAnimationFrame as jest.Mock).mockRestore();
});

jest.useFakeTimers();

describe('useTimer logic', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    const { result: storeResult } = renderHook(() => useTimerStore());
    act(() => {
      storeResult.current.resetTimer();
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should decrease timeLeft when running', () => {
    const { result: storeResult } = renderHook(() => useTimerStore());
    renderHook(() => useTimer());

    act(() => {
      storeResult.current.startTimer();
    });

    // Fast-forward slightly over 1 second to account for 16ms rAF ticks
    act(() => {
      jest.advanceTimersByTime(1050);
    });

    // 25 * 60 = 1500 seconds initially
    expect(storeResult.current.timeLeft).toBe(1499);
  });

  it('should not decrease timeLeft when paused', () => {
    const { result: storeResult } = renderHook(() => useTimerStore());
    renderHook(() => useTimer());

    act(() => {
      storeResult.current.startTimer();
    });
    
    act(() => {
      jest.advanceTimersByTime(1050);
    });
    
    expect(storeResult.current.timeLeft).toBe(1499);
    
    act(() => {
      storeResult.current.pauseTimer();
    });

    act(() => {
      jest.advanceTimersByTime(5050);
    });

    // Should remain 1499
    expect(storeResult.current.timeLeft).toBe(1499);
  });

  it('should pause timer and hit 0 when time is up', () => {
    const { result: storeResult } = renderHook(() => useTimerStore());
    renderHook(() => useTimer());

    // set low time for test
    act(() => {
      storeResult.current.tick(2);
      storeResult.current.startTimer();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(storeResult.current.timeLeft).toBe(0);
    expect(storeResult.current.isRunning).toBe(false);
  });
});
