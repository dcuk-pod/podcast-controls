// player_profile.js

window.addEventListener('load', function() {

    const container = document.getElementById('player-profile-container');

    function initializeProfile() {
        console.log("PLAYERPROFILE: Initializing or updating graphic from localStorage...");
        try {
            const playerDataKey = `player_profile_data_${playerId}`;
            const playerDataStr = localStorage.getItem(playerDataKey);

            if (!playerDataStr) {
                throw new Error(`Player data not found in hub for ID ${playerId}. Waiting for data_fetcher...`);
            }

            const playerData = JSON.parse(playerDataStr);
            if (!playerData || playerData.length === 0) {
                 throw new Error(`Player data for ID ${playerId} is empty.`);
            }

            buildProfile(playerData[0]);

        } catch (err) {
            console.error("PLAYERPROFILE RENDER ERROR:", err);
            container.innerHTML = `<h1>Waiting for data...</h1><p>${err.message}</p>`;
        }
    }

    function buildProfile(data) {
        container.innerHTML = '';

        const playerInfo = data.player;
        const mlsStats = data.statistics.find(s => s.league.id === leagueId);
        
        if (!mlsStats) {
            container.innerHTML = `<h1>No MLS stats available for ${playerInfo.name} this season.</h1>`;
            return;
        }

        const localImagePath = `images/players/${playerInfo.id}.png`;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'profile-wrapper';

        wrapper.innerHTML = `<img src="${mlsStats.team.logo}" class="background-logo" alt="${mlsStats.team.name} Background Logo">`;

        // --- MODIFICATION: The player-bio div is now part of the top bar structure ---
        const topBarHTML = `
            <div class="top-bar">
                <span class="player-number">#${mlsStats.games.number || '-'}</span>
                <div class="player-identity">
                    <h1 class="player-name">${playerInfo.firstname} ${playerInfo.lastname}</h1>
                    <div class="player-bio">
                        ${playerInfo.age} years old | ${playerInfo.height || '-'} | ${playerInfo.nationality}
                    </div>
                </div>
            </div>
        `;

        const content = document.createElement('div');
        content.className = 'profile-content';
        
        // --- MODIFICATION: The player-bio div has been removed from this section ---
        content.innerHTML = `
            <div class="player-column">
                <div class="player-image-container">
                    <img src="${localImagePath}" 
                         onerror="this.onerror=null; this.src='${playerInfo.photo}';" 
                         alt="${playerInfo.name}" 
                         class="player-photo">
                </div>
            </div>
            <div class="stats-column">
                ${generateStatsCard(mlsStats)}
            </div>
        `;
        
        wrapper.innerHTML += topBarHTML;
        wrapper.appendChild(content);
        container.appendChild(wrapper);

        setTimeout(() => content.classList.add('visible'), 100);
    }

    function generateStatsCard(stat) {
        if (!stat) return '';
        return `
            <div class="stats-card">
                <div class="stats-card-header">
                    <img src="${stat.league.logo}" alt="${stat.league.name}">
                    <h3>${stat.league.name}</h3>
                </div>
                <div class="stats-grid">
                    ${createStatItem('Appearances', stat.games.appearences)}
                    ${createStatItem('Minutes', stat.games.minutes)}
                    ${createStatItem('Goals', stat.goals.total)}
                    ${createStatItem('Assists', stat.goals.assists)}
                    ${createStatItem('Total Shots', stat.shots.total)}
                    ${createStatItem('Shots on Target', stat.shots.on)}
                    ${createStatItem('Passes', stat.passes.total)}
                    ${createStatItem('Key Passes', stat.passes.key)}
                    ${createStatItem('Tackles', stat.tackles.total)}
                    ${createStatItem('Duels Won', stat.duels.won)}
                    ${createStatItem('Dribbles', stat.dribbles.success)}
                    ${createStatItem('Yellow Cards', stat.cards.yellow)}
                </div>
            </div>
        `;
    }

    function createStatItem(label, value) {
        const displayValue = (value !== null && value !== undefined) ? value : '-';
        return `
            <div class="stat-item">
                <span class="label">${label}</span>
                <span class="value">${displayValue}</span>
            </div>
        `;
    }

    initializeProfile();

    window.addEventListener('storage', function(event) {
        const playerDataKey = `player_profile_data_${playerId}`;
        if (event.key === playerDataKey) {
            console.log(`HUB-UPDATE: ${event.key} was updated. Re-rendering player profile.`);
            initializeProfile();
        }
    });
});