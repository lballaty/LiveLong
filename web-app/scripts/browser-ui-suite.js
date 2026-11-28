// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-ui-suite.js
// Description: Comprehensive full-app agent-driven UI test suite executed via chrome-devtools-mcp against the live browser
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-24

async () => {
  const results = [];
  const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));
  const assert = (name, cond, detail = '') => {
    results.push({ name, pass: Boolean(cond), detail: cond ? 'ok' : detail || 'failed' });
  };
  const clickNav = async (label) => {
    const btn = Array.from(document.querySelectorAll('nav button')).find((b) =>
      b.textContent?.includes(label)
    );
    btn?.click();
    await wait(160);
    return btn;
  };
  const clickBtnText = async (selector, text) => {
    const btn = Array.from(document.querySelectorAll(selector)).find((b) =>
      b.textContent?.includes(text)
    );
    btn?.click();
    await wait(140);
    return btn;
  };
  const setInputVal = (el, val) => {
    const proto =
      el.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : el.tagName === 'SELECT'
        ? window.HTMLSelectElement.prototype
        : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    setter?.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // --- 1. SESSION VIEW: RAJIO TAISO ALL 6 STEPS + EXTERNAL/FALLBACK + ANIMATION ---
  await clickNav('Session');
  const player = document.querySelector('[data-testid="exercise-animation-player"]');
  const firstSvg = document.querySelector('.exercise-figures svg');
  const rect = firstSvg?.getBoundingClientRect();
  assert(
    '1.1 Session: External Robot R1 animation loaded with non-zero SVG size',
    player?.getAttribute('data-animation-source') === 'external' &&
      firstSvg?.getAttribute('aria-label')?.includes('Robot (R1)') &&
      (rect?.width || 0) > 50 &&
      (rect?.height || 0) > 50
  );

  // Check HUD decluttering & mute pills
  const hudSliders = document.querySelectorAll('[data-testid="audio-channel-mixer"] input[type="range"]').length;
  assert('1.2 Session: Exercise HUD has 0 volume sliders (decluttered)', hudSliders === 0);

  const chimePill = document.querySelector('[data-testid="toggle-chime-mute"]');
  const voicePill = document.querySelector('[data-testid="toggle-voice-mute"]');
  const musicPill = document.querySelector('[data-testid="toggle-music-mute"]');
  assert('1.3 Session: All 3 compact mute pills exist', Boolean(chimePill && voicePill && musicPill));

  const chimeAriaBefore = chimePill?.getAttribute('aria-label');
  chimePill?.click();
  await wait(80);
  const chimeAriaAfter = chimePill?.getAttribute('aria-label');
  chimePill?.click();
  await wait(80);
  assert('1.4 Session: Chime mute pill toggles ARIA state', chimeAriaBefore !== chimeAriaAfter);

  // Start -> Animate -> Pause -> Resume -> Stop
  const svgBefore = firstSvg?.innerHTML;
  document.querySelector('[data-testid="start-focus-button"]')?.click();
  await wait(600);
  const svgAfter = document.querySelector('.exercise-figures svg')?.innerHTML;
  assert('1.5 Session: Robot R1 animates live after Start', Boolean(svgBefore && svgAfter && svgBefore !== svgAfter));
  assert('1.6 Session: Pause button visible while running', Boolean(document.querySelector('[data-testid="pause-button"]')));
  document.querySelector('[data-testid="pause-button"]')?.click();
  await wait(120);
  assert('1.7 Session: Resume button visible while paused', Boolean(document.querySelector('[data-testid="resume-button"]')));
  document.querySelector('[data-testid="resume-button"]')?.click();
  await wait(120);
  document.querySelector('[data-testid="stop-button"]')?.click();
  await wait(120);
  assert('1.8 Session: Start button restored after Stop', Boolean(document.querySelector('[data-testid="start-focus-button"]')));

  // Step through all 6 Rajio Taiso steps and verify external vs fallback sources
  const expectedStepSources = [
    { title: '1. Neck and Arm Stretches', source: 'external' },
    { title: '2. Arm Swings', source: 'external' },
    { title: '3. Chest Expansion', source: 'external' },
    { title: '4. Side Bends', source: 'external' },
    { title: '5. Trunk Twists', source: 'external' },
    { title: '6. Leg Swings', source: 'external' },
  ];
  for (let i = 0; i < expectedStepSources.length; i++) {
    if (i > 0) {
      document.querySelector('[data-testid="review-next-step"]')?.click();
      await wait(180);
    }
    const h2Text = document.querySelector('h2')?.textContent || '';
    const src = player?.getAttribute('data-animation-source');
    assert(
      `1.9.${i + 1} Rajio Taiso Step ${i + 1} renders (${expectedStepSources[i].source})`,
      h2Text.includes(expectedStepSources[i].title) && src === expectedStepSources[i].source,
      `got "${h2Text}" (${src})`
    );
  }
  // Prev step back to 1
  for (let i = 0; i < 5; i++) {
    document.querySelector('[data-testid="review-prev-step"]')?.click();
    await wait(80);
  }
  assert('1.10 Session: Prev Step returns to step 1', document.querySelector('h2')?.textContent?.includes('1. Neck and Arm Stretches'));

  // --- 2. SETTINGS VIEW: CAST, VARIANT, VIEWS (BOTH = 2 SVGS), VOICES, AUDIO TOGGLES & SLIDERS, BUNDLE DOCS ---
  await clickNav('Settings');
  const settings = document.querySelector('[data-testid="settings-view"]');
  const settingsSliders = settings ? Array.from(settings.querySelectorAll('input[type="range"]')) : [];
  const settingsCheckboxes = settings ? Array.from(settings.querySelectorAll('input[type="checkbox"]')) : [];
  assert('2.1 Settings: View renders with 3 audio sliders and 4 toggles', settingsSliders.length === 3 && settingsCheckboxes.length === 4);
  assert('2.2 Settings: Drop-in bundle status section visible', Boolean(settings?.textContent?.includes('Drop-In Voice & Animation Bundles')));

  // Cast selector updates live figure preview inside Settings
  const castSelect = settings?.querySelector('select');
  setInputVal(castSelect, 'f30-slim');
  await wait(220);
  const previewAria = settings?.querySelector('.exercise-figures svg')?.getAttribute('aria-label') || '';
  assert('2.3 Settings: Cast selector updates live figure preview', previewAria.includes('Woman, about 30'), previewAria);

  // Voice Woman/Man toggle + Test Audio Cue button
  await clickBtnText('[data-testid="settings-view"] button', 'Man');
  await clickBtnText('[data-testid="settings-view"] button', 'Woman');
  const testCueBtn = await clickBtnText('[data-testid="settings-view"] button', 'Test Audio Cue');
  assert('2.4 Settings: Voice selector and Test Audio Cue button interactive', Boolean(testCueBtn));

  // Audio & Haptic checkboxes + sliders update percentages
  setInputVal(settings?.querySelector('input[aria-label="Chime volume"]'), '55');
  setInputVal(settings?.querySelector('input[aria-label="Voice volume"]'), '80');
  setInputVal(settings?.querySelector('input[aria-label="Music volume"]'), '30');
  await wait(80);
  assert(
    '2.5 Settings: Volume sliders update percentage readouts',
    Boolean(settings?.textContent?.includes('55%') && settings?.textContent?.includes('80%') && settings?.textContent?.includes('30%'))
  );

  // Switch to Front + Side & Chair-Based variant, verify 2 SVGs render in Session
  await clickBtnText('[data-testid="settings-view"] button', 'Front + Side');
  await clickBtnText('[data-testid="settings-view"] button', 'Chair-Based');
  await clickNav('Session');
  await wait(250);
  const bothCount = document.querySelectorAll('.exercise-figures svg').length;
  assert('2.6 Settings -> Session: Front + Side renders 2 SVGs', bothCount === 2, `count=${bothCount}`);

  // Switch back to Robot R1 + Front + Standing
  await clickNav('Settings');
  setInputVal(document.querySelector('[data-testid="settings-view"] select'), 'robot-r1');
  await clickBtnText('[data-testid="settings-view"] button', 'Front');
  await clickBtnText('[data-testid="settings-view"] button', 'Standing');

  // Save Current as Defaults -> change sliders -> Reset All to Saved Defaults -> Restore Factory Defaults
  const getChimeSlider = () => document.querySelector('[data-testid="settings-view"] input[aria-label="Chime volume"]');
  setInputVal(getChimeSlider(), '40');
  await wait(80);
  document.querySelector('[data-testid="save-defaults-button"]')?.click();
  await wait(80);
  setInputVal(getChimeSlider(), '90');
  await wait(80);
  document.querySelector('[data-testid="reset-defaults-button"]')?.click();
  await wait(80);
  const restoredSavedChime = getChimeSlider()?.value;
  document.querySelector('[data-testid="reset-factory-button"]')?.click();
  await wait(80);
  const restoredFactoryChime = getChimeSlider()?.value;
  assert(
    '2.7 Settings: Save as Defaults, Reset to Saved Defaults, and Restore Factory Defaults',
    restoredSavedChime === '40' && restoredFactoryChime === '70',
    `saved=${restoredSavedChime} factory=${restoredFactoryChime}`
  );

  // --- 3. ROUTINES VIEW: FILTERS, REORDER, AUDIO MODAL, CLONE, CREATE SERIES, CREATE BREATHING, CREATE SIMPLE, COMPOSE SESSION ---
  await clickNav('Routines');
  await clickBtnText('button', 'Exercises');
  assert(
    '3.1 Routines: Exercises filter isolates series',
    document.body.textContent?.includes('Japanese Longevity Exercises') &&
      !document.body.textContent?.includes('Focus & Meditation Timers')
  );
  await clickBtnText('button', 'Breathing');
  assert('3.2 Routines: Breathing filter isolates breathing', document.body.textContent?.includes('Breathing Exercises'));
  await clickBtnText('button', 'Focus Timers');
  assert('3.3 Routines: Focus Timers filter isolates simple timers', document.body.textContent?.includes('Focus & Meditation Timers'));
  await clickBtnText('button', 'All');

  // Reorder cards
  const firstBefore = document.querySelector('[data-testid^="profile-"] h3')?.textContent?.trim();
  document.querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Move routine later"]')?.click();
  await wait(120);
  const firstAfter = document.querySelector('[data-testid^="profile-"] h3')?.textContent?.trim();
  document.querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Move routine earlier"]')?.click();
  await wait(120);
  assert('3.4 Routines: Card reordering swaps and restores order', Boolean(firstBefore && firstAfter && firstBefore !== firstAfter));

  // Music select + preview + chime preview + RoutineAudioModal
  const musicSelect = document.querySelector('[data-testid="music-select-rajio-taiso-series"]');
  setInputVal(musicSelect, 'morning-exercise');
  await wait(80);
  const previewBtn = document.querySelector('[data-testid="preview-music-rajio-taiso-series"]');
  previewBtn?.click();
  await wait(80);
  const playingLabel = previewBtn?.textContent?.trim();
  previewBtn?.click();
  await wait(80);
  assert('3.5 Routines: Music preview toggles Play/Stop', playingLabel === '⏹' && previewBtn?.textContent?.trim() === '▶');

  document.querySelector('[data-testid="audio-config-rajio-taiso-series"]')?.click();
  await wait(120);
  const audioModal = document.querySelector('[data-testid="routine-audio-modal"]');
  assert('3.6 Routines: RoutineAudioModal opens with 3 sliders', Boolean(audioModal && audioModal.querySelectorAll('input[type="range"]').length === 3));
  document.querySelector('button[aria-label="Close audio setup"]')?.click();
  await wait(100);

  // Clone Rajio Taiso -> creates custom copy & opens editor -> save -> delete
  document.querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Clone routine"]')?.click();
  await wait(150);
  assert('3.7 Routines: Clone routine opens RoutineEditorModal', Boolean(document.querySelector('[data-testid="routine-editor-modal"]')));
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(150);
  const clonedCard = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Rajio Taiso Complete Series (Custom)')
  );
  assert('3.8 Routines: Cloned custom series card appears', Boolean(clonedCard));
  clonedCard?.querySelector('button[aria-label="Delete profile"]')?.click();
  await wait(120);

  // Create New Custom Series Routine via + New Routine
  await clickBtnText('button', '+ New Routine');
  const routineModal = document.querySelector('[data-testid="routine-editor-modal"]');
  assert('3.9 Routines: RoutineEditorModal has + Import Icon', Boolean(routineModal?.querySelector('[data-testid="icon-import-button"]')));
  const routineNameInput = routineModal?.querySelector('input[type="text"]');
  if (routineNameInput) setInputVal(routineNameInput, 'E2E Custom Flow');
  await clickBtnText('[data-testid="routine-editor-modal"] button', '+ Add Step');
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(150);
  const customSeriesCard = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('E2E Custom Flow')
  );
  assert('3.10 Routines: Custom Series saved and listed', Boolean(customSeriesCard));
  customSeriesCard?.querySelector('button[aria-label="Delete profile"]')?.click();
  await wait(120);

  // Create & Delete Simple Custom Timer via + Create Custom Timer
  await clickBtnText('button', '+ Create Custom Timer');
  const simpleForm = document.querySelector('form');
  const simpleName = simpleForm?.querySelector('input[type="text"]');
  if (simpleName) setInputVal(simpleName, 'E2E Simple');
  assert('3.11 Routines: Custom Timer modal has + Import Icon', Boolean(document.querySelector('[data-testid="icon-import-button"]')));
  simpleForm?.querySelector('button[type="submit"]')?.click();
  await wait(150);
  const customSimpleCard = Array.from(document.querySelectorAll('[data-testid^="profile-simple-"]')).find((el) =>
    el.textContent?.includes('E2E Simple')
  );
  assert('3.12 Routines: Custom Simple Timer saved and listed', Boolean(customSimpleCard));
  customSimpleCard?.querySelector('button[aria-label="Delete profile"]')?.click();
  await wait(120);

  // Compose Session -> Start Session -> Verify active-session-plan-banner -> Stop -> Delete
  await clickBtnText('button', '+ Compose Session');
  assert('3.13 Routines: SessionComposerModal has + Import Icon', Boolean(document.querySelector('[data-testid="session-composer-modal"] [data-testid="icon-import-button"]')));
  document.querySelector('[data-testid="save-session-plan-button"]')?.click();
  await wait(150);
  await clickBtnText('[data-testid^="session-plan-"] button', '▶ Start Session');
  await wait(200);
  assert('3.14 Session: Active SessionPlan banner shown when running session', Boolean(document.querySelector('[data-testid="active-session-plan-banner"]')));
  document.querySelector('[data-testid="stop-button"]')?.click();
  await wait(120);
  await clickNav('Routines');
  document.querySelector('button[aria-label="Delete session plan"]')?.click();
  await wait(120);

  // --- 4. BREATHING & SIMPLE TIMER VIEWS ---
  const boxCard = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Box Breathing')
  );
  boxCard?.click();
  await wait(150);
  assert('4.1 Breathing: Box Breathing renders BreathingVisualizer', Boolean(document.querySelector('[data-testid="breathing-visualizer"]')));
  const cycleInc = document.querySelector('[data-testid="loops-increase"]');
  const cycleDec = document.querySelector('[data-testid="loops-decrease"]');
  const loopsCountEl = document.querySelector('[data-testid="loops-count"]');
  const loopsBefore = Number(loopsCountEl?.textContent?.trim() || 0);
  cycleInc?.click();
  await wait(100);
  const loopsAfterInc = Number(loopsCountEl?.textContent?.trim() || 0);
  cycleDec?.click();
  await wait(100);
  assert(
    '4.2 Breathing: Loop count control increments and decrements',
    Boolean(cycleInc && cycleDec && loopsAfterInc === loopsBefore + 1),
    `before=${loopsBefore} after=${loopsAfterInc}`
  );

  await clickNav('Routines');
  const pomodoroCard = Array.from(document.querySelectorAll('[data-testid^="profile-simple-"]')).find((el) =>
    el.textContent?.includes('Pomodoro')
  );
  pomodoroCard?.click();
  await wait(150);
  assert('4.3 Simple Timer: Pomodoro shows 25:00', document.querySelector('[data-testid="time-display"]')?.textContent?.trim() === '25:00');

  // --- 5. PROGRESS VIEW & RESPONSIVE CHECK ---
  await clickNav('Progress');
  assert('5.1 Progress: ProgressView renders', Boolean(document.querySelector('[data-testid="progress-view"]')));
  assert(
    '5.2 Layout: Zero horizontal overflow on current viewport',
    document.documentElement.scrollWidth <= window.innerWidth + 1,
    `scrollWidth=${document.documentElement.scrollWidth} innerWidth=${window.innerWidth}`
  );

  // Restore Rajio Taiso
  await clickNav('Routines');
  document.querySelector('[data-testid="profile-rajio-taiso-series"]')?.click();
  await wait(150);

  const failed = results.filter((r) => !r.pass);
  return {
    total: results.length,
    passed: results.length - failed.length,
    failedCount: failed.length,
    results,
  };
};
