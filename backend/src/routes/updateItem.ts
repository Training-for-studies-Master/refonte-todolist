module.exports = (db: any) => {
    return async (req: any, res: any) => {
        const userId = req.session.userId;

        await db.updateItem(
            req.params.id,
            {
                name: req.body.name,
                completed: req.body.completed,
            },
            userId
        );

        const item = await db.getItem(req.params.id, userId);

        res.send(item);
    };
};