import { Router } from 'express';
import pool from '../helpers/db.js';
import { parseStringPromise } from 'xml2js';
import fetchWithPuppeteer from '../helpers/fetchSchedule.js'; 
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
import axios from 'axios';

const router = Router();

const generateDateString = (date) => date.toISOString().split('T')[0];

router.get('/shows', async (req, res) => {
    try {
        const { area_id } = req.query;

        // Ensure area_id is provided
        if (!area_id) {
            return res.status(400).json({ error: 'Area is required' });
        }

        const today = new Date();
        const dateStr = generateDateString(today);  // Use today's date for the query

        console.log(`Fetching showtimes for: ${dateStr}`);  // Log the date being requested

        // Fetch showtimes for the selected area and date
        const xmlData = await fetchWithPuppeteer(area_id, dateStr);

        // Log the PubDate from the response to ensure it's correctly returned
        console.log("PubDate from API response:", xmlData.Schedule.PubDate[0]);

        if (xmlData && xmlData.Schedule && xmlData.Schedule.Shows && xmlData.Schedule.Shows[0]) {
            const shows = xmlData.Schedule.Shows[0].Show;

            const seenIds = new Set();

            const showData = shows.map(show => {
                if (seenIds.has(show.ID[0])) {
                    return null; // Skip duplicates
                }

                seenIds.add(show.ID[0]);

                const showTimeStr = show.dttmShowStart ? show.dttmShowStart[0] : null;
                const title = show.Title ? show.Title[0] : "Unknown";
                const theatre = show.Theatre ? show.Theatre[0] : "Unknown";
                const picture = show.Images && show.Images[0].EventSmallImagePortrait ? show.Images[0].EventSmallImagePortrait[0] : null;

                let showtimeDate;
                if (showTimeStr) {
                    showtimeDate = new Date(showTimeStr);
                    if (isNaN(showtimeDate)) {
                        return null;
                    }
                } else {
                    return null;
                }

                return {
                    id: show.ID[0],
                    title: title,
                    theatre: theatre,
                    startTime: showtimeDate.toISOString(),
                    pic_link: picture,
                };
            }).filter(show => show !== null);

            return res.json(showData);
        } else {
            console.warn(`No shows found for area: ${area_id} on ${dateStr}`);
            return res.status(404).json({ message: "No shows found for the selected date" });
        }

    } catch (error) {
        console.error("Error in fetching showtimes: ", error);
        return res.status(500).send('Error fetching showtimes');
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT area_id, area_name FROM "Areas"');
        res.json(result.rows);        
    } catch (error) {
        console.error('Error fetchin areas: ', error);
        res.status(500).json({ message: 'Failed to fetch areas' });
    }
});

export default router;