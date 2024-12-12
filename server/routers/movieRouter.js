import { Router } from 'express';
import { main } from '../helpers/movieDb.js';
import pool from '../helpers/db.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const router = Router();

const apiToken = process.env.API_TOKEN;
const apiKey = process.env.API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.query('SELECT * FROM "Movies" LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        const countResult = await pool.query('SELECT COUNT(*) FROM "Movies"');
        const totalMovies = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalMovies / limit);

        res.json({
            results: result.rows,
            total_pages: totalPages,
            current_page: page,
            total_movies: totalMovies,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve movies' });
    }
});

router.get('/movie/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Fetching movie details for ID:', id);
    try {
        const response = await axios.get(`${BASE_URL}/movie/${id}`, {
            params: {
                api_key: apiKey,
            },
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        const movieDetails = {
            id: response.data.id,
            title: response.data.title,
            overview: response.data.overview,
            release_date: response.data.release_date,
            poster_path: response.data.poster_path ? `${IMAGE_BASE_URL}${response.data.poster_path}` : null,
            genres: response.data.genres.map(genre => genre.name).join(","),
            production_companies: response.data.production_companies.map(company => company.name).join(","), 
            imdb_id: response.data.imdb_id,
            homepage: response.data.homepage,
            };

        res.status(200).json(movieDetails);
    } catch (error) {
        if (error.response) {
            console.error("Error fetching movie details: ", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("Error:", error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

router.get('/top-rated', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/discover/movie`, {
            params: { 
                api_key: apiKey, 
                page: 1,
                include_adult: false,
                include_video: false,
                sort_by: 'popularity.desc',
            },
            headers: { Authorization: `Bearer ${apiToken}` },
        });

        const topMovies = response.data.results.slice(0, 15).map((movie) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
            release_date: movie.release_date,
        }));

        res.json(topMovies);
    } catch (error) {
        console.error('Error fetching top rated:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch top movies',
        });
    }
});

router.get('/search', async (req, res) => {
    const { query } = req.query;
    const {page} = req.query;

    try {
        const response = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: apiKey,
                query: query,
                include_adult: false,
                page: page,
            },
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });
        if (response.data.results.length === 0) {
          return res.status(404).json({ error: 'No movies found for the given query' });
        }
        res.json({
            results: response.data.results,
            total_pages: response.data.total_pages,
        });
      } catch (err) {
        console.error('Error fetching movies from database:', err);
        res.status(500).json({ error: 'Failed to fetch movies' });
      }
});

router.get('/genre/:genreId', async (req, res) => {
    const {genreId} = req.params;
    const {page} = req.query;

    try {
        const response = await axios.get(`${BASE_URL}/discover/movie`, {
            params: {
                api_key: apiKey,
                with_genres: genreId,
                page,
            },
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        const movieByGenre = response.data.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path  ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
            release_date: movie.release_date,
        }));

        res.json({ results: movieByGenre, total_pages: response.data.total_pages });
    } catch (error) {
        console.error('Error fetching movies by genre:', error.message);
        res.status(error.response?.status || 500).json({
        error: 'Failed to fetch movies by genre',
        });
    }
});

export default router;