import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import AppLayout from '../AppLayout';
import uiSlice from '../../../store/slices/uiSlice';
import type { User, AppNotification } from '../../../types';

// Mock the child components
vi.mock('../Header', () => ({
  default: ({ onSidebarToggle }: { onSidebarToggle?: () => void }) => (
    <div data-testid="mock-header">
      <button onClick={onSidebarToggle} data-testid="sidebar-toggle">
        Toggle Sidebar
      </button>
    </div>
  ),
}));

vi.mock('../Sidebar', () => ({
  default: ({ isOpen, onToggle }: { isOpen?: boolean; onToggle?: () => void }) => (
    <div data-testid="mock-sidebar" data-open={isOpen}>
      <button onClick={onToggle} data-testid="sidebar-close">
        Close Sidebar
      </button>
    </div>
  ),
}));

const mockStore = configureStore({
  reducer: {
    ui: uiSlice,
  },
  preloadedState: {
    ui: {
      sidebarCollapsed: false,
      activeRoute: '/',
      theme: 'light',
    },
  },
});

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  avatar: 'avatar.jpg',
};

const mockNotifications: AppNotification[] = [];

const renderAppLayout = (props = {}) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <AppLayout
          user={mockUser}
          notifications={mockNotifications}
          {...props}
        >
          <div data-testid="main-content">Main Content</div>
        </AppLayout>
      </BrowserRouter>
    </Provider>
  );
};

describe('AppLayout Accessibility', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('has proper semantic structure', () => {
    renderAppLayout();
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Main content');
  });

  it('provides skip to main content link', () => {
    renderAppLayout();
    
    const skipLink = screen.getByRole('button', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass('skip-link');
  });

  it('focuses main content when skip link is activated', () => {
    renderAppLayout();
    
    const skipLink = screen.getByRole('button', { name: /skip to main content/i });
    const mainContent = screen.getByRole('main');
    
    fireEvent.click(skipLink);
    
    expect(mainContent).toHaveFocus();
  });

  it('has live region for screen readers', () => {
    renderAppLayout();
    
    const liveRegion = document.getElementById('live-region');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion).toHaveClass('sr-only');
  });

  it('handles mobile responsive behavior', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    renderAppLayout();
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      const mainContent = screen.getByRole('main');
      expect(mainContent.parentElement).toHaveClass('ml-0');
    });
  });

  it('shows loading state with proper accessibility', () => {
    renderAppLayout({ loading: true });
    
    const loadingSpinner = screen.getByRole('status');
    expect(loadingSpinner).toBeInTheDocument();
    
    // Main content should not be visible when loading
    expect(screen.queryByTestId('main-content')).not.toBeInTheDocument();
  });

  it('handles sidebar overlay on mobile', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    renderAppLayout();
    
    // Trigger resize to activate mobile mode
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      // Should not show overlay initially
      expect(screen.queryByRole('button', { name: /close sidebar/i })).not.toBeInTheDocument();
    });
  });

  it('maintains focus management', () => {
    renderAppLayout();
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('tabIndex', '-1');
  });

  it('has proper ARIA attributes', () => {
    renderAppLayout();
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('id', 'main-content');
    expect(mainContent).toHaveAttribute('role', 'main');
    expect(mainContent).toHaveAttribute('aria-label', 'Main content');
  });

  it('animates content with fade-in', () => {
    renderAppLayout();
    
    const contentWrapper = screen.getByTestId('main-content').parentElement;
    expect(contentWrapper).toHaveClass('animate-fade-in');
  });
});