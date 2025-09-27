import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import UserProfileDropdown from '../UserProfileDropdown';
import type { User } from '../../../types';

const mockUser: User = {
  id: '1',
  name: 'John Fleet Manager',
  email: 'john@fleetvolt.com',
  role: 'manager',
  permissions: ['dashboard:read', 'fleet:read', 'energy:read'],
  avatar: undefined,
};

const mockUserWithAvatar: User = {
  ...mockUser,
  avatar: 'https://example.com/avatar.jpg',
};

describe('UserProfileDropdown', () => {
  it('renders user information correctly', () => {
    render(<UserProfileDropdown user={mockUser} />);
    
    expect(screen.getByText('John Fleet Manager')).toBeInTheDocument();
    expect(screen.getByText('john@fleetvolt.com')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
  });

  it('displays user initials when no avatar provided', () => {
    render(<UserProfileDropdown user={mockUser} />);
    
    expect(screen.getByText('JF')).toBeInTheDocument();
  });

  it('displays avatar image when provided', () => {
    render(<UserProfileDropdown user={mockUserWithAvatar} />);
    
    const avatarImage = screen.getByAltText('John Fleet Manager');
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('opens dropdown menu when clicked', async () => {
    render(<UserProfileDropdown user={mockUser} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Account Preferences')).toBeInTheDocument();
      expect(screen.getByText('Security & Privacy')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(<UserProfileDropdown user={mockUser} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();
    });
  });

  it('calls onProfileClick when profile settings clicked', async () => {
    const mockOnProfileClick = vi.fn();
    render(<UserProfileDropdown user={mockUser} onProfileClick={mockOnProfileClick} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      const profileButton = screen.getByText('Profile Settings');
      fireEvent.click(profileButton);
    });
    
    expect(mockOnProfileClick).toHaveBeenCalledTimes(1);
  });

  it('calls onSettingsClick when account preferences clicked', async () => {
    const mockOnSettingsClick = vi.fn();
    render(<UserProfileDropdown user={mockUser} onSettingsClick={mockOnSettingsClick} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      const settingsButton = screen.getByText('Account Preferences');
      fireEvent.click(settingsButton);
    });
    
    expect(mockOnSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('calls onSignOut when sign out clicked', async () => {
    const mockOnSignOut = vi.fn();
    render(<UserProfileDropdown user={mockUser} onSignOut={mockOnSignOut} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
    });
    
    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });

  it('displays role with correct styling', () => {
    const adminUser: User = { ...mockUser, role: 'admin' };
    render(<UserProfileDropdown user={adminUser} />);
    
    const roleElement = screen.getByText('admin');
    expect(roleElement).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('displays permissions when available', async () => {
    render(<UserProfileDropdown user={mockUser} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('Permissions:')).toBeInTheDocument();
      expect(screen.getByText('dashboard:read')).toBeInTheDocument();
      expect(screen.getByText('fleet:read')).toBeInTheDocument();
      expect(screen.getByText('energy:read')).toBeInTheDocument();
    });
  });

  it('shows truncated permissions when more than 3', async () => {
    const userWithManyPermissions: User = {
      ...mockUser,
      permissions: ['perm1', 'perm2', 'perm3', 'perm4', 'perm5'],
    };
    
    render(<UserProfileDropdown user={userWithManyPermissions} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });
  });

  it('handles user with single name correctly', () => {
    const singleNameUser: User = { ...mockUser, name: 'John' };
    render(<UserProfileDropdown user={singleNameUser} />);
    
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('rotates chevron icon when dropdown is open', async () => {
    render(<UserProfileDropdown user={mockUser} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    const chevronIcon = userButton.querySelector('svg');
    
    expect(chevronIcon).not.toHaveClass('rotate-180');
    
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(chevronIcon).toHaveClass('rotate-180');
    });
  });

  it('closes dropdown after menu item click', async () => {
    const mockOnProfileClick = vi.fn();
    render(<UserProfileDropdown user={mockUser} onProfileClick={mockOnProfileClick} />);
    
    const userButton = screen.getByLabelText('User menu for John Fleet Manager');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      const profileButton = screen.getByText('Profile Settings');
      fireEvent.click(profileButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();
    });
  });
});