# LiveLong App - Clean Implementation Plan

## Overview
Start fresh with a clean, test-driven implementation based on consolidated requirements from PowerPoint presenter notes, Requirements.md, and Design.md.

## Detailed Exercise Specifications (from PowerPoint Notes)

### 1. Breathing – Kokyū Taiso (2 min)
**Slides:** Sit or stand tall, hands on belly
**Guidance:** "Inhale slowly through nose (4s)... feel belly rise. Exhale through mouth (6s)... feel belly fall."
**Count:** 10 breaths
**Special:** Breathing pacer support with visual and audio cues

### 2. Towel Twist – Tenugui Hibiki (1.5 min)
**Setup:** Hold towel shoulder-width apart
**Guidance:** "Inhale at center... exhale as you twist right. Return to center, inhale... exhale as you twist left."
**Count:** 10-15 twists each side
**Benefits:** Grip strength and hand flexibility

### 3. Hand & Finger Mobility – Yubi Undō (1-2 min)
**Sequence:**
- Open hands wide/close into fists (×10)
- Spread fingers wide/relax (×5)
- Touch each fingertip to thumb, one by one
**Benefits:** Keep hands nimble for everyday life

### 4. Eye & Neck – Me no Taiso (1.5 min)
**Eyes:** Up/down/left/right (×2), then gentle circles each way
**Neck:** Slow head turns right/left (×4 each side)
**Timing:** "Inhale at center, exhale as you turn"
**Benefits:** Release tension, help balance

### 5. Floor Sitting – Seiza Henka (2 min)
**Movement:** Stand → sit cross-legged/kneeling → stand
**Guidance:** "Inhale standing... exhale as you lower down. Pause, breathe. Inhale, exhale as you rise."
**Count:** 3-5 repetitions
**Safety:** Use chair support if needed

### 6. Deep Squat – Shinku Zuwari (2 min)
**Setup:** Feet shoulder-width apart
**Movement:** "Inhale... exhale as you lower into deep squat, heels on ground. Hold for 3 calm breaths."
**Count:** 5 repetitions
**Benefits:** Leg strength, hip/knee/ankle flexibility

### 7. Gentle Resistance (2 min)
**Equipment:** Light weights or water bottles
**Exercises:**
- Biceps curls: "Inhale as arms lower... exhale as you lift" (×10)
- Shoulder press: "Inhale as you lower... exhale as you press overhead" (×10)
**Emphasis:** Slow, controlled movements

### 8. Single-Leg Standing – Ippon Ashi (2 min)
**Setup:** Stand near chair/wall for support
**Movement:** "Inhale... exhale as you lift right foot slightly. Hold steady, keep breathing (10s)"
**Count:** 2 holds per side
**Benefits:** Balance improvement, fall prevention

### 9. Daily Stretching – Rajio Taiso (3 min)
**Flow:** Arm swings, side bends, light squats, heel raises, arm circles
**Style:** "Keep moving in rhythm, breathing naturally. Flow from one movement to the next."
**Music:** Recommended for steady pace
**Benefits:** Flexibility and circulation

### 10. Slow Walking – Sanpo (4 min)
**Pattern:** Inhale for 2 steps, exhale for 2 steps
**Posture:** Upright, arms relaxed, steps light and even
**Location:** In place or around room
**Music:** Optional for rhythm guidance

### 11. Cognitive-Motor Drill (2.5 min)
**Activities:**
- March in place while counting aloud (1,2,3,4...)
- Clap hands on every 2nd step
- March while saying days of the week
**Benefits:** "Strengthens both body and brain"
**Music:** Optional light rhythm

## Technical Implementation Plan

### Phase 1: Clean Foundation

#### 1.1 Project Structure Reset
```
src/
  app/           # Core application logic
  data/          # Exercise data and schemas
  styles/        # CSS architecture
  assets/        # Media files
tests/
  e2e/           # Playwright tests
  fixtures/      # Test data
docs/            # Documentation
```

#### 1.2 HTML Foundation
- Semantic structure with proper landmarks
- Three main views: home-view, session-view, summary-view
- Accessible form controls and navigation
- Progressive enhancement approach

#### 1.3 CSS Architecture
- CSS custom properties for theming
- Mobile-first responsive design
- Reduced motion support
- Focus management system

#### 1.4 JavaScript Core
- ES6+ modules for clean separation
- State machine pattern for view management
- Event-driven architecture
- Error handling and resilience

### Phase 2: Core Features

#### 2.1 Exercise Data System
```json
{
  "routine_id": "jpn-longevity-001",
  "exercises": [
    {
      "id": "breathing",
      "name": "Breathing – Kokyū Taiso",
      "type": "time",
      "duration_sec": 120,
      "cues": [
        "Sit or stand tall, hands on belly",
        "Inhale through nose for 4 seconds",
        "Exhale through mouth for 6 seconds",
        "Continue for 10 calm breaths"
      ],
      "guidance": "Inhale slowly through nose... feel belly rise. Exhale through mouth... feel belly fall.",
      "pacer": {
        "type": "breathing",
        "inhale_sec": 4,
        "exhale_sec": 6
      }
    }
    // ... all 11 exercises with complete presenter notes
  ]
}
```

#### 2.2 State Management
- `AppState`: idle, preparing, exercising, complete
- `TimerState`: countdown, progress tracking
- `PreferencesState`: settings persistence
- Clean state transitions with event handling

#### 2.3 Timer & Progress System
- Accurate 1-second intervals
- Preparation phases between exercises
- Total session progress calculation
- Rep counting for rep-based exercises

#### 2.4 Media & Accessibility
- Video/image fallback system
- TTS integration with speech queuing
- Keyboard navigation throughout
- Screen reader announcements

### Phase 3: Testing Foundation

#### 3.1 Playwright Setup
```javascript
// tests/e2e/app.spec.js
test.describe('LiveLong App', () => {
  test('complete user journey', async ({ page }) => {
    // Home view → Start session → Complete all exercises → Summary
  });

  test('pause and resume functionality', async ({ page }) => {
    // Test interruption handling
  });

  test('settings persistence', async ({ page }) => {
    // Test all preference categories
  });

  test('accessibility compliance', async ({ page }) => {
    // Keyboard navigation, screen reader support
  });
});
```

#### 3.2 Test Coverage Areas
1. **User Journeys**
   - Complete session flow
   - Pause/resume scenarios
   - Skip forward/backward navigation
   - Settings changes during session

2. **Data & State**
   - Exercise data loading
   - Timer accuracy verification
   - Settings persistence
   - Error handling

3. **Accessibility**
   - Keyboard-only navigation
   - Screen reader compatibility
   - Focus management
   - WCAG 2.1 AA compliance

4. **Performance**
   - Load time verification
   - Bundle size checking
   - Offline functionality
   - Memory usage

## Implementation Priorities

### Must Have (Phase 1-2)
- [x] All 11 exercises with complete guidance
- [x] Accurate timer system
- [x] Basic settings (music, TTS, video, text size)
- [x] Three-view navigation
- [x] Keyboard accessibility
- [x] Local storage persistence

### Should Have (Phase 3)
- [x] Comprehensive Playwright tests
- [x] Breathing pacer with visual/audio
- [x] Video/image media support
- [x] Service worker for offline
- [x] Performance optimization

### Could Have (Future)
- [ ] Gamification system (XP, badges, goals)
- [ ] PWA install capabilities
- [ ] Advanced breathing presets
- [ ] Export/import functionality

## Success Criteria

### Functional Requirements
✅ All 11 exercises render with correct timing
✅ Timer system accurate within 100ms
✅ Settings persist across browser sessions
✅ Complete keyboard accessibility
✅ Graceful media fallbacks

### Technical Requirements
✅ Load time < 3s on slow 3G
✅ Bundle size < 250KB
✅ Works offline after first load
✅ WCAG 2.1 AA compliance

### Testing Requirements
✅ 100% Playwright test coverage for core flows
✅ All accessibility tests pass
✅ Performance budgets met
✅ Cross-browser compatibility verified

## Next Steps

1. **Clean the current codebase** - Remove existing implementation
2. **Set up fresh structure** - New HTML/CSS/JS foundation
3. **Implement incrementally** - Build and test each feature
4. **Add comprehensive tests** - Playwright coverage for everything
5. **Performance optimization** - Meet all budget requirements

The goal is a production-ready, accessible, tested application that faithfully implements the Japanese longevity exercise program with modern web standards.