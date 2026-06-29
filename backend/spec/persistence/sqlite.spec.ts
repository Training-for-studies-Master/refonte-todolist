export {};
import { InMemoryRepository } from '../../src/persistence/InMemoryRepository';

let db: InMemoryRepository;
const userId = 'test-user';

const ITEM = {
    id: '7aef3d7c-d301-4846-8358-2a91ec9d6be3',
    name: 'Test',
    completed: false,
};

beforeEach(async () => {
  db = new InMemoryRepository();
  await db.init();
});

afterEach(async () => {
  await db.teardown();
});

test('it initializes correctly', async () => {
    await db.init();
});

test('it can store and retrieve items', async () => {
    await db.init();

    await db.storeItem(ITEM, userId);

    const items = await db.getItems(userId);
    expect(items.length).toBe(1);
    expect(items[0]).toEqual(ITEM);
});

test('it can update an existing item', async () => {
    await db.init();

    const initialItems = await db.getItems(userId);
    expect(initialItems.length).toBe(0);

    await db.storeItem(ITEM, userId);

    await db.updateItem(
        ITEM.id,
        Object.assign({}, ITEM, { completed: !ITEM.completed }),
        userId,
    );

    const items = await db.getItems(userId);
    expect(items.length).toBe(1);
    expect(items[0].completed).toBe(!ITEM.completed);
});

test('it can remove an existing item', async () => {
    await db.init();
    await db.storeItem(ITEM, userId);

    await db.removeItem(ITEM.id, userId);

    const items = await db.getItems(userId);
    expect(items.length).toBe(0);
});

test('it can get a single item', async () => {
    await db.init();
    await db.storeItem(ITEM, userId);

    const item = await db.getItem(ITEM.id, userId);
    expect(item).toEqual(ITEM);
});

