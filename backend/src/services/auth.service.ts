import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { SafeUser } from '../types/user.types.js';
import { LoginInput, RegisterInput } from '../validations/auth.validation.js';
import { env } from '../config/env.js';

export interface AuthResult {
  token: string;
  user: SafeUser;
}

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  private sanitizeUser(user: any): SafeUser {
    const { password, ...safe } = user;
    return safe;
  }

  private generateToken(user: SafeUser): string {
    return jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmailOrUsername(input.identifier);
    if (!user) {
      const error: any = new Error('اطلاعات ورود نامعتبر است');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);
    if (!isValidPassword) {
      const error: any = new Error('اطلاعات ورود نامعتبر است');
      error.statusCode = 401;
      throw error;
    }

    const safeUser = this.sanitizeUser(user);
    const token = this.generateToken(safeUser);
    return { token, user: safeUser };
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      const error: any = new Error('این ایمیل قبلاً در سامانه ثبت شده است');
      error.statusCode = 409;
      throw error;
    }

    const existingUsername = await this.userRepository.findByUsername(input.username);
    if (existingUsername) {
      const error: any = new Error('این نام کاربری قبلاً انتخاب شده است');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(input.password, salt);

    const newUser = await this.userRepository.create({
      name: input.name,
      username: input.username,
      email: input.email,
      password: hashedPassword,
    });

    const safeUser = this.sanitizeUser(newUser);
    const token = this.generateToken(safeUser);
    return { token, user: safeUser };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error: any = new Error('کاربر یافت نشد');
      error.statusCode = 404;
      throw error;
    }
    return this.sanitizeUser(user);
  }
}
