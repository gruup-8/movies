import pool from './helpers/db.js'; // PostgreSQL library
import { parseStringPromise } from 'xml2js'; // XML parsing library
import fs from 'fs';
//firs run this in git bash
//curl -X GET "https://www.finnkino.fi/xml/TheatreAreas/" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"> theatre_area.xml
//then this (be in the server file): node save_areas.js 
//the latter is propably enough if you already have file named theatre_area.xml 


async function saveTheatreAreas(xmlData) {
    try {
        // Step 1: Parse XML
        const parsedData = await parseStringPromise(xmlData);
        
        // Step 2: Map parsed data
        const areas = parsedData.TheatreAreas.TheatreArea.map(area => ({
            area_id: parseInt(area.ID[0], 10), // Convert ID to integer
            area_name: area.Name[0], // Get the name string
        }));

        // Step 3: Insert into database
        const insertQuery = `
            INSERT INTO "Areas" (area_id, area_name)
            VALUES ($1, $2)
            ON CONFLICT (area_id) DO NOTHING;
        `;

        for (const area of areas) {
            await pool.query(insertQuery, [area.area_id, area.area_name]);
        }

        console.log('All theatre areas have been saved successfully!');
    } catch (error) {
        console.error('Error saving theatre areas:', error);
    } finally {
        await pool.end(); // Close the database connection
    }
}
async function main() {
    // Read XML from file or curl output
    const xmlData = fs.readFileSync('theatre_area.xml', 'utf-8'); // Or directly use your curl response string
    await saveTheatreAreas(xmlData);
}
main();