import { User, CreateUserDTO } from '../types/user.types.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmailOrUsername(identifier: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: CreateUserDTO): Promise<User>;
  getAll(): Promise<User[]>;
}
