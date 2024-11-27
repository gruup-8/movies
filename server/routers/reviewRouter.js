import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();

router.get('/', async (req,res) => {
    try {
        const result = await pool.query('SELECT * FROM "Review"');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve reviews' });
    }
});

router.post('/', authenticateUser, async (req, res) => {
    const userId  = req.user.id;
    const userEmail = req.user.email;
    const {movie_id, stars, comment} = req.body;

    if(!movie_id || !stars || stars < 1 || stars > 5) {
        return res.status(400).json({ message: 'Invalid movie or stars' });
    }

    try {
        const result = await pool.query(
           'INSERT INTO "Review" (movie_id, user_email, stars, comment, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [movie_id, userEmail, stars, comment]
        );

        res.status(201).json({
            message: 'Review added successfully',
            review: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review' });
    }
});

export default router;