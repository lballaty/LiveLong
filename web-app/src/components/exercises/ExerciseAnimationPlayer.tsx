// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/exercises/ExerciseAnimationPlayer.tsx
// Description: Thin React wrapper slot for the animation fleet's live SVG exercise-figures-runtime
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
  instructions?: string;
  animation?: StepAnimationRef;
  characterId: CastCharacterId;
  variant: ExerciseVariant;
  views: ExerciseViewMode;
  isPlaying: boolean;
  phase: 'warmup' | 'exercise' | 'rest' | 'cooldown';
}

/**
 * Host slot for `exercise-figures-runtime.js` + JSON exercise/character packs
 * delivered by the `animation` fleet into `public/animations/`.
 * Until a bundle is imported, renders a clean posture/cue preview aligned with the contract.
 */
export default function ExerciseAnimationPlayer({
  stepId,
  stepName,
  instructions,
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

  return (
    <div
      data-testid="exercise-animation-player"
      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 mb-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700">
          {CAST_LABELS[characterId]} · {variant === 'chair' ? 'Chair' : 'Standing'}
        </span>
        <span className="px-2 py-0.5 rounded bg-white border border-gray-200 font-mono">
          {packLabel}
        </span>
      </div>

      <div className={`grid gap-3 ${viewList.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {viewList.map((view) => (
          <div
            key={view}
            className="flex flex-col items-center justify-center rounded-lg bg-white border border-gray-200 p-4 min-h-[140px]"
          >
            <svg
              viewBox="0 0 120 120"
              className={`w-24 h-24 stroke-gray-800 ${
                isPlaying && !reducedMotion && phase === 'exercise' ? 'animate-pulse' : ''
              }`}
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label={`${stepName} (${view} view, ${variant})`}
            >
              {/* Minimal line-art figure placeholder matching animation fleet outline style */}
              <circle cx="60" cy="24" r="10" />
              <line x1="60" y1="34" x2="60" y2={variant === 'chair' ? '66' : '70'} />
              {view === 'front' ? (
                <>
                  <path d="M36 46 Q60 40 84 46" />
                  {variant === 'chair' ? (
                    <>
                      <path d="M60 66 L48 80 L48 102" />
                      <path d="M60 66 L72 80 L72 102" />
                      <path d="M38 76 H82 M42 76 V104 M78 76 V104" className="stroke-gray-400" />
                    </>
                  ) : (
                    <>
                      <line x1="60" y1="70" x2="48" y2="104" />
                      <line x1="60" y1="70" x2="72" y2="104" />
                    </>
                  )}
                </>
              ) : (
                <>
                  <path d="M60 44 L80 54" />
                  {variant === 'chair' ? (
                    <>
                      <path d="M60 66 L78 74 L78 102" />
                      <path d="M44 74 H76 M48 74 V104 M72 74 V104" className="stroke-gray-400" />
                    </>
                  ) : (
                    <>
                      <line x1="60" y1="70" x2="54" y2="104" />
                      <line x1="60" y1="70" x2="68" y2="104" />
                    </>
                  )}
                </>
              )}
            </svg>
            <span className="mt-1 text-[11px] uppercase tracking-wider text-gray-400">
              {view} view{reducedMotion ? ' · static' : ''}
            </span>
          </div>
        ))}
      </div>

      {instructions && (
        <p className="mt-3 text-sm text-center text-gray-700">{instructions}</p>
      )}
    </div>
  );
}
