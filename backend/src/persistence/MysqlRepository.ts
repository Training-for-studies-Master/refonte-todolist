import fs from 'fs';
import mysql from 'mysql2';
import type { Pool } from 'mysql2';
import { ItemRepository } from '../domain/ItemRepository';
import { Item } from '../domain/Item';

export class MysqlRepository implements ItemRepository {
  private pool!: Pool;

  private host = process.env.MYSQL_HOST || '';
  private user = process.env.MYSQL_USER || '';
  private password = process.env.MYSQL_PASSWORD || '';
  private database = process.env.MYSQL_DB || '';

  async init(): Promise<void> {
    // Lecture depuis fichiers si nécessaire
    if (process.env.MYSQL_HOST_FILE) this.host = fs.readFileSync(process.env.MYSQL_HOST_FILE).toString();
    if (process.env.MYSQL_USER_FILE) this.user = fs.readFileSync(process.env.MYSQL_USER_FILE).toString();
    if (process.env.MYSQL_PASSWORD_FILE) this.password = fs.readFileSync(process.env.MYSQL_PASSWORD_FILE).toString();
    if (process.env.MYSQL_DB_FILE) this.database = fs.readFileSync(process.env.MYSQL_DB_FILE).toString();

    this.pool = mysql.createPool({
      connectionLimit: 5,
      host: this.host,
      user: this.user,
      password: this.password,
      database: this.database,
      charset: 'utf8mb4',
    });

    // Création de la table si elle n'existe pas
    await new Promise<void>((resolve, reject) => {
      this.pool.query(
        `CREATE TABLE IF NOT EXISTS users (
          id varchar(36) PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password_hash varchar(255) NOT NULL
        ) DEFAULT CHARSET utf8mb4`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise<void>((resolve, reject) => {
      this.pool.query(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, user_id varchar(36) NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) DEFAULT CHARSET utf8mb4',
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  async getItems(userId: string): Promise<Item[]> {
  return new Promise((resolve, reject) => {
    this.pool.query(
      'SELECT * FROM todo_items WHERE user_id=?',
      [userId],
      (err, rows: any[]) => {
        if (err) return reject(err);
        resolve(
          rows.map(row => ({
            id: row.id,
            name: row.name,
            completed: row.completed === 1,
          }))
        );
      }
    );
  });
}

  async getItem(id: string, userId: string): Promise<Item | undefined> {
  return new Promise((resolve, reject) => {
    this.pool.query(
      'SELECT * FROM todo_items WHERE id=? AND user_id=?',
      [id, userId],
      (err, rows: any[]) => {
        if (err) return reject(err);
        const row = rows[0];
        if (!row) return resolve(undefined);

        resolve({
          id: row.id,
          name: row.name,
          completed: row.completed === 1,
        });
      }
    );
  });
}

  async storeItem(item: Item, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    this.pool.query(
      'INSERT INTO todo_items (id, user_id, name, completed) VALUES (?, ?, ?, ?)',
      [item.id, userId, item.name, item.completed ? 1 : 0],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

  async updateItem(id: string, item: Item, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    this.pool.query(
      'UPDATE todo_items SET name=?, completed=? WHERE id=? AND user_id=?',
      [item.name, item.completed ? 1 : 0, id, userId],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

  async createUser(user: { id: string; username: string; passwordHash: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pool.query(
        'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
        [user.id, user.username, user.passwordHash],
        (err) => (err ? reject(err) : resolve())
      );
    });
  }

  async getUserByUsername(username: string): Promise<{ id: string; username: string; passwordHash: string } | undefined> {
    return new Promise((resolve, reject) => {
      this.pool.query(
        'SELECT * FROM users WHERE username=?',
        [username],
        (err, rows: any[]) => {
          if (err) return reject(err);
          const row = rows[0];
          if (!row) return resolve(undefined);

          resolve({
            id: row.id,
            username: row.username,
            passwordHash: row.password_hash,
          });
        }
      );
    });
  }

  async removeItem(id: string, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    this.pool.query(
      'DELETE FROM todo_items WHERE id=? AND user_id=?',
      [id, userId],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

  async teardown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pool.end(err => (err ? reject(err) : resolve()));
    });
  }
}