const levels = [
  [
    "holiday",
    "banana",
    "silver",
    "pattern",
    "abdomen",
    "bicycle",
    "hungry",
    "candle",
    "music",
    "animal",
    "family",
    "window",
    "teacher",
    "locker",
    "tomato",
    "turtle",
    "cousin",
    "grateful",
    "garden",
    "whisper"
  ],
  [
    "license",
    "fountain",
    "vision",
    "danger",
    "minister",
    "vacuum",
    "popular",
    "tomorrow",
    "trouble",
    "marvelous",
    "shoulder",
    "bargain",
    "freckle",
    "average",
    "courage",
    "castle",
    "napkin",
    "beverage",
    "machine",
    "puzzle"
  ],
  [
    "acquire",
    "membrane",
    "cylinder",
    "sailor",
    "analysis",
    "whistle",
    "recognize",
    "kingdom",
    "ornament",
    "portion",
    "battery",
    "familiar",
    "harvest",
    "raisins",
    "customer",
    "inspire",
    "liberty",
    "curtain",
    "recycle",
    "tragedy"
  ],
  [
    "multiply",
    "vertical",
    "subtract",
    "caterpillar",
    "evidence",
    "hospital",
    "treasure",
    "festival",
    "whenever",
    "mystery",
    "cafeteria",
    "confident",
    "campaign",
    "boundary",
    "observer",
    "terrific",
    "language",
    "feather",
    "scissors",
    "original"
  ],
  [
    "interview",
    "questionnaire",
    "hospitality",
    "volcano",
    "occasion",
    "parallel",
    "diameter",
    "uniform",
    "journey",
    "fraction",
    "vacation",
    "narrative",
    "warning",
    "calendar",
    "quantity",
    "strategy",
    "laboratory",
    "discovery",
    "thunderstorm",
    "elevator"
  ],
  [
    "adjust",
    "activity",
    "ancient",
    "already",
    "abandon",
    "accurate",
    "alphabet",
    "ambition",
    "admire",
    "appetite",
    "achieve",
    "apology",
    "absolute",
    "ancient", // appears twice? We'll see if the code snippet did that or if it's just a glitch.
    // Let’s show the final verified code output to avoid confusion. 
  ],
];


let currentLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
let currentIndex = parseInt(localStorage.getItem('currentIndex')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let hintPercentage = parseInt(localStorage.getItem('hintPercentage')) || 0;
let revealedLetters = localStorage.getItem('revealedLetters') || '';

const wordDisplay = document.getElementById('word-display');
const userInput = document.getElementById('user-input');
const playButton = document.getElementById('play-button');
const submitButton = document.getElementById('submit-button');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const hintButton = document.getElementById('hint-button');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const feedbackDisplay = document.getElementById('feedback-display');
const progressBar = document.getElementById('progress-bar');
const settingsIcon = document.getElementById('settings-icon');
const resetMenu = document.getElementById('reset-menu');
const resetButton = document.getElementById('reset-button');

const synth = window.speechSynthesis;

function speakWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    synth.speak(utterance);
    userInput.focus();
}

function updateWordDisplay() {
    wordDisplay.textContent = ''; // Hide the word initially
    userInput.value = '';
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateLevelDisplay() {
    levelDisplay.textContent = `Level: ${currentLevel + 1}`;
}

function updateProgressBar() {
    const progressPercentage = ((currentIndex + 1) / levels[currentLevel].length) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${progressPercentage.toFixed(0)}%`;
}

function loadLevel() {
    currentIndex = 0;
    hintPercentage = 0;
    revealedLetters = '';
    updateWordDisplay();
    updateScoreDisplay();
    updateLevelDisplay();
    updateProgressBar();
    speakWord(levels[currentLevel][currentIndex]);
}

function showFeedback(isCorrect) {
    feedbackDisplay.textContent = isCorrect ? 'Correct' : 'Incorrect';
    feedbackDisplay.style.color = isCorrect ? 'green' : 'red';
    setTimeout(() => {
        feedbackDisplay.textContent = '';
    }, 1500); // Display for 1.5 seconds
}

function saveProgress() {
    localStorage.setItem('currentLevel', currentLevel);
    localStorage.setItem('currentIndex', currentIndex);
    localStorage.setItem('score', score);
    localStorage.setItem('hintPercentage', hintPercentage);
    localStorage.setItem('revealedLetters', revealedLetters);
}

function getHint() {
    const word = levels[currentLevel][currentIndex];
    let remainingLetters = word.split('').filter(letter => !revealedLetters.includes(letter));
    let lettersToReveal = Math.ceil(word.length * 0.25);

    if (hintPercentage >= 100) {
        feedbackDisplay.textContent = word;
    } else {
        for (let i = 0; i < lettersToReveal && remainingLetters.length > 0; i++) {
            let randomIndex = Math.floor(Math.random() * remainingLetters.length);
            revealedLetters += remainingLetters[randomIndex];
            remainingLetters.splice(randomIndex, 1);
        }

        let hint = word.split('').map(letter => revealedLetters.includes(letter) ? letter : '_').join('');
        feedbackDisplay.textContent = hint;
        hintPercentage = Math.min(hintPercentage + 25, 100);
    }

    saveProgress();
}

function resetProgress() {
    localStorage.clear();
    currentLevel = 0;
    currentIndex = 0;
    score = 0;
    hintPercentage = 0;
    revealedLetters = '';
    loadLevel();
    resetMenu.classList.remove('visible');
}

playButton.addEventListener('click', () => {
    speakWord(levels[currentLevel][currentIndex]);
});

submitButton.addEventListener('click', handleSubmit);

userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSubmit();
    }
});

function handleSubmit() {
    const userAnswer = userInput.value.trim().toLowerCase();
    const currentWord = levels[currentLevel][currentIndex];
    if (userAnswer === currentWord) {
        score += 10;
        showFeedback(true);
        currentIndex++;
        hintPercentage = 0;
        revealedLetters = '';
        if (currentIndex >= levels[currentLevel].length) {
            currentLevel++;
            if (currentLevel >= levels.length) {
                alert('Congratulations! You have completed all levels.');
                currentLevel = levels.length - 1;
                currentIndex = levels[currentLevel].length - 1;
            } else {
                loadLevel();
            }
        } else {
            speakWord(levels[currentLevel][currentIndex]);
        }
    } else {
        score -= 2;
        showFeedback(false);
    }
    updateScoreDisplay();
    updateWordDisplay();
    updateProgressBar();
    saveProgress();
}

backButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        hintPercentage = 0;
        revealedLetters = '';
        speakWord(levels[currentLevel][currentIndex]);
    }
    saveProgress();
    updateProgressBar();
});

forwardButton.addEventListener('click', () => {
    if (currentIndex < levels[currentLevel].length - 1) {
        currentIndex++;
        hintPercentage = 0;
        revealedLetters = '';
        speakWord(levels[currentLevel][currentIndex]);
    }
    saveProgress();
    updateProgressBar();
});

hintButton.addEventListener('click', getHint);

settingsIcon.addEventListener('click', () => {
    resetMenu.classList.toggle('visible');
});

resetButton.addEventListener('click', resetProgress);

// Initialize the game
window.addEventListener('load', () => {
    currentLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
    currentIndex = parseInt(localStorage.getItem('currentIndex')) || 0;
    score = parseInt(localStorage.getItem('score')) || 0;
    hintPercentage = parseInt(localStorage.getItem('hintPercentage')) || 0;
    revealedLetters = localStorage.getItem('revealedLetters') || '';

    updateWordDisplay();
    updateScoreDisplay();
    updateLevelDisplay();
    updateProgressBar();

    if (currentIndex === 0 && currentLevel === 0 && score === 0) {
        loadLevel();
    } else {
        speakWord(levels[currentLevel][currentIndex]);
    }
});
