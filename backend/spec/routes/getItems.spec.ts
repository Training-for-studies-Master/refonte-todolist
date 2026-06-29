export {};

const getItems = require('../../src/routes/getItems');
const ITEMS = [{ id: 12345 }];

test('it gets items correctly', async () => {
    const fakeDb = {
        getItems: jest.fn().mockResolvedValue(ITEMS),
    };
    const userId = 'user-123';
    const req = { session: { userId } };
    const res = { send: jest.fn() };
    
    const handler = getItems(fakeDb);
    await handler(req, res);


    expect(fakeDb.getItems.mock.calls.length).toBe(1);
    expect(fakeDb.getItems.mock.calls[0][0]).toEqual(userId);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEMS);
});
