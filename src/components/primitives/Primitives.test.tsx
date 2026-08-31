import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import {describe, it, expect, vi, afterEach} from 'vitest';
import {Button} from './Button';
import {Badge} from './Badge';
import {Dialog} from './Dialog';
import {Toast} from './Toast';
import {SegmentedControl} from './SegmentedControl';
import {OrbVisualizer} from './OrbVisualizer';

describe('Primitives', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Button with variants and handles click', () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Click me
      </Button>,
    );
    const btn = screen.getByRole('button', {name: /click me/i});
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders Button in loading state', () => {
    render(<Button loading>Submit</Button>);
    const btn = screen.getByRole('button', {name: /submit/i});
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.animate-spin')).toBeDefined();
  });

  it('renders Badges with correct tones', () => {
    const {rerender} = render(<Badge tone="success">Active</Badge>);
    expect(screen.getByText('Active')).toBeDefined();

    rerender(<Badge tone="warning">Pending</Badge>);
    expect(screen.getByText('Pending')).toBeDefined();

    rerender(<Badge tone="danger">Failed</Badge>);
    expect(screen.getByText('Failed')).toBeDefined();

    rerender(<Badge tone="demo">Demo</Badge>);
    expect(screen.getByText('Demo')).toBeDefined();
  });

  it('renders Dialog when open and closes on close button click', () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} title="Test Dialog">
        <div>Modal Content</div>
      </Dialog>,
    );

    expect(screen.getByText('Modal Content')).toBeDefined();
    const closeBtn = screen.getByRole('button', {name: /close dialog/i});
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders Toast notification', () => {
    const onDismiss = vi.fn();
    render(
      <Toast
        toast={{id: '1', message: 'Success message', type: 'success'}}
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText('Success message')).toBeDefined();
  });

  it('renders SegmentedControl and handles selection', () => {
    const onChange = vi.fn();
    const options = [
      {value: 'a', label: 'Option A'},
      {value: 'b', label: 'Option B'},
    ];
    render(<SegmentedControl options={options} value="a" onChange={onChange} />);
    const optB = screen.getByRole('radio', {name: 'Option B'});
    fireEvent.click(optB);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('renders OrbVisualizer with custom size', () => {
    const {container} = render(<OrbVisualizer size="sm" />);
    expect(container.firstChild).toBeDefined();
  });
});
