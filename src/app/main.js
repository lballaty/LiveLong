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

    // Initialize functionality
    this.initializeSettings();
    this.initializeNavigation();
    this.initializeControls();

    // Populate exercise list
    this.populateExerciseList();

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
    if (this.dom.totalTime) {
      this.dom.totalTime.textContent = `Total: ${minutes} minutes`;
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

  // Session control methods (to be implemented)
  togglePlayPause() {
    // TODO: Implement play/pause functionality
    console.log('Toggle play/pause');
  }

  nextExercise() {
    // TODO: Implement next exercise logic
    console.log('Next exercise');
  }

  previousExercise() {
    // TODO: Implement previous exercise logic
    console.log('Previous exercise');
  }

  incrementRep() {
    // TODO: Implement rep counting
    console.log('Increment rep');
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LiveLongApp());
} else {
  new LiveLongApp();
}