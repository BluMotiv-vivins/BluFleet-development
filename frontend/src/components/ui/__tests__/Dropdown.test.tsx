import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dropdown from '../Dropdown';

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <div className={className} data-testid="mock-icon">Icon</div>
);

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3', disabled: true },
  { value: 'option4', label: 'Option 4', icon: MockIcon },
];

describe('Dropdown', () => {
  const defaultProps = {
    options: mockOptions,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder', () => {
    render(<Dropdown {...defaultProps} placeholder="Choose option" />);
    
    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Dropdown {...defaultProps} label="Select Option" />);
    
    expect(screen.getByText('Select Option')).toBeInTheDocument();
  });

  it('shows selected value', () => {
    render(<Dropdown {...defaultProps} value="option1" />);
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<Dropdown {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('calls onSelect when option is clicked', () => {
    const onSelect = vi.fn();
    render(<Dropdown {...defaultProps} onSelect={onSelect} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const option = screen.getByText('Option 1');
    fireEvent.click(option);
    
    expect(onSelect).toHaveBeenCalledWith('option1');
  });

  it('does not call onSelect for disabled options', () => {
    const onSelect = vi.fn();
    render(<Dropdown {...defaultProps} onSelect={onSelect} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const disabledOption = screen.getByText('Option 3');
    fireEvent.click(disabledOption);
    
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes dropdown after selection', () => {
    render(<Dropdown {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const option = screen.getByText('Option 1');
    fireEvent.click(option);
    
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<Dropdown {...defaultProps} />);
    
    const button = screen.getByRole('button');
    
    // Open with Enter
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    // Navigate with Arrow Down
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    
    // Close with Escape
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows search input when searchable', () => {
    render(<Dropdown {...defaultProps} searchable />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByPlaceholderText('Search options...')).toBeInTheDocument();
  });

  it('filters options when searching', () => {
    render(<Dropdown {...defaultProps} searchable />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search options...');
    fireEvent.change(searchInput, { target: { value: 'Option 1' } });
    
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
  });

  it('shows "No options found" when search yields no results', () => {
    render(<Dropdown {...defaultProps} searchable />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText('Search options...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText('No options found')).toBeInTheDocument();
  });

  it('renders option icons', () => {
    render(<Dropdown {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('shows selected option icon in button', () => {
    render(<Dropdown {...defaultProps} value="option4" />);
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Dropdown {...defaultProps} error="This field is required" />);
    
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Dropdown {...defaultProps} disabled />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('closes when clicking outside', () => {
    render(<Dropdown {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Dropdown {...defaultProps} label="Test Dropdown" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});