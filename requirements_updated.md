# LiveLong App - Updated Requirements v2.0

## Overview
Senior-friendly Japanese longevity exercise app with dynamic SVG visualizations, prominent visual timer indication, and optional audio cues.

## Target Audience
- Older adults (60+ years)
- Focus on accessibility and simplicity
- Large text, high contrast, clear visual indicators
- Touch-friendly interface

## Core Features

### 1. Exercise System
- **11 Japanese longevity exercises** from PowerPoint source
- **Dynamic SVG visualizations** that animate with timer progress
- **Breathing pacer with visual circle** expanding/contracting (4s in, 6s out)
- **Rep-based exercises** with animated counters and movement indicators
- **Time-based exercises** with progress animations

### 2. Enhanced Timer System ✅ (Completed)
- **Prominent visual timer display** with large, clear numbers
- **Circular progress indicator** around timer showing exercise progress
- **Session progress bar** showing overall routine completion
- **Play/pause controls** with clear visual state
- **Auto-advance** between exercises (optional)

### 3. SVG Exercise Visualizations (New)

#### Breathing Exercise (Kokyū Taiso)
- **Animated breathing circle** that expands (inhale 4s) and contracts (exhale 6s)
- **Color gradient** from blue (inhale) to green (exhale)
- **Text overlay** showing "Breathe In" / "Breathe Out"
- **Cycle counter** showing completed breaths

#### Movement Exercises
- **Towel Twist**: Animated figure showing left/right twist motion
- **Hand & Finger**: Animated hands opening/closing, finger movements
- **Eye & Neck**: Animated head showing eye movements and neck turns
- **Floor Sitting**: Animated sequence of stand → sit → stand
- **Deep Squat**: Animated figure showing squat position with breathing
- **Single-Leg Standing**: Animated balance pose with stability indicator
- **Daily Stretching**: Flow animation of arm swings, bends, squats
- **Slow Walking**: Animated walking figure with breathing rhythm
- **Cognitive-Motor**: Animated figure marching with counting display

#### Rep-Based Exercises
- **Visual rep counter** with animated progress
- **Movement demonstration** that repeats with each rep
- **Target visualization** showing progress toward goal

### 4. Visual Timer Enhancements (New)
- **Large central timer** (120px minimum) with high contrast
- **Circular progress ring** around timer showing exercise completion
- **Color coding**: Green (ready), Blue (active), Orange (final 10s), Red (complete)
- **Pulsing animation** for final countdown (last 10 seconds)
- **Session progress bar** with segment indicators for each exercise

### 5. Audio System (New - Optional)
- **Timer sounds**: Gentle chime at start/end of exercises
- **Breathing cues**: Soft tone for inhale/exhale rhythm
- **Rep counting**: Gentle click for each completed repetition
- **Transition sounds**: Musical note for exercise changes
- **Voice guidance**: Optional text-to-speech for exercise names and cues
- **Volume controls** and mute option

### 6. Exercise Data Structure (Enhanced)
```json
{
  "exercises": [
    {
      "id": "breathing",
      "name": "Breathing — Kokyū Taiso",
      "type": "time",
      "duration_sec": 120,
      "pacer": {
        "type": "breath",
        "inhale_sec": 4,
        "exhale_sec": 6,
        "style": "circle"
      },
      "visualization": {
        "type": "breathing_circle",
        "colors": ["#4A90E2", "#7ED321"],
        "animations": ["expand", "contract"]
      },
      "audio": {
        "breathing_tone": true,
        "voice_cues": ["Breathe in", "Breathe out"]
      }
    }
  ]
}
```

### 7. Accessibility Features ✅ (Completed)
- **WCAG 2.1 AA compliance**
- **Screen reader support** with ARIA labels
- **Keyboard navigation** for all controls
- **High contrast mode** support
- **Large text options** (Normal, Large, Extra Large)
- **Focus indicators** clearly visible

### 8. Settings & Preferences ✅ (Basic implemented)
- **Background music** toggle
- **Voice guidance** toggle
- **Video demonstrations** toggle (future)
- **Text size** selection
- **Audio volume** controls (new)
- **Timer sounds** on/off (new)
- **Auto-advance** exercises on/off (new)

## Technical Architecture

### Enhanced Components
1. **SVGExercise Class**: Renders dynamic exercise visualizations
2. **TimerRenderer Class**: Handles visual timer with progress indicators
3. **AudioManager Class**: Manages optional sound effects and voice
4. **AnimationEngine Class**: Coordinates SVG animations with timer state

### File Structure (Updated)
```
src/
├── assets/
│   ├── audio/           # Timer sounds, breathing tones
│   ├── exercises/       # SVG exercise templates
│   └── icons/          # UI icons
├── components/
│   ├── timer/          # Enhanced timer with visual indicators
│   ├── exercises/      # SVG exercise renderers
│   └── audio/          # Audio management
└── data/
    └── routine.json    # Enhanced exercise data with visualizations
```

## Design Specifications

### Visual Timer Design
- **Circular progress ring**: 4px stroke, 140px diameter
- **Central timer**: 48px font, monospace, high contrast
- **Color progression**: Blue → Green → Orange → Red
- **Pulse animation**: Scale 1.0 to 1.1 over 0.5s for final countdown

### SVG Exercise Standards
- **Viewport**: 400x300px minimum for senior-friendly sizing
- **Line weights**: 3px minimum for visibility
- **Colors**: High contrast with theme support
- **Animation timing**: Synced to exercise duration and reps
- **Text overlays**: 24px minimum, clear sans-serif font

### Audio Specifications
- **File format**: WebM/OGG for broad browser support
- **Timer sounds**: 200ms gentle chimes
- **Breathing tones**: 4s/6s duration matching breath cycle
- **Volume range**: 0-100% with 10% increments
- **Voice synthesis**: Web Speech API for cues

## User Experience Flow

### Enhanced Exercise Session
1. **Exercise Selection** → Dynamic preview with SVG
2. **Session Start** → Animated transition to first exercise
3. **Exercise Display** → Full-screen SVG with timer overlay
4. **Progress Indication** → Visual and audio feedback
5. **Exercise Transition** → Smooth animation between exercises
6. **Session Complete** → Celebration animation and summary

### Visual Feedback Hierarchy
1. **Primary**: Large central timer with progress ring
2. **Secondary**: Exercise SVG animation
3. **Tertiary**: Session progress bar
4. **Supportive**: Text cues and instruction overlays

## Implementation Priority

### Phase 1: SVG Foundation ✅ (Current)
- Design SVG templates for all 11 exercises
- Create animation framework synced to timer
- Implement breathing circle with color progression

### Phase 2: Enhanced Timer Display
- Circular progress ring around timer
- Color-coded countdown with pulsing final seconds
- Session progress with exercise segments

### Phase 3: Audio System
- Optional timer sounds and breathing tones
- Volume controls and accessibility compliance
- Voice guidance for exercise transitions

### Phase 4: Integration & Testing
- End-to-end testing with Playwright
- Performance optimization for seniors' devices
- Accessibility validation with screen readers

## Success Metrics
- **Timer visibility**: Readable from 2+ feet away
- **Exercise comprehension**: Clear movement demonstration without instruction
- **Audio accessibility**: Optional but enhances experience
- **Performance**: Smooth animations on older devices (60fps target)
- **Accessibility**: Full keyboard navigation and screen reader support