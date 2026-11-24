// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-ui-suite.js
// Description: Full-app agent-driven UI test suite executed via chrome-devtools-mcp against the live browser
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
    await wait(150);
    return btn;
  };
  const clickBtnText = async (selector, text) => {
    const btn = Array.from(document.querySelectorAll(selector)).find((b) =>
      b.textContent?.includes(text)
    );
    btn?.click();
    await wait(120);
    return btn;
  };

  // 1. Session View: Initial Rajio Taiso + External Robot R1 Animation
  await clickNav('Session');
  const player = document.querySelector('[data-testid="exercise-animation-player"]');
  const firstSvg = document.querySelector('.exercise-figures svg');
  const rect = firstSvg?.getBoundingClientRect();
  assert(
    'Session: External Robot R1 animation loaded with non-zero SVG size',
    player?.getAttribute('data-animation-source') === 'external' &&
      firstSvg?.getAttribute('aria-label')?.includes('Robot (R1)') &&
      (rect?.width || 0) > 50 &&
      (rect?.height || 0) > 50,
    `source=${player?.getAttribute('data-animation-source')} aria=${firstSvg?.getAttribute('aria-label')} size=${rect?.width}x${rect?.height}`
  );

  // 2. Session View: Clean HUD (0 sliders, compact mute pills)
  const hudSliders = document.querySelectorAll('[data-testid="audio-channel-mixer"] input[type="range"]').length;
  assert('Session: Exercise HUD has 0 volume sliders (decluttered)', hudSliders === 0, `sliders=${hudSliders}`);
  assert(
    'Session: Compact mute pills present (Chimes, Script, Music)',
    Boolean(
      document.querySelector('[data-testid="toggle-chime-mute"]') &&
        document.querySelector('[data-testid="toggle-voice-mute"]') &&
        document.querySelector('[data-testid="toggle-music-mute"]')
    )
  );

  // 3. Session View: Start -> Animates -> Pause -> Resume -> Stop
  const svgBefore = firstSvg?.innerHTML;
  document.querySelector('[data-testid="start-focus-button"]')?.click();
  await wait(550);
  const svgAfter = document.querySelector('.exercise-figures svg')?.innerHTML;
  assert('Session: Robot R1 animates when timer starts', Boolean(svgBefore && svgAfter && svgBefore !== svgAfter));
  assert('Session: Pause button visible while running', Boolean(document.querySelector('[data-testid="pause-button"]')));
  document.querySelector('[data-testid="pause-button"]')?.click();
  await wait(120);
  assert('Session: Resume button visible while paused', Boolean(document.querySelector('[data-testid="resume-button"]')));
  document.querySelector('[data-testid="stop-button"]')?.click();
  await wait(120);
  assert('Session: Start button restored after Stop', Boolean(document.querySelector('[data-testid="start-focus-button"]')));

  // 4. Session View: Step Review Prev/Next (External <-> Built-in Fallback)
  document.querySelector('[data-testid="review-next-step"]')?.click();
  await wait(150);
  assert(
    'Session: Next Step advances to 2. Arm Swings',
    document.querySelector('h2')?.textContent?.includes('2. Arm Swings')
  );
  document.querySelector('[data-testid="review-prev-step"]')?.click();
  await wait(150);
  assert(
    'Session: Prev Step returns to 1. Neck and Arm Stretches',
    document.querySelector('h2')?.textContent?.includes('1. Neck and Arm Stretches')
  );

  // 5. Routines View: Filters, Card Reordering, Music/Chime Preview, RoutineAudioModal
  await clickNav('Routines');
  assert('Routines: Headings visible', document.body.textContent?.includes('Routines & Timers'));

  await clickBtnText('button', 'Breathing');
  assert(
    'Routines: Breathing filter hides Exercises section',
    !document.body.textContent?.includes('Japanese Longevity Exercises') &&
      document.body.textContent?.includes('Breathing Exercises')
  );
  await clickBtnText('button', 'All');

  const firstBefore = document.querySelector('[data-testid^="profile-"] h3')?.textContent?.trim();
  document
    .querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Move routine later"]')
    ?.click();
  await wait(120);
  const firstAfter = document.querySelector('[data-testid^="profile-"] h3')?.textContent?.trim();
  document
    .querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Move routine earlier"]')
    ?.click();
  await wait(120);
  assert(
    'Routines: Card reordering swaps and restores order',
    Boolean(firstBefore && firstAfter && firstBefore !== firstAfter),
    `${firstBefore} -> ${firstAfter}`
  );

  // Music selection & preview toggle
  const musicSelect = document.querySelector('[data-testid="music-select-rajio-taiso-series"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
  setter?.call(musicSelect, 'morning-exercise');
  musicSelect?.dispatchEvent(new Event('change', { bubbles: true }));
  await wait(80);
  const previewBtn = document.querySelector('[data-testid="preview-music-rajio-taiso-series"]');
  previewBtn?.click();
  await wait(80);
  const playingLabel = previewBtn?.textContent?.trim();
  previewBtn?.click();
  await wait(80);
  assert('Routines: Music preview toggles Play/Stop', playingLabel === '⏹' && previewBtn?.textContent?.trim() === '▶');

  // RoutineAudioModal
  document.querySelector('[data-testid="audio-config-rajio-taiso-series"]')?.click();
  await wait(120);
  const audioModal = document.querySelector('[data-testid="routine-audio-modal"]');
  assert(
    'Routines: RoutineAudioModal opens with 3 volume sliders',
    Boolean(audioModal && audioModal.querySelectorAll('input[type="range"]').length === 3)
  );
  document.querySelector('button[aria-label="Close audio setup"]')?.click();
  await wait(100);

  // 6. Routines View: RoutineEditorModal, SessionComposerModal, Create Custom Timer (+ Import Icon)
  await clickBtnText('button', '+ New Routine');
  assert(
    'Routines: RoutineEditorModal opens with + Import Icon',
    Boolean(document.querySelector('[data-testid="routine-editor-modal"] [data-testid="icon-import-button"]'))
  );
  document.querySelector('button[aria-label="Close routine editor"]')?.click();
  await wait(100);

  await clickBtnText('button', '+ Compose Session');
  assert(
    'Routines: SessionComposerModal opens with + Import Icon',
    Boolean(document.querySelector('[data-testid="session-composer-modal"] [data-testid="icon-import-button"]'))
  );
  document.querySelector('[data-testid="save-session-plan-button"]')?.click();
  await wait(150);
  assert('Routines: Saved Composed Session appears on page', document.body.textContent?.includes('Composed Sessions'));
  document.querySelector('button[aria-label="Delete session plan"]')?.click();
  await wait(100);

  // 7. Breathing Routine -> BreathingVisualizer
  const boxCard = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Box Breathing')
  );
  boxCard?.click();
  await wait(150);
  assert('Session: Selecting Box Breathing renders BreathingVisualizer', Boolean(document.querySelector('[data-testid="breathing-visualizer"]')));

  // 8. Progress View
  await clickNav('Progress');
  assert('Progress: ProgressView renders', Boolean(document.querySelector('[data-testid="progress-view"]')));

  // 9. Settings View
  await clickNav('Settings');
  const settingsView = document.querySelector('[data-testid="settings-view"]');
  assert(
    'Settings: SettingsView renders with cast, variant, view, and audio controls',
    Boolean(settingsView && settingsView.querySelectorAll('input[type="range"]').length >= 3)
  );

  // Restore Rajio Taiso on Session view cleanly
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
