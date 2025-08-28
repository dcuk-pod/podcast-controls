// matchstats_review.js

window.addEventListener('load', function() {

    const statsContainer = document.getElementById('stats-container');

    function initializeGraphic() {
        console.log("MATCHSTATS-REVIEW: Initializing or updating graphic from localStorage...");
        try {
            // --- STEP 1: Define localStorage keys using the fixtureReviewId ---
            const fixtureDetailKey = `fixture_detail_data_${fixtureReviewId}`;
            const fixtureStatsKey = `fixture_stats_data_${fixtureReviewId}`;

            // --- STEP 2: Retrieve data from the data hub ---
            const fixtureDetailStr = localStorage.getItem(fixtureDetailKey);
            const fixtureStatsStr = localStorage.getItem(fixtureStatsKey);

            // --- STEP 3: Check if all data exists ---
            if (!fixtureDetailStr || !fixtureStatsStr) {
                throw new Error("Required match data not found in hub for review fixture. Ensure the data_fetcher is running.");
            }

            // --- STEP 4: Parse the JSON strings ---
            const fixture = JSON.parse(fixtureDetailStr);
            const stats = JSON.parse(fixtureStatsStr);

            const homeTeamId = fixture.teams.home.id;
            const awayTeamId = fixture.teams.away.id;
            const homeColor = TEAM_COLORS[homeTeamId] || TEAM_COLORS['default'];
            const awayColor = TEAM_COLORS[awayTeamId] || TEAM_COLORS['default'];

            // --- STEP 5: Call the function to build the HTML ---
            buildGraphic(fixture, stats, homeColor, awayColor);

        } catch (err) {
            console.error("MATCHSTATS-REVIEW RENDER ERROR:", err);
            statsContainer.innerHTML = `<h1>Waiting for review data...</h1><p>${err.message}</p>`;
        }
    }

    function buildGraphic(fixture, stats, homeColor, awayColor) {
        statsContainer.innerHTML = '';

        const homeTeamStats = stats.find(team => team.team.id === fixture.teams.home.id);
        const awayTeamStats = stats.find(team => team.team.id === fixture.teams.away.id);
        
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

    initializeGraphic();

    // --- MODIFICATION: Listen for updates to the review fixture data ---
    window.addEventListener('storage', function(event) {
        const fixtureDetailKey = `fixture_detail_data_${fixtureReviewId}`;
        const fixtureStatsKey = `fixture_stats_data_${fixtureReviewId}`;

        if (event.key === fixtureDetailKey || event.key === fixtureStatsKey) {
            console.log(`HUB-UPDATE-REVIEW: ${event.key} was updated. Re-rendering match stats.`);
            initializeGraphic();
        }
    });
});