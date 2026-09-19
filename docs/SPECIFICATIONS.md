# Technical Specifications

## 1. System Overview

LiveLong ⊹ is a standalone web application requiring no backend API for its core functionality. It is designed to be hosted on static hosting services (e.g., GitHub Pages, Vercel, Netlify).

## 2. Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (framework TBD).
- **Tooling**: Node.js, npm, Playwright (for testing).

## 3. Data Models

### Timer Configuration
```typescript
interface TimerConfig {
  id: string;
  name: string; // e.g., "Pomodoro", "Deep Work"
  durationSeconds: number;
}
```

### Exercise Configuration
```typescript
interface BreathingPhase {
  name: "inhale" | "hold" | "exhale" | "rest";
  durationSeconds: number;
}

interface BreathingExercise {
  id: string;
  name: string;
  phases: BreathingPhase[];
}
```

## 4. Business Logic

### Timer Execution Flow
1. User selects a timer preset.
2. Timer counts down. If page is backgrounded, calculate elapsed time based on timestamps to adjust for browser throttling.
3. Upon completion, play an audio chime and update user statistics.

---

**Status**: Defined
**Last Updated**: 2026-09-17
