import axios from 'axios';
import pool from './db.js';
import dotenv from 'dotenv';

dotenv.config();



const fetchDataFromAPI = async() => {
    const apiKey = process.env.API_KEY;
    //added filtering to the end of the request to exclude not wanted content
    const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&without_keywords=190370,301766,155477,211121,445';
    let movies = [];
    try {
        //made them from 1 to 240 manually keeping in mind the limit of 40 requests in 10 seconds limitation
        for (let page = 200; page <= 240; page++) {
            const response = await axios.get(url, {
                params: {
                    api_key: apiKey, 
                    page: page, 
                    
                },
                headers: {
                    Authorization: `Bearer ${process.env.API_TOKEN}`, 
                },
            });
        //console.log("APi response: ", response.data);
        movies = movies.concat(response.data.results);
        }
        return movies;
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
        //const genreString = movie.genre_ids ? movie.genre_ids.join(', '):'';
        
        try {

            const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

            await pool.query(
                'insert into "Movies" ("id", "title", "release_year", "picture") values ($1, $2, $3, $4) on conflict ("id") do nothing',
                [movie.id, movie.title, releaseYear, movie.poster_path]
            );

            /*for (const genreId of movie.genre_ids) {
                await pool.query('INSERT INTO "movie_genres" (movie_id, genre_id) VALUES ($1, $2)', [movie.id, genreId]);
            }*/
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