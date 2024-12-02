import { Router } from 'express';
import pool from '../helpers/db.js';
import { authenticateUser } from '../helpers/authUser.js';

const router = Router();

router.get('/', authenticateUser, async (req, res) => {
    const userId = req.user.id;
    console.log('User ID:', userId);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `SELECT g.id, g.name, g.creator_id,
                CASE
                    WHEN g.creator_id = $1 THEN 'creator'
                    WHEN gm.user_id = $1 THEN 'member'
                    WHEN gr.user_id = $1 AND gr.status = 'pending' THEN 'requested'
                    ELSE 'not_member'
                END AS status
            FROM "Groups" g
            LEFT JOIN "GroupMembers" gm ON g.id = gm.group_id AND gm.user_id = $1
            LEFT JOIN "GroupRequests" gr ON g.id = gr.group_id AND gr.user_id = $1
            WHERE g.creator_id = $1 OR gm.user_id = $1 OR gr.user_id = $1`,
            [userId]
        );

        const availableGroups = await client.query(
            `SELECT g.id, g.name, g.creator_id,
                    CASE
                        WHEN gr.user_id = $1 AND gr.status = 'pending' THEN 'pending'
                        ELSE 'available'
                    END AS request_status
             FROM "Groups" g
             LEFT JOIN "GroupRequests" gr ON g.id = gr.group_id AND gr.user_id = $1
             WHERE g.creator_id != $1
             AND (gr.status IS NULL OR gr.status = 'pending')`,
            [userId]
        );
        await client.query('COMMIT');

        const userGroups = result.rows;
        const groupsAvailable = availableGroups.rows;

        console.log('User Groups:', userGroups);
        console.log('Available Groups:', groupsAvailable);

        res.status(200).json({
            userGroups,
            availableGroups: groupsAvailable
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Error fetching groups' });
    } finally {
        client.release();
    }
});

router.post('/create', authenticateUser, async (req, res) => {
    const { name } = req.body;
    const creatorId = req.user.id;

    if(!name) {
        return res.status(400).json({ message: 'Group name is required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            'INSERT INTO "Groups" (name, creator_id) VALUES ($1, $2) RETURNING id, name, creator_id',
            [name, creatorId]
        );
        const groupId = groupResult.rows[0].id;

        await client.query(
            'INSERT INTO "GroupMembers" (group_id, user_id) VALUES ($1, $2)',
            [groupId, creatorId]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Group created', group: groupResult.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating group:', error);
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            return res.status(400).json({ message: 'Group name already in use' });
        } else {
            console.error('Error creating group:', error);
            res.status(500).json({ message: 'Error creating group or the name is in use already' }); //should devide into two different errors
        }
    } finally {
        client.release();
    }
});

router.post('/:groupId/request', authenticateUser, async (req, res) => {
    const userId  = req.user.id;
    const groupId = req.params.groupId;

    if (isNaN(groupId)) {
        return res.status(400).json({ message: 'Invalid group ID' });
    }

    console.log('Received request to join group:', { userId, groupId });

    try {
        const group = await pool.query(
            'SELECT creator_id FROM "Groups" WHERE id = $1',
            [groupId]
        );

        if (group.rowCount === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }
        console.log('Group creator_id:', group.rows[0].creator_id);
        console.log('User ID Type:', typeof userId);
        console.log('Group Creator ID Type:', typeof group.rows[0].creator_id);
        if (parseInt(group.rows[0].creator_id) === parseInt(userId)) {
            console.log('Group creator trying to join own group.');
            return res.status(400).json({ message: 'You cannot request to join your own group' });
        }

        const isMember = await pool.query(
            'SELECT * FROM "GroupMembers" WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (isMember.rowCount > 0) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        const existingReq = await pool.query(
            'SELECT * FROM "GroupRequests" WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (existingReq.rowCount > 0) {
            const requestStatus = existingReq.rows[0].status;
            if (requestStatus === 'accepted') {
                return res.status(400).json({ message: 'You have already been accepted into this group' });
            }
            if (requestStatus === 'declined') {
                await pool.query(
                    'UPDATE "GroupRequests" SET status = $1 WHERE group_id = $2 AND user_id = $3',
                    ['pending', groupId, userId]
                );
                return res.status(200).json({ message: 'Your request has been re-submitted' });
            }
            return res.status(400).json({ message: 'You have already requested to join this group' });
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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

         const group = await pool.query('SELECT * FROM "Groups" WHERE id = $1 AND creator_id = $2', [groupId, requestId]);

         if (group.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Only the creator can accept or decline' });
         }

         const request = await pool.query('SELECT * FROM "GroupRequests" WHERE group_id = $1 AND user_id = $2 AND status = $3', [groupId, userId, 'pending']);

         if (request.rows.length === 0) {
            await client.query('ROLLBACK');
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

         await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing the request:', error);
        res.status(500).json({ message: 'Error processing the request' });
    } finally {
        client.release();
    }
});

router.get('/:groupId', authenticateUser, async (req, res) => {
    console.log('User Info:', req.user); 
    const groupId = req.params.groupId;
    const { id } = req.user;

    console.log('Request received. User:', id);
    console.log('Group ID in backend:', groupId);

    try {
        const result = await pool.query(
            `SELECT 
                g.id, 
                g.name, 
                g.creator_id, 
                CASE WHEN g.creator_id = $1 THEN true ELSE false END AS is_creator,
                -- Fetch group members
                COALESCE(
                    ARRAY_AGG(DISTINCT json_build_object('userId', gm.user_id)), 
                    '{}'
                ) AS members,
                -- Fetch join requests
                COALESCE(
                    ARRAY_AGG(DISTINCT json_build_object(
                        'userId', gr.user_id, 
                        'status', gr.status, 
                        'request_date', gr.request_date
                    )) FILTER (WHERE gr.id IS NOT NULL), 
                    '{}'
                ) AS requests
             FROM "Groups" g
             -- Join with GroupMembers and GroupRequests
             LEFT JOIN "GroupMembers" gm ON g.id = gm.group_id
             LEFT JOIN "GroupRequests" gr ON g.id = gr.group_id
             WHERE g.id = $2 
               AND (
                    -- Ensure the user is a member or their request is accepted
                    gm.user_id = $1 
                    OR (gr.status = 'accepted' AND gr.user_id = $1)
                    OR g.creator_id = $1
               )
             GROUP BY g.id, g.name, g.creator_id`,
            [id, groupId] 
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
    const { id } = req;
    console.log(id);

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