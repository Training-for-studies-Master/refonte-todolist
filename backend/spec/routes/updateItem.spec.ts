export {};

const updateItem = require('../../src/routes/updateItem');
const ITEM = { id: 12345 };

test('it updates items correctly', async () => {
    const fakeDb = {
        updateItem: jest.fn().mockResolvedValue(undefined),
        getItem: jest.fn().mockResolvedValue(ITEM),
    };
    const userId = 'user-123';
    const req = {
        params: { id: 1234 },
        body: { name: 'New title', completed: false },
        session: { userId },
    };
    const res = { send: jest.fn() };

    const handler = updateItem(fakeDb);
    await handler(req, res);

    expect(fakeDb.updateItem.mock.calls.length).toBe(1);
    expect(fakeDb.updateItem.mock.calls[0][0]).toBe(req.params.id);
    expect(fakeDb.updateItem.mock.calls[0][1]).toEqual({
        name: 'New title',
        completed: false,
    });
    expect(fakeDb.updateItem.mock.calls[0][2]).toEqual(userId);

    expect(fakeDb.getItem.mock.calls.length).toBe(1);
    expect(fakeDb.getItem.mock.calls[0][0]).toBe(req.params.id);
    expect(fakeDb.getItem.mock.calls[0][1]).toEqual(userId);

    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEM);
});
