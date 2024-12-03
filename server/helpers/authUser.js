import pool from './db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticateUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = {
            id: decoded.id,
            email: decoded.email
        }; 
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ message: 'invalid or expired token' });
}
};

export { authenticateUser };

    /*const userId = req.headers['user-id'];
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
    }*/