import { Router } from 'express';
import pool from '../helpers/db.js';
import { fetchShowtimes, saveTimes } from '../helpers/finnkino.js';

const router = Router();

router.get('/fetch', async (req, res) => {
    try {
        const showtimes = await fetchShowtimes();  // Await the result
        const savedTimes = await saveTimes(showtimes);
        res.json(showtimes);  // Return the data as JSON
    } catch (error) {
        console.error("Error in fetching: ", error);
        res.status(500).send('Error fetching showtimes');
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Showtimes"');
        res.json(result.rows);        
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve showtimes' });
    }
});

export default router;