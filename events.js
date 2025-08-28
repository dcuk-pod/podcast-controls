window.addEventListener('load', function() {

    const eventsContainer = document.getElementById('events-container');
    const refreshInterval = 60000;
    
    // --- THIS IS NEW ---
    // This variable will hold a "snapshot" of the last data we displayed.
    let lastEventsSnapshot = '';

    // The getIconForEvent, formatPlayerDetails, and renderEvents functions remain the same.
    // ...

    async function fetchEvents() {
        const url = `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            });
            const data = await response.json();

            // --- THIS IS THE KEY LOGIC CHANGE ---
            // 1. Create a snapshot of the new data.
            const newEventsSnapshot = JSON.stringify(data.response);

            // 2. Compare it to the last snapshot. If they are the same, do nothing.
            if (newEventsSnapshot === lastEventsSnapshot) {
                console.log("No new events, skipping redraw.");
                return; // Exit the function
            }
            
            // 3. If the data is new, update our snapshot and then render the list.
            lastEventsSnapshot = newEventsSnapshot;
            renderEvents(data.response);

        } catch (err) {
            console.error("Failed to fetch events:", err);
        }
    }

    function renderEvents(events) {
        // This function is now only called when there are actual changes.
        eventsContainer.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'events-wrapper';
        
        const titleContainer = document.createElement('div');
        titleContainer.className = 'title-container';
        const title = document.createElement('h1');
        title.className = 'main-title';
        title.textContent = 'Match Events';
        titleContainer.appendChild(title);

        const eventsList = document.createElement('div');
        eventsList.className = 'events-list';

        if (events.length === 0) {
            const noEvents = document.createElement('div');
            noEvents.className = 'no-events';
            noEvents.textContent = 'No events yet.';
            eventsList.appendChild(noEvents);
        } else {
            events.sort((a, b) => a.time.elapsed - b.time.elapsed);
            events.forEach(event => {
                const item = document.createElement('div');
                item.className = 'event-item';
                const eventTime = event.time.extra ? `${event.time.elapsed}+${event.time.extra}` : event.time.elapsed;
                item.innerHTML = `
                    <img src="${event.team.logo}" alt="${event.team.name}" class="team-logo">
                    <div class="event-time">${eventTime}'</div>
                    <div class="event-icon">${getIconForEvent(event)}</div>
                    <div class="event-details">${formatPlayerDetails(event)}</div>
                `;
                eventsList.appendChild(item);
            });
        }
        
        wrapper.appendChild(titleContainer);
        wrapper.appendChild(eventsList);
        eventsContainer.appendChild(wrapper);

        eventsList.scrollTop = eventsList.scrollHeight;
    }

    // Helper functions (getIconForEvent, formatPlayerDetails) remain unchanged.
    function getIconForEvent(event) {
        switch (event.type) {
            case 'Goal': return '⚽';
            case 'Card': return event.detail === 'Yellow Card' ? '🟨' : '🟥';
            case 'subst': return '🔄';
            case 'Var': return '🖥️';
            default: return 'ℹ️';
        }
    }

    function formatPlayerDetails(event) {
        if (event.type === 'subst') {
            return `<div class="player-name sub-in">▲ ${event.assist.name}</div><div class="detail-text sub-out">▼ ${event.player.name}</div>`;
        }
        return `<div class="player-name">${event.player.name}</div><div class="detail-text">${event.detail || ''}</div>`;
    }

    fetchEvents();
    setInterval(fetchEvents, refreshInterval);
});