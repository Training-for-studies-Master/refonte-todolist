import { Item } from '../../src/domain/Item';
import { ItemRepository } from '../../src/domain/ItemRepository';

export class InMemoryRepository implements ItemRepository {
  private items: { item: Item; userId: string }[] = [];
  private users: { id: string; username: string; passwordHash: string }[] = [];

  async init(): Promise<void> {
    this.items = [];
    this.users = [];
  }
// test ci debug
  async teardown(): Promise<void> {
    this.items = [];
    this.users = [];
  }

  async getItems(userId: string): Promise<Item[]> {
    return this.items
      .filter(entry => entry.userId === userId)
      .map(entry => entry.item);
  }

  async getItem(id: string, userId: string): Promise<Item | undefined> {
    const entry = this.items.find(
      e => e.item.id === id && e.userId === userId
    );
    return entry?.item;
  }

  async storeItem(item: Item, userId: string): Promise<void> {
    this.items.push({ item, userId });
  }

  async updateItem(id: string, item: Item, userId: string): Promise<void> {
    const index = this.items.findIndex(
      e => e.item.id === id && e.userId === userId
    );

    if (index !== -1) {
      this.items[index] = { item, userId };
    }
  }

  async removeItem(id: string, userId: string): Promise<void> {
    this.items = this.items.filter(
      e => !(e.item.id === id && e.userId === userId)
    );
  }

  async getUserByUsername(username: string): Promise<{ id: string; username: string; passwordHash: string } | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: { id: string; username: string; passwordHash: string }): Promise<void> {
    this.users.push(user);
  }
}