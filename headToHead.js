// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {

    const h2hContainer = document.getElementById('h2h-container');

    // --- RENDER FUNCTIONS (Unchanged from your last working version) ---

    function renderError(errorMessage) {
        h2hContainer.innerHTML = `
            <div class="h2h-wrapper">
                <div class="error-message">
                    Error loading data.<br>
                    <small style="color: #888;">Reason: ${errorMessage}</small>
                </div>
            </div>
        `;
    }

    function renderH2H(fixtures) {
        h2hContainer.innerHTML = ''; 

        const wrapper = document.createElement('div');
        wrapper.className = 'h2h-wrapper';

        if (!fixtures || fixtures.length === 0) {
            wrapper.innerHTML = '<div class="error-message">No head-to-head history found.</div>';
            h2hContainer.appendChild(wrapper);
            return;
        }

        fixtures.sort((a, b) => b.fixture.timestamp - a.fixture.timestamp);

        fixtures.forEach(fixture => {
            const item = document.createElement('div');
            item.className = 'h2h-item';

            const fixtureDate = new Date(fixture.fixture.date);
            const formattedDate = fixtureDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            item.innerHTML = `
                <div class="date">${formattedDate}</div>
                <div class="scoreline-row">
                    <img src="${fixture.teams.home.logo}" class="team-logo">
                    <span class="team-name">${fixture.teams.home.name}</span>
                    <span class="score">${fixture.goals.home} - ${fixture.goals.away}</span>
                    <span class="team-name">${fixture.teams.away.name}</span>
                    <img src="${fixture.teams.away.logo}" class="team-logo">
                </div>
                <div class="league-row">
                    <img src="${fixture.league.logo}" class="league-logo">
                    <span>${fixture.league.name}</span>
                </div>
                <div class="meta-info">
                    <span>${fixture.fixture.venue.name}</span>
                    ${fixture.fixture.referee ? `<span> | ${fixture.fixture.referee}</span>` : ''}
                </div>
            `;
            wrapper.appendChild(item);
        });

        h2hContainer.appendChild(wrapper);
    }

    // --- NEW "LISTENER" LOGIC ---

    function updateFromStorage() {
        const dataString = localStorage.getItem('h2h_data');
        if (dataString) {
            renderH2H(JSON.parse(dataString));
        } else {
            // Display a waiting message if no data is in storage yet
            renderError("Waiting for data from the Data Hub...");
        }
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'h2h_data') {
            console.log("H2H: Detected data update from hub.");
            updateFromStorage();
        }
    });

    console.log("H2H: Initial load.");
    updateFromStorage();
});