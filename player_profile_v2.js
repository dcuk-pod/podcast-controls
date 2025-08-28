// player_profile_v2.js

window.addEventListener('load', function() {

    const container = document.getElementById('player-profile-container-v2');

    function initializeProfile() {
        console.log("PLAYERPROFILE_V2: Initializing or updating graphic from localStorage...");
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
            console.error("PLAYERPROFILE_V2 RENDER ERROR:", err);
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
        wrapper.className = 'profile-wrapper-v2';

        // --- MODIFICATION: New HTML structure for a more reliable layout ---
        // The wrapper is a tall, transparent container. The image and the content-bar sit inside it.
        wrapper.innerHTML = `
            <div class="player-image-container-v2">
                <img src="${localImagePath}" 
                     onerror="this.onerror=null; this.src='${playerInfo.photo}';" 
                     alt="${playerInfo.name}" 
                     class="player-photo-v2">
            </div>

            <div class="content-bar-v2">
                <div class="player-details-v2">
                    <div class="player-identity-v2">
                        <span class="player-number-v2">#${mlsStats.games.number || '-'}</span>
                        <h1 class="player-name-v2">${playerInfo.firstname} ${playerInfo.lastname}</h1>
                    </div>
                    <div class="player-bio-v2">
                        ${playerInfo.age} years old | ${playerInfo.height || '-'} | ${playerInfo.nationality}
                    </div>
                </div>

                <div class="stats-grid-v2">
                    ${generateStatsGrid(mlsStats)}
                </div>

                <img src="${mlsStats.team.logo}" class="team-logo-v2" alt="${mlsStats.team.name} Logo">
            </div>
        `;
        
        container.appendChild(wrapper);

        setTimeout(() => wrapper.classList.add('visible'), 100);
    }

    function generateStatsGrid(stat) {
        if (!stat) return '';
        
        let statsHTML = '';
        statsHTML += createStatItem('Appearances', stat.games.appearences);
        statsHTML += createStatItem('Minutes', stat.games.minutes);
        statsHTML += createStatItem('Goals', stat.goals.total);
        statsHTML += createStatItem('Assists', stat.goals.assists);
        statsHTML += createStatItem('Total Shots', stat.shots.total);
        statsHTML += createStatItem('Shots on Target', stat.shots.on);
        statsHTML += createStatItem('Key Passes', stat.passes.key);
        statsHTML += createStatItem('Tackles', stat.tackles.total);
        statsHTML += createStatItem('Yellow Cards', stat.cards.yellow);
        
        return statsHTML;
    }

    function createStatItem(label, value) {
        const displayValue = (value !== null && value !== undefined) ? value : '-';
        return `
            <div class="stat-item-v2">
                <span class="value-v2">${displayValue}</span>
                <span class="label-v2">${label}</span>
            </div>
        `;
    }

    initializeProfile();

    window.addEventListener('storage', function(event) {
        const playerDataKey = `player_profile_data_${playerId}`;
        if (event.key === playerDataKey) {
            console.log(`HUB-UPDATE_V2: ${event.key} was updated. Re-rendering player profile.`);
            initializeProfile();
        }
    });
});