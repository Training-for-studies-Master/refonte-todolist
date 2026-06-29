module.exports = (db: any) => {
    return async (req: any, res: any) => {
        const userId = req.session.userId;
        await db.removeItem(req.params.id, userId);

        res.sendStatus(200);
    };
};