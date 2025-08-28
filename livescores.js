// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {
    
    const panelSwitchInterval = 10000;
    const filmstrip = document.getElementById('filmstrip');
    const panelTitle = document.getElementById('panel-title');
    let currentPanel = 1;

    // Carousel Animation Logic
    setInterval(() => {
        const panelCount = filmstrip.children.length;
        if (panelCount > 1) {
            currentPanel = (currentPanel === 1) ? 2 : 1;
            if (currentPanel === 2) {
                filmstrip.classList.add('show-panel-2');
                panelTitle.textContent = 'Match Stats';
            } else {
                filmstrip.classList.remove('show-panel-2');
                panelTitle.textContent = 'Live Scores';
            }
        }
    }, panelSwitchInterval);

    // Function to render the graphic using data from localStorage
    function updateFromStorage() {
        const liveFixtures = JSON.parse(localStorage.getItem('live_fixtures_data'));
        const fixtureDetail = JSON.parse(localStorage.getItem('fixture_detail_data'));
        const fixtureStats = JSON.parse(localStorage.getItem('fixture_stats_data'));

        if (liveFixtures && fixtureDetail && fixtureStats) {
            updatePanels(liveFixtures, fixtureDetail, fixtureStats);
        }
    }

    // Listen for the 'storage' event, which fires when the Data Hub saves new data
    window.addEventListener('storage', function(e) {
        if (['live_fixtures_data', 'fixture_detail_data', 'fixture_stats_data'].includes(e.key)) {
            console.log("Scroller: Detected data update from hub.");
            updateFromStorage();
        }
    });
    
    // The function that builds the HTML for the panels
    function updatePanels(liveFixtures, fixtureDetail, fixtureStats) {
        let liveScoresPanel = filmstrip.querySelector('.live-scores-panel');
        if (!liveScoresPanel) {
            filmstrip.innerHTML = '';
            liveScoresPanel = document.createElement('div');
            liveScoresPanel.className = 'ticker-panel live-scores-panel';
            filmstrip.appendChild(liveScoresPanel);
        }
        let matchStatsPanel = filmstrip.querySelector('.match-stats-panel');
        if (!matchStatsPanel) {
            matchStatsPanel = document.createElement('div');
            matchStatsPanel.className = 'ticker-panel match-stats-panel';
            filmstrip.appendChild(matchStatsPanel);
        }
        let scoresHTML = '<div class="live-scores-list">';
        if (liveFixtures && liveFixtures.length > 0) {
            liveFixtures.forEach(fixture => { scoresHTML += `<div class="score-item"><span class="status">${fixture.fixture.status.elapsed}'</span><span class="team-name">${fixture.teams.home.name}</span><span class="score">${fixture.goals.home} - ${fixture.goals.away}</span><span class="team-name" style="text-align: right;">${fixture.teams.away.name}</span></div>`; });
        } else { scoresHTML += '<div>No live games currently.</div>'; }
        scoresHTML += '</div>';
        liveScoresPanel.innerHTML = scoresHTML;
        if (!fixtureDetail || !fixtureStats) {
            matchStatsPanel.innerHTML = `<div>Match stats data not available.</div>`;
            return;
        }
        const homeTeamStats = fixtureStats.find(team => team.team.id === fixtureDetail.teams.home.id);
        const awayTeamStats = fixtureStats.find(team => team.team.id === fixtureDetail.teams.away.id);
        const findStat = (stats, type) => stats?.statistics.find(s => s.type === type)?.value ?? '-';
        const statsToDisplay = [{ type: 'Total Shots', label: 'Total Shots' }, { type: 'Shots on Goal', label: 'On Target' }, { type: 'Shots off Goal', label: 'Off Target' }, { type: 'Blocked Shots', label: 'Blocked Shots' }, { type: 'Ball Possession', label: 'Possession' }, { type: 'Corner Kicks', label: 'Corner Kicks' }, { type: 'Fouls', label: 'Fouls' }, { type: 'Yellow Cards', label: 'Yellow Cards' }, { type: 'Red Cards', label: 'Red Cards' }, { type: 'Total passes', label: 'Total passes' }, { type: 'expected_goals', label: 'Expected Goals' }];
        let statsGridHTML = '';
        statsToDisplay.forEach(stat => { statsGridHTML += `<div>${findStat(homeTeamStats, stat.type)}</div><div class="label">${stat.label}</div><div>${findStat(awayTeamStats, stat.type)}</div>`; });
        let statsHTML = `<div class="stats-header"><div class="stats-team home"><img src="${fixtureDetail.teams.home.logo}" class="stats-team-logo"><span>${fixtureDetail.teams.home.name}</span></div><div class="stats-score">${fixtureDetail.goals.home} - ${fixtureDetail.goals.away}</div><div class="stats-team away"><img src="${fixtureDetail.teams.away.logo}" class="stats-team-logo"><span>${fixtureDetail.teams.away.name}</span></div></div><div class="stats-grid">${statsGridHTML}</div>`;
        matchStatsPanel.innerHTML = statsHTML;
    }

    // Update the graphic once on initial load
    console.log("Scroller: Initial load.");
    updateFromStorage();
});