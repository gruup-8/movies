import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();

router.get('/', async (req,res) => {
    try {
        const query = `
            SELECT             
                r.movie_id, 
                r.user_email, 
                r.stars, 
                r.comment, 
                r.timestamp,
                m.title AS movie_title, 
                m.poster_path AS movie_poster
            FROM "Review" r
            JOIN "Movies" m ON r.movie_id = m.id
        `
        //console.log('Fetching reviews with query:', query);
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving reviews:', error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post('/', authenticateUser, async (req, res) => {
    console.log('Received request to post review');
    const userId = req.user.id;  // Assuming authentication is successful
    const userEmail = req.user.email;
    const { movie_id, stars, comment } = req.body;

    // Log request data
    console.log('Request Data:', { userId, userEmail, movie_id, stars, comment });

    if (!movie_id || !stars || stars < 1 || stars > 5) {
        return res.status(400).json({ message: 'Invalid movie or stars' });
    }

    try {
        // Your logic here
        const result = await pool.query(
           'INSERT INTO "Review" (movie_id, user_email, stars, comment, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [movie_id, userEmail, stars, comment]
        );

        if (!comment || comment.length > 500) {
            return res.status(400).json({ message: 'Comment is too long or missing' });
        }

        console.log('Review added:', result.rows[0]);
        res.status(201).json({
            message: 'Review added successfully',
            review: result.rows[0],
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
});

export default router;
