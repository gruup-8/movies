import pool from './db.js'
const authenticateUser = async (req, res, next) => {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const result = await pool.query('SELECT email FROM "Users" WHERE id = $1', [userId]);

        if(result.rows.length === 0) {
            return res.status(404).json({message: 'user not found'});
        }

        req.user = { id: userId, email: result.rows[0].email };
        console.log('email:',req.user.email);
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Error' });
    }
};

export { authenticateUser };