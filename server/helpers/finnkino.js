import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
import pool from './db.js';
import axios from 'axios';
import fetchWithPuppeteer from './fetchSchedule.js';

dotenv.config();

async function fetchShowtimes(areaId, dateStr) {
    try {
        // Attempt to use axios
        const response = await axios.get('https://www.finnkino.fi/xml/Schedule/', {
            params: { area: areaId, dt: dateStr },
            headers: {
                'Accept': 'application/xml',
                'User-Agent': 'Mozilla/5.0',
            },
        });
        return response.data;
    } catch (axiosError) {
        console.warn('Axios failed, falling back to Puppeteer:', axiosError.message);

        // Fallback to Puppeteer
        return await fetchWithPuppeteer(areaId, dateStr);
    }
};


async function saveTimes(showtimesData) { 
    try {
        const deleteQuery = `DELETE FROM "Showtimes";`;
        await pool.query(deleteQuery);
        console.log("Showtimes table has been cleared.");
        
        const queryText = `
            INSERT INTO "Showtimes" (id, movie_title, theatre_name, show_time, picture)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;

        const promises = showtimesData.map(async (showtime) => {
            //console.log("Raw showtime:", showtime);

            // Ensure we are getting the correct values
            const { id, title, theatre, startTime, pic_link } = showtime;

            // Validate if all required fields are present
            if (!id || !title || !theatre || !startTime || !pic_link) {
                console.error("Missing data for movie:", id, title, theatre, startTime, pic_link);
                return; // Skip this showtime if any required field is missing
            }

            // Ensure startTime is a valid Date object or string
            const showtimeDate = new Date(startTime);

            // Check if the date is valid
            if (isNaN(showtimeDate)) {
                throw new Error(`Invalid showtime format: ${startTime}`);
            }

            // Log the formatted showtime to verify it's correct
            console.log("Formatted showtime:", showtimeDate.toISOString());

            const values = [id, title, theatre, showtimeDate, pic_link];

            // Now insert the values into the database correctly
            const res = await pool.query(queryText, values);
            return res.rows[0].id;  // Returns the ID of the inserted showtime
        });

        const insertedShowtimes = await Promise.all(promises);
        console.log('Showtimes saved:', insertedShowtimes);

        return insertedShowtimes;
    } catch (error) {
        console.error('Error saving showtimes:', error);
        throw new Error('Error saving showtimes');
    }
}

export { fetchShowtimes, saveTimes };