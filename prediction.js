// This script listens to Firebase and builds the prediction graphic when instructed by the control panel.
window.addEventListener('load', function() {
    const container = document.getElementById('preview-container');

    // Firebase Document References
    const visibilityDocRef = db.collection('scoreboard').doc('predictionVisibility');
    const dataDocRef = db.collection('scoreboard').doc('predictionData');
    const fixtureDocRef = db.collection('scoreboard').doc('currentFixture');
    
    let unsubscribeAll = null; // A function to stop all active Firebase listeners

    // 1. Listen for visibility changes from the control panel
    visibilityDocRef.onSnapshot(doc => {
        const isVisible = doc.data()?.show === true;

        if (isVisible) {
            container.innerHTML = `<h1><br/>Loading Match Preview...</h1>`;
            // If visible, start listening to the data documents
            subscribeToData();
        } else {
            // If hidden, stop listening to save resources and hide the graphic
            if (unsubscribeAll) {
                unsubscribeAll();
                unsubscribeAll = null;
            }
            hideGraphic();
        }
    });

    /**
     * Subscribes to the necessary data documents in Firestore.
     * It waits until all required data is present before attempting to build the graphic.
     */
    function subscribeToData() {
        if (unsubscribeAll) unsubscribeAll(); // Ensure no old listeners are running

        let predictionData = null;
        let fixtureData = null;

        const unsubPrediction = dataDocRef.onSnapshot(doc => {
            if (doc.exists && doc.data().data) {
                predictionData = doc.data().data; // The API response is nested under a 'data' key
                checkAndRender();
            } else {
                displayError("Prediction data not found. Please click 'Load Data' in the control panel.");
            }
        });

        const unsubFixture = fixtureDocRef.onSnapshot(doc => {
             if (doc.exists) {
                fixtureData = doc.data();
                checkAndRender();
            } else {
                displayError("Fixture data not found. Please load a fixture from the control panel.");
            }
        });
        
        // This function will be called to detach both listeners when they are no longer needed
        unsubscribeAll = () => {
            unsubPrediction();
            unsubFixture();
        };

        /**
         * Checks if all data sources are ready. If so, it fetches the final piece (standings)
         * and triggers the build process.
         */
        async function checkAndRender() {
            if (predictionData && fixtureData) {
                try {
                    const leagueId = predictionData.league.id;
                    const season = predictionData.league.season;
                    const standingsRes = await fetch(`${API_BASE_URL}/standings?league=${leagueId}&season=${season}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } });
                    const standingsData = await standingsRes.json();
                    
                    if (!standingsData.response || standingsData.response.length === 0) {
                       throw new Error("Standings data could not be fetched from the API.");
                    }
                    const standings = standingsData.response[0].league.standings.flat();
                    
                    // With all data gathered, build the graphic
                    buildGraphic(fixtureData, predictionData, standings);

                } catch (err) {
                    console.error("PREDICTION RENDER ERROR:", err);
                    displayError(err.message);
                }
            }
        }
    }

    /**
     * Hides the main graphic with a fade-out animation.
     */
    function hideGraphic() {
        const wrapper = container.querySelector('.preview-wrapper');
        if (wrapper) {
            wrapper.classList.remove('visible');
            setTimeout(() => { if (!wrapper.classList.contains('visible')) container.innerHTML = ''; }, 500);
        } else {
            container.innerHTML = '';
        }
    }

    /**
     * Displays an error message in the container.
     * @param {string} message The error message to display.
     */
    function displayError(message) {
         container.innerHTML = `<div class="preview-wrapper visible"><h1>Error</h1><p style="font-size: 24px;">${message}</p></div>`;
    }

    /**
     * Takes all the data and constructs the HTML for the graphic.
     * @param {object} fixture - The core fixture data.
     * @param {object} prediction - The detailed prediction API response.
     * @param {Array} standings - The league standings array.
     */
    function buildGraphic(fixture, prediction, standings) {
        container.innerHTML = ''; // Clear previous content
        
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-wrapper';

        // --- Data Extraction & Helpers ---
        const homeTeam = prediction.teams.home;
        const awayTeam = prediction.teams.away;
        const fixtureDate = new Date(fixture.fixture.date);
        const formattedDate = fixtureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
        const formattedTime = fixtureDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
        const createFormHtml = (formString) => (formString || '-----').slice(-6).split('').map(r => `<div class="form-box form-${r}">${r}</div>`).join('');

        // --- HTML Component Builders ---
        const topBarHTML = `
            <div class="top-bar">
                <img src="${fixture.league.logo}" alt="${fixture.league.name}" class="league-logo">
                <div class="header-details">
                    <div class="fixture-name">${fixture.teams.home.name} vs ${fixture.teams.away.name}</div>
                    <div class="fixture-meta">${formattedDate} at ${formattedTime} | ${fixture.fixture.venue.name} | Referee: ${fixture.fixture.referee || 'N/A'}</div>
                </div>
            </div>
        `;

        const predictionSummaryHTML = `
            <div class="section prediction-summary">
                <div class="details">
                    <div class="prediction-item">
                        <div class="label">Predicted Winner</div>
                        <div class="value">${prediction.predictions.winner.name || 'Draw'}</div>
                    </div>
                    <div class="prediction-item">
                        <div class="label">Predicted Score</div>
                        <div class="value">${prediction.predictions.goals.home.replace('-', '')} - ${prediction.predictions.goals.away.replace('-', '')}</div>
                    </div>
                    <div class="prediction-item prediction-chances">
                        <div class="chance-item">
                            <div class="label">${homeTeam.name}</div>
                            <div class="value">${prediction.predictions.percent.home}</div>
                        </div>
                        <div class="chance-item">
                            <div class="label">Draw</div>
                            <div class="value">${prediction.predictions.percent.draw}</div>
                        </div>
                        <div class="chance-item">
                            <div class="label">${awayTeam.name}</div>
                            <div class="value">${prediction.predictions.percent.away}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const createTeamStatsHTML = (team, type) => {
            const league = team.league;
            const mostUsedFormation = league.lineups?.sort((a, b) => b.played - a.played)[0]?.formation || 'N/A';
            return `
                <div class="section team-stats">
                    <div class="team-header">
                        <img src="${team.logo}" alt="${team.name}">
                        <h2 class="team-name">${team.name}</h2>
                    </div>
                    <div class="stat-row"><span class="label">Record (W-D-L)</span> <span class="value">${league.fixtures.wins.total}-${league.fixtures.draws.total}-${league.fixtures.loses.total}</span></div>
                    <div class="stat-row"><span class="label">Goals For / Against</span> <span class="value">${league.goals.for.total.total} / ${league.goals.against.total.total}</span></div>
                    <div class="stat-row"><span class="label">Avg Goals For</span> <span class="value">${league.goals.for.average.total}</span></div>
                    <div class="stat-row"><span class="label">Avg Goals Against</span> <span class="value">${league.goals.against.average.total}</span></div>
                    <div class="stat-row"><span class="label">Clean Sheets</span> <span class="value">${league.clean_sheet.total}</span></div>
                    <div class="stat-row"><span class="label">Failed to Score</span> <span class="value">${league.failed_to_score.total}</span></div>
                    <div class="stat-row"><span class="label">Biggest Win</span> <span class="value">${league.biggest.wins[type] || '-'}</span></div>
                    <div class="stat-row"><span class="label">Main Formation</span> <span class="value">${mostUsedFormation}</span></div>
                </div>
            `;
        };

        const h2hHTML = `
            <div class="section h2h">
                <h3 class="section-title">Head to Head (Last 5)</h3>
                <div class="h2h-list">
                    ${prediction.h2h.slice(0, 5).map(match => `
                        <div class="match">
                            <span class="team-name home ${match.teams.home.winner ? 'winner' : ''}">${match.teams.home.name}</span>
                            <span class="score">${match.goals.home} - ${match.goals.away}</span>
                            <span class="team-name away ${match.teams.away.winner ? 'winner' : ''}">${match.teams.away.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const formHTML = `
            <div class="section form">
                <h3 class="section-title">Recent Form (Last 6)</h3>
                <div class="form-container">
                    <div class="form-team">
                        <div class="form-title">${homeTeam.name}</div>
                        <div class="form-boxes">${createFormHtml(homeTeam.league.form)}</div>
                    </div>
                    <div class="form-team">
                        <div class="form-title">${awayTeam.name}</div>
                        <div class="form-boxes">${createFormHtml(awayTeam.league.form)}</div>
                    </div>
                </div>
            </div>
        `;

        const standingsHTML = `
            <div class="section standings">
                <h3 class="section-title">League Standings</h3>
                <table class="standings-table">
                    <thead>
                        <tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>
                    </thead>
                    <tbody>
                        ${standings
                            .filter(row => row.team.id === homeTeam.id || row.team.id === awayTeam.id)
                            .map(row => `
                                <tr class="highlight-team">
                                    <td>${row.rank}</td>
                                    <td class="team-cell"><img src="${row.team.logo}" alt="${row.team.name}"><span>${row.team.name}</span></td>
                                    <td>${row.all.played}</td>
                                    <td>${row.all.win}</td>
                                    <td>${row.all.draw}</td>
                                    <td>${row.all.lose}</td>
                                    <td>${row.goalsDiff}</td>
                                    <td><b>${row.points}</b></td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // --- Assemble Final HTML into the new two-column structure ---
        wrapper.innerHTML = `
            ${topBarHTML}
            <div class="main-content">
                <div class="column left-column">
                    ${predictionSummaryHTML}
                    ${createTeamStatsHTML(homeTeam, 'home')}
                    ${createTeamStatsHTML(awayTeam, 'away')}
                </div>
                <div class="column right-column">
                    ${h2hHTML}
                    ${formHTML}
                    ${standingsHTML}
                </div>
            </div>
        `;

        container.appendChild(wrapper);
        setTimeout(() => wrapper.classList.add('visible'), 50);
    }
});