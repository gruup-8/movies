import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';
import crypto from 'crypto'

const router = Router();

router.get('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query('SELECT movie_id FROM "Favorites" WHERE user_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load Favorites' });
    }
});

router.post('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const { movie_id } = req.body;

    const share_uri = crypto.randomBytes(16).toString('hex');
    try {
        const result = await pool.query(
            'INSERT INTO "Favorites" (user_id, movie_id, share_uri) VALUES ($1, $2, $3) RETURNING *',
            [userId, movie_id, share_uri]
        );

            res.status(201).json({
                message: 'Movie added to favorites',
                fav: result.rows[0],  
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
            res.status(500).json({ message: 'Error adding new favorite' });
        }
});

router.delete('/:movie_id', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const movieId = req.params.movie_id;

    try {
        const result = await pool.query(
            'DELETE FROM "Favorites" WHERE user_id = $1 AND movie_id = $2 RETURNING *',
            [userId, movieId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.status(200).json({ message: 'Movie removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing favorite' });
    }
});


router.get('/public/:share_uri', async (req, res) => {
    const { share_uri } = req.params;

    try {
        const result = await pool.query(
            'SELECT movie_id FROM "Favorites" WHERE share_uri = $1',
            [share_uri]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Favorites list not found' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shared list' });
    }
});

export default router;