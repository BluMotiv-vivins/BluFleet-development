import { Router } from 'express';
import userManagementService, { CreateUserRequest, UpdateUserRequest, UserRole, UserStatus } from '../services/userManagementService';
import { authenticate } from '../middleware/auth';

const router = Router();

// Login endpoint for user management system
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const result = await userManagementService.login(username, password);
    if (!result) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    return res.json(result);
  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
});

// Middleware to check admin permissions
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin' && !req.user?.permissions?.includes('*')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check user management permissions
const requireUserPermissions = (req: any, res: any, next: any) => {
  const hasPermission = req.user?.role === 'admin' || 
                       req.user?.permissions?.includes('*') ||
                       req.user?.permissions?.includes('users.read') ||
                       req.user?.permissions?.includes('users.write');
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Get all users
router.get('/', authenticate, requireUserPermissions, async (req, res) => {
  try {
    const users = await userManagementService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticate, requireUserPermissions, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userManagementService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const userData: CreateUserRequest = req.body;
    
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (userData.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Set default role if not provided
    if (!userData.role) {
      userData.role = UserRole.VIEWER;
    }

    const newUser = await userManagementService.createUser(userData);
    return res.status(201).json(newUser);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.message === 'Email already exists' || error.message === 'Username already exists') {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates: UpdateUserRequest = req.body;
    
    // Validate email format if provided
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    const updatedUser = await userManagementService.updateUser(id, updates);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await userManagementService.deleteUser(id);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    if (error.message === 'Cannot delete system administrator') {
      return res.status(403).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user status
router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!Object.values(UserStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updatedUser = await userManagementService.updateUserStatus(id, status);
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Change password (for current user)
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }
    
    const success = await userManagementService.changePassword(userId, currentPassword, newPassword);
    
    if (!success) {
      return res.status(400).json({ error: 'Invalid current password or user not found' });
    }
    
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Reset password (admin only)
router.post('/:id/reset-password', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    const success = await userManagementService.resetPassword(id, newPassword);
    
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const stats = await userManagementService.getUserStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get current user profile
router.get('/profile/me', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await userManagementService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
