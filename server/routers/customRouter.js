import { Router } from 'express';
import { authenticateUser } from '../helpers/authUser.js';
import pool from '../helpers/db.js';

const router = Router();

router.post('/', authenticateUser, async (req, res) => {
    console.log('Request body:', req.body);
    const userId = req.user.id;
    const { group_id, movie_id, showtime } = req.body;

    try {
        // Validate that the user is a member of the group
        const groupMembers = await pool.query(
            'SELECT * FROM "GroupMembers" WHERE group_id = $1 AND user_id = $2',
            [group_id, userId]
        );
        if (groupMembers.rows.length === 0) {
            return res.status(403).json({ message: 'User not a group member' });
        }

        let result;

        if (movie_id) {
            // Handle adding a movie
            result = await pool.query(
                'INSERT INTO "Custom" (group_id, movie_id) VALUES ($1, $2) RETURNING *',
                [group_id, movie_id]
            );
        } else if (showtime) {
            // Validate and insert showtime
            if (!showtime.show_time || isNaN(new Date(showtime.show_time).getTime())) {
                return res.status(400).json({ message: 'Invalid showtime date' });
            }

            const existingTime = await pool.query(
                'SELECT * FROM "Showtimes" WHERE show_time = $1 AND theatre_name = $2',
                [showtime.show_time, showtime.theatre_name]
            );

            let showtimeId;
            if (existingTime.rows.length > 0) {
                showtimeId = existingTime.rows[0].id;
            } else {
                const { show_time, movie_title, theatre_name, picture } = showtime;
                if (!show_time || !movie_title || !theatre_name || !picture) {
                    return res.status(400).json({ message: 'Incomplete showtime data' });
                }
                const newShowTime = await pool.query(
                    'INSERT INTO "Showtimes" (show_time, movie_title, theatre_name, picture) VALUES ($1, $2, $3, $4) RETURNING id',
                    [show_time, movie_title, theatre_name, picture]
                );
                showtimeId = newShowTime.rows[0].id;
            }

            result = await pool.query(
                'INSERT INTO "Custom" (group_id, showtime) VALUES ($1, $2) RETURNING *',
                [group_id, showtimeId]
            );
        } else {
            return res.status(400).json({ message: 'Invalid request data. Must include movie_id or showtime.' });
        }

        res.status(201).json({ message: 'Successfully added to group', custom: result.rows[0] });
    } catch (error) {
        console.error('Error adding movie or showtime to group:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch movies for a specific group
router.get('/:groupId', authenticateUser, async (req, res) => {
    const { groupId } = req.params;

    try {
        // Fetch movies associated with the group
        const moviesResult = await pool.query(
            `SELECT c.movie_id, m.title, m.poster_path
            FROM "Custom" c
            LEFT JOIN "Movies" m ON c.movie_id = m.id
            WHERE c.group_id = $1 AND c.movie_id IS NOT NULL`,
            [groupId]
        );
        const movies = moviesResult.rows;
        console.log(`Fetched movies:`, movies);

        const showtimesResult = await pool.query(
            `SELECT c.showtime, s.movie_title, s.theatre_name, s.show_time, s.picture
            FROM "Custom" c
            LEFT JOIN "Showtimes" s ON c.showtime = s.id
            WHERE c.group_id = $1 AND c.showtime IS NOT NULL`,
            [groupId]
        );
        const showtimes = showtimesResult.rows;
        console.log(`Fetched showtimes:`, showtimes);

        res.status(200).json({
            movies: movies || [],
            showtimes: showtimes || [],
        });
    } catch (error) {
        console.error('Error fetching group movies:', error);
        res.status(500).json({ message: 'Error fetching group movies' });
    }
});

export default router;