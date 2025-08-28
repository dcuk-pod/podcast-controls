window.addEventListener('load', function() {

    const container = document.getElementById('qa-container');
    const logoElement = document.getElementById('qa-logo');
    const titleElement = document.getElementById('qa-title');
    const questionElement = document.getElementById('qa-question');

    if (typeof questions === 'undefined' || questions.length === 0) {
        titleElement.textContent = "No questions configured.";
        questionElement.textContent = "Please add questions to your config.js file.";
        logoElement.style.display = 'none';
        return;
    }

    let currentIndex = parseInt(localStorage.getItem('questionIndex')) || 0;

    if (currentIndex >= questions.length) {
        currentIndex = 0;
    }

    const currentQuestion = questions[currentIndex];

    logoElement.src = `assets/${currentQuestion.source}.png`;

    const sourceCapitalized = currentQuestion.source.charAt(0).toUpperCase() + currentQuestion.source.slice(1);

    if (currentQuestion.name === 'D.C U.K') {
        titleElement.textContent = "Got a question?";
    } else {
         titleElement.textContent = `From ${sourceCapitalized} - ${currentQuestion.name}`;
    }
   

    // --- THIS IS THE NEW LOGIC ---
    // Check if the name is 'D.C U.K'
if (currentQuestion.name === 'D.C U.K') {
        questionElement.textContent = `${currentQuestion.question}`;
    } else {
        // Otherwise, show the normal question text
        questionElement.textContent = `"${currentQuestion.question}"`;
    }
    // --- END OF NEW LOGIC ---

    const nextIndex = (currentIndex + 1) % questions.length;
    localStorage.setItem('questionIndex', nextIndex);

    container.classList.remove('animate-in');
    setTimeout(() => {
        container.classList.add('animate-in');
    }, 10);
});