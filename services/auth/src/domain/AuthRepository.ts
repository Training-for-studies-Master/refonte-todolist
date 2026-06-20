export interface AuthRepository {
  getUserByUsername(username: string): Promise<{ id: string; username: string; passwordHash: string, birthDate?: string | null } | undefined>;
  getUserById(id: string): Promise<{ id: string; username: string, birthDate?: string | null } | undefined>;
  createUser(user: { id: string; username: string; passwordHash: string, birthDate?: string | null }): Promise<void>;
  teardown(): Promise<void>;
}