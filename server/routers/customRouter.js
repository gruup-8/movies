import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();

router.post('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const { group_id, movie_id, showtime } = req.body;

    try {
         console.log('Request body:', req.body); // Log the request body for debugging
        const groupMembers = await pool.query(
            'SELECT * FROM "GroupMembers" WHERE group_id = $1 AND user_id = $2',
            [group_id, userId]
        );

        if (groupMembers.rows.length === 0) {
            return res.status(403).json({ message: 'User not a groupmember' });
        }

        const result = await pool.query(
            'INSERT INTO "Custom" (group_id, movie_id, showtime) VALUES ($1, $2, $3) RETURNING *',
            [group_id, movie_id, showtime]
        );
        console.log('Request body:', req.body);

        res.status(201).json({ message: 'Movie or showtime added', custom: result.rows[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error posting showtime or movie' });
    }
});

// Fetch movies for a specific group
router.get('/:groupId', authenticateUser, async (req, res) => {
    const { groupId } = req.params;

    try {
        // Fetch movies associated with the group
        const groupMovies = await pool.query(
            `SELECT c.movie_id, c.showtime, m.title, m.poster_path
            FROM "Custom" c
            INNER JOIN "Movies" m ON c.movie_id = m.id
            WHERE c.group_id = $1`,
            [groupId]
        );

        if(groupMovies.rows.length === 0){
            return res.status(404).json({ message: 'No movies found for this group.' });
        }
        
        res.status(200).json({ movies: groupMovies.rows });
    } catch (error) {
        console.error('Error fetching group movies:', error);
        res.status(500).json({ message: 'Error fetching group movies' });
    }
});

export default router;