document.addEventListener('DOMContentLoaded', function() {

    // --- CONFIGURATION ---
   // const apiKey = '3192ab461d652eebacaa42aead93db3f'; // <-- IMPORTANT: REPLACE WITH YOUR KEY
    //const fixtureId = '1326579';
    const statsToShow = [
        'Total Shots',
        'Shots on Goal',
        'Shots off Goal',
        'Blocked Shots',
        'Ball Possession',
        'Corner Kicks',
        'Fouls',
        'Yellow Cards',
        'Red Cards',
        'Total passes',
        'expected_goals',
    ];
        const refreshInterval = 30000;
    // --- END CONFIGURATION ---

    const statsContainer = document.getElementById('stats-container');
    const teamColorsCache = {};

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
                let dominantColor = 'rgb(100, 100, 100)';

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
                    if (a < 200 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) continue;
                    const rgb = `rgb(${r},${g},${b})`;
                    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
                    if (colorCounts[rgb] > maxCount) { maxCount = colorCounts[rgb]; dominantColor = rgb; }
                }
                resolve(dominantColor);
            };
            img.onerror = (err) => { console.error("Error loading image for color analysis:", err); reject('rgb(100, 100, 100)'); };
        });
    }

    async function fetchAndUpdateStats() {
        console.log('Fetching latest stats...');
        const url = `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            });
            const data = await response.json();
            
            statsContainer.innerHTML = '';
            const homeTeam = data.response[0];
            const awayTeam = data.response[1];

            const homeColor = teamColorsCache[homeTeam.team.id] || (teamColorsCache[homeTeam.team.id] = await getDominantColor(homeTeam.team.logo));
            const awayColor = teamColorsCache[awayTeam.team.id] || (teamColorsCache[awayTeam.team.id] = await getDominantColor(awayTeam.team.logo));

            document.getElementById('home-name').textContent = homeTeam.team.name;
            document.getElementById('home-logo').src = homeTeam.team.logo;
            document.getElementById('away-name').textContent = awayTeam.team.name;
            document.getElementById('away-logo').src = awayTeam.team.logo;

            statsToShow.forEach(statName => {
                const homeStatRaw = homeTeam.statistics.find(s => s.type === statName)?.value ?? 0;
                const awayStatRaw = awayTeam.statistics.find(s => s.type === statName)?.value ?? 0;
                const homeValue = parseFloat(homeStatRaw) || 0;
                const awayValue = parseFloat(awayStatRaw) || 0;

                let homePercentage = 0, awayPercentage = 0;
                const total = homeValue + awayValue;

                if (total > 0) { homePercentage = (homeValue / total) * 100; awayPercentage = (awayValue / total) * 100; }
                if (statName === 'Ball Possession') { homePercentage = homeValue; awayPercentage = awayValue; }

                const row = document.createElement('div');
                // Use a new class for the new layout
                row.className = 'new-stat-row';
                
                // --- THIS HTML IS COMPLETELY REBUILT FOR THE STACKED BAR LAYOUT ---
                row.innerHTML = `
                    <div class="new-stat-label">${statName === 'Ball Possession' ? 'Possession' : statName === 'expected_goals' ? 'Expected Goals' : statName}</div>
                    <div class="new-stat-bar-area">
                        <div class="new-stat-value home">${homeStatRaw || '0'}</div>
                        <div class="combined-bar-container">
                            <div class="bar-segment" style="width: ${homePercentage}%; background-color: ${homeColor};"></div>
                            <div class="bar-segment" style="width: ${awayPercentage}%; background-color: ${awayColor};"></div>
                        </div>
                        <div class="new-stat-value away">${awayStatRaw || '0'}</div>
                    </div>
                `;
                statsContainer.appendChild(row);
            });
        } catch (err) {
            console.error(err);
            statsContainer.innerHTML = '<h1>Error loading stats</h1>';
        }
    }

    fetchAndUpdateStats();
    setInterval(fetchAndUpdateStats, refreshInterval);
});