# LiveLong App - Consolidated Requirements

## Overview
A web app guiding users through 11 Japanese longevity exercises with timer, media support, accessibility features, and optional gamification.

## Core Exercise Sequence (from PowerPoint)

1. **Breathing – Kokyū Taiso** (2 min)
   - Hands on belly, inhale nose 4s, exhale mouth 6s
   - 10 breaths, breathing pacer support

2. **Towel Twist – Tenugui Hibiki** (1.5 min)
   - Hold towel shoulder-width, twist right/left
   - 10-15 reps per side

3. **Hand & Finger Mobility – Yubi Undō** (1-2 min)
   - Open/close fists ×10, spread ×5
   - Thumb taps each finger

4. **Eye & Neck – Me no Taiso** (1.5 min)
   - Eyes: up/down/left/right ×2, circles
   - Neck turns ×4/side

5. **Floor Sitting – Seiza Henka** (2 min)
   - Stand → kneel/cross-leg sit → stand
   - 3-5 reps, support if needed

6. **Deep Squat – Shinku Zuwari** (2 min)
   - Feet shoulder-width, heels down
   - Hold 3 breaths in squat, 5 reps

7. **Gentle Resistance** (2 min)
   - Light weights/water bottles
   - Curls + shoulder press, 8-10 reps each

8. **Single-Leg Standing – Ippon Ashi** (2 min)
   - Near support, lift foot, hold 10s
   - 2 holds per side

9. **Daily Stretching – Rajio Taiso** (3 min)
   - Arm swings, side bends, light squats
   - Heel raises, arm circles - flowing sequence

10. **Slow Walking – Sanpo** (4 min)
    - Inhale 2 steps, exhale 2 steps
    - Upright posture, light even steps

11. **Cognitive-Motor Drill** (2.5 min)
    - March + count aloud
    - Clap every 2nd step, say days of week

## Functional Requirements

### Core App Flow
- **Home View**: Hero card, settings, exercise preview list
- **Session View**: Exercise display, media, timer, controls dock
- **Summary View**: Completion stats, restart option

### Controls
- Start/Pause/Resume/Skip/Restart
- Previous exercise navigation
- Rep counter for rep-based exercises

### Settings & Preferences
- Music toggle (ambient loop)
- TTS/Voice guidance toggle
- Video preference toggle
- Text size (100%/125%/150%)
- Prepare time (3s/5s/10s)
- Breathing pacer presets

### Media Support
- Video demos with poster images
- Image galleries for exercises
- Graceful fallbacks when media missing

### Timer System
- Countdown for timed exercises
- Rep tracking for rep-based exercises
- Preparation phase between exercises
- Total session progress tracking

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Reduced motion support
- High contrast support

## Technical Requirements

### Performance
- Load time < 3s on slow 3G
- Bundle size < 250KB
- Works offline after first load

### Browser Support
- Modern evergreen browsers
- Feature detection and graceful degradation

### Data Storage
- Local storage only (no cloud/accounts)
- JSON-based exercise data
- Settings persistence

## Optional Features (Gamification)

### XP & Levels
- XP per exercise and session
- Level progression system
- Visual progress indicators

### Badges & Achievements
- Streak tracking
- Session count milestones
- Variety and consistency rewards

### Goals
- Daily/weekly targets
- Progress tracking
- Auto-progression options

## Testing Requirements

### Playwright E2E Tests
- Complete user journey testing
- All three views (Home → Session → Summary)
- Controls functionality (play/pause/skip/restart)
- Settings persistence
- Timer accuracy
- Accessibility features
- Media handling and fallbacks
- Responsive design across devices

### Test Scenarios
1. **Happy Path**: Complete full session
2. **Pause/Resume**: Mid-session interruption
3. **Skip Forward/Back**: Exercise navigation
4. **Settings**: All preference changes
5. **Media**: Video/image fallbacks
6. **Accessibility**: Keyboard-only navigation
7. **Offline**: Service worker caching
8. **Error Handling**: Network failures, missing assets

## Implementation Strategy

### Phase 1: Core Foundation
1. Clean project structure
2. Basic HTML/CSS layout
3. JavaScript state machine
4. Exercise data loading
5. Basic timer functionality

### Phase 2: Full Features
1. Media handling
2. Settings and persistence
3. Accessibility enhancements
4. Service worker for offline

### Phase 3: Polish & Testing
1. Playwright test suite
2. Performance optimization
3. Cross-browser testing
4. Error handling

### Phase 4: Optional Enhancements
1. Gamification system
2. Breathing pacer
3. Advanced accessibility
4. PWA features

## Success Criteria
- All 11 exercises render correctly
- Timer system works accurately
- Settings persist across sessions
- Fully keyboard accessible
- Works offline
- All Playwright tests pass
- Performance budgets met