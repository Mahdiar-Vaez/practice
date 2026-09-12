import { query } from '../db/index.js';
import { User, CreateUserDTO, UpdateProfileDTO } from '../types/user.types.js';
import { IUserRepository } from './user.repository.interface.js';

interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  bio: string | null;
  avatar: string | null;
  created_at: Date;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    password: row.password,
    bio: row.bio || '',
    avatar: row.avatar || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export class PostgresUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const res = await query<UserRow>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email.trim()]
    );
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const res = await query<UserRow>(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username.trim()]
    );
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    const clean = identifier.trim().toLowerCase();
    const res = await query<UserRow>(
      'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1 LIMIT 1',
      [clean]
    );
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const res = await query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await query<UserRow>(
      `INSERT INTO users (id, name, username, email, password, bio, avatar, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        id,
        userData.name,
        userData.username.toLowerCase(),
        userData.email.toLowerCase(),
        userData.password,
        userData.bio || '',
        userData.avatar || '',
      ]
    );
    return mapRowToUser(res.rows[0]);
  }

  async update(id: string, data: UpdateProfileDTO): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${idx++}`);
      values.push(data.bio);
    }
    if (data.avatar !== undefined) {
      updates.push(`avatar = $${idx++}`);
      values.push(data.avatar);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await query<UserRow>(sql, values);
    return res.rows[0] ? mapRowToUser(res.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await query('DELETE FROM users WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async getAll(): Promise<User[]> {
    const res = await query<UserRow>('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows.map(mapRowToUser);
  }
}
