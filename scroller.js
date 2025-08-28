// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {
    
    const panelSwitchInterval = 10000; // 10 seconds per panel
    const filmstrip = document.getElementById('filmstrip');
    const panelTitle = document.getElementById('panel-title');
    let currentPanel = 0; // Start at 0 to make the math easier
    let totalPanels = 0;
    let panelInterval;

    // --- Carousel Animation Logic ---
    function cyclePanels() {
        totalPanels = filmstrip.children.length;
        if (totalPanels <= 1) return;

        currentPanel = (currentPanel + 1) % totalPanels;

        // Update filmstrip position
        filmstrip.style.transform = `translateX(-${currentPanel * (100 / totalPanels)}%)`;

        // Update header title based on the new panel
        const activePanel = filmstrip.children[currentPanel];
        panelTitle.textContent = activePanel.dataset.title || 'Live Ticker';
    }

    function startCarousel() {
        // Clear any existing interval to prevent it from speeding up
        if (panelInterval) clearInterval(panelInterval);
        // Start a new one
        panelInterval = setInterval(cyclePanels, panelSwitchInterval);
    }


    // --- Function to render the graphic using data from localStorage ---
    function updateFromStorage() {
        console.log("Scroller: Checking storage for updates...");
        
        // Get all data sources. If a source doesn't exist, JSON.parse(null) will correctly result in null.
        const liveFixtures = JSON.parse(localStorage.getItem('live_fixtures_data'));
        const fixtureDetail = JSON.parse(localStorage.getItem('fixture_detail_data'));
        const fixtureStats = JSON.parse(localStorage.getItem('fixture_stats_data'));
        const fixturePlayers = JSON.parse(localStorage.getItem(`fixture_players_data_${fixtureId}`));

        updatePanels(liveFixtures, fixtureDetail, fixtureStats, fixturePlayers);
    }

    // --- Listen for the 'storage' event from the Data Hub ---
    window.addEventListener('storage', function(e) {
        const keysToWatch = [
            'live_fixtures_data', 
            'fixture_detail_data', 
            'fixture_stats_data',
            `fixture_players_data_${fixtureId}`
        ];
        if (keysToWatch.includes(e.key)) {
            console.log(`Scroller: Detected data update for ${e.key}.`);
            updateFromStorage();
        }
    });
    
    // --- The function that builds the HTML for all panels ---
    function updatePanels(liveFixtures, fixtureDetail, fixtureStats, fixturePlayers) {
        filmstrip.innerHTML = ''; // Clear existing panels before rebuilding

        // Panel 1: Live Scores (This will now always be built)
        const liveScoresPanel = document.createElement('div');
        liveScoresPanel.className = 'ticker-panel';
        liveScoresPanel.dataset.title = 'Live Scores';
        let scoresHTML = '<div class="live-scores-list">';
        if (liveFixtures && liveFixtures.length > 0) {
            liveFixtures.forEach(fixture => { scoresHTML += `<div class="score-item"><span class="status">${fixture.fixture.status.elapsed}'</span><span class="team-name">${fixture.teams.home.name}</span><span class="score">${fixture.goals.home} - ${fixture.goals.away}</span><span class="team-name" style="text-align: right;">${fixture.teams.away.name}</span></div>`; });
        } else { scoresHTML += '<div>No live games currently.</div>'; }
        scoresHTML += '</div>';
        liveScoresPanel.innerHTML = scoresHTML;
        filmstrip.appendChild(liveScoresPanel);

        // Panel 2: Match Stats (Built only if data exists)
        if (fixtureDetail && fixtureStats) {
            const matchStatsPanel = document.createElement('div');
            matchStatsPanel.className = 'ticker-panel';
            matchStatsPanel.dataset.title = 'Match Stats';
            const homeTeamStats = fixtureStats.find(team => team.team.id === fixtureDetail.teams.home.id);
            const awayTeamStats = fixtureStats.find(team => team.team.id === fixtureDetail.teams.away.id);
            const findStat = (stats, type) => stats?.statistics.find(s => s.type === type)?.value ?? '-';
            const statsToDisplay = [{ type: 'Total Shots', label: 'Total Shots' }, { type: 'Shots on Goal', label: 'On Target' }, { type: 'Shots off Goal', label: 'Off Target'}, { type: 'Blocked Shots', label: 'Blocked Shots'}, { type: 'Ball Possession', label: 'Possession' }, { type: 'Corner Kicks', label: 'Corners' }, { type: 'Fouls', label: 'Fouls' }, { type: 'Yellow Cards', label: 'Yellow Cards'},{ type: 'Red Cards', label: 'Red Cards'},{ type: 'expected_goals', label: 'xG'}  ];
            let statsGridHTML = '';
            statsToDisplay.forEach(stat => { statsGridHTML += `<div>${findStat(homeTeamStats, stat.type)}</div><div class="label">${stat.label}</div><div>${findStat(awayTeamStats, stat.type)}</div>`; });
            matchStatsPanel.innerHTML = `<div class="stats-header"><div class="stats-team home"><img src="${fixtureDetail.teams.home.logo}" class="stats-team-logo"><span>${fixtureDetail.teams.home.name}</span></div><div class="stats-score">${fixtureDetail.goals.home} - ${fixtureDetail.goals.away}</div><div class="stats-team away"><img src="${fixtureDetail.teams.away.logo}" class="stats-team-logo"><span>${fixtureDetail.teams.away.name}</span></div></div><div class="stats-grid">${statsGridHTML}</div>`;
            filmstrip.appendChild(matchStatsPanel);
        }

        // Panels 3 & 4: Player Ratings (Built only if data exists)
        if (fixturePlayers && fixturePlayers.length === 2) {
            const homeTeamPlayerData = fixturePlayers[0];
            const awayTeamPlayerData = fixturePlayers[1];

            const homeRatingsPanel = document.createElement('div');
            homeRatingsPanel.className = 'ticker-panel player-ratings-panel';
            homeRatingsPanel.dataset.title = `${homeTeamPlayerData.team.name} Ratings`;
            homeRatingsPanel.innerHTML = generatePlayerRatingsHTML(homeTeamPlayerData);
            filmstrip.appendChild(homeRatingsPanel);
            
            const awayRatingsPanel = document.createElement('div');
            awayRatingsPanel.className = 'ticker-panel player-ratings-panel';
            awayRatingsPanel.dataset.title = `${awayTeamPlayerData.team.name} Ratings`;
            awayRatingsPanel.innerHTML = generatePlayerRatingsHTML(awayTeamPlayerData);
            filmstrip.appendChild(awayRatingsPanel);
        }
        
        // After adding all panels, update the filmstrip width and restart the carousel
        totalPanels = filmstrip.children.length;
        if (totalPanels > 0) {
            filmstrip.style.width = `${totalPanels * 100}%`;
            filmstrip.childNodes.forEach(node => {
                node.style.width = `${100 / totalPanels}%`;
            });
        }
        startCarousel(); 
    }

    // --- Function to generate HTML for a player ratings list ---
    function generatePlayerRatingsHTML(teamData) {
        let ratingsHTML = '<div class="player-rating-list">';
        teamData.players.forEach(p => {
            const stats = p.statistics[0];
            if (stats.games.minutes) { 
                const rating = stats.games.rating ? parseFloat(stats.games.rating).toFixed(1) : '-';
                
                // --- NEW: Logic to determine rating color class ---
                const r = parseFloat(rating);
                let ratingClass = ''; // Default class
                if (r <= 6) ratingClass = 'rating-red';
                else if (r > 7 && r <= 8) ratingClass = 'rating-green-light';
                else if (r > 8 && r <= 9) ratingClass = 'rating-green-dark';
                else if (r > 9) ratingClass = 'rating-blue';

                ratingsHTML += `
                    <div class="rating-item">
                        <span class="player-name">${p.player.name}</span>
                        <span class="player-rating ${ratingClass}">${rating}</span>
                    </div>
                `;
            }
        });
        ratingsHTML += '</div>';
        return ratingsHTML;
    }

    // --- Update the graphic once on initial load ---
    console.log("Scroller: Initial load.");
    updateFromStorage();
});
