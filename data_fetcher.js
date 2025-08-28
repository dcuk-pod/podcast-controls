// data_fetcher.js

window.addEventListener('load', function() {

    const highFrequencyInterval = 60000;  // 1 minute
    const lowFrequencyInterval = 900000; // 15 minutes

    // --- High-Frequency Data Fetching ---
    async function fetchHighFrequencyData() {
        console.log("HUB: Fetching high-frequency data for LIVE match...");
        await fetchDataForFixture(fixtureId, 'live');
        console.log("HUB: High-frequency LIVE data updated.");
    }
    
    // --- Low-Frequency Data Fetching ---
    async function fetchLowFrequencyData() {
        console.log("HUB: Fetching low-frequency data for fixture review & player profile...");
        await fetchDataForFixture(fixtureReviewId, 'review');
        await fetchPlayerData();
        console.log("HUB: Low-frequency REVIEW & PLAYER data updated.");
    }
    
    async function fetchPlayerData() {
        if (!playerId || !season) {
            console.log("HUB: Skipping player profile fetch as playerId or season is not set.");
            return;
        }
        console.log(`HUB: Fetching player profile for ID: ${playerId}`);
        try {
            const playerRes = await fetch(`${API_BASE_URL}/players?id=${playerId}&season=${season}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } });
            const playerData = await playerRes.json();
            localStorage.setItem(`player_profile_data_${playerId}`, JSON.stringify(playerData.response));
            console.log(`HUB: Player profile data updated for ID: ${playerId}`);
        } catch(err) {
            console.error(`HUB PLAYER PROFILE ERROR for ID ${playerId}:`, err);
        }
    }


    // --- Generic Data Fetching Function ---
    async function fetchDataForFixture(currentFixtureId, type = 'live') {
        if (!currentFixtureId) {
            console.log(`HUB: Skipping fetch for fixture ID: ${currentFixtureId} as it is not set.`);
            return;
        }

        console.log(`HUB: Fetching data for fixture ID: ${currentFixtureId}`);
        try {
            // --- MODIFICATION: Added fixtureStatsRes to the initial Promise.all ---
            const [
                fixtureDetailRes, 
                fixturePlayersRes,
                fixtureStatsRes 
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/fixtures?id=${currentFixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/fixtures/players?fixture=${currentFixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/fixtures/statistics?fixture=${currentFixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } })
            ]);

            const fixtureDetail = await fixtureDetailRes.json();
            const fixturePlayers = await fixturePlayersRes.json();
            const fixtureStats = await fixtureStatsRes.json();
            
            // Save data with keys unique to the fixture ID
            localStorage.setItem(`fixture_players_data_${currentFixtureId}`, JSON.stringify(fixturePlayers.response));
            localStorage.setItem(`fixture_detail_data_${currentFixtureId}`, JSON.stringify(fixtureDetail.response[0]));
            // --- NEW: Save fixture stats with a unique key for both live and review ---
            localStorage.setItem(`fixture_stats_data_${currentFixtureId}`, JSON.stringify(fixtureStats.response));

            // Only fetch events and lineups for the live match to save API calls
            if (type === 'live') {
                 const [fixtureEventsRes, fixtureLineupsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/fixtures/events?fixture=${currentFixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                    fetch(`${API_BASE_URL}/fixtures/lineups?fixture=${currentFixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                ]);
                const fixtureEvents = await fixtureEventsRes.json();
                const fixtureLineups = await fixtureLineupsRes.json();
                localStorage.setItem('fixture_events_data', JSON.stringify(fixtureEvents.response));
                localStorage.setItem('fixture_lineups_data', JSON.stringify(fixtureLineups.response));
            }
            
            console.log(`HUB: Data updated for fixture ID: ${currentFixtureId}`);

        } catch (err) { console.error(`HUB ERROR for fixture ${currentFixtureId}:`, err); }
    }
    
    async function fetchGeneralLowFrequencyData() {
        console.log("HUB: Fetching general low-frequency data (standings, h2h, etc.)...");
        try {
            const fixtureRes = await fetch(`${API_BASE_URL}/fixtures?id=${fixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } });
            const fixtureData = await fixtureRes.json();
            if (!fixtureData.response || fixtureData.response.length === 0) throw new Error("Primary fixture not found in low-frequency fetch.");
            
            const fixtureInfo = fixtureData.response[0];
            const dynamicLeagueId = fixtureInfo.league.id;
            const dynamicHomeId = fixtureInfo.teams.home.id;
            const dynamicAwayId = fixtureInfo.teams.away.id;
            const dynamicH2H = `${dynamicHomeId}-${dynamicAwayId}`;

            const [
                standingsRes, h2hRes, predictionRes, 
                homeStatsRes, awayStatsRes
            ] = await Promise.all([
                fetch(`${API_BASE_URL}/standings?league=${dynamicLeagueId}&season=${season}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/fixtures/headtohead?h2h=${dynamicH2H}&last=5`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/predictions?fixture=${fixtureId}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/teams/statistics?league=${dynamicLeagueId}&team=${dynamicHomeId}&season=${season}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(`${API_BASE_URL}/teams/statistics?league=${dynamicLeagueId}&team=${dynamicAwayId}&season=${season}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } })
            ]);

            const standingsData = await standingsRes.json();
            const h2hData = await h2hRes.json();
            const predictionData = await predictionRes.json();
            const homeStatsData = await homeStatsRes.json();
            const awayStatsData = await awayStatsRes.json();

            localStorage.setItem('league_standings_data', JSON.stringify(standingsData.response));
            localStorage.setItem('h2h_data', JSON.stringify(h2hData.response));
            localStorage.setItem('prediction_data', JSON.stringify(predictionData.response));
            localStorage.setItem('home_stats_data', JSON.stringify(homeStatsData.response));
            localStorage.setItem('away_stats_data', JSON.stringify(awayStatsData.response));

            console.log("HUB: General low-frequency data updated.");
        } catch (err) { console.error("HUB GENERAL LOW-FREQ ERROR:", err); }
    }


    // --- KICK EVERYTHING OFF ---
    fetchHighFrequencyData(); 
    fetchLowFrequencyData(); 
    fetchGeneralLowFrequencyData();

    setInterval(fetchHighFrequencyData, highFrequencyInterval);
    setInterval(fetchLowFrequencyData, lowFrequencyInterval); 
    setInterval(fetchGeneralLowFrequencyData, lowFrequencyInterval);
});