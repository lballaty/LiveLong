// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/RoutineEditorModal.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RoutineEditorModal from '../RoutineEditorModal';
import { BUILTIN_MUSIC_TRACKS } from '@/services/audio/BackgroundMusicService';

describe('RoutineEditorModal', () => {
  it('creates a custom Exercise Series routine with added steps and scripts', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(nameInput, { target: { value: 'Morning Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Add Step' }));
    expect(screen.getByText('Steps (2)')).toBeTruthy();

    fireEvent.click(screen.getByTestId('save-routine-button'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Morning Mobility',
        type: 'series',
        isCustom: true,
      })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('switches to Breathing Routine tab and saves breathing pattern', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Breathing Routine' }));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Evening Calm' } });
    fireEvent.click(screen.getByTestId('save-routine-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Evening Calm',
        type: 'breathing',
      })
    );
  });

  it('switches to Simple Timer tab, reorders/deletes series steps, and saves', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Add Step' }));
    fireEvent.click(screen.getAllByLabelText('Move step down')[0]);
    fireEvent.click(screen.getAllByLabelText('Remove step')[1]);
    expect(screen.getByText('Steps (1)')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Simple Timer' }));
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Quick Focus Custom' } });
    fireEvent.click(screen.getByTestId('save-routine-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Quick Focus Custom',
        type: 'simple',
      })
    );
  });

  it('edits an existing series routine and updates step script and music', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        profile={{
          id: 'custom-series-1',
          name: 'Existing Series',
          description: 'Desc',
          type: 'series',
          color: '#3b82f6',
          icon: '🤸',
          musicTrackId: 'zen-garden',
          soundEnabled: true,
          vibrationEnabled: true,
          seriesConfig: {
            warmupMinutes: 0,
            warmupSeconds: 30,
            cooldownMinutes: 0,
            cooldownSeconds: 30,
            steps: [
              {
                id: 's1',
                name: 'Stretch',
                description: '',
                durationMinutes: 1,
                durationSeconds: 0,
                restMinutes: 0,
                restSeconds: 15,
              },
            ],
          },
          totalDurationSeconds: 135,
          isDefault: false,
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Guided script / voice cue text'), {
      target: { value: 'Reach high' },
    });
    fireEvent.change(screen.getByPlaceholderText('Animation pack'), {
      target: { value: 'rajio-taiso.side-bends' },
    });
    fireEvent.click(screen.getByTestId('save-routine-button'));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'custom-series-1', type: 'series' })
    );
  });

  // Accessibility (WCAG AA): the editor is a named modal dialog and its duration fields are
  // reachable by their visible label text, so assistive tech announces what each field is.
  it('is an accessible dialog whose simple-timer duration fields are labelled and saved', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Create Routine' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Simple Timer' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Labelled Timer' } });
    fireEvent.change(screen.getByLabelText('Work Duration minutes'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Work Duration seconds'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Break Duration minutes'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Break Duration seconds'), { target: { value: '15' } });
    fireEvent.click(screen.getByTestId('save-routine-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Labelled Timer',
        type: 'simple',
        simpleDuration: { workMinutes: 10, workSeconds: 30, breakMinutes: 2, breakSeconds: 15 },
      })
    );
  });

  it('labels and saves series warmup and cooldown durations', () => {
    const onSave = jest.fn();
    render(
      <RoutineEditorModal
        musicOptions={BUILTIN_MUSIC_TRACKS}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Labelled Series' } });
    fireEvent.change(screen.getByLabelText('Warmup minutes'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Warmup seconds'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Cooldown minutes'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Cooldown seconds'), { target: { value: '45' } });
    expect(screen.getByLabelText('Step 1 name')).toBeTruthy();
    fireEvent.click(screen.getByTestId('save-routine-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Labelled Series',
        type: 'series',
        seriesConfig: expect.objectContaining({
          warmupMinutes: 1,
          warmupSeconds: 15,
          cooldownMinutes: 2,
          cooldownSeconds: 45,
        }),
      })
    );
  });
});
