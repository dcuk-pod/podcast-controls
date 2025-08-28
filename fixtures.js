// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {
    
    const pageSwitchInterval = 5000; // Switch page every 5 seconds
    let pages = [];
    let currentPage = 0;
    let pageCycleInterval = null; // To hold the timer
    
    const listContainer = document.getElementById('fixtures-list');
    const panelTitle = document.getElementById('panel-title');
    const pageIndicator = document.getElementById('page-indicator');

    // --- RENDER & HELPER FUNCTIONS ---

    function getRankClass(rank) {
        if (rank === 1) return 'rank-1';
        if (rank >= 2 && rank <= 7) return 'rank-2-7';
        if (rank >= 8 && rank <= 9) return 'rank-8-9';
        return '';
    }

    function renderFixturesPage(fixtures) {
        fixtures.forEach(fixture => {
            const item = document.createElement('div');
            item.className = 'fixture-item';
            let scoreOrTimeHTML = '';
            const status = fixture.fixture.status.short;

            if (['FT', 'AET', 'PEN', '1H', '2H', 'HT'].includes(status)) {
                scoreOrTimeHTML = `<span class="score-or-time result">${fixture.goals.home} - ${fixture.goals.away}</span>`;
            } else {
                const date = new Date(fixture.fixture.date);
                const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' });
                scoreOrTimeHTML = `<span class="score-or-time">${time}</span>`;
            }

            const venue = fixture.fixture.venue?.name || '';
            const city = fixture.fixture.venue?.city || '';
            const referee = fixture.fixture.referee || '';
            let metaHTML = '';
            if (venue) { metaHTML += `<div class="venue-line">${venue}, ${city}</div>`; }
            if (referee) { metaHTML += `<div class="ref-line">${referee}</div>`; }

            item.innerHTML = `
                <div class="fixture-teams">
                    <div class="team home"><span class="team-name">${fixture.teams.home.name}</span><img src="${fixture.teams.home.logo}" class="team-logo"></div>
                    ${scoreOrTimeHTML}
                    <div class="team away"><img src="${fixture.teams.away.logo}" class="team-logo"><span class="team-name">${fixture.teams.away.name}</span></div>
                </div>
                <div class="fixture-meta">${metaHTML}</div>
            `;
            listContainer.appendChild(item);
        });
    }

    function renderTablePage(standings, conferenceName) {
        const table = document.createElement('table');
        table.className = 'standings-table';
        table.innerHTML = `<thead><tr><th class="pos">#</th><th class="team">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead><tbody></tbody>`;
        const tbody = table.querySelector('tbody');

        standings.forEach(team => {
            const teamCode = teamCodes[team.team.id] || team.team.name.substring(0, 3).toUpperCase();
            const row = document.createElement('tr');
            row.className = getRankClass(team.rank);
            row.innerHTML = `<td class="pos">${team.rank}</td><td class="team"><img src="${team.team.logo}" class="team-logo"> ${teamCode}</td><td>${team.all.played}</td><td>${team.all.win}</td><td>${team.all.draw}</td><td>${team.all.lose}</td><td><b>${team.points}</b></td>`;
            tbody.appendChild(row);
        });
        listContainer.appendChild(table);
    }
    
    function renderPage() {
        listContainer.innerHTML = '';
        if (pages.length === 0) return;
        
        // Ensure currentPage is always valid
        currentPage = currentPage % pages.length;
        const pageData = pages[currentPage];

        if (pageData.type === 'fixtures') {
            panelTitle.textContent = `${pageData.teamName} Fixtures`;
            renderFixturesPage(pageData.data);
        } else if (pageData.type === 'table') {
            panelTitle.textContent = `${pageData.conference} Conference`;
            renderTablePage(pageData.data, pageData.conference);
        }
        
        pageIndicator.textContent = `Page ${currentPage + 1} / ${pages.length}`;
    }

    function cyclePage() {
        currentPage++;
        renderPage();
    }

    // --- NEW "LISTENER" LOGIC ---

    function updateFromStorage() {
        const fixtureDataString = localStorage.getItem('all_team_fixtures_data');
        const standingsDataString = localStorage.getItem('league_standings_data');

        if (!fixtureDataString || !standingsDataString) {
            listContainer.innerHTML = `<div class="fixture-meta">Waiting for data from hub...</div>`;
            return;
        }

        const allFixtures = JSON.parse(fixtureDataString);
        const standingsData = JSON.parse(standingsDataString);

        // This logic, which builds the pages, is now inside the update function
        pages = [];
        const teamName = allFixtures.length > 0 ? (allFixtures[0].teams.home.id === teamId ? allFixtures[0].teams.home.name : allFixtures[0].teams.away.name) : 'Team';
        
        const FIXTURES_PER_PAGE = 6;
        for (let i = 0; i < allFixtures.length; i += FIXTURES_PER_PAGE) {
            pages.push({ type: 'fixtures', teamName: teamName, data: allFixtures.slice(i, i + FIXTURES_PER_PAGE) });
        }
        if (standingsData && standingsData.length > 0) {
            const leagueData = standingsData[0].league;
            if (leagueData && leagueData.standings && leagueData.standings.length > 0) {
                const allStandings = leagueData.standings;
                const easternConf = allStandings.find(conf => conf[0].group.includes("Eastern"));
                const westernConf = allStandings.find(conf => conf[0].group.includes("Western"));
                if (easternConf) pages.push({ type: 'table', conference: 'Eastern', data: easternConf });
                if (westernConf) pages.push({ type: 'table', conference: 'Western', data: westernConf });
            }
        }
        
        // Render the first page immediately
        currentPage = 0;
        renderPage();

        // Clear any old timer and start a new one if needed
        if (pageCycleInterval) clearInterval(pageCycleInterval);
        if (pages.length > 1) {
            pageCycleInterval = setInterval(cyclePage, pageSwitchInterval);
        }
    }

    window.addEventListener('storage', e => {
        if (e.key === 'all_team_fixtures_data' || e.key === 'league_standings_data') {
            console.log("Fixtures/Tables: Detected data update from hub.");
            updateFromStorage();
        }
    });

    updateFromStorage();
});