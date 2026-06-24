import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from './themed-text';

// Mock the hook to return a predictable theme
jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({
    text: '#000000',
    background: '#ffffff',
    tint: '#2f95dc',
    icon: '#000000',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
  }),
}));

describe('ThemedText', () => {
  it('renders default text correctly', async () => {
    await render(<ThemedText>Hello World</ThemedText>);
    const textElement = screen.getByText('Hello World');
    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#000000' }),
      ])
    );
  });

  it('renders title text correctly', async () => {
    await render(<ThemedText type="title">Title Text</ThemedText>);
    const textElement = screen.getByText('Title Text');
    expect(textElement).toBeTruthy();
  });

  it('renders code text correctly', async () => {
    await render(<ThemedText type="code">Code Text</ThemedText>);
    const textElement = screen.getByText('Code Text');
    expect(textElement).toBeTruthy();
  });
});
