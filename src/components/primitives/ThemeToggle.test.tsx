import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, beforeEach} from 'vitest';
import {ThemeToggle} from './ThemeToggle';
import {useThemeStore} from '@/store/useThemeStore';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    useThemeStore.setState({theme: 'dark', resolvedTheme: 'dark'});
  });

  it('renders icon toggle and toggles theme on click', () => {
    render(<ThemeToggle variant="icon" />);
    const toggleBtn = screen.getByRole('button', {name: /switch to light mode/i});
    expect(toggleBtn).toBeDefined();

    fireEvent.click(toggleBtn);
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });

  it('renders segmented theme selector with dark, light, system options', () => {
    render(<ThemeToggle variant="segmented" />);
    const darkRadio = screen.getByRole('radio', {name: /dark/i});
    const lightRadio = screen.getByRole('radio', {name: /light/i});
    const systemRadio = screen.getByRole('radio', {name: /system/i});

    expect(darkRadio).toBeDefined();
    expect(lightRadio).toBeDefined();
    expect(systemRadio).toBeDefined();

    fireEvent.click(lightRadio);
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

