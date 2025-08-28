// This script is a "listener". It gets its data from the central data_fetcher.js
window.addEventListener('load', function() {
    const eventsList = document.getElementById('events-list');
    let displayedEventIds = new Set();
    const ITEM_HEIGHT = 40;
    const MAX_EVENTS = Math.floor((225 - 45) / ITEM_HEIGHT);

    function typewriterEffect(element, text, speed = 30) {
        let i = 0;
        element.textContent = '';
        const typing = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, speed);
    }
    
    function getIconForEvent(event) {
        if (event.type === 'Goal') return '⚽';
        if (event.type === 'Card') return event.detail === 'Yellow Card' ? '🟨' : '🟥';
        return 'ℹ️';
    }

    function updateTicker(events) {
        if (!events) return;
        
        // Process oldest new events first to prepend them in the correct order
        events.reverse(); 

        events.forEach(event => {
            const eventId = `${event.fixtureInfo.fixture.id}-${event.type}-${event.player.id}-${event.time.elapsed}-${event.detail}`;
            
            if (!displayedEventIds.has(eventId)) {
                if (eventsList.firstChild && eventsList.firstChild.className.includes('no-events')) {
                    eventsList.innerHTML = '';
                }
                
                const item = document.createElement('div');
                item.className = 'event-item new-event';
                item.dataset.eventId = eventId;
                
                const eventTime = event.time.extra ? `${event.time.elapsed}+${event.time.extra}` : event.time.elapsed;
                const icon = getIconForEvent(event);
                const detailText = `${event.player.name} (${event.team.name})`;

                item.innerHTML = `
                    <div class="event-time">${eventTime}'</div>
                    <div class="event-icon">${icon}</div>
                    <div class="event-details"></div>
                `;

                eventsList.prepend(item);
                displayedEventIds.add(eventId);
                typewriterEffect(item.querySelector('.event-details'), detailText);
                
                setTimeout(() => item.classList.remove('new-event'), 500);
            }
        });

        while (eventsList.children.length > MAX_EVENTS) {
            const childToRemove = eventsList.lastChild;
            displayedEventIds.delete(childToRemove.dataset.eventId);
            eventsList.removeChild(childToRemove);
        }
        
        if (eventsList.children.length === 0) {
            eventsList.innerHTML = `<div class="no-events">No recent events.</div>`;
        }
    }

    // --- NEW "LISTENER" LOGIC ---
    function updateFromStorage() {
        const dataString = localStorage.getItem('league_events_data');
        if (dataString) {
            updateTicker(JSON.parse(dataString));
        } else {
            updateTicker([]); // Render empty state if no data
        }
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'league_events_data') {
            updateFromStorage();
        }
    });

    updateFromStorage(); // Initial render
});