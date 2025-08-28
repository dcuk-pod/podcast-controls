// player_stats.js

window.addEventListener('load', function() {

    const container = document.getElementById('player-stats-container');

    // --- Main function to initialize and render the graphic ---
    function initializeGraphic() {
        console.log("PLAYERSTATS: Initializing or updating graphic from localStorage...");
        try {
            // --- STEP 1: Determine which fixture data to load (live vs. review) ---
            // The 'urlParams' constant is correctly read from the global scope of the HTML file.
            if (typeof urlParams === 'undefined') {
                throw new Error("Configuration error: urlParams not defined in the HTML file.");
            }
            const fixtureType = urlParams.get('type');
            const currentFixtureId = fixtureType === 'review' ? fixtureReviewId : fixtureId;

            // --- STEP 2: Define localStorage keys based on the fixture ID ---
            const playersDataKey = `fixture_players_data_${currentFixtureId}`;
            const fixtureDetailKey = fixtureType === 'review' ? `fixture_detail_data_${currentFixtureId}` : 'fixture_detail_data';

            // --- STEP 3: Retrieve data from the data hub (localStorage) ---
            const playersDataStr = localStorage.getItem(playersDataKey);
            const fixtureDetailStr = localStorage.getItem(fixtureDetailKey);

            // --- STEP 4: Check if all necessary data exists ---
            if (!playersDataStr || !fixtureDetailStr) {
                throw new Error(`Required data not found in hub for fixture ${currentFixtureId}. Waiting for data_fetcher...`);
            }

            // --- STEP 5: Parse the JSON strings into usable objects ---
            const playersData = JSON.parse(playersDataStr);
            const fixtureDetail = JSON.parse(fixtureDetailStr);

            // --- STEP 6: Call the function to build the HTML with the retrieved data ---
            buildGraphic(fixtureDetail, playersData);

        } catch (err) {
            console.error("PLAYERSTATS RENDER ERROR:", err);
            container.innerHTML = `<h1>Waiting for data...</h1><p>${err.message}</p>`;
        }
    }

    // --- Builds the complete HTML for the graphic ---
    function buildGraphic(fixtureDetail, playersData) {
        container.innerHTML = ''; // Clear previous content

        // --- FIX: Add a defensive check for player data ---
        // This ensures that if the player data hasn't loaded yet, or is incomplete,
        // the graphic will show a waiting message instead of crashing.
        if (!playersData || !playersData[0] || !playersData[1] || !playersData[0].team || !playersData[1].team) {
            console.warn("PLAYERSTATS: Player data is not available or is incomplete. Waiting for the next update from the data hub.");
            container.innerHTML = `<h1>Waiting for player data...</h1>`;
            return; // Exit the function to prevent errors.
        }

        const homeTeamData = playersData[0];
        const awayTeamData = playersData[1];

        const wrapper = document.createElement('div');
        wrapper.className = 'stats-wrapper';

        wrapper.innerHTML = `
            <div class="background-logos">
                <img src="${fixtureDetail.teams.home.logo}" alt="${fixtureDetail.teams.home.name} Logo">
                <img src="${fixtureDetail.teams.away.logo}" alt="${fixtureDetail.teams.away.name} Logo">
            </div>
        `;

        const content = document.createElement('div');
        content.className = 'stats-content';

        const fixtureDate = new Date(fixtureDetail.fixture.date);
        const formattedDate = fixtureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        content.innerHTML = `
            <div class="top-bar">
                <img src="${fixtureDetail.league.logo}" alt="${fixtureDetail.league.name}" class="league-logo">
                <div class="fixture-details">
                    <div class="fixture-name">
                        <span class="team-name home">${fixtureDetail.teams.home.name}</span>
                        <span class="scoreline">${fixtureDetail.goals.home} - ${fixtureDetail.goals.away}</span>
                        <span class="team-name away">${fixtureDetail.teams.away.name}</span>
                    </div>
                    <div class="fixture-meta">${formattedDate} | ${fixtureDetail.fixture.venue.name}</div>
                </div>
            </div>
        `;

        const tablesArea = document.createElement('div');
        tablesArea.className = 'tables-area';

        tablesArea.innerHTML = `
            <div class="team-table-container">
                <div class="team-header">
                    <img src="${homeTeamData.team.logo}" alt="${homeTeamData.team.name} Logo">
                    <h3>${homeTeamData.team.name}</h3>
                </div>
                <table class="player-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th class="text-center">#</th>
                            <th class="text-center">Mins</th>
                            <th class="text-center">Rating</th>
                            <th class="text-center">Shots (On)</th>
                            <th class="text-center">Goals</th>
                            <th class="text-center">Conceded</th>
                            <th class="text-center">Pass %</th>
                            <th class="text-center">Cards</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generatePlayerRows(homeTeamData.players)}
                    </tbody>
                </table>
            </div>
            <div class="team-table-container">
                <div class="team-header">
                    <img src="${awayTeamData.team.logo}" alt="${awayTeamData.team.name} Logo">
                    <h3>${awayTeamData.team.name}</h3>
                </div>
                <table class="player-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th class="text-center">#</th>
                            <th class="text-center">Mins</th>
                            <th class="text-center">Rating</th>
                            <th class="text-center">Shots (On)</th>
                            <th class="text-center">Goals</th>
                            <th class="text-center">Conceded</th>
                            <th class="text-center">Pass %</th>
                            <th class="text-center">Cards</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generatePlayerRows(awayTeamData.players)}
                    </tbody>
                </table>
            </div>
        `;

        content.appendChild(tablesArea);
        wrapper.appendChild(content);
        container.appendChild(wrapper);
        
        setTimeout(() => tablesArea.classList.add('visible'), 100);
    }

    // --- Generates the HTML for all player rows for a single team ---
    function generatePlayerRows(players) {
        let rowsHtml = '';
        players.forEach(p => {
            const stats = p.statistics[0];
            const rating = stats.games.rating ? parseFloat(stats.games.rating).toFixed(1) : '-';
            
            const r = parseFloat(rating);
            let ratingClass = 'rating-neutral';
            if (r <= 6) ratingClass = 'rating-red';
            else if (r > 7 && r <= 8) ratingClass = 'rating-green-light';
            else if (r > 8 && r <= 9) ratingClass = 'rating-green-dark';
            else if (r > 9) ratingClass = 'rating-blue';

            let cardDisplay = '-';
            if (stats.cards.yellow > 0) cardDisplay = '<span class="card-yellow"></span>';
            if (stats.cards.red > 0) cardDisplay = (cardDisplay !== '-') ? `${cardDisplay} <span class="card-red"></span>` : '<span class="card-red"></span>';

            rowsHtml += `
                <tr>
                    <td>${p.player.name}</td>
                    <td class="text-center">${stats.games.number || '-'}</td>
                    <td class="text-center">${stats.games.minutes || '-'}</td>
                    <td class="text-center"><span class="rating-cell ${ratingClass}">${rating}</span></td>
                    <td class="text-center">${stats.shots.total || 0} (${stats.shots.on || 0})</td>
                    <td class="text-center">${stats.games.position === 'G' ? '-' : (stats.goals.total || 0)}</td>
                    <td class="text-center">${stats.games.position !== 'G' ? '-' : (stats.goals.conceded !== null ? stats.goals.conceded : 0)}</td>
                    <td class="text-center">${stats.passes.accuracy || 0}%</td>
                    <td class="text-center">${cardDisplay}</td>
                </tr>
            `;
        });
        return rowsHtml;
    }

    // --- KICK EVERYTHING OFF ---
    initializeGraphic();

    // --- Listen for updates from the data_fetcher hub ---
    window.addEventListener('storage', function(event) {
        // The urlParams constant is defined in the HTML file's scope
        const fixtureType = urlParams.get('type');
        const currentFixtureId = fixtureType === 'review' ? fixtureReviewId : fixtureId;
        const playersDataKey = `fixture_players_data_${currentFixtureId}`;
        const fixtureDetailKey = fixtureType === 'review' ? `fixture_detail_data_${currentFixtureId}` : 'fixture_detail_data';

        if (event.key === playersDataKey || event.key === fixtureDetailKey) {
            console.log(`HUB-UPDATE: ${event.key} was updated. Re-rendering player stats.`);
            initializeGraphic();
        }
    });

});
