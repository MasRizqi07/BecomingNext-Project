import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {PrivacyBoundaries} from './PrivacyBoundaries';

describe('PrivacyBoundaries Component', () => {
  it('renders privacy sections and navigation', () => {
    render(
      <MemoryRouter>
        <PrivacyBoundaries />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /privacy & ai boundaries/i})).toBeDefined();
    expect(screen.getByText(/01\. Privacy at the Core/i)).toBeDefined();
    expect(screen.getByText(/02\. Technical Architecture/i)).toBeDefined();
    expect(screen.getByText(/03\. AI Integrity & Processing/i)).toBeDefined();
  });
});
