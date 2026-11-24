// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/components/profiles/__tests__/IconPicker.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IconPicker, { RoutineIcon, formatIconForSelect } from '../IconPicker';

describe('IconPicker & RoutineIcon', () => {
  it('renders preset emojis and selects clicked emoji', () => {
    const onChange = jest.fn();
    render(<IconPicker value="⏱️" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '🌿' }));
    expect(onChange).toHaveBeenCalledWith('🌿');
    expect(screen.getByTestId('icon-import-button')).toBeTruthy();
  });

  it('renders imported data URL icons as img and formats select labels safely', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const { container } = render(<RoutineIcon icon={dataUrl} />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('src')).toBe(dataUrl);
    expect(formatIconForSelect(dataUrl)).toBe('🖼️');
    expect(formatIconForSelect('📻')).toBe('📻');
  });
});
