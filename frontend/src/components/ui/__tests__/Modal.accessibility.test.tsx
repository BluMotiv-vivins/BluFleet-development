import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Modal from '../Modal';

describe('Modal Accessibility', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('has proper ARIA attributes', () => {
    render(<Modal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('supports aria-describedby', () => {
    render(
      <Modal {...defaultProps} aria-describedby="modal-description">
        <p id="modal-description">This is a description</p>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
  });

  it('traps focus within modal', async () => {
    const user = userEvent.setup();
    
    render(
      <Modal {...defaultProps}>
        <button>First button</button>
        <button>Second button</button>
        <button>Third button</button>
      </Modal>
    );
    
    const firstButton = screen.getByText('First button');
    const thirdButton = screen.getByText('Third button');
    const closeButton = screen.getByLabelText('Close modal');
    
    // Focus should start on first focusable element
    await waitFor(() => {
      expect(firstButton).toHaveFocus();
    });
    
    // Tab to last element
    await user.tab();
    await user.tab();
    await user.tab();
    expect(closeButton).toHaveFocus();
    
    // Tab should wrap to first element
    await user.tab();
    expect(firstButton).toHaveFocus();
    
    // Shift+Tab should go to last element
    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on Escape when disabled', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />);
    
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on overlay click when disabled', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when clicking modal content', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const modalContent = screen.getByText('Modal content');
    fireEvent.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('restores focus to previous element when closed', async () => {
    const TriggerButton = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      
      return (
        <>
          <button onClick={() => setIsOpen(true)}>Open Modal</button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test">
            <button>Modal button</button>
          </Modal>
        </>
      );
    };
    
    render(<TriggerButton />);
    
    const triggerButton = screen.getByText('Open Modal');
    
    // Focus and open modal
    triggerButton.focus();
    fireEvent.click(triggerButton);
    
    // Modal should be open and focus should move
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close modal
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    // Focus should return to trigger button
    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });

  it('prevents body scroll when open', () => {
    render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.paddingRight).toBe('0px');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.paddingRight).toBe('');
  });

  it('has proper heading structure', () => {
    render(<Modal {...defaultProps} title="Modal Title" />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Modal Title');
    expect(heading).toHaveAttribute('id', 'modal-title');
  });

  it('supports different sizes with proper responsive classes', () => {
    const { rerender } = render(<Modal {...defaultProps} size="sm" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md');
    
    rerender(<Modal {...defaultProps} size="lg" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
    
    rerender(<Modal {...defaultProps} size="full" />);
    expect(screen.getByRole('dialog')).toHaveClass('max-w-full', 'h-full');
  });

  it('has close button with proper accessibility', () => {
    render(<Modal {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toHaveAttribute('type', 'button');
    expect(closeButton).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('can hide close button', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('animates properly with accessibility considerations', () => {
    render(<Modal {...defaultProps} />);
    
    const modalContainer = screen.getByRole('dialog').parentElement;
    expect(modalContainer).toHaveClass('animate-fade-in');
    
    const modalPanel = screen.getByRole('dialog');
    expect(modalPanel).toHaveClass('animate-slide-in');
  });

  it('handles disabled focusable elements correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Modal {...defaultProps}>
        <button>Enabled button</button>
        <button disabled>Disabled button</button>
        <input type="text" />
        <input type="text" disabled />
      </Modal>
    );
    
    // Should skip disabled elements in focus trap
    const enabledButton = screen.getByText('Enabled button');
    const textInput = screen.getByDisplayValue('');
    
    await waitFor(() => {
      expect(enabledButton).toHaveFocus();
    });
    
    await user.tab();
    expect(textInput).toHaveFocus();
  });

  it('supports custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal-class" />);
    
    const modal = screen.getByRole('dialog');
    expect(modal).toHaveClass('custom-modal-class');
  });
});