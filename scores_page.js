window.addEventListener('load', function() {
    const scoresContainer = document.getElementById('scores-container');

    function buildGraphic(allFixtures) {
        scoresContainer.innerHTML = '';
        
        if (!allFixtures || allFixtures.length === 0) {
            scoresContainer.innerHTML = `<div class="scores-wrapper"><div class="no-fixtures">No fixtures found in the selected date range.</div></div>`;
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'scores-wrapper';

        const fixturesByDate = {};
        allFixtures.forEach(fixture => {
            const fixtureDateStr = fixture.fixture.date.split('T')[0];
            if (!fixturesByDate[fixtureDateStr]) {
                fixturesByDate[fixtureDateStr] = [];
            }
            fixturesByDate[fixtureDateStr].push(fixture);
        });

        const firstFixture = allFixtures[0];
        const friendlyFrom = new Date(fromDate + 'T12:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const friendlyTo = new Date(toDate + 'T12:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const topBarHTML = `
            <div class="top-bar">
                <img src="${firstFixture.league.logo}" alt="${firstFixture.league.name}" class="league-logo">
                <div class="header-details">
                    <div class="league-name">${firstFixture.league.name}</div>
                    <div class="league-meta">Fixtures from ${friendlyFrom} to ${friendlyTo}</div>
                </div>
            </div>
        `;

        let scoresListHTML = '<div class="scores-list">';
        const sortedDates = Object.keys(fixturesByDate).sort();

        sortedDates.forEach(dateStr => {
            const friendlyDate = new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            scoresListHTML += `<div class="date-header">${friendlyDate}</div>`;
            
            const fixturesForThisDate = fixturesByDate[dateStr];
            fixturesForThisDate.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);

            // --- THIS IS THE RESTORED LOGIC THAT WAS MISSING ---
            fixturesForThisDate.forEach(fixture => {
                let scorelineContent = '';
                const status = fixture.fixture.status.short;
                if (status === 'PST' || status === 'CANC') { scorelineContent = 'Post.'; }
                else if (status === 'NS') {
                    const kickoffTime = new Date(fixture.fixture.date);
                    scorelineContent = kickoffTime.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false });
                } else { scorelineContent = `${fixture.goals.home} - ${fixture.goals.away}`; }
                
                scoresListHTML += `
                    <div class="score-item">
                        <img src="assets/logos/${fixture.teams.home.id}.png" class="team-logo home">
                        <div class="team-name home">${fixture.teams.home.name}</div>
                        <div class="scoreline">${scorelineContent}</div>
                        <div class="team-name away">${fixture.teams.away.name}</div>
                        <img src="assets/logos/${fixture.teams.away.id}.png" class="team-logo away">
                    </div>
                `;
            });
        });
        scoresListHTML += '</div>';

        wrapper.innerHTML = topBarHTML + scoresListHTML;
        scoresContainer.appendChild(wrapper);
    }
    
    function updateFromStorage() {
        const dataString = localStorage.getItem('fixtures_date_range_data');
        if (dataString) {
            buildGraphic(JSON.parse(dataString));
        } else {
            scoresContainer.innerHTML = `<h1>Waiting for data from the Data Hub...</h1>`;
        }
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'fixtures_date_range_data') {
            updateFromStorage();
        }
    });

    updateFromStorage();
});