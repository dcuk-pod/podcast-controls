window.addEventListener('load', function() {

    // --- CONFIGURATION ---
    const apiKey = '3192ab461d652eebacaa42aead93db3f'; // <-- IMPORTANT: REPLACE WITH YOUR KEY
   const fixtureId = 1326579;
    const lineupContainer = document.getElementById('lineup-container');

    async function fetchData() {
        // ... (fetchData function is the same)
        const lineupUrl = `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`;
        const playersUrl = `https://v3.football.api-sports.io/fixtures/players?fixture=${fixtureId}`;
        try {
            const [lineupRes, playersRes] = await Promise.all([
                fetch(lineupUrl, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
                fetch(playersUrl, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } })
            ]);
            const lineupData = await lineupRes.json();
            const playersData = await playersRes.json();
            buildLineup(lineupData.response[1], playersData.response[1]); // AWAY TEAM
        } catch (err) {
            console.error("Failed to fetch lineup data:", err);
            lineupContainer.innerHTML = '<h1>Error loading lineup.</h1>';
        }
    }

    function buildLineup(teamLineup, teamPlayers) {
        // ... (The top part of the function is the same)
        lineupContainer.innerHTML = ''; 

        const playerPhotoMap = new Map();
        teamPlayers.players.forEach(p => playerPhotoMap.set(p.player.id, p.player.photo));
        
        const graphic = document.createElement('div');
        graphic.className = 'lineup-graphic';

        const topBar = document.createElement('div');
        topBar.className = 'top-bar';
        const teamKitColor = teamLineup.team.colors?.player?.primary || 'cc0000';
        topBar.style.backgroundColor = `#${teamKitColor}`;
        topBar.innerHTML = `<img src="${teamLineup.team.logo}" class="top-bar-logo"><span class="top-bar-name">${teamLineup.team.name}</span>`;

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        
        const pitchSection = document.createElement('div');
        pitchSection.className = 'pitch-section';
        const pitch = document.createElement('div');
        pitch.className = 'pitch';
        
        const rowGroups = {};
        teamLineup.startXI.forEach(p => {
            if (p.player.grid) {
                const [rowNumStr] = p.player.grid.split(':');
                if (!rowGroups[rowNumStr]) { rowGroups[rowNumStr] = []; }
                rowGroups[rowNumStr].push(p.player);
            }
        });
        
        Object.keys(rowGroups).sort((a, b) => a - b).forEach(rowKey => {
            // --- THIS IS THE ONLY JAVASCRIPT CHANGE ---
            const columnDiv = document.createElement('div');
            columnDiv.className = 'pitch-column'; // Changed from pitch-row
            
            const playersInRow = rowGroups[rowKey];
            playersInRow.sort((a, b) => parseInt(a.grid.split(':')[1]) - parseInt(b.grid.split(':')[1]));
            
            playersInRow.forEach(player => {
                const photoUrl = playerPhotoMap.get(player.id) || 'path/to/fallback.png';
                const marker = document.createElement('div');
                marker.className = 'player-marker';
                marker.innerHTML = `<img src="${photoUrl}" alt="${player.name}" class="player-photo"><span class="player-name">${player.number}. ${player.name.split(' ').pop()}</span>`;
                columnDiv.appendChild(marker);
            });
            pitch.appendChild(columnDiv);
        });
        pitchSection.appendChild(pitch);

        const startersListSection = document.createElement('div');
        startersListSection.className = 'list-section starters';
        let startingXIList = '<h2 class="list-title">Starting Lineup</h2><ul class="player-list">';
        teamLineup.startXI.forEach(p => {
            startingXIList += `<li class="player-list-item"><span class="number">${p.player.number}</span> <span class="name">${p.player.name}</span></li>`;
        });
        startersListSection.innerHTML += startingXIList + '</ul>';

        const benchSection = document.createElement('div');
        benchSection.className = 'list-section bench';
        let substitutesList = '<h2 class="list-title">Bench</h2><ul class="player-list">';
        teamLineup.substitutes.forEach(p => {
            substitutesList += `<li class="player-list-item"><span class="number">${p.player.number}</span> <span class="name">${p.player.name}</span></li>`;
        });
        benchSection.innerHTML += substitutesList + '</ul>';
        
        contentWrapper.appendChild(pitchSection);
        contentWrapper.appendChild(startersListSection);
        contentWrapper.appendChild(benchSection);
        graphic.appendChild(topBar);
        graphic.appendChild(contentWrapper);
        lineupContainer.appendChild(graphic);
    }

    fetchData();
});