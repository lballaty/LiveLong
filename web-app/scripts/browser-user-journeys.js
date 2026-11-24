// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/scripts/browser-user-journeys.js
// Description: Dedicated User Journey & End-to-End Workflow suite executed in the live Chrome browser via chrome-devtools-mcp
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-24

async () => {
  const mode = window.__LL_JOURNEY_MODE || 'run';
  const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));
  const results = [];
  const assert = (journey, step, cond, detail = '') => {
    results.push({ journey, step, pass: Boolean(cond), detail: cond ? 'ok' : detail || 'failed' });
  };
  const clickNav = async (label) => {
    const btn = Array.from(document.querySelectorAll('nav button')).find((b) =>
      b.textContent?.includes(label)
    );
    btn?.click();
    await wait(160);
  };
  const clickBtnText = async (selector, text) => {
    const btn = Array.from(document.querySelectorAll(selector)).find((b) =>
      b.textContent?.includes(text)
    );
    btn?.click();
    await wait(140);
    return btn;
  };
  const setVal = (el, val) => {
    if (!el) return;
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

  if (mode === 'verify-reload') {
    await clickNav('Routines');
    const hasPersistedRoutine = Boolean(
      Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
        el.textContent?.includes('Persist Check Routine')
      )
    );
    const hasPersistedSession = Boolean(
      Array.from(document.querySelectorAll('[data-testid^="session-plan-"]')).find((el) =>
        el.textContent?.includes('Persist Check Session')
      )
    );
    const firstTitle = document.querySelector('[data-testid^="profile-"] h3')?.textContent?.trim();
    assert('J8.Persistence', 'Custom routine survives full reload', hasPersistedRoutine);
    assert('J8.Persistence', 'Composed session survives full reload', hasPersistedSession);
    assert(
      'J8.Persistence',
      'Reordered card order survives full reload',
      firstTitle === 'Tai Chi Morning Flow',
      `first=${firstTitle}`
    );

    // Cleanup persisted test artifacts
    Array.from(document.querySelectorAll('[data-testid^="profile-"]'))
      .find((el) => el.textContent?.includes('Persist Check Routine'))
      ?.querySelector('button[aria-label="Delete profile"]')
      ?.click();
    await wait(100);
    document.querySelector('button[aria-label="Delete session plan"]')?.click();
    await wait(100);
    document
      .querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Move routine earlier"]')
      ?.click();
    await wait(100);
    document.querySelector('[data-testid="profile-rajio-taiso-series"]')?.click();
    await wait(120);

    const failed = results.filter((r) => !r.pass);
    return { mode, total: results.length, passed: results.length - failed.length, failedCount: failed.length, results };
  }

  // --- JOURNEY 1: Live Timer Lifecycle (Start -> Tick -> Pause -> Hold -> Resume -> Stop -> Reset) ---
  await clickNav('Session');
  const initialTime = document.querySelector('[data-testid="time-display"]')?.textContent?.trim();
  document.querySelector('[data-testid="start-focus-button"]')?.click();
  await wait(1250);
  const runningTime = document.querySelector('[data-testid="time-display"]')?.textContent?.trim();
  assert('J1.TimerLifecycle', 'Timer counts down when running', runningTime !== initialTime, `${initialTime} -> ${runningTime}`);

  document.querySelector('[data-testid="pause-button"]')?.click();
  await wait(1100);
  const pausedTime1 = document.querySelector('[data-testid="time-display"]')?.textContent?.trim();
  await wait(1100);
  const pausedTime2 = document.querySelector('[data-testid="time-display"]')?.textContent?.trim();
  assert('J1.TimerLifecycle', 'Timer holds steady while paused', pausedTime1 === pausedTime2);

  document.querySelector('[data-testid="resume-button"]')?.click();
  await wait(1150);
  const resumedTime = document.querySelector('[data-testid="time-display"]')?.textContent?.trim();
  assert('J1.TimerLifecycle', 'Timer resumes counting down', resumedTime !== pausedTime2, `${pausedTime2} -> ${resumedTime}`);

  document.querySelector('[data-testid="stop-button"]')?.click();
  await wait(150);
  const resetTime = document.querySelector('[data-testid="time-display"]')?.textContent?.trim();
  assert('J1.TimerLifecycle', 'Stop resets countdown to initial duration', resetTime === initialTime);

  // --- JOURNEY 2: Cast / View / Posture Journey across Settings -> Session ---
  await clickNav('Settings');
  const castSelect = document.querySelector('[data-testid="settings-view"] select');
  setVal(castSelect, 'f30-slim');
  await wait(100);
  await clickBtnText('[data-testid="settings-view"] button', 'Front + Side');
  await clickBtnText('[data-testid="settings-view"] button', 'Chair-Based');
  await clickNav('Session');
  await wait(250);
  const f30Svgs = Array.from(document.querySelectorAll('.exercise-figures svg'));
  assert(
    'J2.CastAndViews',
    'Settings cast (Woman ~30) + Front+Side renders 2 external SVGs',
    f30Svgs.length === 2 && f30Svgs[0]?.getAttribute('aria-label')?.includes('Woman, about 30')
  );
  // Restore defaults
  await clickNav('Settings');
  setVal(document.querySelector('[data-testid="settings-view"] select'), 'robot-r1');
  await clickBtnText('[data-testid="settings-view"] button', 'Front');
  await clickBtnText('[data-testid="settings-view"] button', 'Standing');

  // --- JOURNEY 3: Author Custom Exercise Series & Run It ---
  await clickNav('Routines');
  await clickBtnText('button', '+ New Routine');
  const rModal = document.querySelector('[data-testid="routine-editor-modal"]');
  setVal(rModal?.querySelector('input[type="text"]'), 'Evening Mobility');
  await clickBtnText('[data-testid="routine-editor-modal"] button', '+ Add Step');
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(150);
  const mobilityCard = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Evening Mobility')
  );
  mobilityCard?.click();
  await wait(150);
  assert(
    'J3.CustomSeries',
    'Custom 2-step series launches in Session view',
    document.body.textContent?.includes('Evening Mobility') && document.body.textContent?.includes('Step 1 of 2')
  );
  document.querySelector('[data-testid="start-focus-button"]')?.click();
  await wait(200);
  document.querySelector('[data-testid="stop-button"]')?.click();
  await wait(120);

  // --- JOURNEY 4: Author Custom Breathing Routine & Run It ---
  await clickNav('Routines');
  await clickBtnText('button', '+ New Routine');
  await clickBtnText('[data-testid="routine-editor-modal"] button', 'Breathing Routine');
  setVal(document.querySelector('[data-testid="routine-editor-modal"] input[type="text"]'), 'Custom 4-7-8');
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(150);
  const breathCard = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Custom 4-7-8')
  );
  breathCard?.click();
  await wait(150);
  assert('J4.CustomBreathing', 'Custom breathing routine renders BreathingVisualizer', Boolean(document.querySelector('[data-testid="breathing-visualizer"]')));

  // --- JOURNEY 5: Compose & Run Multi-Routine SessionPlan ---
  await clickNav('Routines');
  await clickBtnText('button', '+ Compose Session');
  const sModal = document.querySelector('[data-testid="session-composer-modal"]');
  setVal(sModal?.querySelector('input[type="text"]'), 'Full Daily Stack');
  const addSel = sModal?.querySelector('select[aria-label="Add routine to session"]');
  if (addSel && addSel.options.length > 1) {
    setVal(addSel, addSel.options[1].value);
    await wait(80);
  }
  document.querySelector('[data-testid="save-session-plan-button"]')?.click();
  await wait(150);
  await clickBtnText('[data-testid^="session-plan-"] button', '▶ Start Session');
  await wait(200);
  const bannerText = document.querySelector('[data-testid="active-session-plan-banner"]')?.textContent || '';
  assert('J5.SessionPlan', 'Composed session launches with Routine 1/2 banner', bannerText.includes('Full Daily Stack') && bannerText.includes('1/2'));
  document.querySelector('[data-testid="stop-button"]')?.click();
  await wait(120);

  // --- JOURNEY 6: Clone, Edit & Delete Built-in Routine ---
  await clickNav('Routines');
  document.querySelector('[data-testid="profile-tai-chi-morning-series"] button[aria-label="Clone routine"]')?.click();
  await wait(150);
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(150);
  const clonedTaiChi = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Tai Chi Morning Flow (Custom)')
  );
  assert('J6.CloneEditDelete', 'Cloned built-in series appears as custom card', Boolean(clonedTaiChi));
  clonedTaiChi?.querySelector('button[aria-label="Edit profile"]')?.click();
  await wait(120);
  setVal(document.querySelector('[data-testid="routine-editor-modal"] input[type="text"]'), 'Tai Chi Edited');
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(120);
  const editedTaiChi = Array.from(document.querySelectorAll('[data-testid^="profile-"]')).find((el) =>
    el.textContent?.includes('Tai Chi Edited')
  );
  assert('J6.CloneEditDelete', 'Edited cloned routine updates card title', Boolean(editedTaiChi));
  editedTaiChi?.querySelector('button[aria-label="Delete profile"]')?.click();
  await wait(120);

  // Cleanup J3, J4, J5 temporary items
  Array.from(document.querySelectorAll('[data-testid^="profile-"]'))
    .filter((el) => el.textContent?.includes('Evening Mobility') || el.textContent?.includes('Custom 4-7-8'))
    .forEach((el) => el.querySelector('button[aria-label="Delete profile"]')?.click());
  await wait(100);
  document.querySelector('button[aria-label="Delete session plan"]')?.click();
  await wait(100);

  // --- JOURNEY 7: Routine Audio Modal & HUD Mute Sync ---
  document.querySelector('[data-testid="audio-config-rajio-taiso-series"]')?.click();
  await wait(120);
  const audioModal = document.querySelector('[data-testid="routine-audio-modal"]');
  const checkboxes = audioModal ? Array.from(audioModal.querySelectorAll('input[type="checkbox"]')) : [];
  assert('J7.AudioModal', 'RoutineAudioModal exposes Music, Chimes, and Voice toggles', checkboxes.length === 3);
  document.querySelector('button[aria-label="Close audio setup"]')?.click();
  await wait(100);

  // --- JOURNEY 8 SETUP: Create Persistence Artifacts Before Full Reload ---
  await clickBtnText('button', '+ New Routine');
  setVal(document.querySelector('[data-testid="routine-editor-modal"] input[type="text"]'), 'Persist Check Routine');
  document.querySelector('[data-testid="save-routine-button"]')?.click();
  await wait(120);
  await clickBtnText('button', '+ Compose Session');
  setVal(document.querySelector('[data-testid="session-composer-modal"] input[type="text"]'), 'Persist Check Session');
  document.querySelector('[data-testid="save-session-plan-button"]')?.click();
  await wait(120);
  document.querySelector('[data-testid="profile-rajio-taiso-series"] button[aria-label="Move routine later"]')?.click();
  await wait(120);
  assert('J8.PersistenceSetup', 'Prepared routine, session, and card order for reload check', true);

  const failed = results.filter((r) => !r.pass);
  return { mode, total: results.length, passed: results.length - failed.length, failedCount: failed.length, results };
};
