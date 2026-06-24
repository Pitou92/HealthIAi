import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HintRow } from './hint-row';

// Mock the hook to return a predictable theme
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    text: '#000000',
    backgroundSelected: '#dddddd',
    textSecondary: '#666666',
  }),
}));

describe('HintRow', () => {
  it('renders with default props', async () => {
    await render(<HintRow />);
    expect(screen.getByText('Try editing')).toBeTruthy();
    expect(screen.getByText('app/index.tsx')).toBeTruthy();
  });

  it('renders with custom props', async () => {
    await render(<HintRow title="Custom Title" hint="Custom Hint" />);
    expect(screen.getByText('Custom Title')).toBeTruthy();
    expect(screen.getByText('Custom Hint')).toBeTruthy();
  });
});
