// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {

    const fixturesContent = document.getElementById('fixtures-content');

    // --- RENDER FUNCTION (Unchanged from your last working version) ---
    function renderFixtures(fixtures) {
        fixturesContent.innerHTML = ''; // Clear previous content

        if (!fixtures || fixtures.length === 0) {
            fixturesContent.innerHTML = '<div>No upcoming fixtures found.</div>';
            // Disable animation if there's no content
            fixturesContent.style.animationName = 'none';
            return;
        }
        
        let fixturesHTML = '';
        fixtures.forEach(fixture => {
            const fixtureDate = new Date(fixture.fixture.date);
            const formattedDate = fixtureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' });
            const formattedTime = fixtureDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

            fixturesHTML += `
                <div class="fixture-item">
                    <div class="fixture-date">${formattedDate} - ${formattedTime}</div>
                    <div class="teams-row">
                        <img src="${fixture.teams.home.logo}" class="team-logo" title="${fixture.teams.home.name}">
                        <span class="vs-text">vs</span>
                        <img src="${fixture.teams.away.logo}" class="team-logo" title="${fixture.teams.away.name}">
                    </div>
                    <div class="league-info">${fixture.league.name}</div>
                </div>
            `;
        });
        
        // --- Seamless Loop Logic ---
        fixturesContent.innerHTML = fixturesHTML + fixturesHTML;

        // Ensure animation is enabled
        fixturesContent.style.animationName = 'scroll-left';

        setTimeout(() => {
            const contentWidth = fixturesContent.scrollWidth / 2;
            const scrollSpeed = 80; // pixels per second
            const duration = contentWidth / scrollSpeed;
            
            fixturesContent.style.animationDuration = `${duration}s`;
        }, 100);
    }

    // --- NEW "LISTENER" LOGIC ---

    function updateFromStorage() {
        const dataString = localStorage.getItem('next_fixtures_data');
        if (dataString) {
            renderFixtures(JSON.parse(dataString));
        } else {
            renderFixtures([]); // Render empty state if no data
        }
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'next_fixtures_data') {
            console.log("Next Fixtures: Detected data update from hub.");
            updateFromStorage();
        }
    });

    console.log("Next Fixtures: Initial load.");
    updateFromStorage();
});