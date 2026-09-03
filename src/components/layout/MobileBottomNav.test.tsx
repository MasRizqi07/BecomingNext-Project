import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {MobileBottomNav} from './MobileBottomNav';

describe('MobileBottomNav', () => {
  it('targets the real protocols section and reserves device safe-area space', () => {
    const onSelectSection = vi.fn();
    render(<MobileBottomNav activeSection="protocols" onSelectSection={onSelectSection} />);

    fireEvent.click(screen.getByRole('button', {name: 'Plan'}));

    expect(onSelectSection).toHaveBeenCalledWith('protocols');
    expect(screen.getByRole('navigation', {name: /mobile section navigation/i})).toHaveClass(
      'pb-[calc(0.625rem+env(safe-area-inset-bottom))]',
    );
  });
});
