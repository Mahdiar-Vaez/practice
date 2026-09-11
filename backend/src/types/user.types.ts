export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string; // bcrypt hash
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export type SafeUser = Omit<User, 'password'>;

export interface CreateUserDTO {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatar?: string;
}
