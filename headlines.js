window.addEventListener('load', function() {

    // Get references to the new elements
    const headlineMainElement = document.getElementById('headline-main');
    const headlineDescriptionElement = document.getElementById('headline-description');
    const headlineImageElement = document.getElementById('headline-image');
    const container = document.querySelector('.headline-container');

    if (typeof headlines === 'undefined' || headlines.length === 0) {
        headlineMainElement.textContent = "No headlines configured.";
        headlineImageElement.style.display = 'none';
        return;
    }

    let currentIndex = parseInt(localStorage.getItem('headlineIndex')) || 0;

    if (currentIndex >= headlines.length) {
        currentIndex = 0;
    }

    // Get the current headline OBJECT from the array
    const currentHeadline = headlines[currentIndex];

    // --- UPDATED LOGIC ---
    // Populate the two separate text elements
    headlineMainElement.textContent = currentHeadline.headline;
    headlineDescriptionElement.textContent = currentHeadline.description;

    // The image logic remains the same
    if (currentHeadline.image) {
        headlineImageElement.src = currentHeadline.image;
        headlineImageElement.style.display = 'block';
    } else {
        headlineImageElement.style.display = 'none';
    }

    // The logic for cycling to the next headline remains the same
    const nextIndex = (currentIndex + 1) % headlines.length;
    localStorage.setItem('headlineIndex', nextIndex);

    // The logic for the animation remains the same
    container.classList.remove('animate-in');
    setTimeout(() => {
        container.classList.add('animate-in');
    }, 10);

});