export {};

const { v4: uuid } = require('uuid');

module.exports = (db: any) => {
    return async (req: any, res: any) => {
        const userId = req.session.userId;

        const item = {
            id: uuid(),
            name: req.body.name,
            completed: false,
        };

        await db.storeItem(item, userId);

        res.send(item);
    };
};