module.exports = (db: any) => {
    return async (req: any, res: any) => {
        const userId = req.session.userId;
        const items = await db.getItems(userId);
        res.send(items);
    };
};