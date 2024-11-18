import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

//User in use: test@foo.com password: test123

const router = Router();

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email FROM "Users"');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve users' });
    }
});

router.post('/register', async (req,res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const result = await pool.query(
            'INSERT INTO "Users" (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, password]
        );
        res.status(201).json({ message: 'User registered', user: result.rows[0] });
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
        const result = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.status(200).json({ message: 'User logged in', user: {id: user.id, email: user.email} });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
});

router.delete('/delete', authenticateUser, async (req, res) => {
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