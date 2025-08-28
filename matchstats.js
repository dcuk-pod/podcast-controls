// matchstats.js

window.addEventListener('load', function() {

    const statsContainer = document.getElementById('stats-container');

    /**
     * Main function to render the graphic.
     * Reads all necessary data from localStorage, looks up colors, and calls the buildGraphic function.
     */
    function initializeGraphic() {
        console.log("MATCHSTATS: Initializing or updating graphic from localStorage...");
        try {
            // --- STEP 1: Retrieve data from the data hub ---
            const fixtureDetailStr = localStorage.getItem('fixture_detail_data');
            const fixtureStatsStr = localStorage.getItem('fixture_stats_data');

            // --- STEP 2: Check if all data exists ---
            if (!fixtureDetailStr || !fixtureStatsStr) {
                throw new Error("Required match data not found in hub. Ensure the data_fetcher is running.");
            }

            // --- STEP 3: Parse the JSON strings into usable objects ---
            const fixture = JSON.parse(fixtureDetailStr);
            const stats = JSON.parse(fixtureStatsStr);

            // --- STEP 4: Look up team colors from the TEAM_COLORS object in config.js ---
            const homeTeamId = fixture.teams.home.id;
            const awayTeamId = fixture.teams.away.id;

            const homeColor = TEAM_COLORS[homeTeamId] || TEAM_COLORS['default'];
            const awayColor = TEAM_COLORS[awayTeamId] || TEAM_COLORS['default'];

            // --- STEP 5: Call the function to build the HTML with the retrieved data ---
            buildGraphic(fixture, stats, homeColor, awayColor);

        } catch (err) {
            console.error("MATCHSTATS RENDER ERROR:", err);
            statsContainer.innerHTML = `<h1>Waiting for live data...</h1><p>${err.message}</p>`;
        }
    }

    /**
     * Builds the complete HTML for the graphic.
     * This function is the same as your original, but now receives its data from the hub.
     */
    function buildGraphic(fixture, stats, homeColor, awayColor) {
        statsContainer.innerHTML = '';

        const homeTeamStats = stats.find(team => team.team.id === fixture.teams.home.id);
        const awayTeamStats = stats.find(team => team.team.id === fixture.teams.away.id);
        
        // If stats for either team are not available yet, display a waiting message.
        if (!homeTeamStats || !awayTeamStats) {
             statsContainer.innerHTML = '<h1>Waiting for match stats to become available...</h1>';
             return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'stats-wrapper';

        wrapper.innerHTML += `<div class="background-logos"><img src="assets/logos/${fixture.teams.home.id}.png" alt=""><img src="assets/logos/${fixture.teams.away.id}.png" alt=""></div>`;
        const content = document.createElement('div');
        content.className = 'stats-content';

        const fixtureDate = new Date(fixture.fixture.date);
        const formattedDate = fixtureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        content.innerHTML += `
            <div class="top-bar">
                <img src="${fixture.league.logo}" alt="${fixture.league.name}" class="league-logo">
                <div class="fixture-details">
                    <div class="fixture-name">
                        <span class="team-name home">${fixture.teams.home.name}</span>
                        <span class="scoreline">${fixture.goals.home} - ${fixture.goals.away}</span>
                        <span class="team-name away">${fixture.teams.away.name}</span>
                    </div>
                    <div class="fixture-meta">
                        ${formattedDate} | ${fixture.fixture.venue.name}
                        ${fixture.fixture.referee ? ` | Referee: ${fixture.fixture.referee}` : ''}
                    </div>
                </div>
            </div>
        `;

        const statsArea = document.createElement('div');
        statsArea.className = 'stats-area';
        
        const statsToDisplay = ['Total Shots', 'Shots on Goal', 'Shots off Goal', 'Blocked Shots', 'Ball Possession', 'Corner Kicks', 'Fouls', 'Yellow Cards', 'Red Cards', 'Total passes', 'expected_goals'];
        statsToDisplay.forEach(statName => {
            const homeStat = homeTeamStats.statistics.find(s => s.type === statName);
            const awayStat = awayTeamStats.statistics.find(s => s.type === statName);
            if (!homeStat || !awayStat) return;

            // Handle percentage values (like possession) and absolute values differently
            let homeValue, awayValue;
            if (statName === 'Ball Possession') {
                homeValue = parseFloat(homeStat.value) || 0;
                awayValue = parseFloat(awayStat.value) || 0;
            } else {
                homeValue = parseInt(homeStat.value) || 0;
                awayValue = parseInt(awayStat.value) || 0;
            }
            
            const total = homeValue + awayValue;
            const homeWidth = total > 0 ? (homeValue / total) * 100 : 50;
            const awayWidth = total > 0 ? (awayValue / total) * 100 : 50;

            statsArea.innerHTML += `
                <div class="stat-row">
                    <div class="stat-value home">${homeStat.value || 0}</div>
                    <div class="stat-bar-container home">
                        <div class="stat-bar" style="width: ${homeWidth}%; background-color: ${homeColor};"></div>
                    </div>
                    <div class="stat-label">${statName === 'Ball Possession' ? 'Possession' : statName === 'expected_goals' ? 'Expected Goals' : statName}</div>
                    <div class="stat-bar-container away">
                        <div class="stat-bar" style="width: ${awayWidth}%; background-color: ${awayColor};"></div>
                    </div>
                    <div class="stat-value away">${awayStat.value || 0}</div>
                </div>
            `;
        });
        
        content.appendChild(statsArea);
        wrapper.appendChild(content);
        statsContainer.appendChild(wrapper);

        if (!statsArea.classList.contains('animate-in')) {
            setTimeout(() => { statsArea.classList.add('animate-in'); }, 100);
        }
    }

    // --- KICK EVERYTHING OFF ---
    initializeGraphic();

    // Listen for updates from the data_fetcher hub to keep stats live
    window.addEventListener('storage', function(event) {
        // Only re-render if the relevant data has changed
        if (event.key === 'fixture_detail_data' || event.key === 'fixture_stats_data') {
            console.log(`HUB-UPDATE: ${event.key} was updated. Re-rendering match stats.`);
            initializeGraphic();
        }
    });
});