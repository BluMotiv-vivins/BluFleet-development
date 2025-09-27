import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  permissions: string[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  permissions?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: string[];
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// In-memory user storage (replace with database in production)
class UserStorage {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private usernameIndex: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    // Create default admin user
    const adminUser: User = {
      id: '1',
      username: 'admin',
      email: 'admin@blufleet.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['*'] // All permissions
    };

    this.users.set(adminUser.id, adminUser);
    this.emailIndex.set(adminUser.email, adminUser.id);
    this.usernameIndex.set(adminUser.username, adminUser.id);

    // Create default manager user
    const managerUser: User = {
      id: '2',
      username: 'manager',
      email: 'manager@blufleet.com',
      firstName: 'Fleet',
      lastName: 'Manager',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['users.read', 'vehicles.read', 'vehicles.write', 'analytics.read', 'maintenance.read', 'maintenance.write']
    };

    this.users.set(managerUser.id, managerUser);
    this.emailIndex.set(managerUser.email, managerUser.id);
    this.usernameIndex.set(managerUser.username, managerUser.id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  getUserByEmail(email: string): User | null {
    const id = this.emailIndex.get(email);
    return id ? this.users.get(id) || null : null;
  }

  getUserByUsername(username: string): User | null {
    const id = this.usernameIndex.get(username);
    return id ? this.users.get(id) || null : null;
  }

  createUser(user: User): void {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
    this.usernameIndex.set(user.username, user.id);
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    
    // Update indexes if email or username changed
    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email);
      this.emailIndex.set(updates.email, id);
    }
    if (updates.username && updates.username !== user.username) {
      this.usernameIndex.delete(user.username);
      this.usernameIndex.set(updates.username, id);
    }

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    const user = this.users.get(id);
    if (!user) return false;

    this.users.delete(id);
    this.emailIndex.delete(user.email);
    this.usernameIndex.delete(user.username);
    return true;
  }

  emailExists(email: string): boolean {
    return this.emailIndex.has(email);
  }

  usernameExists(username: string): boolean {
    return this.usernameIndex.has(username);
  }
}

class UserManagementService {
  private userStorage = new UserStorage();
  private passwordStorage = new Map<string, string>(); // userId -> hashedPassword

  constructor() {
    // Set default passwords for initial users
    this.passwordStorage.set('1', bcrypt.hashSync('admin123', 10)); // admin user
    this.passwordStorage.set('2', bcrypt.hashSync('manager123', 10)); // manager user
  }

  async getAllUsers(): Promise<User[]> {
    return this.userStorage.getAllUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userStorage.getUserById(id);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate unique constraints
    if (this.userStorage.emailExists(userData.email)) {
      throw new Error('Email already exists');
    }
    if (this.userStorage.usernameExists(userData.username)) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const newUser: User = {
      id: this.generateId(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: userData.permissions || this.getDefaultPermissions(userData.role)
    };

    this.userStorage.createUser(newUser);
    this.passwordStorage.set(newUser.id, hashedPassword);

    return newUser;
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User | null> {
    // Validate unique constraints if email is being updated
    if (updates.email) {
      const existingUser = this.userStorage.getUserByEmail(updates.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already exists');
      }
    }

    return this.userStorage.updateUser(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    if (id === '1') { // Prevent deletion of admin user
      throw new Error('Cannot delete system administrator');
    }

    const deleted = this.userStorage.deleteUser(id);
    if (deleted) {
      this.passwordStorage.delete(id);
    }
    return deleted;
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User | null> {
    return this.userStorage.updateUser(id, { status });
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = this.userStorage.getUserByUsername(username) || this.userStorage.getUserByEmail(username);
    
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    const storedPassword = this.passwordStorage.get(user.id);
    if (!storedPassword) {
      return null;
    }

    const isValid = await bcrypt.compare(password, storedPassword);
    if (!isValid) {
      return null;
    }

    // Update last login
    const updatedUser = this.userStorage.updateUser(user.id, { lastLogin: new Date() });
    return updatedUser;
  }

  async login(username: string, password: string): Promise<{token: string, user: User} | null> {
    const user = await this.authenticateUser(username, password);
    if (!user) {
      return null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role,
        permissions: user.permissions 
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );

    return { token, user };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = this.userStorage.getUserById(userId);
    if (!user) return false;

    const storedPassword = this.passwordStorage.get(userId);
    if (!storedPassword) return false;

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, storedPassword);
    if (!isCurrentPasswordValid) return false;

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    this.passwordStorage.set(userId, hashedNewPassword);
    return true;
  }

  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    const user = this.userStorage.getUserById(userId);
    if (!user) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    this.passwordStorage.set(userId, hashedPassword);
    return true;
  }

  generateJWT(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'blufleet-secret', {
      expiresIn: '24h'
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultPermissions(role: UserRole): string[] {
    switch (role) {
      case UserRole.ADMIN:
        return ['*']; // All permissions
      case UserRole.MANAGER:
        return [
          'users.read', 'users.write',
          'vehicles.read', 'vehicles.write',
          'analytics.read', 'analytics.write',
          'maintenance.read', 'maintenance.write',
          'reports.read', 'reports.write'
        ];
      case UserRole.OPERATOR:
        return [
          'vehicles.read',
          'analytics.read',
          'maintenance.read', 'maintenance.write',
          'reports.read'
        ];
      case UserRole.VIEWER:
        return [
          'vehicles.read',
          'analytics.read',
          'reports.read'
        ];
      default:
        return [];
    }
  }

  // Get user statistics for dashboard
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    roleDistribution: Record<string, number>;
    recentLogins: number;
  }> {
    const users = this.userStorage.getAllUsers();
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === UserStatus.ACTIVE).length,
      inactiveUsers: users.filter(u => u.status !== UserStatus.ACTIVE).length,
      roleDistribution: {} as Record<string, number>,
      recentLogins: users.filter(u => u.lastLogin && u.lastLogin > last7Days).length
    };

    // Calculate role distribution
    users.forEach(user => {
      stats.roleDistribution[user.role] = (stats.roleDistribution[user.role] || 0) + 1;
    });

    return stats;
  }
}

export default new UserManagementService();
