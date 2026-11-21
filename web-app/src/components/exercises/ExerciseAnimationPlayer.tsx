// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/exercises/ExerciseAnimationPlayer.tsx
// Description: Full-stage React wrapper slot for the animation fleet's live SVG exercise-figures-runtime
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-21

'use client';

import React, { useEffect, useState } from 'react';
import {
  CastCharacterId,
  ExerciseVariant,
  ExerciseViewMode,
  StepAnimationRef,
} from '@/types/unified-profile.types';

export const CAST_LABELS: Record<CastCharacterId, string> = {
  'm25-athletic': 'Man ~25 (Athletic)',
  'f30-slim': 'Woman ~30 (Slim)',
  'm50-heavier': 'Man ~50 (Heavier)',
  'f50-fuller': 'Woman ~50 (Fuller)',
  'f72-stooped': 'Woman ~72 (Gentle Stoop)',
  'm75-slim': 'Man ~75 (Slim)',
};

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
  const isRestOrStatic = phase === 'rest' || phase === 'cooldown' || !isPlaying || reducedMotion;

  return (
    <div
      data-testid="exercise-animation-player"
      className={`relative flex flex-col items-center justify-center p-4 sm:p-6 min-h-[220px] sm:min-h-[340px] transition-colors ${
        phase === 'rest' || phase === 'cooldown' ? 'bg-amber-50/70' : 'bg-white'
      }`}
    >
      <div
        className={`w-full grid place-items-center gap-4 ${
          viewList.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {viewList.map((view) => (
          <div key={view} className="flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 140 160"
              className={`w-36 h-40 sm:w-48 sm:h-52 stroke-slate-900 ${
                !isRestOrStatic ? 'animate-pulse' : ''
              }`}
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label={`${stepName} (${view} view, ${variant})`}
            >
              <circle cx="70" cy="28" r="12" />
              {view === 'front' ? (
                <>
                  <path d="M52 54 Q70 46 88 54 L84 94 L56 94 Z" />
                  <path
                    d={
                      isRestOrStatic
                        ? 'M52 54 L40 90 M88 54 L100 90'
                        : 'M52 54 Q30 34 38 18 M88 54 Q110 34 102 18'
                    }
                  />
                  {variant === 'chair' ? (
                    <>
                      <path d="M60 94 L48 112 L48 144 M80 94 L92 112 L92 144" />
                      <path d="M42 108 H98" className="stroke-slate-400" />
                    </>
                  ) : (
                    <path d="M60 94 L54 146 M80 94 L86 146" />
                  )}
                </>
              ) : (
                <>
                  <path d="M62 50 L78 52 L76 94 L60 94 Z" />
                  <path d={isRestOrStatic ? 'M70 54 L68 92' : 'M74 54 Q96 36 86 18'} />
                  {variant === 'chair' ? (
                    <>
                      <path d="M68 94 L96 104 L96 144" />
                      <path d="M54 104 H86 M58 104 V144" className="stroke-slate-400" />
                    </>
                  ) : (
                    <path d="M66 94 L62 146 M74 94 L80 146" />
                  )}
                </>
              )}
            </svg>
            <span className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">
              {view} view{isRestOrStatic ? ' · static' : ''}
            </span>
          </div>
        ))}
      </div>

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
