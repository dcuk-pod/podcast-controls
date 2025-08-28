// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {

    const lineupContainer = document.getElementById('lineup-container');

    // --- RENDER & HELPER FUNCTIONS (Unchanged from your last working version) ---

    function buildGraphic(lineupData, playersData) {
        lineupContainer.innerHTML = '';
        const homeTeamLineup = lineupData[0];
        const awayTeamLineup = lineupData[1];
        const homeFormationHTML = createFormationGraphic(homeTeamLineup);
        const awayFormationHTML = createFormationGraphic(awayTeamLineup);
        const homeListHTML = createPlayerLists(homeTeamLineup);
        const awayListHTML = createPlayerLists(awayTeamLineup);

        const wrapper = document.createElement('div');
        wrapper.className = 'lineup-wrapper';
        wrapper.innerHTML = `
            <div class="formations-section">
                ${homeFormationHTML}
                ${awayFormationHTML}
            </div>
            <div class="lists-section">
                ${homeListHTML}
                ${awayListHTML}
            </div>
        `;
        lineupContainer.appendChild(wrapper);
    }

    function createFormationGraphic(teamLineup) {
        const rowGroups = {};
        teamLineup.startXI.forEach(p => {
            if (p.player.grid) {
                const [rowNumStr] = p.player.grid.split(':');
                if (!rowGroups[rowNumStr]) { rowGroups[rowNumStr] = []; }
                rowGroups[rowNumStr].push(p.player);
            }
        });

        let columnsHTML = '';
        const sortedRowKeys = Object.keys(rowGroups).sort((a, b) => a - b);
        
        sortedRowKeys.forEach(rowKey => {
            const columnDiv = document.createElement('div');
            columnDiv.className = 'pitch-column';
            const playersInRow = rowGroups[rowKey];
            playersInRow.sort((a, b) => parseInt(a.grid.split(':')[1]) - parseInt(b.grid.split(':')[1]));

            let playersHTML = '';
            playersInRow.forEach(player => {
                const kitColor = teamLineup.team.colors?.player?.primary || '333333';
                const numColor = teamLineup.team.colors?.player?.number || 'ffffff';
                playersHTML += `
                    <div class="player-dot">
                        <div class="player-shirt" style="background-color: #${kitColor}; color: #${numColor};">
                            ${player.number}
                        </div>
                    </div>
                `;
            });
            columnDiv.innerHTML = playersHTML;
            columnsHTML += columnDiv.outerHTML;
        });

        return `
            <div class="pitch-container">
                <div class="formation-title">FORMATION : ${teamLineup.formation}</div>
                <div class="pitch">${columnsHTML}</div>
            </div>
        `;
    }

    function createPlayerLists(teamLineup) {
        let startingXI_HTML = '';
        teamLineup.startXI.forEach(p => {
            startingXI_HTML += `<div class="player-item"><span class="number">${p.player.number}</span><span class="name">${p.player.name}</span></div>`;
        });

        let substitutes_HTML = '';
        teamLineup.substitutes.forEach(p => {
            substitutes_HTML += `<div class="player-item"><span class="number">${p.player.number}</span><span class="name">${p.player.name}</span></div>`;
        });

        return `
            <div class="team-list-container">
                <div class="team-header">
                    <img src="${teamLineup.team.logo}" class="team-header-logo">
                    <div class="team-header-name">${teamLineup.team.name}</div>
                </div>
                <div class="list-heading">Coach: ${teamLineup.coach.name}</div>
                <div class="lists-wrapper">
                    <div class="player-list-group">
                        <div class="list-heading">Starting XI</div>
                        <div class="player-list">${startingXI_HTML}</div>
                    </div>
                    <div class="player-list-group">
                        <div class="list-heading">Substitutes</div>
                        <div class="player-list">${substitutes_HTML}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // --- NEW "LISTENER" LOGIC ---

    // 1. Function to render the graphic using data from localStorage
    function updateFromStorage() {
        const lineupData = JSON.parse(localStorage.getItem('fixture_lineups_data'));
        const playersData = JSON.parse(localStorage.getItem('fixture_players_data'));

        // Check if all necessary data is present before trying to render
        if (lineupData && playersData && lineupData.length >= 2) {
            buildGraphic(lineupData, playersData);
        } else {
            lineupContainer.innerHTML = '<h1>Waiting for lineup data...</h1>';
        }
    }

    // 2. Listen for the 'storage' event, which fires when the Data Hub saves new data
    window.addEventListener('storage', function(e) {
        if (e.key === 'fixture_lineups_data' || e.key === 'fixture_players_data') {
            console.log("Combined Lineup: Detected data update from hub.");
            updateFromStorage();
        }
    });

    // 3. Update the graphic once on initial load
    console.log("Combined Lineup: Initial load.");
    updateFromStorage();
});