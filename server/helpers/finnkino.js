import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
import pool from './db.js';
import { exec } from 'child_process';

dotenv.config();

async function fetchShowtimes() {
    try {
        // Run the curl command to fetch the data from Finnkino API
        const curlCommand = `curl -X GET "https://www.finnkino.fi/xml/Schedule/" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"`;

        // Execute the curl command
        const response = await new Promise((resolve, reject) => {
            exec(curlCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error executing curl: ${stderr}`);
                } else {
                    resolve(stdout); // This will be the XML response from Finnkino API
                }
            });
        });

        const result = await parseStringPromise(response);

        // Log the parsed response to inspect the structure
        //console.log("Parsed Finnkino response:", JSON.stringify(result, null, 2));

        // Check if Shows exist in the response
        if (result.Schedule && result.Schedule.Shows && result.Schedule.Shows[0]) {
            const shows = result.Schedule.Shows[0].Show;
            //console.log("Shows data:", shows);

            // Map the result to showtimes
            const showtimes = shows.map(show => {
                const showTimeStr = show.dttmShowStart ? show.dttmShowStart[0] : null;
                const title = show.Title ? show.Title[0] : "Unknown"; // Fallback to "Unknown" if title is missing
                const theatre = show.Theatre ? show.Theatre[0] : "Unknown"; // Fallback if theatre is missing
                const picture = show.Images && show.Images[0].EventSmallImagePortrait ? show.Images[0].EventSmallImagePortrait[0] :  null;

                // Check if showtime is valid
                let showtimeDate;
                if (showTimeStr) {
                    showtimeDate = new Date(showTimeStr);
                    if (isNaN(showtimeDate)) {
                        console.error(`Invalid date format for showtime: ${showTimeStr}`);
                        return null; // Return null if invalid date
                    }
                } else {
                    console.error("No showtime found for show:", show);
                    return null;
                }

                return {
                    id: show.ID[0],
                    title: title, // Ensure title is set
                    theatre: theatre, // Ensure theatre is set
                    startTime: showtimeDate.toISOString(), // Use the formatted ISO string
                    pic_link: picture,
                };
            }).filter(showtime => showtime !== null); // Filter out null values

            //console.log("Mapped showtimes:", showtimes);

            return showtimes;
        } else {
            throw new Error("Shows data not found in the API response.");
        }
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        throw error; // Rethrow the error for higher-level handling
    }
}

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