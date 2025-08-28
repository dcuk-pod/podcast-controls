window.addEventListener('load', function() {

    const ukTimeElement = document.getElementById('uk-time');
    const dcTimeElement = document.getElementById('dc-time');

    function updateClocks() {
        const now = new Date();

        // --- UK Time (Europe/London) ---
        // This will correctly handle BST and GMT automatically.
        const ukTime = now.toLocaleTimeString('en-GB', {
            timeZone: 'Europe/London',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Use 24-hour format
        });
        ukTimeElement.textContent = ukTime;

        // --- Washington D.C. Time (America/New_York) ---
        // This will correctly handle EST and EDT automatically.
        const dcTime = now.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Use 12-hour format with AM/PM
        });
        dcTimeElement.textContent = dcTime;
    }

    // Run the function once immediately to show the time without a delay
    updateClocks();

    // Then, update the clocks every second (1000 milliseconds)
    setInterval(updateClocks, 1000);

});