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

// Word definitions (placeholders)
const definitions = {
    "holiday": "A day of festivity or recreation when no work is done",
    "banana": "A long curved fruit with a yellow peel",
    "silver": "A shiny gray-white precious metal",
    "pattern": "A repeated decorative design or sequence",
    "abdomen": "The part of the body containing the digestive organs",
    "bicycle": "A vehicle with two wheels powered by pedals",
    "hungry": "Feeling or showing the need for food",
    "candle": "A cylinder of wax with a central wick that provides light when burning",
    "music": "Vocal or instrumental sounds combined to produce beauty of form",
    "animal": "A living organism that feeds on organic matter",
    // Add more definitions as needed...
};

let completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || {};
let currentLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
let currentIndex = parseInt(localStorage.getItem('currentIndex')) || 0;
let score = parseInt(localStorage.getItem('score')) || 0;
let hintPercentage = parseInt(localStorage.getItem('hintPercentage')) || 0;
let revealedLetters = localStorage.getItem('revealedLetters') || '';
let highestLevelReached = parseInt(localStorage.getItem('highestLevelReached')) || 0;
let progressByLevel = JSON.parse(localStorage.getItem('progressByLevel')) || {};


const wordDisplay = document.getElementById('word-display');
const userInput = document.getElementById('user-input');
const playButton = document.getElementById('play-button');
const submitButton = document.getElementById('submit-button');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const hintButton = document.getElementById('hint-button');
const definitionButton = document.getElementById('definition-button');
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
    // Save current progress before switching levels
    progressByLevel[currentLevel] = currentIndex;
    
    // Load saved progress for the new level
    currentIndex = progressByLevel[currentLevel] || 0;
    
    hintPercentage = 0;
    revealedLetters = '';
    updateWordDisplay();
    updateScoreDisplay();
    updateLevelDisplay();
    updateProgressBar();
    speakWord(levels[currentLevel][currentIndex]);
    
    // Save the updated state
    saveProgress();
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
    localStorage.setItem('highestLevelReached', highestLevelReached);
    localStorage.setItem('progressByLevel', JSON.stringify(progressByLevel));


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

        let hint = word.split('').map(letter => revealedLetters.includes(letter) ? letter : '_').join(' ');
        feedbackDisplay.textContent = hint;
        hintPercentage = Math.min(hintPercentage + 25, 100);
    }

    // Deduct 1 point for using hint
    score = Math.max(0, score - 1);
    updateScoreDisplay();
    saveProgress();
}

function getDefinition() {
    const word = levels[currentLevel][currentIndex];
    const definition = definitions[word] || "Definition not available";
    
    // Toggle definition display
    if (feedbackDisplay.textContent === definition) {
        feedbackDisplay.textContent = '';
    } else {
        feedbackDisplay.textContent = definition;
    }
}

function resetProgress() {
    localStorage.clear();
    currentLevel = 0;
    currentIndex = 0;
    score = 0;
    hintPercentage = 0;
    revealedLetters = '';
    completedLevels = {};
    highestLevelReached = 0;
    progressByLevel = {};
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

function updateSettingsMenu() {
    resetMenu.innerHTML = ''; 
    
    const title = document.createElement('h3');
    title.textContent = 'Settings & Progress';
    resetMenu.appendChild(title);

    const levelsSection = document.createElement('div');
    levelsSection.classList.add('completed-levels');
    
    // Get the highest level user has reached
    highestLevelReached = Math.max(
        highestLevelReached,
        currentLevel,
        ...Object.keys(completedLevels).map(Number)
    );
    
    // Save current progress before displaying menu
    progressByLevel[currentLevel] = currentIndex;
    
    for (let i = 0; i < levels.length; i++) {
        const levelButton = document.createElement('button');
        levelButton.classList.add('level-button');
        
        if (i in completedLevels) {
            const completionDate = new Date(completedLevels[i]).toLocaleDateString();
            levelButton.textContent = `Level ${i + 1} - Completed ${completionDate}`;
            levelButton.classList.add('completed-level');
        } else if (i === currentLevel) {
            const progress = Math.round((currentIndex / levels[currentLevel].length) * 100);
            levelButton.textContent = `Level ${i + 1} - In Progress (${progress}%)`;
            levelButton.classList.add('current-level');
        } else if (i > highestLevelReached) {
            levelButton.textContent = `Level ${i + 1} - Locked`;
            levelButton.classList.add('locked-level');
            levelButton.disabled = true;
        } else {
            const savedProgress = progressByLevel[i] || 0;
            const progressPercent = Math.round((savedProgress / levels[i].length) * 100);
            levelButton.textContent = `Level ${i + 1} - In Progress (${progressPercent}%)`;
            levelButton.classList.add('available-level');
        }
        
        levelButton.addEventListener('click', () => {
            if (!levelButton.disabled) {
                // Save progress of current level before switching
                progressByLevel[currentLevel] = currentIndex;
                
                // Switch to selected level
                currentLevel = i;
                currentIndex = progressByLevel[i] || 0;
                
                loadLevel();
                resetMenu.classList.remove('visible');
                
                // Save the updated state
                saveProgress();
            }
        });
        
        levelsSection.appendChild(levelButton);
    };
    
    resetMenu.appendChild(levelsSection);

    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = 'Reset All Progress';
    resetButton.addEventListener('click', resetProgress);
    resetMenu.appendChild(resetButton);
}

function handleClickOutside(event) {
    // Check if the menu is visible
    if (resetMenu.classList.contains('visible')) {
        // Check if the click is outside both the menu and the settings icon
        if (!resetMenu.contains(event.target) && event.target !== settingsIcon) {
            resetMenu.classList.remove('visible');
        }
    }
}
function handleSubmit() {
    const userAnswer = userInput.value.trim().toLowerCase();
    const currentWord = levels[currentLevel][currentIndex];
    if (userAnswer === currentWord) {
        score += 10;
        showFeedback(true);
        currentIndex++;
        hintPercentage = 0;
        revealedLetters = '';
        
        // Update progress for current level
        progressByLevel[currentLevel] = currentIndex;
        
        if (currentIndex >= levels[currentLevel].length) {
            // Record level completion
            completedLevels[currentLevel] = new Date().toISOString();
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
            
            currentLevel++;
            if (currentLevel >= levels.length) {
                alert('Congratulations! You have completed all levels.');
                currentLevel = levels.length - 1;
                currentIndex = levels[currentLevel].length - 1;
            } else {
                highestLevelReached = Math.max(highestLevelReached, currentLevel);
                currentIndex = progressByLevel[currentLevel] || 0;
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
        feedbackDisplay.textContent = ''; 
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
        feedbackDisplay.textContent = ''; 
        speakWord(levels[currentLevel][currentIndex]);
    }
    saveProgress();
    updateProgressBar();
});

hintButton.addEventListener('click', getHint);

definitionButton.addEventListener('click', getDefinition);

settingsIcon.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click from being caught by the document listener
    updateSettingsMenu();
    resetMenu.classList.toggle('visible');
});

// Add click event listener to the document 
// addd
document.addEventListener('click', handleClickOutside);

// Add click event listener to the reset menu to prevent closing when clicking inside
resetMenu.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the document
});

resetButton.addEventListener('click', resetProgress);

// Initialize the game
window.addEventListener('load', () => {
    currentLevel = parseInt(localStorage.getItem('currentLevel')) || 0;
    currentIndex = parseInt(localStorage.getItem('currentIndex')) || 0;
    score = parseInt(localStorage.getItem('score')) || 0;
    hintPercentage = parseInt(localStorage.getItem('hintPercentage')) || 0;
    revealedLetters = localStorage.getItem('revealedLetters') || '';
    completedLevels = JSON.parse(localStorage.getItem('completedLevels')) || {};
    highestLevelReached = parseInt(localStorage.getItem('highestLevelReached')) || 0;
    progressByLevel = JSON.parse(localStorage.getItem('progressByLevel')) || {};

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
