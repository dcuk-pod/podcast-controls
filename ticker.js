window.addEventListener('load', function() {

    const tickerContainer = document.getElementById('ticker-container');
    const refreshInterval = 60000;
    
    let displayedEventIds = new Set();
    const MAX_EVENTS_TO_SHOW = 5;

    function getIconForEvent(event) {
        if (event.type === 'Goal') return '⚽';
        if (event.type === 'Card') return event.detail === 'Yellow Card' ? '🟨' : '🟥';
        return 'ℹ️';
    }

    async function fetchAndRenderEvents() {
        const liveFixturesUrl = `https://v3.football.api-sports.io/fixtures?live=all&league=${leagueId}`;
        try {
            const fixturesRes = await fetch(liveFixturesUrl, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } });
            const fixturesData = await fixturesRes.json();
            const liveFixtures = fixturesData.response;

            if (liveFixtures.length === 0) {
                updateTicker([]);
                return;
            }

            const eventPromises = liveFixtures.map(fixture =>
                fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixture.fixture.id}`, { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' } })
                    .then(res => res.json())
                    .then(eventData => eventData.response.map(event => ({ ...event, fixtureInfo: fixture })))
            );

            const eventsByFixture = await Promise.all(eventPromises);
            
            const allEvents = eventsByFixture.flat()
                .filter(event => event.type === 'Goal' || event.type === 'Card')
                .sort((a, b) => b.time.elapsed - a.time.elapsed);

            updateTicker(allEvents);

        } catch (err) {
            console.error("Failed to fetch live events:", err);
        }
    }

    function updateTicker(events) {
        let wrapper = tickerContainer.querySelector('.ticker-wrapper');
        let listContainer;

        if (!wrapper) {
            tickerContainer.innerHTML = '';
            wrapper = document.createElement('div');
            wrapper.className = 'ticker-wrapper';
            listContainer = document.createElement('div');
            listContainer.className = 'events-list';
            wrapper.appendChild(listContainer);
            tickerContainer.appendChild(wrapper);
        } else {
            listContainer = wrapper.querySelector('.events-list');
        }

        if (events.length === 0 && displayedEventIds.size === 0) {
            listContainer.innerHTML = '<div class="no-events">No recent goals or cards in live games.</div>';
            return;
        }

        events.slice(0, MAX_EVENTS_TO_SHOW).reverse().forEach(event => {
            const eventId = `${event.fixtureInfo.fixture.id}-${event.type}-${event.player.id}-${event.time.elapsed}-${event.detail}`;
            
            if (!displayedEventIds.has(eventId)) {
                if (listContainer.querySelector('.no-events')) {
                    listContainer.innerHTML = '';
                }
                
                const item = document.createElement('div');
                item.classList.add('event-row', 'new-event');
                item.dataset.eventId = eventId;
                const fixture = event.fixtureInfo;

                if (event.type === 'Goal') {
                    item.classList.add('goal-event');
                    const isHomeGoal = event.team.id === fixture.teams.home.id;
                    item.innerHTML = `
                        <div class="event-icon">${getIconForEvent(event)}</div>
                        <div class="score-line ${isHomeGoal ? 'highlight' : ''}">
                            <img src="${fixture.teams.home.logo}" class="team-logo">
                            <span class="team-name">${fixture.teams.home.name}</span>
                            <b>${fixture.goals.home}</b>
                        </div>
                        <div class="score-line ${!isHomeGoal ? 'highlight' : ''}">
                            <b>${fixture.goals.away}</b>
                            <span class="team-name">${fixture.teams.away.name}</span>
                            <img src="${fixture.teams.away.logo}" class="team-logo">
                        </div>
                        <div class="scorer-info">
                            <div class="scorer-name">${event.player.name}</div>
                            <div class="event-minute">${event.time.elapsed}'</div>
                        </div>
                    `;
                } else if (event.type === 'Card') {
                    item.classList.add('card-event');
                    // --- THIS INNERHTML IS UPDATED ---
                    item.innerHTML = `
                        <div class="event-icon">${getIconForEvent(event)}</div>
                        <div class="player-name">${event.player.name}</div>
                        <div class="team-info">
                            <img src="${event.team.logo}" class="team-logo">
                            <span class="team-name">${event.team.name}</span>
                        </div>
                        <div class="event-detail">
                            <span>${event.detail}</span>
                            <span class="event-minute">${event.time.elapsed}'</span>
                        </div>
                    `;
                }
                
                listContainer.prepend(item);
                displayedEventIds.add(eventId);

                setTimeout(() => item.classList.remove('new-event'), 500);
            }
        });

        while (listContainer.children.length > MAX_EVENTS_TO_SHOW) {
            const childToRemove = listContainer.lastChild;
            displayedEventIds.delete(childToRemove.dataset.eventId);
            listContainer.removeChild(childToRemove);
        }
    }

    fetchAndRenderEvents();
    setInterval(fetchAndRenderEvents, refreshInterval);
});