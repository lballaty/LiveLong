/**
 * Exercise Renderer - Handles dynamic SVG exercise visualizations
 * Integrates with timer state for synchronized animations
 */

class ExerciseRenderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentSVG = null;
    this.animationTimer = null;
    this.exerciseState = {
      type: null,
      remainingSeconds: 0,
      totalSeconds: 0,
      repCount: 0,
      targetReps: 0,
      isRunning: false,
      isPaused: false
    };
  }

  /**
   * Load and display an exercise SVG
   */
  async loadExercise(exerciseData) {
    try {
      const svgPath = this.getSVGPath(exerciseData.id);
      const response = await fetch(svgPath);

      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status}`);
      }

      const svgContent = await response.text();
      this.container.innerHTML = svgContent;
      this.currentSVG = this.container.querySelector('svg');

      // Initialize exercise state
      this.exerciseState = {
        type: exerciseData.type,
        remainingSeconds: exerciseData.duration_sec || 0,
        totalSeconds: exerciseData.duration_sec || 0,
        repCount: 0,
        targetReps: exerciseData.target_reps || 0,
        isRunning: false,
        isPaused: false,
        exerciseData: exerciseData
      };

      // Set up exercise-specific elements
      this.initializeExerciseElements(exerciseData);

      return true;
    } catch (error) {
      console.error('Error loading exercise SVG:', error);
      this.showFallbackDisplay(exerciseData);
      return false;
    }
  }

  /**
   * Get SVG file path based on exercise ID
   */
  getSVGPath(exerciseId) {
    const svgMap = {
      'breathing': 'src/assets/exercises/breathing-circle.svg',
      'towel_twist': 'src/assets/exercises/towel-twist.svg',
      'deep_squat': 'src/assets/exercises/deep-squat.svg',
      'hand_finger': 'src/assets/exercises/breathing-circle.svg', // Fallback
      'eye_neck': 'src/assets/exercises/breathing-circle.svg',    // Fallback
      'floor_sitting': 'src/assets/exercises/breathing-circle.svg', // Fallback
      'gentle_resistance': 'src/assets/exercises/breathing-circle.svg', // Fallback
      'single_leg': 'src/assets/exercises/breathing-circle.svg',  // Fallback
      'daily_stretching': 'src/assets/exercises/breathing-circle.svg', // Fallback
      'slow_walking': 'src/assets/exercises/breathing-circle.svg', // Fallback
      'cognitive_motor': 'src/assets/exercises/breathing-circle.svg'  // Fallback
    };

    return svgMap[exerciseId] || 'src/assets/exercises/breathing-circle.svg';
  }

  /**
   * Initialize exercise-specific elements and animations
   */
  initializeExerciseElements(exerciseData) {
    if (!this.currentSVG) return;

    // Update exercise title
    const titleElement = this.currentSVG.querySelector('#exerciseTitle');
    if (titleElement) {
      titleElement.textContent = exerciseData.name;
    }

    // Initialize timer display
    this.updateTimerDisplay(this.exerciseState.remainingSeconds);

    // Initialize rep counter for rep-based exercises
    if (exerciseData.type === 'reps') {
      this.updateRepDisplay(0, exerciseData.target_reps);
    }

    // Set up breathing-specific elements
    if (exerciseData.id === 'breathing') {
      this.initializeBreathingExercise(exerciseData);
    }

    // Set up movement-specific elements
    if (exerciseData.id === 'towel_twist') {
      this.initializeTowelTwist(exerciseData);
    }

    if (exerciseData.id === 'deep_squat') {
      this.initializeDeepSquat(exerciseData);
    }
  }

  /**
   * Initialize breathing exercise with breathing pacer
   */
  initializeBreathingExercise(exerciseData) {
    const pacer = exerciseData.pacer;
    if (!pacer) return;

    this.breathingState = {
      phase: 'prepare', // prepare, inhale, pause, exhale
      inhaleTime: pacer.inhale_sec || 4,
      exhaleTime: pacer.exhale_sec || 6,
      breathCount: 0,
      cycleProgress: 0
    };

    // Set initial state
    const instruction = this.currentSVG.querySelector('#breathingInstruction');
    if (instruction) {
      instruction.textContent = 'Get Ready';
    }
  }

  /**
   * Initialize towel twist exercise
   */
  initializeTowelTwist(exerciseData) {
    this.twistState = {
      direction: 'center', // center, left, right
      repCount: 0,
      targetReps: 15 // 10-15 each side as per cues
    };
  }

  /**
   * Initialize deep squat exercise
   */
  initializeDeepSquat(exerciseData) {
    this.squatState = {
      phase: 'prepare', // prepare, squat, hold, rise
      holdProgress: 0,
      breathsInHold: 0,
      targetBreaths: 3
    };
  }

  /**
   * Start exercise animation
   */
  startExercise() {
    this.exerciseState.isRunning = true;
    this.exerciseState.isPaused = false;

    // Start animation loop
    this.startAnimationLoop();
  }

  /**
   * Pause exercise animation
   */
  pauseExercise() {
    this.exerciseState.isPaused = true;
  }

  /**
   * Resume exercise animation
   */
  resumeExercise() {
    this.exerciseState.isPaused = false;
  }

  /**
   * Stop exercise animation
   */
  stopExercise() {
    this.exerciseState.isRunning = false;
    this.exerciseState.isPaused = false;

    if (this.animationTimer) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  /**
   * Update exercise state (called by main app timer)
   */
  updateExerciseState(remainingSeconds, repCount = null) {
    this.exerciseState.remainingSeconds = remainingSeconds;

    if (repCount !== null) {
      this.exerciseState.repCount = repCount;
    }

    // Update visual elements
    this.updateTimerDisplay(remainingSeconds);
    this.updateProgressIndicators();

    if (this.exerciseState.type === 'reps') {
      this.updateRepDisplay(this.exerciseState.repCount, this.exerciseState.targetReps);
    }
  }

  /**
   * Update timer display in SVG
   */
  updateTimerDisplay(seconds) {
    const timerElement = this.currentSVG?.querySelector('#timer, #remainingTime');
    if (timerElement) {
      timerElement.textContent = seconds.toString();
    }

    // Update progress ring for breathing exercise
    if (this.exerciseState.exerciseData?.id === 'breathing') {
      this.updateBreathingProgress();
    }
  }

  /**
   * Update rep display for rep-based exercises
   */
  updateRepDisplay(current, target) {
    const currentRepElement = this.currentSVG?.querySelector('#currentRep, #repCount');
    const targetRepElement = this.currentSVG?.querySelector('#targetReps');

    if (currentRepElement) {
      currentRepElement.textContent = current.toString();
    }

    if (targetRepElement) {
      targetRepElement.textContent = target.toString();
    }
  }

  /**
   * Update progress indicators
   */
  updateProgressIndicators() {
    const totalSeconds = this.exerciseState.totalSeconds;
    const remainingSeconds = this.exerciseState.remainingSeconds;
    const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

    // Update progress ring if present
    const progressIndicator = this.currentSVG?.querySelector('#progressIndicator');
    if (progressIndicator) {
      const circumference = 2 * Math.PI * 80; // radius = 80
      const offset = circumference * (1 - progress);
      progressIndicator.style.strokeDasharray = `${circumference * progress} ${circumference}`;
    }

    // Update exercise-specific progress
    if (this.exerciseState.exerciseData?.id === 'deep_squat') {
      this.updateSquatProgress(progress);
    }
  }

  /**
   * Update breathing exercise animation
   */
  updateBreathingProgress() {
    if (!this.breathingState || this.exerciseState.isPaused) return;

    const totalCycleTime = this.breathingState.inhaleTime + this.breathingState.exhaleTime;
    const elapsed = (this.exerciseState.totalSeconds - this.exerciseState.remainingSeconds) % totalCycleTime;

    let phase, progress, instruction, circleRadius;

    if (elapsed < this.breathingState.inhaleTime) {
      // Inhale phase
      phase = 'inhale';
      progress = elapsed / this.breathingState.inhaleTime;
      instruction = 'Breathe In';
      circleRadius = 40 + (progress * 20); // Expand from 40 to 60
    } else {
      // Exhale phase
      phase = 'exhale';
      progress = (elapsed - this.breathingState.inhaleTime) / this.breathingState.exhaleTime;
      instruction = 'Breathe Out';
      circleRadius = 60 - (progress * 20); // Contract from 60 to 40
    }

    // Update circle size
    const mainCircle = this.currentSVG?.querySelector('#mainCircle');
    if (mainCircle) {
      mainCircle.setAttribute('r', circleRadius);

      // Update colors based on phase
      if (phase === 'inhale') {
        mainCircle.setAttribute('fill', 'url(#breathingGradient)');
      } else {
        mainCircle.setAttribute('fill', 'url(#exhaleGradient)');
      }
    }

    // Update instruction text
    const instructionElement = this.currentSVG?.querySelector('#breathingInstruction');
    if (instructionElement) {
      instructionElement.textContent = instruction;
    }

    // Update breath count
    const newBreathCount = Math.floor((this.exerciseState.totalSeconds - this.exerciseState.remainingSeconds) / totalCycleTime);
    if (newBreathCount !== this.breathingState.breathCount) {
      this.breathingState.breathCount = newBreathCount;
      const breathCountElement = this.currentSVG?.querySelector('#breathCount');
      if (breathCountElement) {
        breathCountElement.textContent = newBreathCount.toString();
      }
    }
  }

  /**
   * Update squat exercise progress
   */
  updateSquatProgress(overallProgress) {
    // Update hold progress bar if in squat phase
    const progressFill = this.currentSVG?.querySelector('#progressFill');
    if (progressFill) {
      const fillWidth = 200 * overallProgress;
      progressFill.setAttribute('width', fillWidth);
    }
  }

  /**
   * Start animation loop for dynamic exercises
   */
  startAnimationLoop() {
    if (this.animationTimer) return;

    this.animationTimer = setInterval(() => {
      if (!this.exerciseState.isPaused && this.exerciseState.isRunning) {
        this.updateProgressIndicators();
      }
    }, 100); // Update every 100ms for smooth animation
  }

  /**
   * Show fallback display when SVG fails to load
   */
  showFallbackDisplay(exerciseData) {
    this.container.innerHTML = `
      <div class="exercise-fallback">
        <div class="fallback-icon">🧘</div>
        <h2 class="fallback-title">${exerciseData.name}</h2>
        <div class="fallback-timer" id="fallback-timer">${exerciseData.duration_sec || 0}</div>
        <div class="fallback-cues">
          ${exerciseData.cues.map(cue => `<p class="fallback-cue">${cue}</p>`).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopExercise();
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.currentSVG = null;
  }
}

// Export for use in main app
window.ExerciseRenderer = ExerciseRenderer;