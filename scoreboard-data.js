// scoreboard-data.js

window.addEventListener('load', function() {
    const statusText = document.getElementById('status-text');

    async function fetchScoreboardData() {
        console.log("SCOREBOARD HUB: Fetching data...");
        statusText.textContent = "Fetching latest fixture and lineup data...";
        try {
            // Fetch both endpoints as before
            const [fixtureRes, lineupsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/fixtures?id=${fixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/fixtures/lineups?fixture=${fixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } })
            ]);

            const fixtureData = await fixtureRes.json();
            const lineupsData = await lineupsRes.json();

            // --- MODIFIED SECTION START ---

            // First, we validate that the core fixture data exists. If not, we can't continue.
            if (!fixtureData.response || fixtureData.response.length === 0) {
                throw new Error("Fixture data not found. Please check the fixtureId in config.js.");
            }

            // If we get here, we have fixture data, so we can save it immediately.
            // This is the key change: we no longer wait to check for lineups.
            localStorage.setItem('fixture_detail_data', JSON.stringify(fixtureData.response[0]));
            
            let statusMessage = `Successfully loaded data for: ${fixtureData.response[0].teams.home.name} vs ${fixtureData.response[0].teams.away.name}. You can now use the control panel.`;

            // Now, we handle the lineup data.
            // Instead of throwing an error if it's missing, we log a warning and save an empty array.
            // This tells the control panel that there are no lineups, rather than leaving old data in place.
            if (!lineupsData.response || lineupsData.response.length === 0) {
                console.warn("SCOREBOARD HUB: Lineup data not found for this fixture. Player dropdowns will be empty.");
                localStorage.setItem('fixture_lineups_data', JSON.stringify([])); // Save an empty array
                statusMessage += " (Warning: Lineups not available)"; // Add a note to the UI
            } else {
                // If lineups are found, we save them as normal.
                localStorage.setItem('fixture_lineups_data', JSON.stringify(lineupsData.response));
            }
            
            console.log("SCOREBOARD HUB: Data fetched and saved to localStorage successfully.");
            statusText.textContent = statusMessage;

            // --- MODIFIED SECTION END ---

        } catch (err) {
            console.error("SCOREBOARD HUB ERROR:", err);
            statusText.textContent = `Error: ${err.message}`;
            statusText.style.color = 'red';
        }
    }

    // Run the fetch function once on page load.
    fetchScoreboardData();
});