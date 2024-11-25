import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();



router.get('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    console.log('User ID:', userId);

    try {
        const result = await pool.query(
            `SELECT g.id, g.name, 
                    CASE
                        WHEN g.creator_id = $1 THEN 'creator'
                        WHEN gm.user_id = $1 THEN 'member'
                        WHEN gr.user_id = $1 AND gr.status = 'pending' THEN 'requested'
                        ELSE 'not_member'
                    END AS status
             FROM "Groups" g
             LEFT JOIN "GroupMembers" gm ON g.id = gm.group_id
             LEFT JOIN "GroupRequests" gr ON g.id = gr.group_id
             WHERE g.creator_id = $1 OR gm.user_id = $1 OR gr.user_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups' });
    }
});

router.post('/create', authenticateUser, async (req, res) => {
    const { name } = req.body;
    const creatorId = req.user.id;

    if(!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO "Groups" (name, creator_id) VALUES ($1, $2) RETURNING id, name, creator_id',
            [name, creatorId]
        );

        res.status(201).json({ message: 'Group created', group: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error creating group or the name is in use already' }); //should devide into two different errors
    }
});

router.post('/:groupId/request', authenticateUser, async (req, res) => {
    const userId  = req.user.id;
    const groupId = req.params.groupId;

    try {
        const existingReq = await pool.query(
            'SELECT * FROM "GroupRequests" WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (existingReq.rowCount > 0) {
            return res.status(400).json({ message: 'You have requested to join already' });
        }

        await pool.query(
            'INSERT INTO "GroupRequests" (group_id, user_id) VALUES ($1, $2)',
            [groupId, userId]
        );

        res.status(201).json({ message: 'Request sent to join the group' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending request' });
    }
});

router.post('/:groupId/answer/:userId', authenticateUser, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;
    const requestId = req.user.id;
    const { action } = req.body;

    if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: 'Action must be "accept" or "decline"' });
    }

    try {
         const group = await pool.query('SELECT * FROM "Groups" WHERE id = $1 AND creator_id = $2', [groupId, requestId]);

         if (group.rows.length === 0) {
            return res.status(403).json({ message: 'Only the creator can accept or decline' });
         }

         const request = await pool.query('SELECT * FROM "GroupRequests" WHERE group_id = $1 AND user_id = $2 AND status = $3', [groupId, userId, 'pending']);

         if (request.rows.length === 0) {
            return res.status(404).json({ message: 'No pending requests' });
         }

         if (action === 'accept') {
            await pool.query('UPDATE "GroupRequests" SET status = $1 WHERE group_id = $2 AND user_id = $3', ['accepted', groupId, userId]);
            await pool.query('INSERT INTO "GroupMembers" (group_id, user_id) VALUES ($1, $2)', [groupId, userId]);
            res.status(200).json({ message: 'User added to group' });
         } else {
            await pool.query('UPDATE "GroupRequests" SET status = $1 WHERE group_id = $2 AND user_id = $3', ['declined', groupId, userId]);
            res.status(200).json({ message: 'Request declined' });
         }
    } catch (error) {
        res.status(500).json({ message: 'Error processing the request' });
    }
});

router.get('/:groupId', authenticateUser, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT g.id, g.name
            FROM "Groups" g
            LEFT JOIN "GroupMembers" gm ON g.id = gm.group_id
            LEFT JOIN "GroupRequests" gr ON g.id = gr.group_id AND gr.user_id = $1
            WHERE g.id = $1 AND (gm.user_id = $2 OR (gr.status = 'accepted' AND gr.user_id = $2))`,
            [groupId, userId]
        );
        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'You are not a member' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching group details' });
    }
});

router.delete('/:groupId', authenticateUser, async (req, res) => {
    const groupId = req.params.groupId;
    const requesterId = req.user.id;

    try {
        const groupCheck = await pool.query('SELECT * FROM "Groups" WHERE id = $1 AND creator_id = $2', [groupId, requesterId]);

        if (groupCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Only the creator can delete a group' });
        }

        await pool.query('DELETE FROM "Groups" WHERE id = $1', [groupId]);
        await pool.query('DELETE FROM "GroupMembers" WHERE group_id = $1', [groupId]);

        res.status(200).json({ message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting group' });
    }
});

router.delete('/:groupId/user/:userId', authenticateUser, async (req, res) => {
    const groupId = req.params.groupId;
    const userIdToDelete = req.params.userId;
    const requesterId = req.user.id;

    try {
        const groupCheck = await pool.query('SELECT * FROM "Groups" WHERE id = $1 AND creator_id = $2', [groupId, requesterId]);

        if (groupCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Only the creator can delete members' });
        }

        await pool.query('DELETE FROM "GroupMembers" WHERE group_id = $1 AND user_id = $2', [groupId, userIdToDelete]);

        res.status(200).json({ message: 'User removed from group' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing user' });
    }
});

router.delete('/:groupId/member', authenticateUser, async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    try {
        await pool.query(
            'DELETE FROM "GroupMembers" WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );
        res.status(200).json({ message: 'You left the group' });
    } catch (error) {
        res.status(500).json({ message: 'Error leaving the group' });
    }
});

export default router;