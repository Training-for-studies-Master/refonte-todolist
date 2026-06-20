import mysql from "mysql2";
import type { Pool } from "mysql2";
import type { AuthRepository } from "../../domain/AuthRepository";

export class MysqlAuthRepository implements AuthRepository {
  private pool!: Pool;

  async init(): Promise<void> {
    this.pool = mysql.createPool({
      connectionLimit: 5,
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB || "auth_db",
      charset: "utf8mb4",
      dateStrings: true,
    });
  }

  async getUserByUsername(username: string): Promise<{ id: string; username: string; passwordHash: string; birthDate?: string | null; } | undefined> {
    return new Promise((resolve, reject) => {
      this.pool.query(
        "SELECT id, username, password_hash, birth_date FROM users WHERE username=?",
        [username],
        (err, rows: any[]) => {
          if (err) return reject(err);
          const r = rows[0];
          if (!r) return resolve(undefined);
          const birthDateString = r.birth_date instanceof Date
            ? r.birth_date.toISOString().split('T')[0]
            : r.birth_date ?? null;

          resolve({
            id: r.id,
            username: r.username,
            passwordHash: r.password_hash,
            birthDate: birthDateString
          });
        }
      );
    });
  }

  async getUserById(id: string): Promise<{ id: string; username: string; birthDate?: string | null; } | undefined> {
    return new Promise((resolve, reject) => {
      this.pool.query("SELECT id, username, birth_date FROM users WHERE id=?", [id], (err, rows: any[]) => {
        if (err) return reject(err);
        const r = rows[0];
        if (!r) return resolve(undefined);
        const birthDateString = r.birth_date instanceof Date
          ? r.birth_date.toISOString().split('T')[0]
          : r.birth_date ?? null;

        resolve({
          id: r.id,
          username: r.username,
          birthDate: birthDateString
        });
      });
    });
  }

  async createUser(user: { id: string; username: string; passwordHash: string, birthDate?: string | null; }) {
    return new Promise<void>((resolve, reject) => {
      this.pool.query(
        "INSERT INTO users (id, username, password_hash, birth_date) VALUES (?, ?, ?, ?)",
        [user.id, user.username, user.passwordHash, user.birthDate ?? null],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  async teardown(): Promise<void> {
    return new Promise((resolve, reject) => this.pool.end((err) => (err ? reject(err) : resolve())));
  }
}