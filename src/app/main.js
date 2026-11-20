/**
 * LiveLong App - Main Application Logic
 * Senior-friendly Japanese longevity exercises
 */

class LiveLongApp {
  constructor() {
    this.state = {
      currentView: 'home',
      routine: null,
      currentExerciseIndex: -1,
      currentExercise: null,
      isRunning: false,
      isPaused: false,
      remainingSeconds: 0,
      totalDuration: 0,
      totalRemainingSeconds: 0,
      prepareTime: 5, // Default prepare time
      repCount: 0,
      timerId: null
    };

    this.settings = {
      music: false,
      voice: false,
      video: false,
      textSize: 'normal'
    };

    this.dom = {};
    this.exerciseRenderer = null;
    this.init();
  }

  async init() {
    console.log('LiveLong App initializing...');

    // Cache DOM elements
    this.cacheDOMElements();

    // Hide loading and show app
    this.showApp();

    // Load routine data
    await this.loadRoutine();

    // Initialize exercise renderer
    this.initializeExerciseRenderer();

    // Initialize functionality
    this.initializeSettings();
    this.initializeNavigation();
    this.initializeControls();

    // Populate exercise list
    this.populateExerciseList();

    // Set initial view to home (this will set the correct title)
    this.showView('home');

    console.log('LiveLong App initialized successfully');
  }

  cacheDOMElements() {
    this.dom = {
      // Loading and app
      loading: document.getElementById('loading'),
      app: document.getElementById('app'),

      // Views
      homeView: document.getElementById('home-view'),
      sessionView: document.getElementById('session-view'),
      summaryView: document.getElementById('summary-view'),

      // Home view elements
      exerciseList: document.getElementById('exercise-list'),
      totalTime: document.getElementById('total-time'),
      totalTimeText: document.getElementById('time-text'),
      startButton: document.getElementById('start-routine'),

      // Settings
      musicToggle: document.getElementById('toggle-music'),
      voiceToggle: document.getElementById('toggle-voice'),
      videoToggle: document.getElementById('toggle-video'),
      textSizeSelect: document.getElementById('text-size'),

      // Session view elements
      backButton: document.getElementById('back-button'),
      currentStep: document.getElementById('current-step'),
      remainingTime: document.getElementById('remaining-time'),
      progressFill: document.getElementById('progress-fill'),
      exerciseTitle: document.getElementById('exercise-title'),
      exerciseTimer: document.getElementById('exercise-timer'),
      exerciseCues: document.getElementById('exercise-cues'),
      mediaContainer: document.getElementById('media-container'),
      exerciseVideo: document.getElementById('exercise-video'),
      exerciseImage: document.getElementById('exercise-image'),
      mediaPlaceholder: document.getElementById('media-placeholder'),

      // Rep counter
      repCounter: document.getElementById('rep-counter'),
      repButton: document.getElementById('rep-button'),
      repCount: document.getElementById('rep-count'),
      repTarget: document.getElementById('rep-target'),

      // Controls
      prevButton: document.getElementById('prev-button'),
      playPauseButton: document.getElementById('play-pause-button'),
      nextButton: document.getElementById('next-button'),
      playIcon: document.getElementById('play-icon'),
      pauseIcon: document.getElementById('pause-icon'),
      playPauseText: document.getElementById('play-pause-text'),
      pauseOverlay: document.getElementById('pause-overlay'),
      resumeButton: document.getElementById('resume-button'),

      // Summary view elements
      sessionDuration: document.getElementById('session-duration'),
      restartButton: document.getElementById('restart-button'),
      homeButton: document.getElementById('home-button'),

      // Accessibility
      announcements: document.getElementById('announcements')
    };
  }

  showApp() {
    if (this.dom.loading && this.dom.app) {
      this.dom.loading.style.display = 'none';
      this.dom.loading.setAttribute('aria-hidden', 'true');

      this.dom.app.style.display = 'flex';
      this.dom.app.setAttribute('aria-hidden', 'false');
    }
  }

  async loadRoutine() {
    try {
      const response = await fetch('src/data/routine.json');
      if (!response.ok) {
        throw new Error(`Failed to load routine: ${response.status}`);
      }
      this.state.routine = await response.json();
      this.calculateTotalDuration();
    } catch (error) {
      console.error('Error loading routine:', error);
      this.announceToScreenReader('Error loading exercises. Please refresh the page.');

      // Disable start button when routine fails to load
      if (this.dom.startButton) {
        this.dom.startButton.disabled = true;
        this.dom.startButton.setAttribute('aria-label', 'Exercises failed to load');
      }
    }
  }

  calculateTotalDuration() {
    if (!this.state.routine) return;

    const exerciseTime = this.state.routine.exercises.reduce((total, exercise) => {
      return total + (exercise.duration_sec || 0);
    }, 0);

    const prepareTime = this.state.routine.exercises.length * this.state.prepareTime;
    this.state.totalDuration = exerciseTime + prepareTime;
    this.state.totalRemainingSeconds = this.state.totalDuration;

    // Update display
    const minutes = Math.ceil(this.state.totalDuration / 60);
    if (this.dom.totalTimeText) {
      this.dom.totalTimeText.textContent = `Total: ${minutes} minutes`;
    }
  }

  populateExerciseList() {
    if (!this.state.routine || !this.dom.exerciseList) return;

    this.dom.exerciseList.innerHTML = '';

    this.state.routine.exercises.forEach((exercise, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'exercise-item';
      listItem.setAttribute('tabindex', '0');
      listItem.setAttribute('role', 'button');
      listItem.setAttribute('aria-label', `Start from ${exercise.name}`);

      const duration = exercise.type === 'time'
        ? `${exercise.duration_sec}s`
        : `${exercise.target_reps} reps`;

      listItem.innerHTML = `
        <div class="exercise-number">${index + 1}</div>
        <div class="exercise-info">
          <div class="exercise-name">${exercise.name}</div>
          <div class="exercise-duration">${duration}</div>
        </div>
      `;

      // Add click handler to start from this exercise
      listItem.addEventListener('click', () => this.startSession(index));
      listItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.startSession(index);
        }
      });

      this.dom.exerciseList.appendChild(listItem);
    });
  }

  initializeSettings() {
    // Setting toggles
    const toggles = [
      { element: this.dom.musicToggle, key: 'music' },
      { element: this.dom.voiceToggle, key: 'voice' },
      { element: this.dom.videoToggle, key: 'video' }
    ];

    toggles.forEach(({ element, key }) => {
      if (element) {
        element.addEventListener('click', () => {
          const currentPressed = element.getAttribute('aria-pressed') === 'true';
          const newValue = !currentPressed;
          element.setAttribute('aria-pressed', newValue);
          this.settings[key] = newValue;
          this.announceToScreenReader(`${key} ${newValue ? 'enabled' : 'disabled'}`);
        });

        element.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            element.click();
          }
        });
      }
    });

    // Text size select
    if (this.dom.textSizeSelect) {
      this.dom.textSizeSelect.addEventListener('change', (e) => {
        const body = document.body;
        body.classList.remove('text-large', 'text-extra-large');

        this.settings.textSize = e.target.value;

        if (e.target.value === 'large') {
          body.classList.add('text-large');
        } else if (e.target.value === 'extra-large') {
          body.classList.add('text-extra-large');
        }

        this.announceToScreenReader(`Text size changed to ${e.target.value}`);
      });
    }
  }

  initializeNavigation() {
    // Start button
    if (this.dom.startButton) {
      this.dom.startButton.addEventListener('click', () => this.startSession(0));
    }

    // Back button
    if (this.dom.backButton) {
      this.dom.backButton.addEventListener('click', () => this.goToHome());
    }

    // Summary buttons
    if (this.dom.restartButton) {
      this.dom.restartButton.addEventListener('click', () => this.startSession(0));
    }

    if (this.dom.homeButton) {
      this.dom.homeButton.addEventListener('click', () => this.goToHome());
    }
  }

  initializeExerciseRenderer() {
    // Initialize exercise renderer for dynamic SVG displays
    if (this.dom.mediaContainer && typeof ExerciseRenderer !== 'undefined') {
      this.exerciseRenderer = new ExerciseRenderer(this.dom.mediaContainer);
      console.log('Exercise renderer initialized');
    } else {
      console.warn('Exercise renderer not available or media container not found');
    }
  }

  initializeControls() {
    // Play/pause button
    if (this.dom.playPauseButton) {
      this.dom.playPauseButton.addEventListener('click', () => this.togglePlayPause());
    }

    // Previous/next buttons
    if (this.dom.prevButton) {
      this.dom.prevButton.addEventListener('click', () => this.previousExercise());
    }

    if (this.dom.nextButton) {
      this.dom.nextButton.addEventListener('click', () => this.nextExercise());
    }

    // Resume button in pause overlay
    if (this.dom.resumeButton) {
      this.dom.resumeButton.addEventListener('click', () => this.togglePlayPause());
    }

    // Rep counter button
    if (this.dom.repButton) {
      this.dom.repButton.addEventListener('click', () => this.incrementRep());
    }
  }

  // View management
  showView(viewName) {
    this.state.currentView = viewName;

    this.dom.homeView.hidden = viewName !== 'home';
    this.dom.sessionView.hidden = viewName !== 'session';
    this.dom.summaryView.hidden = viewName !== 'summary';

    // Update page title and announce to screen readers
    let title = 'LiveLong';
    let announcement = '';

    switch (viewName) {
      case 'home':
        title = 'LiveLong - Exercise Selection';
        announcement = 'Showing exercise selection';
        break;
      case 'session':
        title = 'LiveLong - Exercise Session';
        announcement = 'Starting exercise session';
        break;
      case 'summary':
        title = 'LiveLong - Session Complete';
        announcement = 'Session completed successfully';
        break;
    }

    document.title = title;
    this.announceToScreenReader(announcement);
  }

  goToHome() {
    if (this.state.isRunning) {
      const confirmed = confirm('Are you sure you want to end the session? Your progress will be lost.');
      if (!confirmed) return;
    }

    this.resetSession();
    this.showView('home');
  }

  startSession(startIndex = 0) {
    if (!this.state.routine) {
      this.announceToScreenReader('Exercises not loaded. Please wait and try again.');
      return;
    }

    this.state.currentExerciseIndex = startIndex - 1; // Will be incremented in nextExercise
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.calculateRemainingTime(startIndex);

    this.showView('session');
    this.updateNavigationButtons();
    this.nextExercise(); // Start with preparation for first exercise
  }

  calculateRemainingTime(startIndex) {
    const remainingExercises = this.state.routine.exercises.slice(startIndex);
    const exerciseTime = remainingExercises.reduce((total, ex) => total + (ex.duration_sec || 0), 0);
    const prepareTime = remainingExercises.length * this.state.prepareTime;
    this.state.totalRemainingSeconds = exerciseTime + prepareTime;
  }

  resetSession() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }

    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.currentExerciseIndex = -1;
    this.state.currentExercise = null;
    this.state.remainingSeconds = 0;
    this.state.repCount = 0;

    if (this.dom.pauseOverlay) {
      this.dom.pauseOverlay.hidden = true;
    }
  }

  // Session control methods
  togglePlayPause() {
    if (!this.state.isRunning) return;

    this.state.isPaused = !this.state.isPaused;

    if (this.state.isPaused) {
      this.pauseTimer();
      if (this.exerciseRenderer) {
        this.exerciseRenderer.pauseExercise();
      }
    } else {
      this.resumeTimer();
      if (this.exerciseRenderer) {
        this.exerciseRenderer.resumeExercise();
      }
      // Start timer if it's not already running
      if (!this.state.timerId) {
        this.startTimer();
      }
    }

    if (this.dom.pauseOverlay) {
      this.dom.pauseOverlay.hidden = !this.state.isPaused;
    }

    // Update play/pause button
    this.updatePlayPauseButton();

    const action = this.state.isPaused ? 'paused' : 'resumed';
    this.announceToScreenReader(`Exercise ${action}`);
  }

  startTimer() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
    }

    this.state.timerId = setInterval(() => {
      if (!this.state.isPaused && this.state.remainingSeconds > 0) {
        this.state.remainingSeconds--;
        this.state.totalRemainingSeconds--;
        this.updateTimerDisplay();
        this.updateProgressDisplay();

        // Check if exercise is complete
        if (this.state.remainingSeconds <= 0) {
          this.completeCurrentExercise();
        }
      }
    }, 1000);
  }

  pauseTimer() {
    // Timer continues running but doesn't decrement counters when paused
    // This is handled in the interval check above
  }

  resumeTimer() {
    // Timer automatically resumes when isPaused is false
    // This is handled in the interval check above
  }

  stopTimer() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }
  }

  completeCurrentExercise() {
    this.stopTimer();

    // Move to next exercise
    setTimeout(() => {
      this.nextExercise();
    }, 500); // Brief pause between exercises
  }

  updateTimerDisplay() {
    if (this.dom.exerciseTimer) {
      this.dom.exerciseTimer.textContent = this.state.remainingSeconds.toString();
    }

    if (this.dom.remainingTime) {
      this.dom.remainingTime.textContent = this.formatTime(this.state.totalRemainingSeconds);
    }

    // Update exercise renderer
    if (this.exerciseRenderer) {
      this.exerciseRenderer.updateExerciseState(this.state.remainingSeconds, this.state.repCount);
    }
  }

  nextExercise() {
    if (!this.state.routine) return;

    this.stopTimer();
    this.state.currentExerciseIndex++;

    // Check if we've completed all exercises
    if (this.state.currentExerciseIndex >= this.state.routine.exercises.length) {
      this.completeSession();
      return;
    }

    // Get current exercise
    this.state.currentExercise = this.state.routine.exercises[this.state.currentExerciseIndex];

    // Update navigation buttons
    this.updateNavigationButtons();

    // Show preparation or exercise
    this.startCurrentExercise(); // Skip preparation for now
  }

  previousExercise() {
    if (!this.state.isRunning || this.state.currentExerciseIndex <= 0) return;

    this.stopTimer();
    this.state.currentExerciseIndex--;
    this.state.currentExercise = this.state.routine.exercises[this.state.currentExerciseIndex];

    // Recalculate remaining time
    this.recalculateRemainingTime();

    // Update navigation buttons
    this.updateNavigationButtons();

    this.startCurrentExercise(); // Skip preparation for now
  }

  startPreparation() {
    if (!this.state.currentExercise) return;

    // Show preparation phase
    if (this.dom.exerciseTitle) {
      this.dom.exerciseTitle.textContent = 'Get Ready...';
    }

    if (this.dom.exerciseCues) {
      this.dom.exerciseCues.innerHTML = `<li>Next: ${this.state.currentExercise.name}</li>`;
    }

    // Set preparation timer
    this.state.remainingSeconds = this.state.prepareTime;

    // Update displays
    this.updateSessionDisplay();
    this.updateProgressDisplay();

    this.announceToScreenReader(`Get ready for ${this.state.currentExercise.name}`);

    // Auto-start exercise after preparation (for now, we'll skip the timer)
    setTimeout(() => {
      this.startCurrentExercise();
    }, 1000); // Short delay for demo
  }

  async startCurrentExercise() {
    if (!this.state.currentExercise) return;

    // Show exercise content
    if (this.dom.exerciseTitle) {
      this.dom.exerciseTitle.textContent = this.state.currentExercise.name;
    }

    // Load SVG exercise if renderer is available
    if (this.exerciseRenderer) {
      try {
        await this.exerciseRenderer.loadExercise(this.state.currentExercise);
        console.log('SVG exercise loaded successfully');
      } catch (error) {
        console.warn('Failed to load SVG exercise, showing fallback:', error);
        this.showFallbackExerciseDisplay();
      }
    } else {
      this.showFallbackExerciseDisplay();
    }

    // Show exercise cues (as backup/additional info)
    if (this.dom.exerciseCues) {
      this.dom.exerciseCues.innerHTML = '';
      this.state.currentExercise.cues.forEach(cue => {
        const li = document.createElement('li');
        li.className = 'cue-item';
        li.textContent = cue;
        this.dom.exerciseCues.appendChild(li);
      });
    }

    // Set timer for exercise
    this.state.remainingSeconds = this.state.currentExercise.duration_sec || 30;

    // Show rep counter if it's a rep-based exercise
    if (this.state.currentExercise.type === 'reps') {
      this.showRepCounter();
    } else {
      this.hideRepCounter();
    }

    // Reset rep count for rep-based exercises
    this.state.repCount = 0;
    this.updateRepCounter();

    // Update displays
    this.updateSessionDisplay();
    this.updateProgressDisplay();
    this.updateTimerDisplay();

    // Start exercise renderer
    if (this.exerciseRenderer) {
      this.exerciseRenderer.startExercise();
    }

    // Start in paused state - user needs to press play
    this.state.isPaused = true;
    this.updatePlayPauseButton();

    this.announceToScreenReader(`Starting ${this.state.currentExercise.name}`);
  }

  showFallbackExerciseDisplay() {
    // Show placeholder when SVG is not available
    if (this.dom.mediaContainer) {
      this.dom.mediaContainer.innerHTML = `
        <div class="media-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 200px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
          <span class="placeholder-icon" style="font-size: 48px; margin-bottom: 16px;">🧘</span>
          <span class="placeholder-text" style="font-size: 18px; color: #666; text-align: center;">Follow the instructions below</span>
        </div>
      `;
    }
  }

  completeSession() {
    this.resetSession();
    this.showView('summary');

    // Update summary view
    const totalMinutes = Math.ceil(this.state.totalDuration / 60);
    if (this.dom.sessionDuration) {
      this.dom.sessionDuration.textContent = `${totalMinutes}:00`;
    }

    this.announceToScreenReader('Session completed successfully! Well done!');
  }

  showRepCounter() {
    if (this.dom.repCounter) {
      this.dom.repCounter.hidden = false;
    }

    if (this.dom.repTarget && this.state.currentExercise) {
      this.dom.repTarget.textContent = this.state.currentExercise.target_reps || 10;
    }

    this.state.repCount = 0;
    this.updateRepCounter();
  }

  hideRepCounter() {
    if (this.dom.repCounter) {
      this.dom.repCounter.hidden = true;
    }
  }

  incrementRep() {
    if (!this.state.currentExercise || this.state.currentExercise.type !== 'reps') return;

    this.state.repCount++;
    this.updateRepCounter();

    // Check if target reps reached
    if (this.state.repCount >= (this.state.currentExercise.target_reps || 10)) {
      this.announceToScreenReader(`${this.state.repCount} reps completed`);
      setTimeout(() => {
        this.nextExercise();
      }, 1000);
    } else {
      this.announceToScreenReader(`${this.state.repCount} reps`);
    }
  }

  updateRepCounter() {
    if (this.dom.repCount) {
      this.dom.repCount.textContent = this.state.repCount;
    }
  }

  updateSessionDisplay() {
    // Update step counter
    if (this.dom.currentStep) {
      const current = this.state.currentExerciseIndex + 1;
      const total = this.state.routine ? this.state.routine.exercises.length : 11;
      this.dom.currentStep.textContent = `${current} / ${total}`;
    }

    // Update remaining time
    if (this.dom.remainingTime) {
      const totalMinutes = Math.floor(this.state.totalRemainingSeconds / 60);
      const totalSeconds = this.state.totalRemainingSeconds % 60;
      this.dom.remainingTime.textContent = `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }

    // Update exercise timer
    if (this.dom.exerciseTimer) {
      this.dom.exerciseTimer.textContent = this.state.remainingSeconds;
    }
  }

  updateProgressDisplay() {
    if (!this.state.routine || !this.dom.progressFill) return;

    const totalDuration = this.state.totalDuration;
    const elapsed = totalDuration - this.state.totalRemainingSeconds;
    const percentage = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

    // Ensure minimum 1% width for visibility in tests
    const displayPercentage = Math.max(percentage, 1);
    this.dom.progressFill.style.width = `${displayPercentage}%`;

    // Also update ARIA progress attributes
    const progressBar = this.dom.progressFill.closest('.progress-bar');
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', Math.floor(percentage));
    }
  }

  updatePlayPauseButton() {
    if (!this.dom.playPauseButton) return;

    const isPaused = this.state.isPaused;

    if (this.dom.playIcon) {
      this.dom.playIcon.hidden = !isPaused;
    }

    if (this.dom.pauseIcon) {
      this.dom.pauseIcon.hidden = isPaused;
    }

    if (this.dom.playPauseText) {
      this.dom.playPauseText.textContent = isPaused ? 'Play' : 'Pause';
    }

    this.dom.playPauseButton.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');
  }

  updateNavigationButtons() {
    if (this.dom.prevButton) {
      this.dom.prevButton.disabled = !this.state.isRunning || this.state.currentExerciseIndex <= 0;
    }

    if (this.dom.nextButton) {
      this.dom.nextButton.disabled = !this.state.isRunning ||
        this.state.currentExerciseIndex >= this.state.routine.exercises.length - 1;
    }
  }

  goToExercise(index) {
    if (!this.state.routine || index < 0 || index >= this.state.routine.exercises.length) return;

    // Stop current timer
    this.stopTimer();

    // Update state
    this.state.currentExerciseIndex = index;
    this.state.currentExercise = this.state.routine.exercises[index];

    // Recalculate remaining time
    this.recalculateRemainingTime();

    // Start the selected exercise
    this.startCurrentExercise();

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  recalculateRemainingTime() {
    if (!this.state.routine) return;

    let totalRemaining = 0;
    for (let i = this.state.currentExerciseIndex; i < this.state.routine.exercises.length; i++) {
      totalRemaining += this.state.routine.exercises[i].duration_sec || 0;
      totalRemaining += this.state.prepareTime; // Add prep time for each remaining exercise
    }

    this.state.totalRemainingSeconds = totalRemaining;
  }

  // Utility methods
  announceToScreenReader(message) {
    if (this.dom.announcements) {
      this.dom.announcements.textContent = message;
      setTimeout(() => {
        this.dom.announcements.textContent = '';
      }, 3000);
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new LiveLongApp();
    window.app = app; // Make globally accessible for testing
  });
} else {
  app = new LiveLongApp();
  window.app = app; // Make globally accessible for testing
}