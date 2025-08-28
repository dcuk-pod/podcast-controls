document.addEventListener('DOMContentLoaded', function() {

    // --- CONFIGURATION ---
    const apiKey = '3192ab461d652eebacaa42aead93db3f'; // <-- IMPORTANT: REPLACE WITH YOUR KEY
    const leagueId = 253;
    const season = 2025;
    // --- END CONFIGURATION ---

    const tablesContainer = document.getElementById('tables-container');
    const teamColorsCache = {}; // Cache to store team colors

    /**
     * Reusable function to get the dominant color from a logo.
     */
    function getDominantColor(imageUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const colorCounts = {};
                let maxCount = 0;
                let dominantColor = '#333333'; // Default dark grey

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                    if (a < 200 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) continue;
                    const hex = "#" + ("000000" + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
                    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                    if (colorCounts[hex] > maxCount) { maxCount = colorCounts[hex]; dominantColor = hex; }
                }
                resolve(dominantColor);
            };
            img.onerror = (err) => { console.error("Error loading image for color analysis:", err); reject('#333333'); };
        });
    }

    /**
     * Takes a single character ('W', 'D', or 'L') and creates a styled span for it.
     */
    function formatFormTicker(formString) {
        if (!formString) return '';
        return formString.split('').map(result => `<span class="form-${result}">${result}</span>`).join('');
    }

    /**
     * Gets the CSS class name based on the team's rank.
     */
    function getRankClass(rank) {
        if (rank === 1) return 'rank-1';
        if (rank >= 2 && rank <= 7) return 'rank-2-7';
        if (rank >= 8 && rank <= 9) return 'rank-8-9';
        return '';
    }

    /**
     * The main function to fetch data and build the tables.
     */
   async function buildTables() {
        const url = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;
        try {
            const response = await fetch(url, { /* ... headers ... */ });
            const data = await response.json();
            
            if (!data.response || data.response.length === 0) { /* ... error handling ... */ return; }

            const league = data.response[0].league;
            const standings = league.standings;

            // --- THIS IS THE KEY CHANGE ---
            // Find the specific conference data instead of looping
            const conference = standings.find(conf => conf[0].group.includes("Eastern Conference"));
            
            if (!conference) {
                tablesContainer.innerHTML = '<h1>Eastern Conference data not found.</h1>';
                return;
            }
            // --- END OF CHANGE ---

            // The rest of the code now builds just ONE table using the 'conference' variable
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-wrapper';
            const conferenceName = conference[0].group.replace(`MLS ${season}, `, '');
            const tableHeader = `...`; // Same header building logic
            const table = document.createElement('table');
            // ... Same table building logic ...
            const tableBody = table.querySelector('tbody');

            for (const team of conference) {
                // ... Same logic for building each row ...
            }
            
            tableWrapper.innerHTML = tableHeader;
            tableWrapper.appendChild(table);
            tablesContainer.appendChild(tableWrapper);

        } catch (err) { /* ... error handling ... */ }
    }

    buildTables();
});