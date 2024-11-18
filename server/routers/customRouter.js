import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();

router.post('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    const { group_id, movie_id, showtime } = req.body;

    try {
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

        res.status(201).json({ message: 'Movie or showtime added', custom: result.rows[0]});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error posting showtime or movie' });
    }
});

export default router;