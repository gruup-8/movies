import { Router } from 'express';
import pool from '../helpers/db.js';
import axios from 'axios';
//get genres with this in browser: http://localhost:3001/api/genres/Genres
const router = Router();

const genre_url = 'https://api.themoviedb.org/3/genre/movie/list';

router.get('/Genres', async (req, res) => {
    try {
        const response = await axios.get(genre_url, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            },
            params: {
                api_key: process.env.API_KEY
            }
        });
        const genres = response.data.genres;

        const client = await pool.connect();
        for (const genre of genres) {
            await client.query(
                'INSERT INTO "Genres" (genre_id, genre_name) VALUES ($1, $2) ON CONFLICT (genre_id) DO NOTHING',
                [genre.id, genre.name]
            );
        }
        client.release();

        res.status(200).json({ message: 'Genres in sync' });
    } catch (error) {
        console.error('Error syncing genres: ', error);
        res.status(500).json({ error: 'Failed to sync genres' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Genres"');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error retrieving genre data: ', error);
        res.status(500).json({ error: 'Failed to retrieve genres' });
    }
})

export default router;