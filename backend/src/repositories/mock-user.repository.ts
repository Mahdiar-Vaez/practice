import bcrypt from 'bcryptjs';
import { User, CreateUserDTO } from '../types/user.types.js';
import { IUserRepository } from './user.repository.interface.js';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    this.seedUsers();
  }

  private seedUsers(): void {
    // Pre-hashed bcrypt for 'password123'
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    this.users.push({
      id: 'usr_demo_123',
      name: 'کاربر دمو',
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      bio: 'توسعه‌دهنده نرم‌افزار و کاربر آزمایشی سامانه',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString(),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return user ? { ...user } : null;
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const cleanId = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async getAll(): Promise<User[]> {
    return [...this.users];
  }
}

export const userRepository = new MockUserRepository();
