import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with default variant correctly', async () => {
    await render(<Badge label="Default Badge" />);
    expect(screen.getByText('Default Badge')).toBeTruthy();
  });

  it('renders with secondary variant correctly', async () => {
    await render(<Badge label="Secondary Badge" variant="secondary" />);
    expect(screen.getByText('Secondary Badge')).toBeTruthy();
  });

  it('renders with custom className', async () => {
    await render(<Badge label="Custom Badge" className="mt-4" />);
    expect(screen.getByText('Custom Badge')).toBeTruthy();
  });
});
