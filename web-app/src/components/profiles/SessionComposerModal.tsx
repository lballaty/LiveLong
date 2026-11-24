// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/SessionComposerModal.tsx
// Description: Modal composer for creating and editing multi-routine SessionPlans
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2026-11-23

'use client';

import React, { useState } from 'react';
import { SessionPlan, SessionPlanItem, UnifiedProfile } from '@/types/unified-profile.types';
import IconPicker, { formatIconForSelect } from './IconPicker';

interface SessionComposerModalProps {
  plan?: SessionPlan;
  availableProfiles: UnifiedProfile[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    icon: string;
    items: SessionPlanItem[];
  }) => void;
}

export default function SessionComposerModal({
  plan,
  availableProfiles,
  onClose,
  onSave,
}: SessionComposerModalProps) {
  const [name, setName] = useState(plan?.name || 'Morning Longevity Session');
  const [description, setDescription] = useState(
    plan?.description || 'Ordered sequence of movement, breathing, and focus'
  );
  const [icon, setIcon] = useState(plan?.icon || '🗓️');
  const [items, setItems] = useState<SessionPlanItem[]>(
    plan?.items?.length
      ? plan.items
      : availableProfiles.length > 0
      ? [{ id: `item-${Date.now()}`, profileId: availableProfiles[0].id }]
      : []
  );

  const addRoutine = (profileId: string) => {
    setItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}-${prev.length}`, profileId },
    ]);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    setItems(copy);
  };

  const totalMinutes = Math.round(
    items.reduce((sum, item) => {
      const p = availableProfiles.find((prof) => prof.id === item.profileId);
      return sum + (p ? p.totalDurationSeconds : 0);
    }, 0) / 60
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    onSave({ name, description, icon, items });
    onClose();
  };

  return (
    <div
      data-testid="session-composer-modal"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            {plan ? `Edit Session: ${plan.name}` : 'Compose Multi-Routine Session'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 px-2 py-1"
            aria-label="Close session composer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Session Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <IconPicker
                value={icon}
                onChange={setIcon}
                presets={['🗓️', '🌅', '🧘', '⚡', '🌿', '🎯', '🏃', '🌟']}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                Routine Sequence ({items.length} items • ~{totalMinutes} min)
              </span>
              {availableProfiles.length > 0 && (
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addRoutine(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2.5 py-1 border border-slate-300 rounded text-xs bg-white"
                  aria-label="Add routine to session"
                >
                  <option value="">+ Add Routine...</option>
                  {availableProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {formatIconForSelect(p.icon)} {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-lg"
                >
                  <span className="text-xs font-semibold text-slate-400 w-5">{idx + 1}.</span>
                  <select
                    value={item.profileId}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, profileId: e.target.value } : it))
                      )
                    }
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm bg-white"
                  >
                    {availableProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icon} {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      className="px-1.5 py-0.5 text-xs bg-slate-100 rounded disabled:opacity-40"
                      aria-label="Move routine up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="px-1.5 py-0.5 text-xs bg-slate-100 rounded disabled:opacity-40"
                      aria-label="Move routine down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      disabled={items.length <= 1}
                      className="px-1.5 py-0.5 text-xs text-red-600 bg-red-50 rounded disabled:opacity-40"
                      aria-label="Remove routine from session"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="save-session-plan-button"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
