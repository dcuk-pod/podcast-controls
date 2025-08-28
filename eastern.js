document.addEventListener('DOMContentLoaded', function() {

    // --- CONFIGURATION ---
   // const apiKey = '3192ab461d652eebacaa42aead93db3f'; // <-- IMPORTANT: REPLACE WITH YOUR KEY
    const leagueId = 253;
    //const season = 2025;
    // --- END CONFIGURATION ---

    const tablesContainer = document.getElementById('tables-container');
    const teamColorsCache = {};

    /**
     * Gets the dominant color from a logo URL.
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
                let dominantColor = '#333333';

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
     * Creates styled spans for the form ticker.
     */
    function formatFormTicker(formString) {
        if (!formString) return '';
        return formString.split('').map(result => `<span class="form-${result}">${result}</span>`).join('');
    }

    /**
     * Gets the CSS class name based on rank.
     */
    function getRankClass(rank) {
        if (rank === 1) return 'rank-1';
        if (rank >= 2 && rank <= 7) return 'rank-2-7';
        if (rank >= 8 && rank <= 9) return 'rank-8-9';
        return '';
    }

    /**
     * Main function to fetch data and build the table.
     */
    async function buildTable() {
        const url = `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            });
            const data = await response.json();
            
            if (!data.response || data.response.length === 0) {
                tablesContainer.innerHTML = '<h1>No standings data available.</h1>';
                return;
            }

            const league = data.response[0].league;
            const allStandings = league.standings;

            // Find the Eastern Conference data specifically
            const conferenceData = allStandings.find(conf => conf[0].group.includes("Eastern Conference"));
            
            if (!conferenceData) {
                tablesContainer.innerHTML = '<h1>Eastern Conference data not found.</h1>';
                return;
            }

            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'table-wrapper';

            const conferenceName = conferenceData[0].group.replace(`MLS ${season}, `, '');

            const tableHeader = `
                <div class="table-header">
                    <img src="${league.logo}" alt="${league.name} Logo" class="league-logo">
                    <h1 class="table-title">Major League Soccer - ${conferenceName} ${season}</h1>
                </div>
            `;

            const table = document.createElement('table');
            table.className = 'standings-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th class="pos">#</th>
                        <th class="team">Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>F</th>
                        <th>A</th>
                        <th>GD</th>
                        <th>Pts</th>
                        <th>Form</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            
            const tableBody = table.querySelector('tbody');

            for (const team of conferenceData) {
                const teamColor = teamColorsCache[team.team.id] || (teamColorsCache[team.team.id] = await getDominantColor(team.team.logo));

                const row = document.createElement('tr');
                row.className = getRankClass(team.rank);
                row.innerHTML = `
                    <td class="pos">${team.rank}</td>
                    <td class="team">
                        <div class="team-cell">
                            <img src="${team.team.logo}" alt="${team.team.name} Logo" class="team-logo">
                            <span class="team-name" style="color: ${teamColor};">${team.team.name}</span>
                        </div>
                    </td>
                    <td>${team.all.played}</td>
                    <td>${team.all.win}</td>
                    <td>${team.all.draw}</td>
                    <td>${team.all.lose}</td>
                    <td>${team.all.goals.for}</td>
                    <td>${team.all.goals.against}</td>
                    <td>${team.goalsDiff}</td>
                    <td><b>${team.points}</b></td>
                    <td class="form-ticker">${formatFormTicker(team.form)}</td>
                `;
                tableBody.appendChild(row);
            }
            
            tableWrapper.innerHTML = tableHeader;
            tableWrapper.appendChild(table);
            tablesContainer.appendChild(tableWrapper);

        } catch (err) {
            console.error("Failed to build league table:", err);
            tablesContainer.innerHTML = '<h1>Error loading league table.</h1>';
        }
    }

    buildTable();
});