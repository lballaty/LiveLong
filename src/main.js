/**
 * LiveLong - v2 Main Application Logic
 * This file defines the LiveLongApp class which encapsulates all application state and logic for the redesigned UI.
 */

class LiveLongApp {
  constructor() {
    this.dom = this._getDomElements();

    this.PREF_KEYS = {
      MUSIC: 'LL_music',
      TTS: 'LL_tts',
      VIDEO: 'LL_video',
      TEXT_SIZE: 'LL_textSize',
      PREPARE_TIME: 'LL_prepareTime',
      PACER_PRESET: 'LL_pacerPresetId',
      PACER_TICK: 'LL_pacerTick',
      GOALS: 'LL_goals_v1',
      HISTORY: 'LL_history_v1',
      PROFILE: 'LL_profile_v1',
    };

    this.prefs = {
      music: false,
      tts: false,
      video: false,
      textSize: '100',
      prepareTime: 5,
      pacerTick: false,
    };

    this.audio = {
      music: null,
      musicPath: 'src/assets/audio/calm-loop.mp3',
      audioContext: null,
      initPromise: null,
    };

    this.tts = {
      isSupported: 'speechSynthesis' in window,
      queue: [],
      isSpeaking: false,
    };

    this.pacer = {
      isActive: false,
      presets: [],
      currentPattern: null,
      totalCycleTime: 0,
      phaseStartTime: 0,
      tickContext: null,
      tickOscillator: null,
    };

    this.goals = {
      suggested: [],
      user: {},
    };

    this.achievements = {
      xp: {},
      levels: [],
      badges: [],
    };

    this.userProfile = {
      xp: 0,
      level: 1,
      unlockedBadges: {},
    };

    this.history = {};

    this.state = {
      routine: null,
      currentIndex: -1,
      currentExercise: null,
      appStatus: 'idle', // idle, preparing, exercising, complete
      remainingSec: 0,
      totalDuration: 0,
      totalRemainingSec: 0,
      timerId: null,
      isRunning: false,
      isPaused: false,
      repCount: 0,
    };

    this.ROUTINE_PATH = 'src/data/routine.json';
    this.GOALS_PATH = 'src/data/goals.json';
    this.ACHIEVEMENTS_PATH = 'src/data/achievements.json';
    this.PACER_PRESETS_PATH = 'src/data/pacer-presets.json';

    this._init();
  }

  // --- Initialization ---

  async _init() {
    this.dom.year.textContent = new Date().getFullYear();
    this._loadPreferences();

    if (!this.tts.isSupported) {
      this.dom.toggleTts.disabled = true;
      this.dom.toggleTts.title = 'Voice guidance is not supported by your browser.';
    }

    this._bindEventListeners();

    try {
      const response = await fetch(this.ROUTINE_PATH);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.state.routine = await response.json();
      this._populatePreviewList();
      this._updateTotalTime(0);

      try {
        await this._initGoals();
        await this._initAchievements();
        await this._initPacer();
      } catch (error) {
        console.error('Failed to initialize goals, achievements, or pacer:', error);
        this.dom.goalsSection.hidden = true;
        this.dom.profileSection.hidden = true;
      }
    } catch (error) {
      console.error('Failed to load routine:', error);
      // In a real app, you might show an error message in the UI here.
    }
  }

  _getDomElements() {
    return {
      // Views
      homeView: document.getElementById('home-view'),
      sessionView: document.getElementById('session-view'),
      summaryView: document.getElementById('summary-view'),

      // Home View
      startBtn: document.getElementById('start-btn'),
      previewList: document.getElementById('preview-list'),

      // Settings
      toggleMusic: document.getElementById('toggle-music'),
      toggleTts: document.getElementById('toggle-tts'),
      toggleVideo: document.getElementById('toggle-video'),
      textSize: document.getElementById('text-size'),
      prepareTime: document.getElementById('prepare-time'),

      // Session View
      pausedOverlay: document.getElementById('paused-overlay'),
      backBtn: document.getElementById('back-btn'),
      restartBtn: document.getElementById('restart-btn'),
      exTitle: document.getElementById('ex-title'),
      media: document.getElementById('media'),
      mediaVideo: document.getElementById('media-video'),
      mediaImageWrap: document.getElementById('media-image-wrap'),
      mediaImage: document.getElementById('media-image'),
      exCues: document.getElementById('ex-cues'),

      // Control Dock
      prevBtn: document.getElementById('prev-btn'),
      playPauseBtn: document.getElementById('play-pause-btn'),
      playIcon: document.querySelector('.icon-play'),
      pauseIcon: document.querySelector('.icon-pause'),
      nextBtn: document.getElementById('next-btn'),
      timerDisplay: document.getElementById('timer'),
      progressRing: document.getElementById('progress-ring'),
      progressPercent: document.getElementById('progress-percent'),
      stepCount: document.getElementById('step'),
      repIncBtn: document.getElementById('rep-inc'),
      repCountDisplay: document.getElementById('rep-count-display'),

      // Summary View
      summaryTime: document.getElementById('summary-time'),
      summaryExercises: document.getElementById('summary-exercises'),
      summaryRestart: document.getElementById('summary-restart'),

      // Pacer
      breathingCard: document.getElementById('breathing-card'),
      breathCircle: document.getElementById('breath-circle'),
      breathPhase: document.getElementById('breath-phase'),
      pacerPresetSelect: document.getElementById('pacer-preset'),
      pacerTickToggle: document.getElementById('pacer-tick'),

      // Gamification
      profileSection: document.getElementById('profile-section'),
      profileLevel: document.getElementById('profile-level'),
      profileXp: document.getElementById('profile-xp'),
      profileNextLevelXp: document.getElementById('profile-next-level-xp'),
      xpBarFill: document.getElementById('xp-bar-fill'),
      celebrationOverlay: document.getElementById('celebration-overlay'),
      celebrationTitle: document.getElementById('celebration-title'),
      celebrationDescription: document.getElementById('celebration-description'),
      celebrationClose: document.getElementById('celebration-close'),

      // Goals
      goalsSection: document.getElementById('goals-section'),
      goalsList: document.getElementById('goals-list'),

      // Global
      year: document.getElementById('year'),
      body: document.body,
    };
  }

  _bindEventListeners() {
    // View switching
    this.dom.startBtn.addEventListener('click', () => this._startSession(0));
    this.dom.backBtn.addEventListener('click', () => this._handleBack());
    this.dom.previewList.addEventListener('click', (e) => this._handlePreviewClick(e));
    this.dom.previewList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') this._handlePreviewClick(e);
    });

    // Session controls
    this.dom.playPauseBtn.addEventListener('click', () => this._handlePauseResume());
    this.dom.nextBtn.addEventListener('click', () => this._handleSkip());
    this.dom.prevBtn.addEventListener('click', () => this._handlePrev());
    this.dom.restartBtn.addEventListener('click', () => this._handleRestart());
    this.dom.summaryRestart.addEventListener('click', () => this._handleRestart());
    this.dom.repIncBtn.addEventListener('click', () => this._handleRepIncrement());

    // Settings
    this.dom.toggleMusic.addEventListener('click', () => this._handlePillToggle(this.dom.toggleMusic, this.PREF_KEYS.MUSIC, 'music'));
    this.dom.toggleTts.addEventListener('click', () => this._handlePillToggle(this.dom.toggleTts, this.PREF_KEYS.TTS, 'tts'));
    this.dom.toggleVideo.addEventListener('click', () => this._handlePillToggle(this.dom.toggleVideo, this.PREF_KEYS.VIDEO, 'video'));
    this.dom.textSize.addEventListener('click', (e) => this._handleSegmentedControl(e, this.dom.textSize, this.PREF_KEYS.TEXT_SIZE, 'textSize', this._applyTextSize.bind(this)));
    this.dom.prepareTime.addEventListener('click', (e) => this._handleSegmentedControl(e, this.dom.prepareTime, this.PREF_KEYS.PREPARE_TIME, 'prepareTime', this._updateTotalTime.bind(this)));
    this.dom.pacerPresetSelect.addEventListener('change', (e) => this._handlePacerPresetChange(e.target.value));
    this.dom.pacerTickToggle.addEventListener('change', (e) => { this.prefs.pacerTick = e.target.checked; });
    this.dom.celebrationClose.addEventListener('click', () => this._hideCelebration());

    // Media fallbacks
    this.dom.mediaVideo.onerror = () => {
      console.warn(`Video failed to load: ${this.dom.mediaVideo.currentSrc}`);
      this.dom.mediaVideo.hidden = true;
      const hasImages = this.state.currentExercise?.media?.images?.length > 0;
      if (hasImages) {
        this.dom.mediaImageWrap.hidden = false;
        this._renderCurrentImage();
      }
    };
    this.dom.mediaImage.onerror = () => {
      console.warn(`Image failed to load: ${this.dom.mediaImage.src}`);
      this.dom.mediaImageWrap.hidden = true;
    };

    this.dom.previewList.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.dataset.index);
      e.target.classList.add('dragging');
    });

    this.dom.previewList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggingEl = this.dom.previewList.querySelector('.dragging');
      const overEl = e.target.closest('li');
      if (overEl && draggingEl !== overEl) {
        const draggingRect = draggingEl.getBoundingClientRect();
        const overRect = overEl.getBoundingClientRect();
        if (e.clientY > overRect.top + overRect.height / 2) {
          overEl.parentNode.insertBefore(draggingEl, overEl.nextSibling);
        } else {
          overEl.parentNode.insertBefore(draggingEl, overEl);
        }
      }
    });

    this.dom.previewList.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggingEl = this.dom.previewList.querySelector('.dragging');
      if (draggingEl) {
        draggingEl.classList.remove('dragging');
        this._handleDrop();
      }
    });

    this.dom.previewList.addEventListener('dragend', (e) => {
      const draggingEl = this.dom.previewList.querySelector('.dragging');
      if (draggingEl) {
        draggingEl.classList.remove('dragging');
      }
    });
  }

  // --- View Management ---

  _showView(view) {
    this.dom.homeView.hidden = (view !== 'home');
    this.dom.sessionView.hidden = (view !== 'session');
    this.dom.summaryView.hidden = (view !== 'summary');
    this.dom.body.className = `mode-${view}`;
  }

  _populatePreviewList() {
    if (!this.state.routine) return;
    const list = this.dom.previewList;
    list.innerHTML = '';
    this.state.routine.exercises.forEach((ex, index) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'button');
      li.setAttribute('tabindex', '0');
      li.dataset.index = String(index);
      li.dataset.id = ex.id;
      li.setAttribute('draggable', 'true');

      const poster = ex.media?.video?.poster || ex.media?.images?.[0] || 'src/assets/images/placeholder.svg';
      li.innerHTML = `
        <img src="${poster}" alt="${ex.name}" draggable="false" />
        <div class="ex-info">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-duration">${ex.type === 'time' ? `${ex.duration_sec}s` : `${ex.target_reps} reps`}</div>
        </div>
      `;
      list.appendChild(li);
    });
  }

  // --- Core Logic / State Machine ---

  _tick() {
    if (this.state.isPaused) return;

    this.state.remainingSec--;
    this.state.totalRemainingSec--;
    this._updateTimerDisplay();
    this._updateProgress();
    if (this.pacer.isActive) this._updatePacer();

    if (this.state.remainingSec <= 0) {
      if (this.state.appStatus === 'exercising') {
        this._prepareForExercise(this.state.currentIndex + 1);
      } else if (this.state.appStatus === 'preparing') {
        this._startExercise(this.state.currentIndex);
      }
    }
  }

  _prepareForExercise(index) {
    if (this.state.timerId) clearInterval(this.state.timerId);

    if (index >= this.state.routine.exercises.length) {
      this._completeSession();
      return;
    }

    // Award XP for completing the previous exercise
    if (this.state.appStatus === 'exercising') {
      this._awardXp(this.achievements.xp.per_exercise);
    }

    this.state.appStatus = 'preparing';
    this.state.currentIndex = index;
    const nextExercise = this.state.routine.exercises[index];

    this.dom.exTitle.textContent = 'Get Ready...';
    this.dom.exCues.innerHTML = `<li>Next: ${nextExercise.name}</li>`;
    this.dom.media.hidden = true;
    this.dom.repIncBtn.hidden = true;
    this._stopPacer();

    this.state.remainingSec = this.prefs.prepareTime;
    this._updateTimerDisplay();
    this._updateProgress();
    this._speak({ text: `Get ready for ${nextExercise.name}`, element: this.dom.exCues.querySelector('li') });

    this.state.timerId = setInterval(this._tick.bind(this), 1000);
  }

  _startExercise(index) {
    this.state.appStatus = 'exercising';
    const exercise = this.state.routine.exercises[index];
    this.state.remainingSec = exercise.duration_sec || 0;
    this.state.repCount = 0;
    this._renderExercise(exercise);

    const cuesToSpeak = [{ text: exercise.name, element: this.dom.exTitle }];
    this.dom.exCues.querySelectorAll('li').forEach(li => {
      cuesToSpeak.push({ text: li.textContent, element: li });
    });
    this._speak(cuesToSpeak);

    if (!this.state.isPaused && !this.dom.mediaVideo.hidden) {
      this.dom.mediaVideo.play().catch(e => console.warn('Video play failed.', e));
    }
  }

  _completeSession() {
    if (this.state.timerId) clearInterval(this.state.timerId);
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.appStatus = 'complete';

    this._updateMusicState();
    this._cancelSpeech();
    this._speak({ text: 'Routine complete. Well done!' });

    const totalTime = this.state.totalDuration;
    const totalExercises = this.state.routine.exercises.length;

    // Update history and goals
    this._updateSessionHistory(totalTime);
    this._awardXp(this.achievements.xp.per_session);
    this._checkForBadgeUnlocks();

    this.dom.summaryTime.textContent = this._formatTime(totalTime);
    this.dom.summaryExercises.textContent = totalExercises;
    this._showView('summary');
  }

  // --- Event Handlers ---

  _handleBack() {
    if (this.state.isRunning) {
      if (!window.confirm('Are you sure you want to end the session? Your progress will be lost.')) {
        return;
      }
    }
    this._resetSession();
    this._showView('home');
  }

  _handlePauseResume() {
    if (!this.state.isRunning) return;
    this.state.isPaused = !this.state.isPaused;
    this.dom.pausedOverlay.hidden = !this.state.isPaused;
    this._updateControls();
    if (!this.dom.mediaVideo.hidden) {
      if (this.state.isPaused) this.dom.mediaVideo.pause();
      else this.dom.mediaVideo.play().catch(e => console.warn('Video resume failed.', e));
    }
    this._updateMusicState();
    if (this.tts.isSupported) {
      if (this.state.isPaused) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
    }
  }

  _handleSkip() {
    if (!this.state.isRunning || this.state.isPaused) return;
    this._cancelSpeech();

    if (this.state.appStatus === 'exercising') {
      this.state.totalRemainingSec -= this.state.remainingSec;
      this._prepareForExercise(this.state.currentIndex + 1);
    } else if (this.state.appStatus === 'preparing') {
      this.state.totalRemainingSec -= this.state.remainingSec;
      this._startExercise(this.state.currentIndex);
    }
  }

  _handlePrev() {
    if (!this.state.isRunning || this.state.isPaused || this.state.currentIndex < 1) return;
    this._cancelSpeech();

    const prevExercise = this.state.routine.exercises[this.state.currentIndex - 1];
    const timeToAdd = (prevExercise.duration_sec || 0) + this.prefs.prepareTime;
    this.state.totalRemainingSec += timeToAdd;

    this._prepareForExercise(this.state.currentIndex - 1);
  }

  _handleRestart() {
    if (!this.state.routine) return;
    if (this.state.isRunning) {
      if (!window.confirm('Are you sure you want to restart the routine?')) {
        return;
      }
    }
    this._resetSession();
    this._startSession(0);
  }

  _handleRepIncrement() {
    if (!this.state.currentExercise || this.state.currentExercise.type !== 'reps' || this.state.isPaused) return;
    this.state.repCount++;
    this.dom.repCountDisplay.textContent = `${this.state.repCount}/${this.state.currentExercise.target_reps}`;
    if (this.state.repCount >= this.state.currentExercise.target_reps) {
      this.state.totalRemainingSec -= this.state.remainingSec;
      this._prepareForExercise(this.state.currentIndex + 1);
    }
  }

  _handlePreviewClick(event) {
    const targetLi = event.target.closest('li[data-index]');
    if (targetLi) {
        event.preventDefault();
        const index = parseInt(targetLi.dataset.index, 10);
        this._startSession(index);
    }
  }

  _handleDrop() {
    const newOrder = Array.from(this.dom.previewList.querySelectorAll('li')).map(li => {
      const exerciseId = li.dataset.id;
      return this.state.routine.exercises.find(ex => ex.id === exerciseId);
    });
    this.state.routine.exercises = newOrder;
    this._populatePreviewList();
    this._updateTotalTime(0);
  }

  _startSession(startIndex = 0) {
    if (this.state.isRunning || !this.state.routine) return;
    this.state.isRunning = true;
    this.state.isPaused = false;
    this._updateTotalTime(startIndex);
    this._showView('session');
    this._updateControls();
    this._prepareForExercise(startIndex);
    this._updateMusicState();
  }

  _resetSession() {
    if (this.state.timerId) clearInterval(this.state.timerId);
    this._cancelSpeech();
    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.appStatus = 'idle';
    this.state.currentIndex = -1;
    this.dom.pausedOverlay.hidden = true;
    this._stopPacer();
    this._updateMusicState();
    this._updateTotalTime(0);
  }

  // --- Preferences ---

  _handlePillToggle(element, key, prefName) {
    const isPressed = element.getAttribute('aria-pressed') === 'true';
    const newValue = !isPressed;
    element.setAttribute('aria-pressed', String(newValue));
    this.prefs[prefName] = newValue;
    this._savePreference(key, newValue);

    if (prefName === 'music') this._updateMusicState();
    if (prefName === 'tts' && !newValue) this._cancelSpeech();
    if (prefName === 'video' && this.state.isRunning) this._renderExercise(this.state.currentExercise);
  }

  _handleSegmentedControl(event, container, key, prefName, callback) {
    const button = event.target.closest('button');
    if (!button) return;

    const newValue = button.dataset.value;
    this.prefs[prefName] = (typeof this.prefs[prefName] === 'number') ? parseInt(newValue, 10) : newValue;
    this._savePreference(key, this.prefs[prefName]);

    container.querySelectorAll('button').forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
    });
    button.setAttribute('aria-pressed', 'true');

    if (callback) callback(this.prefs[prefName]);
  }

  _handlePacerPresetChange(presetId) {
    const preset = this.pacer.presets.find(p => p.id === presetId);
    if (preset) this._startPacer({ type: 'preset', preset_id: preset.id });
  }

  // --- UI Update & Rendering ---

  _renderExercise(exercise) {
    this.state.currentExercise = exercise;
    this.dom.exTitle.textContent = exercise.name;
    this.dom.exCues.innerHTML = '';
    exercise.cues.forEach(cue => { const li = document.createElement('li'); li.textContent = cue; this.dom.exCues.appendChild(li); });

    if (exercise.type === 'reps') {
      this.dom.repIncBtn.hidden = false;
      this.dom.repCountDisplay.textContent = `${this.state.repCount}/${exercise.target_reps}`;
    } else {
      this.dom.repIncBtn.hidden = true;
    }

    if (exercise.pacer) {
      this.dom.media.hidden = true;
      this._startPacer(exercise.pacer);
    } else {
      this._stopPacer();
    }

    this.dom.media.hidden = true;
    this.dom.mediaVideo.hidden = true;
    this.dom.mediaImageWrap.hidden = true;
    this.dom.mediaVideo.pause();
    this.dom.mediaVideo.removeAttribute('src');

    const useVideo = this.prefs.video && exercise.media?.video?.src;
    const useImages = exercise.media?.images?.length > 0;

    if (useVideo) {
      this.dom.media.hidden = false;
      this.dom.mediaVideo.hidden = false;
      this.dom.mediaVideo.src = exercise.media.video.src;
      this.dom.mediaVideo.poster = exercise.media.video.poster || '';
      this.dom.mediaVideo.load();
    } else if (useImages) {
      this.dom.media.hidden = false;
      this.dom.mediaImageWrap.hidden = false;
      this._renderCurrentImage();
    }

    this._updateTimerDisplay();
    this._updateProgress();
  }

  _renderCurrentImage() {
    const images = this.state.currentExercise?.media?.images;
    if (!images || images.length === 0) { this.dom.mediaImageWrap.hidden = true; return; }
    // The new UI doesn't have prev/next for images, so we just show the first one.
    this.dom.mediaImage.src = images[0];
    this.dom.mediaImage.alt = `${this.state.currentExercise.name} - view 1 of ${images.length}`;
  }

  _updateTimerDisplay() { this.dom.timerDisplay.textContent = this._formatTime(this.state.remainingSec); }

  _updateProgress() {
    if (!this.state.routine) return;
    const total = this.state.routine.exercises.length;
    const current = this.state.currentIndex + 1;
    this.dom.stepCount.textContent = `${current > total ? total : current}/`;

    const percent = this.state.totalDuration > 0
      ? Math.floor(((this.state.totalDuration - this.state.totalRemainingSec) / this.state.totalDuration) * 100)
      : 0;
    
    this.dom.progressRing.style.setProperty('--progress', `%`);
    this.dom.progressRing.setAttribute('aria-valuenow', String(percent));
    this.dom.progressPercent.textContent = `%`;
  }

  _updateControls() {
    const isRunning = this.state.isRunning;
    const isPaused = this.state.isPaused;

    this.dom.playPauseBtn.disabled = !isRunning;
    this.dom.playPauseBtn.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');
    this.dom.playIcon.hidden = !isPaused;
    this.dom.pauseIcon.hidden = isPaused;

    this.dom.prevBtn.disabled = !isRunning || isPaused || this.state.currentIndex < 1;
    this.dom.nextBtn.disabled = !isRunning || isPaused;
  }

  // --- Persistence & Utilities ---

  _loadPreferences() {
    try {
      this.prefs.music = localStorage.getItem(this.PREF_KEYS.MUSIC) === 'true';
      this.prefs.tts = localStorage.getItem(this.PREF_KEYS.TTS) === 'true';
      this.prefs.video = localStorage.getItem(this.PREF_KEYS.VIDEO) === 'true';
      this.prefs.textSize = localStorage.getItem(this.PREF_KEYS.TEXT_SIZE) || '100';
      this.prefs.prepareTime = parseInt(localStorage.getItem(this.PREF_KEYS.PREPARE_TIME) || 5, 10);

      this.dom.toggleMusic.setAttribute('aria-pressed', String(this.prefs.music));
      this.dom.toggleTts.setAttribute('aria-pressed', String(this.prefs.tts));
      this.dom.toggleVideo.setAttribute('aria-pressed', String(this.prefs.video));

      this.dom.textSize.querySelectorAll('button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.value === this.prefs.textSize)));
      this.dom.prepareTime.querySelectorAll('button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.value == this.prefs.prepareTime)));

      this._applyTextSize(this.prefs.textSize);
    } catch (e) {
      console.warn('Could not load preferences from localStorage.', e);
    }
  }

  _savePreference(key, value) { try { localStorage.setItem(key, String(value)); } catch (e) { console.warn('Could not save preference to localStorage.', e); } }
  _applyTextSize(size) { this.dom.body.classList.remove('text-125', 'text-150'); if (size === '125') this.dom.body.classList.add('text-125'); else if (size === '150') this.dom.body.classList.add('text-150'); }
  _formatTime(seconds) { const min = Math.floor(seconds / 60); const sec = seconds % 60; return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; }
  
  _calculateTotalTime(exercises, startIndex = 0) {
    const remainingExercises = exercises.slice(startIndex);
    const exerciseTime = remainingExercises.reduce((total, ex) => total + (ex.duration_sec || 0), 0);
    const prepareTime = remainingExercises.length * this.prefs.prepareTime;
    return exerciseTime + prepareTime;
  }

  _updateTotalTime(startIndex = 0) {
    if (!this.state.routine) return;
    this.state.totalDuration = this._calculateTotalTime(this.state.routine.exercises, startIndex);
    this.state.totalRemainingSec = this.state.totalDuration;
  }

  // --- Pacer Engine ---

  async _initPacer() {
    const response = await fetch(this.PACER_PRESETS_PATH);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const pacerData = await response.json();
    this.pacer.presets = pacerData.presets;

    this.dom.pacerPresetSelect.innerHTML = '';
    this.pacer.presets.forEach(preset => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      this.dom.pacerPresetSelect.appendChild(option);
    });
  }

  _startPacer(pacerConfig) {
    let pattern = pacerConfig.pattern;
    if (pacerConfig.type === 'preset') {
      const preset = this.pacer.presets.find(p => p.id === pacerConfig.preset_id);
      if (!preset) {
        console.error(`Pacer preset not found: ${pacerConfig.preset_id}`);
        return;
      }
      pattern = preset.pattern;
      this.dom.pacerPresetSelect.value = preset.id;
    }

    this.pacer.currentPattern = {
      inhale: pattern.inhale_sec || 0,
      hold1: pattern.hold1_sec || 0,
      exhale: pattern.exhale_sec || 0,
      hold2: pattern.hold2_sec || 0,
    };

    this.pacer.totalCycleTime = Object.values(this.pacer.currentPattern).reduce((sum, val) => sum + val, 0);
    if (this.pacer.totalCycleTime === 0) return;

    this.pacer.phaseStartTime = this.state.totalDuration - this.state.totalRemainingSec;
    this.pacer.isActive = true;
    this.dom.breathingCard.hidden = false;

    this.dom.breathCircle.style.animationDuration = `${this.pacer.totalCycleTime}s`;
    this.dom.breathCircle.style.animationPlayState = 'running';
  }

  _stopPacer() {
    if (!this.pacer.isActive) return;
    this.pacer.isActive = false;
    this.dom.breathingCard.hidden = true;
    this.dom.breathCircle.style.animationPlayState = 'paused';
  }

  _updatePacer() {
    if (!this.pacer.isActive || this.state.isPaused) {
      this.dom.breathCircle.style.animationPlayState = 'paused';
      return;
    }
    this.dom.breathCircle.style.animationPlayState = 'running';

    const elapsed = (this.state.totalDuration - this.state.totalRemainingSec) - this.pacer.phaseStartTime;
    const cycleTime = elapsed % this.pacer.totalCycleTime;

    const p = this.pacer.currentPattern;
    let phase = '';
    let boundary = 0;

    if (cycleTime < (boundary += p.inhale)) phase = 'Inhale';
    else if (cycleTime < (boundary += p.hold1)) phase = 'Hold';
    else if (cycleTime < (boundary += p.exhale)) phase = 'Exhale';
    else phase = 'Hold';

    if (this.dom.breathPhase.textContent !== phase) {
      this.dom.breathPhase.textContent = phase;
      if (this.prefs.pacerTick) this._playTick();
    }
  }

  _playTick() {
    if (!this.pacer.tickContext) {
      this.pacer.tickContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = this.pacer.tickContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // --- Goals Engine ---

  async _initGoals() {
    const response = await fetch(this.GOALS_PATH);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const goalsData = await response.json();
    this.goals.suggested = goalsData.goals;

    try {
      this.history = JSON.parse(localStorage.getItem(this.PREF_KEYS.HISTORY)) || {};
      this.goals.user = JSON.parse(localStorage.getItem(this.PREF_KEYS.GOALS)) || {};
    } catch (e) {
      console.warn('Could not parse user history or goals from localStorage.', e);
      this.history = {};
      this.goals.user = {};
    }

    if (Object.keys(this.goals.user).length === 0) {
      this.goals.suggested.slice(0, 3).forEach(goal => {
        this.goals.user[goal.id] = { ...goal, currentValue: 0, completed: false, completed_at: null };
      });
      this._saveUserGoals();
    }

    this._updateGoalsProgress(false); // Initial update without saving
  }

  _updateSessionHistory(sessionDuration) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (!this.history[today]) {
      this.history[today] = { sessionsCompleted: 0, minutes: 0 };
    }
    this.history[today].sessionsCompleted += 1;
    this.history[today].minutes += Math.round(sessionDuration / 60);
    this._saveHistory();
    this._updateGoalsProgress();
  }

  _updateGoalsProgress(save = true) {
    Object.values(this.goals.user).forEach(goal => {
      if (goal.completed && !goal.auto_progression) return;

      const { progress, currentValue } = this._calculateGoalProgress(goal);
      goal.currentValue = currentValue;

      if (progress >= 1 && !goal.completed) {
        goal.completed = true;
        goal.completed_at = new Date().toISOString();
        console.log(`Goal Completed: ${goal.name}`); // Placeholder for celebration
        
        if (goal.auto_progression) {
          goal.target = goal.auto_progression.nextTarget;
          goal.currentValue = 0;
          goal.completed = false;
          goal.completed_at = null;
        }
      }
    });

    if (save) this._saveUserGoals();
    this._renderGoals();
  }

  _calculateGoalProgress(goal) {
    let currentValue = 0;
    const today = new Date();
    const historyEntries = Object.entries(this.history);

    switch (goal.type) {
      case 'session_count':
        currentValue = historyEntries.reduce((sum, [, data]) => sum + data.sessionsCompleted, 0);
        break;
      case 'daily_minutes':
        const todayStr = today.toISOString().split('T')[0];
        currentValue = this.history[todayStr]?.minutes || 0;
        break;
      case 'weekly_sessions':
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        currentValue = historyEntries.filter(([date]) => new Date(date) >= oneWeekAgo).reduce((sum, [, data]) => sum + data.sessionsCompleted, 0);
        break;
    }
    const progress = goal.target > 0 ? Math.min(currentValue / goal.target, 1) : 0;
    return { progress, currentValue };
  }

  _renderGoals() {
    const list = this.dom.goalsList;
    list.innerHTML = '';
    if (!this.goals.user || Object.keys(this.goals.user).length === 0) {
      this.dom.goalsSection.hidden = true;
      return;
    }
    this.dom.goalsSection.hidden = false;

    Object.values(this.goals.user).forEach(goal => {
      const { progress, currentValue } = this._calculateGoalProgress(goal);
      const card = document.createElement('div');
      card.className = 'goal-card';
      card.innerHTML = `
        <div class="goal-header">
          <div class="goal-name">${goal.name}</div>
          <div class="goal-progress-text"> / ${goal.target}</div>
        </div>
        <div class="goal-description">${goal.description || ''}</div>
        <div class="goal-progress-bar">
          <div class="fill" style="--progress: ${progress * 100}%"></div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  _saveHistory() { try { localStorage.setItem(this.PREF_KEYS.HISTORY, JSON.stringify(this.history)); } catch(e) { console.warn('Failed to save history'); } }
  _saveUserGoals() { try { localStorage.setItem(this.PREF_KEYS.GOALS, JSON.stringify(this.goals.user)); } catch(e) { console.warn('Failed to save user goals'); } }

  // --- Achievements Engine ---

  async _initAchievements() {
    const response = await fetch(this.ACHIEVEMENTS_PATH);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    this.achievements = await response.json();

    try {
      const savedProfile = JSON.parse(localStorage.getItem(this.PREF_KEYS.PROFILE));
      if (savedProfile) {
        this.userProfile = savedProfile;
      }
    } catch (e) {
      console.warn('Could not parse user profile from localStorage.', e);
    }
    this._renderProfileStats();
  }

  _awardXp(amount) {
    if (!amount || !this.state.isRunning) return;
    this.userProfile.xp += amount;
    this._checkForLevelUp();
    this._saveProfile();
    this._renderProfileStats();
  }

  _checkForLevelUp() {
    const currentLevel = this.userProfile.level;
    const nextLevelXp = this.achievements.levels[currentLevel];

    if (typeof nextLevelXp !== 'undefined' && this.userProfile.xp >= nextLevelXp) {
      this.userProfile.level++;
      this._showCelebration({
        title: 'Level Up!',
        description: `You've reached Level ${this.userProfile.level}!`
      });
    }
  }

  _checkForBadgeUnlocks() {
    const totalSessions = Object.values(this.history).reduce((sum, day) => sum + day.sessionsCompleted, 0);
    const currentStreak = this._calculateCurrentStreak();

    this.achievements.badges.forEach(badge => {
      badge.tiers.forEach(tier => {
        const badgeId = `${badge.id}_${tier.tier}`;
        if (this.userProfile.unlockedBadges[badgeId]) return; // Already unlocked

        let metricValue = 0;
        if (badge.trigger.type === 'sessions') metricValue = totalSessions;
        if (badge.trigger.type === 'streak') metricValue = currentStreak;

        if (metricValue >= tier.threshold) {
          this.userProfile.unlockedBadges[badgeId] = new Date().toISOString();
          this._awardXp(tier.xpReward || 0);
          this._showCelebration({
            title: 'Badge Unlocked!',
            description: `You've earned the "${badge.name} (${tier.tier})" badge!`
          });
        }
      });
    });
    this._saveProfile();
  }

  _calculateCurrentStreak() {
    let streak = 0;
    const today = new Date();
    if (this.history[today.toISOString().split('T')[0]]) {
      streak = 1;
      for (let i = 1; i < 365; i++) {
        const prevDay = new Date(today);
        prevDay.setDate(today.getDate() - i);
        if (this.history[prevDay.toISOString().split('T')[0]]) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  }

  _renderProfileStats() {
    this.dom.profileSection.hidden = false;
    const { xp, level } = this.userProfile;
    const currentLevelXp = this.achievements.levels[level - 1] || 0;
    const nextLevelXp = this.achievements.levels[level] || xp;
    const xpInLevel = xp - currentLevelXp;
    const xpForNextLevel = nextLevelXp - currentLevelXp;
    const progressPercent = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100;

    this.dom.profileLevel.textContent = level;
    this.dom.profileXp.textContent = xp;
    this.dom.profileNextLevelXp.textContent = nextLevelXp;
    this.dom.xpBarFill.style.setProperty('--xp-progress', `%`);
  }

  _showCelebration({ title, description }) {
    this.dom.celebrationTitle.textContent = title;
    this.dom.celebrationDescription.textContent = description;
    this.dom.celebrationOverlay.hidden = false;
  }

  _hideCelebration() {
    this.dom.celebrationOverlay.hidden = true;
  }

  _saveProfile() { try { localStorage.setItem(this.PREF_KEYS.PROFILE, JSON.stringify(this.userProfile)); } catch(e) { console.warn('Failed to save profile'); } }

  // --- TTS and Audio Methods ---

  _cancelSpeech() {
    if (!this.tts.isSupported) return;
    this.tts.queue = [];
    this.tts.isSpeaking = false;
    window.speechSynthesis.cancel();
    document.querySelectorAll('.speaking').forEach(el => el.classList.remove('speaking'));
  }

  _speak(items) {
    if (!this.tts.isSupported || !this.prefs.tts) return;
    const newQueue = (Array.isArray(items) ? items : [items]);
    this.tts.queue.push(...newQueue);
    if (!this.tts.isSpeaking) {
      this._processTtsQueue();
    }
  }

  _processTtsQueue() {
    if (this.tts.queue.length === 0) {
      this.tts.isSpeaking = false;
      return;
    }
    this.tts.isSpeaking = true;
    const currentItem = this.tts.queue[0];
    const utterance = new SpeechSynthesisUtterance(currentItem.text);
    let lastHighlightedElement = null;
    utterance.onstart = () => {
      if (currentItem.element) {
        currentItem.element.classList.add('speaking');
        lastHighlightedElement = currentItem.element;
      }
    };
    utterance.onend = () => {
      if (lastHighlightedElement) {
        lastHighlightedElement.classList.remove('speaking');
      }
      this.tts.queue.shift();
      this._processTtsQueue();
    };
    utterance.onerror = (event) => {
      console.warn('TTS error:', event.error);
      utterance.onend();
    };
    window.speechSynthesis.speak(utterance);
  }

  async _updateMusicState() {
    const shouldPlay = this.prefs.music && this.state.isRunning && !this.state.isPaused;
    if (shouldPlay) {
      if (!this.audio.initPromise) await this._initMusic();
      if (this.audio.music) this.audio.music.play().catch(e => console.warn('Music playback failed.', e));
    } else {
      if (this.audio.music) this.audio.music.pause();
    }
  }

  _initMusic() {
    if (this.audio.initPromise) return this.audio.initPromise;
    this.audio.initPromise = new Promise((resolve) => {
      const musicEl = new Audio(this.audio.musicPath);
      musicEl.loop = true;
      musicEl.volume = 0.5;
      const loadTimeout = setTimeout(() => musicEl.onerror(new Event('error')), 5000);
      musicEl.onerror = () => {
        clearTimeout(loadTimeout);
        console.warn(`Failed to load music file: ${this.audio.musicPath}.`);
        this.audio.music = { play: () => {}, pause: () => {}, set currentTime(val) {} };
        resolve();
      };
      musicEl.oncanplaythrough = () => {
        clearTimeout(loadTimeout);
        this.audio.music = musicEl;
        resolve();
      };
      musicEl.load();
    });
    return this.audio.initPromise;
  }
}

// --- Application Entry Point ---
(() => {
  'use strict';
  new LiveLongApp();
})();
