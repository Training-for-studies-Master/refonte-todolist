import { Item } from './Item';

export interface ItemRepository {
  getItems(userId: string): Promise<Item[]>;
  getItem(id: string, userId: string): Promise<Item | undefined>;
  storeItem(item: Item, userId: string): Promise<void>;
  updateItem(id: string, item: Item, userId: string): Promise<void>;
  removeItem(id: string, userId: string): Promise<void>;
  getUserByUsername(username: string): Promise<{ id: string; username: string; passwordHash: string } | undefined>;
  createUser(user: { id: string; username: string; passwordHash: string }): Promise<void>;
  teardown(): Promise<void>;
}