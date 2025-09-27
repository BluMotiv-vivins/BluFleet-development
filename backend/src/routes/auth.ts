// Authentication Routes for BluFleet Backend
// Version: 1.0.0

import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { BaseController } from '../controllers/BaseController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AppError, UnauthorizedError } from '../utils/errors';
import { loggers } from '../utils/logger';
import database from '../utils/database';

class AuthController extends BaseController {
  // Login endpoint
  login = asyncHandler(async (req, res) => {
    this.validateRequest(req);

    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });

    // Query user from database
    const userQuery = `
      SELECT id, organization_id, email, password_hash, first_name, last_name, role, permissions
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const userResult = await database.query(userQuery, [email]);
    const user = userResult.rows[0];
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found for email:', email);
      loggers.logAuth('login_failed', undefined, email, false, 'User not found');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    console.log('Comparing password with hash...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Password comparison failed');
      loggers.logAuth('login_failed', user.id, email, false, 'Invalid password');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'CONFIGURATION_ERROR');
    }

    const tokenPayload = {
      id: user.id,
      organizationId: user.organization_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || ['*'] // Default to all permissions for admin
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '24h' });
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    loggers.logAuth('login_success', user.id, email, true);

    const response = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        permissions: user.permissions || ['*']
      },
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    };

    this.sendSuccess(res, response, 'Login successful');
  });

  // Get current user
  getCurrentUser = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);

    // TODO: Fetch full user data from database
    const userData = {
      id: userContext.userId,
      organizationId: userContext.organizationId,
      email: (req as any).user.email,
      firstName: 'John',
      lastName: 'User',
      role: userContext.role,
      permissions: userContext.permissions,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    this.sendSuccess(res, userData);
  });

  // Refresh token
  refreshToken = asyncHandler(async (req, res) => {
    this.validateRequest(req);

    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'CONFIGURATION_ERROR');
    }

    try {
      const decoded = jwt.verify(refreshToken, jwtSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // TODO: Fetch user from database
      const userId = decoded.id;
      
      // Generate new tokens
      const tokenPayload = {
        id: userId,
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@blufleet.com',
        role: 'manager',
        permissions: ['dashboard:read', 'fleet:read']
      };

      const newToken = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '24h' });
      const newRefreshToken = jwt.sign(
        { id: userId, type: 'refresh' },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const response = {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 24 * 60 * 60
      };

      this.sendSuccess(res, response, 'Token refreshed successfully');
    } catch (error) {
      loggers.logAuth('token_refresh_failed', undefined, undefined, false, 'Invalid refresh token');
      throw new UnauthorizedError('Invalid refresh token');
    }
  });

  // Logout
  logout = asyncHandler(async (req, res) => {
    const userContext = this.getUserContext(req);
    
    // TODO: Invalidate token in database/Redis
    loggers.logAuth('logout', userContext.userId, undefined, true);
    
    this.sendSuccess(res, null, 'Logout successful');
  });

  // Change password
  changePassword = asyncHandler(async (req, res) => {
    this.validateRequest(req);

    const userContext = this.getUserContext(req);
    const { currentPassword, newPassword } = req.body;

    // TODO: Implement password change logic
    // 1. Verify current password
    // 2. Hash new password
    // 3. Update in database
    // 4. Log the action

    loggers.logAuth('password_changed', userContext.userId, undefined, true);
    
    this.sendSuccess(res, null, 'Password changed successfully');
  });
}

const authController = new AuthController();
const router = Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/refresh', refreshTokenValidation, authController.refreshToken);
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, changePasswordValidation, authController.changePassword);

export default router;