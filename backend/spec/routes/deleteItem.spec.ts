const deleteItem = require('../../src/routes/deleteItem');

test('it removes item correctly', async () => {
    const fakeDb = {
        removeItem: jest.fn(),
    };
    const userId = 'user-123';
    const req = { params: { id: 12345 }, session: { userId } };
    const res = { sendStatus: jest.fn() };
    
    const handler = deleteItem(fakeDb);
    await handler(req, res);

    expect(fakeDb.removeItem.mock.calls.length).toBe(1);
    expect(fakeDb.removeItem.mock.calls[0][0]).toBe(req.params.id);
    expect(fakeDb.removeItem.mock.calls[0][1]).toEqual(userId);
    expect(res.sendStatus.mock.calls[0].length).toBe(1);
    expect(res.sendStatus.mock.calls[0][0]).toBe(200);
});
