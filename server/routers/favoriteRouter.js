import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();

router.get('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT f.movie_id, m.title, m.poster_path
             FROM "Favorites" f
             JOIN "Movies" m ON f.movie_id = m.id
             WHERE f.user_id = $1`, 
             [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to load Favorites' });
    }
});

router.post('/', authenticateUser, async (req, res) => {
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);

    const userId = req.user.id;
    const { movieId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User not authenticated' });
    }
    console.log('Received movieId:', movieId);

    const numericMovieId = Number(movieId);
    console.log('Converted movieId:', numericMovieId);

    if (!movieId || isNaN(movieId)) {
        return res.status(400).json({ message: 'Invalid movie ID' });
    }

    try {
        const exists = await pool.query(
            'SELECT 1 FROM "Favorites" WHERE user_id = $1 AND movie_id = $2',
            [userId, numericMovieId]
        );
        if (exists.rowCount > 0) {
            return res.status(409).json({ message: 'Movie already in favorites' });
        }

        const result = await pool.query(
            'INSERT INTO "Favorites" (user_id, movie_id) VALUES ($1, $2) RETURNING *',
            [userId, numericMovieId]
        );
        console.log('Database result:', result.rows);
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

router.patch('/public', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const { ispublic } = req.body;

    try {
        await pool.query(
            'UPDATE "Favorites" SET public = $1 WHERE user_id = $2',
            [ispublic, userId]
        );

        res.status(200).json({ message: `Favorites set to ${ispublic ? 'public' : 'private'}`});
    } catch (error) {
        res.status(500).json({ message: 'Error updating visibility' });
    }
});

router.get('/public/share/:userId', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization required' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { userId } = decoded;
        console.log('Decoded userId:', userId);

        const result = await pool.query(
            'SELECT movie_id FROM "Favorites" WHERE user_id = $1 AND public = true',
            [userId]
        );

        console.log('Query result:', result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Favorites list not found or not public' });
        }

        const movieIds = result.rows.map(row => row.movie_id);

        const movieDetails = await pool.query(
            'SELECT id, title, poster_path FROM "Movies" WHERE id = ANY($1)',
            [movieIds]
        );

        res.status(200).json(movieDetails.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shared list' });
    }
});

export default router;