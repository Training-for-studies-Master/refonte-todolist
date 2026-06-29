const addItem = require('../../src/routes/addItem');
const {v4 : uuid} = require('uuid');

jest.mock('uuid', () => ({ v4: jest.fn() }));

test('it stores item correctly', async () => {
    const fakeDb = {
        storeItem: jest.fn(),
    };
    const id = 'something-not-a-uuid';
    const name = 'A sample item';
    const userId = 'user-123';
    const req = { body: { name }, session: { userId } };
    const res = { send: jest.fn() };
    

    uuid.mockReturnValue(id);

    const handler = addItem(fakeDb)
    await handler(req, res);
    // await addItem(req, res);

    const expectedItem = { id, name, completed: false };

    expect(fakeDb.storeItem.mock.calls.length).toBe(1);
    expect(fakeDb.storeItem.mock.calls[0][0]).toEqual(expectedItem);
    expect(fakeDb.storeItem.mock.calls[0][1]).toEqual(userId);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(expectedItem);
});
