import axios from 'axios';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const url = 'https://api.themoviedb.org/3/discover/movie?&include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';

const fetchDataFromAPI = async() => {
    try {
        console.log("using Api key: ",process.env.API_KEY);
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.API_TOKEN}`
            },
            params: {
                api_key: process.env.API_KEY
            }
        });
        console.log("APi response: ", response.data);
        return response.data.results;
    } catch (error) {
        if (error.response) {
            // The API returned a response with an error
            console.error("Error fetching data from API: ", error.response.data);
        } else if (error.request) {
            // No response received from the API
            console.error("No response received from API: ", error.request);
        } else {
            // Something else went wrong
            console.error("Error during request setup: ", error.message);
        }
        return null;
    }
};

const storeDataInDatabase = async (data) => {
    for (const movie of data) {
        const genreString = movie.genre_ids ? movie.genre_ids.join(', '):'';
        const description = movie.overview || 'No description available';
        try {
            await pool.query(
                'insert into "Movies" ("id", "title", "description", "release_date", "genre") values ($1, $2, $3, $4, $5) on conflict ("id") do nothing',
                [movie.id, movie.title, description, movie.release_date, genreString]
            );

            for (const genreId of movie.genre_ids) {
                await pool.query('INSERT INTO "movie_genres" (movie_id, genre_id) VALUES ($1, $2)', [movie.id, genreId]);
            }
        } catch (error) {
            console.error("Error storing data in database: ", error.message);
        }
    }
};

const main = async () => {
    const data = await fetchDataFromAPI();
    if (data && data.length > 0) {
        await storeDataInDatabase(data);
        console.log("Data stored successfully");
    } else {
        console.log("No data fetched from API of an error occurred");
    }
};

export { main, fetchDataFromAPI, storeDataInDatabase };