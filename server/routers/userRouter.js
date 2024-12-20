import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const router = Router();

router.get('/me', authenticateUser, async (req, res) => {

    try {
        const userId = req.user.id;
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
        res.status(201).json({ message: 'User registered successfully', user});
    } catch (error) {
        console.error('Error in /register route:', error);
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
        // Generate access token
        const token = jwt.sign({ id: user.id, email }, SECRET_KEY, {expiresIn: '1h'});
        // Generate refresh token
        //const refreshToken = jwt.sign({ id: user.id, email }, SECRET_KEY, {expiresIn: '15m'})
        // Save refresh token to DB
        //await pool.query('INSERT INTO "RefreshTokens" (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
});

/*router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken){
        return res.status(400).json({ message: 'Refresh token is required' });
    }
    try{
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, SECRET_KEY);

        // Check if the token exist in the database
        const result = await pool.query('SELECT token FROM "RefreshTokens" WHERE token = $1', [refreshToken]);
        if (result.rows.length === 0){
            return res.status(403).json({ message: 'Invalid refresh token' })
        }

        // Generate a new access token
        const accessToken = jwt.sign({ id: decoded.id, email: decoded.email }, SECRET_KEY, { expiresIn: '15m' });
        res.status(200).json({ accessToken });
    }catch(error){
        console.error('Error refreshing token:', error);
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
});*/

router.post('/logout', async (req, res) => {
    res.clearCookie('access_token');
    res.status(200).json({ message: 'Logged out successfully' });
    /*const { refreshToken } = req.body;
    try {
        await pool.query('DELETE FROM "RefreshTokens" WHERE token = $1', [refreshToken]);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out' });
    }*/
});

router.delete('/delete', authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query('BEGIN');

        console.log('Deleting movie reviews...');
        await pool.query(
            `DELETE FROM "Review" WHERE user_email = (
            SELECT email FROM "Users" WHERE id = $1
        );`
        , [userId]);

        console.log('Delete customizations');
        await pool.query(
            `DELETE FROM "Custom" 
             WHERE group_id IN (
                SELECT group_id
                FROM "GroupMembers" 
                WHERE user_id = $1
            );`
        , [userId]);

        await pool.query('DELETE FROM "GroupMembers" WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM "GroupRequests" WHERE user_id = $1', [userId]);

        console.log('deleting favorites');
        await pool.query('DELETE FROM "Favorites" WHERE user_id = $1', [userId]);

        console.log('Deleting created groups');
        await pool.query('DELETE FROM "Groups" WHERE creator_id = $1', [userId]);

        console.log('deleting account');
        const result = await pool.query('DELETE FROM "Users" WHERE id = $1', [userId]);

        await pool.query('COMMIT');
        res.status(200).json({ message: 'User account and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting user: ', error);
        await pool.query('ROLLBACK');
        res.status(500).json({ message: 'Error deleting user account' });
    }
});

export default router;