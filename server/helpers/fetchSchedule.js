import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { parseStringPromise } from 'xml2js';

puppeteer.use(StealthPlugin());

const fetchWithPuppeteer = async (areaId, dateStr) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0');

        const url = `https://www.finnkino.fi/xml/Schedule/?area=${areaId}&dt=${dateStr}`;
        console.log(`Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Extract the raw HTML of the page
        const rawHtml = await page.content();
        console.log('Extracted Raw HTML (First 500 chars):', rawHtml.slice(0, 500));

        // Extract XML content from the raw HTML by locating <Schedule> tag
        const startIdx = rawHtml.indexOf('<Schedule');
        const endIdx = rawHtml.lastIndexOf('</Schedule>') + '</Schedule>'.length;

        if (startIdx === -1 || endIdx === -1) {
            console.error('Error: Could not locate valid XML content in the response.');
            throw new Error('Could not locate valid XML content in the response');
        }

        // Extract the XML part from the HTML content
        let xmlData = rawHtml.substring(startIdx, endIdx).trim();
        console.log('Extracted XML Data (First 500 chars):', xmlData.slice(0, 500));

        // Clean the XML content to avoid issues
        // Remove empty xmlns="" and other potential problematic parts
        xmlData = xmlData.replace(/xmlns=""/g, '').trim();

        // Remove any non-XML characters at the beginning or end
        xmlData = xmlData.replace(/^[\x00-\x20\xA0]+/g, '');  // Remove leading whitespaces or BOM
        xmlData = xmlData.replace(/[\x00-\x20\xA0]+$/g, '');  // Remove trailing whitespaces

        // Check if the XML is well-formed and starts with '<?xml'
        if (!xmlData.startsWith('<?xml') && !xmlData.startsWith('<Schedule')) {
            console.error('Error: Invalid XML format received:', xmlData.slice(0, 100));
            throw new Error('Invalid XML format received from Puppeteer');
        }

        // Parse the XML data
        const result = await parseStringPromise(xmlData);
        return result;

    } catch (error) {
        console.error('Error during Puppeteer fetch:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
};

export default fetchWithPuppeteer;
