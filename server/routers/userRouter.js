import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

router.get('/me', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT id, email FROM "Users" WHERE id = $1', [userId]);

        if (result.rows === 0) {
            return res.status(404).json({ message: 'user not found' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users details' });
    }
});

router.post('/register', async (req,res) => {
    console.log("Request body received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Error: Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        console.log('Checking if email exists:', email);
        const existingUser = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const saltRounds = 10;
        console.log('Hashing password for user:', email);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password for user:', email, hashedPassword);

        console.log('Inserting new user into database...');
        const result = await pool.query(
            'INSERT INTO "Users" (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );
        console.log("SQL query result:", result); 
        const user = result.rows[0];
        console.log('User inserted:', user);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await pool.query('SELECT id, password FROM "Users" WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = result.rows[0];
        console.log('Stored hash:', user.password);
        console.log('Entered password:', password);
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ id: user.id, email }, SECRET_KEY, {expiresIn: '15m'});

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
});

router.post('/logout', async (req, res) => {

    console.log('Cookies in request:', req.cookies);
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token needed' });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_KEY);
        console.log('Decoded refresh token:', decoded);

        await pool.query('UPDATE "Users" SET refresh_token = NULL WHERE refresh_token = $1', [refreshToken]);

        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Error logging out user' });
    }
});

router.use(authenticateUser);
router.delete('/delete', async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query('DELETE FROM "Users" WHERE id = $1 RETURNING *', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error deleting user: ', error);
        res.status(500).json({ message: 'Error deleting user account' });
    }
});

export default router;