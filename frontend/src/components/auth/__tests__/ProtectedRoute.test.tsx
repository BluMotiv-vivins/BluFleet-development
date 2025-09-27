import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import type { User } from '../../../types';

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'manager',
  permissions: ['dashboard:read', 'fleet:read'],
};

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute user={mockUser}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute user={null}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user has required permissions', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute user={mockUser} requiredPermissions={['dashboard:read']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized when user lacks required permissions', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute user={mockUser} requiredPermissions={['admin:read']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user has multiple required permissions', () => {
    render(
      <BrowserRouter>
        <ProtectedRoute user={mockUser} requiredPermissions={['dashboard:read', 'fleet:read']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when user is missing one of multiple required permissions', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute user={mockUser} requiredPermissions={['dashboard:read', 'admin:read']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});