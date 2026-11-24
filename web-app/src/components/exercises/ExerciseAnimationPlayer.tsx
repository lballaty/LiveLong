// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/exercises/ExerciseAnimationPlayer.tsx
// Description: Full-stage React wrapper for exercise animations (live robot-figure POC + animation fleet host slot)
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CastCharacterId,
  ExerciseVariant,
  ExerciseViewMode,
  StepAnimationRef,
} from '@/types/unified-profile.types';
import {
  CharacterPack,
  ExerciseFiguresPlayer,
  ExercisePack,
  createExercisePlayer,
} from '@/lib/animations/exercise-figures-runtime';

export const CAST_LABELS: Record<CastCharacterId, string> = {
  'robot-r1': 'Robot R1 (Draft Default)',
  'm25-athletic': 'Man ~25 (Athletic)',
  'f30-slim': 'Woman ~30 (Slim)',
  'm50-heavier': 'Man ~50 (Heavier)',
  'f50-fuller': 'Woman ~50 (Fuller)',
  'f72-stooped': 'Woman ~72 (Gentle Stoop)',
  'm75-slim': 'Man ~75 (Slim)',
};

const BUNDLED_CHARACTERS = new Set<string>([
  'robot-r1',
  'm25-athletic',
  'f30-slim',
  'f72-stooped',
]);

interface ExerciseAnimationPlayerProps {
  stepId: string;
  stepName: string;
  animation?: StepAnimationRef;
  characterId: CastCharacterId;
  variant: ExerciseVariant;
  views: ExerciseViewMode;
  isPlaying: boolean;
  phase: 'warmup' | 'exercise' | 'rest' | 'cooldown';
}

/**
 * Full-stage host slot for `exercise-figures-runtime.js` + JSON packs
 * delivered by the `animation` fleet into `public/animations/`.
 * Includes an animated robot-figure POC for all 6 Rajio Taiso movements so
 * routines can be reviewed end-to-end with voice, music, and chimes.
 */
export default function ExerciseAnimationPlayer({
  stepId,
  stepName,
  animation,
  characterId,
  variant,
  views,
  isPlaying,
  phase,
}: ExerciseAnimationPlayerProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hasExternalPack, setHasExternalPack] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<ExerciseFiguresPlayer | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const viewList: Array<'front' | 'side'> =
    views === 'both' ? ['front', 'side'] : [views];
  const packLabel = animation?.pack || `rajio-taiso.${stepId}`;
  const resolvedCharacter = BUNDLED_CHARACTERS.has(characterId) ? characterId : 'robot-r1';
  const isRestOrStatic = phase === 'rest' || phase === 'cooldown' || !isPlaying || reducedMotion;
  const activeClass = isRestOrStatic ? '' : `anim-${stepId}`;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    let cancelled = false;

    const loadAndMount = async () => {
      try {
        const [exRes, charRes] = await Promise.all([
          fetch(`/animations/exercises/${packLabel}.json`),
          fetch(`/animations/characters/${resolvedCharacter}.json`),
        ]);
        if (!exRes.ok || !charRes.ok) {
          if (!cancelled) setHasExternalPack(false);
          return;
        }
        const [exercisePack, characterPack] = (await Promise.all([
          exRes.json(),
          charRes.json(),
        ])) as [ExercisePack, CharacterPack];
        if (cancelled || !containerRef.current) return;

        playerRef.current?.destroy();
        containerRef.current.innerHTML = '';
        const player = createExercisePlayer({
          exercisePack,
          characterPack,
          variant,
          views: viewList,
          inkWobble: false,
        });
        player.mount(containerRef.current);
        playerRef.current = player;
        setHasExternalPack(true);
        if (isRestOrStatic) {
          player.staticPose();
        } else {
          player.play();
        }
      } catch {
        if (!cancelled) setHasExternalPack(false);
      }
    };

    loadAndMount();

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packLabel, resolvedCharacter, variant, views]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isRestOrStatic) {
      player.staticPose();
    } else {
      player.play();
    }
  }, [isRestOrStatic]);

  return (
    <div
      data-testid="exercise-animation-player"
      data-animation-source={hasExternalPack ? 'external' : 'robot-poc'}
      className={`relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[220px] sm:min-h-[340px] transition-colors ${
        phase === 'rest' || phase === 'cooldown' ? 'bg-amber-50/70' : 'bg-white'
      }`}
    >
      <style>{`
        @keyframes ll-stretch-arms {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-28deg); }
        }
        @keyframes ll-stretch-arms-r {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(28deg); }
        }
        @keyframes ll-swing-cross-l {
          0%, 100% { transform: rotate(25deg); }
          50% { transform: rotate(-55deg); }
        }
        @keyframes ll-swing-cross-r {
          0%, 100% { transform: rotate(-25deg); }
          50% { transform: rotate(55deg); }
        }
        @keyframes ll-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(5px); }
        }
        @keyframes ll-side-bend {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-16deg); }
          75% { transform: rotate(16deg); }
        }
        @keyframes ll-twist {
          0%, 100% { transform: scaleX(1); }
          25% { transform: scaleX(0.75) translateX(-4px); }
          75% { transform: scaleX(0.75) translateX(4px); }
        }
        @keyframes ll-leg-l {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(24deg); }
          50% { transform: rotate(0deg); }
        }
        @keyframes ll-leg-r {
          0%, 50%, 100% { transform: rotate(0deg); }
          75% { transform: rotate(-24deg); }
        }
        .ll-upper { transform-origin: 70px 94px; }
        .ll-arm-l { transform-origin: 52px 54px; }
        .ll-arm-r { transform-origin: 88px 54px; }
        .ll-leg-l { transform-origin: 60px 94px; }
        .ll-leg-r { transform-origin: 80px 94px; }
        .anim-neck-arm-stretch .ll-arm-l { animation: ll-stretch-arms 3s ease-in-out infinite; }
        .anim-neck-arm-stretch .ll-arm-r { animation: ll-stretch-arms-r 3s ease-in-out infinite; }
        .anim-arm-swings .ll-arm-l { animation: ll-swing-cross-l 2s ease-in-out infinite; }
        .anim-arm-swings .ll-arm-r { animation: ll-swing-cross-r 2s ease-in-out infinite; }
        .anim-arm-swings .ll-body { animation: ll-bounce 1s ease-in-out infinite; }
        .anim-chest-expansion .ll-arm-l { animation: ll-swing-cross-l 3.2s ease-in-out infinite; }
        .anim-chest-expansion .ll-arm-r { animation: ll-swing-cross-r 3.2s ease-in-out infinite; }
        .anim-side-bends .ll-upper { animation: ll-side-bend 3.4s ease-in-out infinite; }
        .anim-trunk-twists .ll-upper { animation: ll-twist 2.8s ease-in-out infinite; }
        .anim-leg-swings .ll-leg-l { animation: ll-leg-l 2.4s ease-in-out infinite; }
        .anim-leg-swings .ll-leg-r { animation: ll-leg-r 2.4s ease-in-out infinite; }
      `}</style>

      <div
        ref={containerRef}
        className={`w-full flex items-center justify-center [&_.exercise-figures]:flex [&_.exercise-figures]:flex-wrap [&_.exercise-figures]:gap-4 [&_.exercise-figures]:justify-center [&_svg]:w-40 [&_svg]:h-48 sm:[&_svg]:w-48 sm:[&_svg]:h-56 ${
          hasExternalPack ? '' : 'hidden'
        }`}
      />

      {!hasExternalPack && (
      <div
        className={`w-full grid place-items-center gap-4 ${
          viewList.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {viewList.map((view) => (
          <div key={view} className="flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 140 160"
              className={`w-36 h-40 sm:w-48 sm:h-52 stroke-slate-900 ${activeClass}`}
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label={`${stepName} (${view} view, ${variant})`}
            >
              {view === 'front' ? (
                <g className="ll-body">
                  <g className="ll-upper">
                    <circle cx="70" cy="28" r="12" />
                    <path d="M52 54 Q70 46 88 54 L84 94 L56 94 Z" />
                    <path className="ll-arm-l" d="M52 54 L36 86" />
                    <path className="ll-arm-r" d="M88 54 L104 86" />
                  </g>
                  {variant === 'chair' ? (
                    <>
                      <path className="ll-leg-l" d="M60 94 L48 112 L48 144" />
                      <path className="ll-leg-r" d="M80 94 L92 112 L92 144" />
                      <path d="M42 108 H98" className="stroke-slate-400" />
                    </>
                  ) : (
                    <>
                      <path className="ll-leg-l" d="M60 94 L54 146" />
                      <path className="ll-leg-r" d="M80 94 L86 146" />
                    </>
                  )}
                </g>
              ) : (
                <g className="ll-body">
                  <g className="ll-upper">
                    <circle cx="72" cy="28" r="12" />
                    <path d="M62 50 L78 52 L76 94 L60 94 Z" />
                    <path className="ll-arm-r" d="M74 54 L86 86" />
                  </g>
                  {variant === 'chair' ? (
                    <>
                      <path className="ll-leg-r" d="M68 94 L96 104 L96 144" />
                      <path d="M54 104 H86 M58 104 V144" className="stroke-slate-400" />
                    </>
                  ) : (
                    <>
                      <path className="ll-leg-l" d="M66 94 L62 146" />
                      <path className="ll-leg-r" d="M74 94 L80 146" />
                    </>
                  )}
                </g>
              )}
            </svg>
            <span className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">
              {view} view{isRestOrStatic ? ' · static' : ''}
            </span>
          </div>
        ))}
      </div>
      )}

      <div className="w-full flex flex-wrap justify-between items-center gap-2 mt-4 text-[11px] text-slate-400">
        <span>
          {CAST_LABELS[characterId]} · {variant === 'chair' ? 'Chair' : 'Standing'} ·{' '}
          {views === 'both' ? 'Front + Side' : views === 'side' ? 'Side' : 'Front'}
        </span>
        <span className="font-mono">{packLabel}</span>
      </div>
    </div>
  );
}
