import {act, cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useState} from 'react';
import {describe, it, expect, vi, afterEach, beforeEach} from 'vitest';
import {Button} from './Button';
import {Card} from './Card';
import {InputField, TextareaField, ScoreField} from './Field';
import {Dialog} from './Dialog';
import {Toast} from './Toast';
import {StatusBadge} from './StatusBadge';
import {Badge} from './Badge';
import {SegmentedControl} from './SegmentedControl';
import {OrbVisualizer} from './OrbVisualizer';

const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

describe('Primitives Test Suite', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalShowModal) {
      Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
    }
    if (originalClose) {
      Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    }
  });

  describe('Button', () => {
    it('renders all variants correctly', () => {
      const {rerender} = render(<Button variant="primary">Primary</Button>);
      expect(screen.getByRole('button', {name: /primary/i})).toHaveClass('primary-button');

      rerender(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button', {name: /secondary/i})).toHaveClass('secondary-button');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button', {name: /ghost/i})).toHaveClass('ghost-button');

      rerender(<Button variant="danger">Danger</Button>);
      expect(screen.getByRole('button', {name: /danger/i})).toHaveClass('danger-button');

      rerender(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button', {name: /link/i})).toBeDefined();

      rerender(<Button variant="icon" aria-label="Settings icon" icon={<span>⚙</span>} />);
      expect(screen.getByRole('button', {name: /settings icon/i})).toHaveClass('icon-button');
    });

    it('handles loading state with spinner and label preservation', () => {
      render(
        <Button loading loadingText="Saving reflection...">
          Save
        </Button>,
      );
      const btn = screen.getByRole('button', {name: /saving reflection/i});
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toHaveAttribute('type', 'button');
      expect(btn.querySelector('.animate-spin')).toBeDefined();
    });

    it('handles disabled state and prevents click', () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>,
      );
      const btn = screen.getByRole('button', {name: /disabled/i});
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Card', () => {
    it('renders non-interactive variants without clickable styling', () => {
      const {container, rerender} = render(
        <Card variant="surface-card">
          <p>Surface Content</p>
        </Card>,
      );
      expect(container.firstChild).not.toHaveClass('card-interactive');
      expect(screen.queryByRole('button')).toBeNull();

      rerender(
        <Card variant="glass-card">
          <p>Glass Content</p>
        </Card>,
      );
      expect(container.firstChild).toHaveClass('glass');

      rerender(
        <Card variant="insight-card">
          <p>Insight Content</p>
        </Card>,
      );
      expect(container.firstChild).toHaveClass('identity-gradient-border');

      rerender(
        <Card variant="danger-card">
          <p>Danger Content</p>
        </Card>,
      );
      expect(container.firstChild).toHaveClass('border-[var(--color-danger)]/30');
    });

    it('applies interactive styling and button role when interactive or clicked', () => {
      const onClick = vi.fn();
      const {container} = render(
        <Card interactive onClick={onClick}>
          <p>Interactive</p>
        </Card>,
      );
      expect(container.firstChild).toHaveClass('card-interactive');
      expect(screen.getByRole('button')).toBeDefined();
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();

      fireEvent.keyDown(screen.getByRole('button'), {key: 'Enter'});
      fireEvent.keyDown(screen.getByRole('button'), {key: ' '});
      fireEvent.keyUp(screen.getByRole('button'), {key: ' '});
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('does not activate an aria-disabled interactive card', () => {
      const onClick = vi.fn();
      render(
        <Card interactive onClick={onClick} aria-disabled="true">
          Disabled card
        </Card>,
      );
      const card = screen.getByRole('button', {name: /disabled card/i});
      fireEvent.click(card);
      fireEvent.keyDown(card, {key: 'Enter'});
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Field', () => {
    it('renders InputField with outside label, hint, and error linked via aria-describedby', () => {
      render(
        <InputField
          id="email-field"
          label="Email Address"
          hint="We will never share your email"
          error="Please enter a valid email"
          required
        />,
      );

      const input = screen.getByLabelText(/email address/i);
      expect(input).toBeDefined();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'email-field-hint email-field-error');
      expect(screen.getByText('We will never share your email')).toBeDefined();
      expect(screen.getByText('Please enter a valid email')).toBeDefined();
    });

    it('renders TextareaField with minimum 144px height and character counter', () => {
      render(
        <TextareaField
          id="reflection-input"
          label="Your Reflection"
          value="My thoughts..."
          maxLength={100}
          showCounter
          onChange={vi.fn()}
        />,
      );

      const textarea = screen.getByLabelText(/your reflection/i);
      expect(textarea).toHaveClass('min-h-[144px]');
      expect(textarea).toHaveClass('resize-y');
      expect(screen.getByText('14/100')).toBeDefined();
    });

    it('updates an uncontrolled TextareaField counter', () => {
      render(
        <TextareaField
          id="uncontrolled-reflection"
          label="Reflection"
          defaultValue="Start"
          maxLength={20}
          showCounter
        />,
      );

      expect(screen.getByText('5/20')).toBeDefined();
      fireEvent.change(screen.getByLabelText('Reflection'), {target: {value: 'Longer reflection'}});
      expect(screen.getByText('17/20')).toBeDefined();
    });

    it('renders ScoreField with 44px tap targets and arrow key navigation', () => {
      const onChange = vi.fn();

      function ScoreHarness() {
        const [value, setValue] = useState<number | string>(3);
        return (
          <ScoreField
            id="rating"
            label="Introspection Depth"
            value={value}
            min={1}
            max={5}
            required
            onChange={(nextValue) => {
              onChange(nextValue);
              setValue(nextValue);
            }}
          />
        );
      }

      render(<ScoreHarness />);

      const group = screen.getByRole('radiogroup', {name: /introspection depth/i});
      expect(group).toHaveAttribute('aria-required', 'true');

      const radio3 = screen.getByRole('radio', {name: /score 3 of 5/i});
      expect(radio3).toBeChecked();

      const radio4 = screen.getByRole('radio', {name: /score 4 of 5/i});
      fireEvent.click(radio4);
      expect(onChange).toHaveBeenCalledWith(4);
      expect(radio4).toBeChecked();

      fireEvent.keyDown(radio4, {key: 'ArrowRight'});
      const radio5 = screen.getByRole('radio', {name: /score 5 of 5/i});
      expect(onChange).toHaveBeenLastCalledWith(5);
      expect(radio5).toBeChecked();
      expect(radio5).toHaveFocus();

      fireEvent.keyDown(radio5, {key: 'Home'});
      expect(screen.getByRole('radio', {name: /score 1 of 5/i})).toBeChecked();
    });
  });

  describe('StatusBadge', () => {
    it('maps enum values to user-friendly labels and icons', () => {
      const {rerender} = render(<StatusBadge status="pending" />);
      expect(screen.getByText('In progress')).toBeDefined();
      expect(screen.queryByText('pending')).toBeNull();

      rerender(<StatusBadge status="completed" />);
      expect(screen.getByText('Ready')).toBeDefined();
      expect(screen.queryByText('completed')).toBeNull();

      rerender(<StatusBadge status="failed" />);
      expect(screen.getByText('Needs attention')).toBeDefined();
      expect(screen.queryByText('failed')).toBeNull();
    });
  });

  describe('Toast', () => {
    it('renders toast with the correct polite and assertive live-region roles', () => {
      const onDismiss = vi.fn();
      const {rerender} = render(
        <Toast
          toast={{id: '1', message: 'Analysis saved', type: 'success'}}
          onDismiss={onDismiss}
          duration={4000}
        />,
      );

      const toastContainer = screen.getByRole('status');
      expect(toastContainer).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('Analysis saved')).toBeDefined();

      rerender(
        <Toast
          toast={{id: '2', message: 'Failed to delete record', type: 'error'}}
          onDismiss={onDismiss}
        />,
      );
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('preserves remaining time while pointer and focus pauses overlap', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(
        <Toast
          toast={{id: 'pause', message: 'Analysis saved', type: 'success'}}
          onDismiss={onDismiss}
          duration={4000}
        />,
      );

      const toast = screen.getByRole('status');
      const closeButton = screen.getByRole('button', {name: /close notification/i});
      act(() => vi.advanceTimersByTime(1500));
      fireEvent.mouseEnter(toast);
      fireEvent.focus(closeButton);
      act(() => vi.advanceTimersByTime(6000));
      expect(onDismiss).not.toHaveBeenCalled();

      fireEvent.mouseLeave(toast);
      act(() => vi.advanceTimersByTime(6000));
      expect(onDismiss).not.toHaveBeenCalled();

      fireEvent.blur(closeButton, {relatedTarget: null});
      act(() => vi.advanceTimersByTime(2499));
      expect(onDismiss).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('enforces the four-second minimum auto-dismiss duration', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(
        <Toast toast={{id: 'minimum', message: 'Saved'}} onDismiss={onDismiss} duration={50} />,
      );

      act(() => vi.advanceTimersByTime(3999));
      expect(onDismiss).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1));
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it('dismisses manually via close button', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(
        <Toast toast={{id: '1', message: 'Export complete', type: 'info'}} onDismiss={onDismiss} />,
      );

      const closeBtn = screen.getByRole('button', {name: /close notification/i});
      fireEvent.click(closeBtn);
      act(() => vi.advanceTimersByTime(4000));
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });

  describe('Dialog', () => {
    it('opens natively, honors initial focus, handles Escape, and restores the trigger', async () => {
      function DialogHarness() {
        const [isOpen, setIsOpen] = useState(false);
        return (
          <>
            <button type="button" onClick={() => setIsOpen(true)}>
              Open dialog
            </button>
            <Dialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              title="Delete Reflection"
              description="This action cannot be undone."
              initialFocusSelector="[data-dialog-initial]"
            >
              <button type="button" data-dialog-initial>
                Cancel deletion
              </button>
            </Dialog>
          </>
        );
      }

      render(<DialogHarness />);
      const trigger = screen.getByRole('button', {name: /open dialog/i});
      trigger.focus();
      fireEvent.click(trigger);

      expect(screen.getByText('Delete Reflection')).toBeDefined();
      expect(screen.getByText('This action cannot be undone.')).toBeDefined();
      expect(screen.getByRole('dialog')).toHaveAttribute('open');
      const cancelButton = screen.getByRole('button', {name: /cancel deletion/i});
      expect(cancelButton).toHaveFocus();

      fireEvent.keyDown(cancelButton, {key: 'Tab'});
      const closeButton = screen.getByRole('button', {name: /close dialog/i});
      expect(closeButton).toHaveFocus();
      fireEvent.keyDown(closeButton, {key: 'Tab', shiftKey: true});
      expect(cancelButton).toHaveFocus();

      fireEvent(screen.getByRole('dialog'), new Event('cancel', {cancelable: true}));
      expect(screen.queryByRole('dialog')).toBeNull();
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  });

  describe('Badge, SegmentedControl, OrbVisualizer', () => {
    it('renders Badge with tones', () => {
      render(<Badge tone="success">Active</Badge>);
      expect(screen.getByText('Active')).toBeDefined();
    });

    it('renders SegmentedControl and handles selection', () => {
      const onChange = vi.fn();
      render(
        <SegmentedControl
          options={[
            {value: 'a', label: 'Option A'},
            {value: 'b', label: 'Option B'},
          ]}
          value="a"
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole('radio', {name: 'Option B'}));
      expect(onChange).toHaveBeenCalledWith('b');
    });

    it('renders OrbVisualizer with custom size', () => {
      const {container} = render(<OrbVisualizer size="sm" />);
      expect(container.firstChild).toBeDefined();
    });
  });
});
