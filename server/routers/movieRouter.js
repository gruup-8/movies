import { Router } from 'express';
import { main } from '../helpers/movieDb.js';
import pool from '../helpers/db.js';

const router = Router();

router.get('/fetch-and-store', async (req, res) => {
    try {
        await main();
        res.status(200).send('Movies fetched and stored successfully');
    } catch (error){
        console.error("Error during the fetch and store process:", error);
        res.status(500).send('Error fetching and storing movies');
    }
});

router.get('/', async (req,res) => {
    try {
        const result = await pool.query('SELECT * FROM "Movies"');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve movies' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM "Movies" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching movie by id:', error);
        res.status(500).json({ message: 'Error getting movie' });
    }
});

export default router;