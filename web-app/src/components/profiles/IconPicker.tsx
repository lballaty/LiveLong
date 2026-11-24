// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/IconPicker.tsx
// Description: Reusable emoji + custom image icon picker and safe renderer
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-24

'use client';

import React, { useRef } from 'react';

export function isImageIcon(icon?: string): boolean {
  return Boolean(icon && (icon.startsWith('data:image/') || icon.startsWith('/')));
}

export function formatIconForSelect(icon?: string): string {
  if (!icon) return '⏱️';
  return isImageIcon(icon) ? '🖼️' : icon;
}

export function RoutineIcon({
  icon,
  className = 'text-2xl',
  imgClassName = 'w-7 h-7 object-contain rounded',
}: {
  icon?: string;
  className?: string;
  imgClassName?: string;
}) {
  if (isImageIcon(icon)) {
    return <img src={icon} alt="" className={imgClassName} />;
  }
  return <span className={className}>{icon || '⏱️'}</span>;
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  presets?: string[];
  label?: string;
}

const DEFAULT_PRESETS = ['⏱️', '🤸', '🫁', '🧘', '📚', '💻', '🎯', '🔥', '🌿', '🌟'];

export default function IconPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  label = 'Icon',
}: IconPickerProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          {isImageIcon(value) && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <RoutineIcon icon={value} imgClassName="w-4 h-4 object-contain rounded" />
              Custom
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="icon-import-input"
          />
          <button
            type="button"
            data-testid="icon-import-button"
            onClick={() => fileRef.current?.click()}
            className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded"
          >
            + Import Icon
          </button>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {presets.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`text-xl p-1.5 rounded-lg ${
              value === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-slate-100'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
