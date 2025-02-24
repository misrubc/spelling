
let loadedLevels = {};
const WORDS_PER_LEVEL = 20;
const TOTAL_LEVELS = wordBank.getTotalLevels(WORDS_PER_LEVEL);


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
function loadLevelData(levelNumber) {
    console.log('Loading level:', levelNumber);
    if (!loadedLevels[levelNumber]) {
        const levelWords = wordBank.getLevelWords(levelNumber);
        console.log('Level words:', levelWords);
        if (!levelWords) {
            console.error(`No words available for level ${levelNumber}`);
            return null;
        }
        loadedLevels[levelNumber] = levelWords;
    }
    console.log('Loaded level data:', loadedLevels[levelNumber]);
    return loadedLevels[levelNumber];
}
// Function to load level data
function loadLevel() {
    console.log('Loading level, current level:', currentLevel);
    progressByLevel[currentLevel] = currentIndex;
    currentIndex = progressByLevel[currentLevel] || 0;
    
    const levelData = loadLevelData(currentLevel);
    console.log('Level data loaded:', levelData);
    if (!levelData) {
        console.error('Failed to load level data');
        return;
    }
    
    hintPercentage = 0;
    revealedLetters = '';
    updateWordDisplay();
    updateScoreDisplay();
    updateLevelDisplay();
    updateProgressBar();
    speakWord(levelData[currentIndex]);
    
    if (currentLevel < TOTAL_LEVELS - 1) {
        setTimeout(() => {
            loadLevelData(currentLevel + 1);
        }, 0);
    }
    
    saveProgress();
}

function speakWord(wordObj) {
    console.log('Speaking word:', wordObj);
    const utterance = new SpeechSynthesisUtterance(wordObj.word);
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
    const progressPercentage = ((currentIndex + 1) / WORDS_PER_LEVEL) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${progressPercentage.toFixed(0)}%`;
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
    const currentWordObj = loadedLevels[currentLevel][currentIndex];
    const word = currentWordObj.word;
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

    score = Math.max(0, score - 1);
    updateScoreDisplay();
    saveProgress();
}

function getDefinition() {
    const currentWordObj = loadedLevels[currentLevel][currentIndex];
    const definition = currentWordObj.definition || "Definition not available";
    const usage = currentWordObj.usage || "Usage example not available";
    const audioUS = currentWordObj.audioUS;
    
    // If the feedback is already showing, clear it
    if (feedbackDisplay.textContent.includes(definition)) {
        feedbackDisplay.textContent = '';
        return;
    }
    
    // Create HTML content with CSS classes
    let content = `
        <div class="definition-container">
            <p class="definition-text">${definition}</p>
            <p class="usage-text">"${usage}"</p>
    `;
    
    // Add audio player if audio URL is available
    if (audioUS) {
        content += `
            <p class="audio-container">
                <button class="audio-button" onclick="playAudio('${audioUS}')">
                    🔊 Play
                </button>
            </p>
        `;
    }
    
    content += '</div>';
    
    feedbackDisplay.innerHTML = content;
}

function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        // Fallback to speech synthesis if audio fails
        const currentWordObj = loadedLevels[currentLevel][currentIndex];
        speakWord(currentWordObj);
    });
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
    const currentWordObj = loadedLevels[currentLevel][currentIndex];
    speakWord(currentWordObj);
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
    
    highestLevelReached = Math.max(
        highestLevelReached,
        currentLevel,
        ...Object.keys(completedLevels).map(Number)
    );
    
    progressByLevel[currentLevel] = currentIndex;
    
    for (let i = 0; i < TOTAL_LEVELS; i++) {
        const levelButton = document.createElement('button');
        levelButton.classList.add('level-button');
        
        if (i in completedLevels) {
            const completionDate = new Date(completedLevels[i]).toLocaleDateString();
            levelButton.textContent = `Level ${i + 1} - Completed ${completionDate}`;
            levelButton.classList.add('completed-level');
        } else if (i === currentLevel) {
            const progress = Math.round((currentIndex / WORDS_PER_LEVEL) * 100);
            levelButton.textContent = `Level ${i + 1} - In Progress (${progress}%)`;
            levelButton.classList.add('current-level');
        } else if (i > highestLevelReached) {
            levelButton.textContent = `Level ${i + 1} - Locked`;
            levelButton.classList.add('locked-level');
            levelButton.disabled = true;
        } else {
            const savedProgress = progressByLevel[i] || 0;
            const progressPercent = Math.round((savedProgress / WORDS_PER_LEVEL) * 100);
            levelButton.textContent = `Level ${i + 1} - In Progress (${progressPercent}%)`;
            levelButton.classList.add('available-level');
        }
        
        levelButton.addEventListener('click', () => {
            if (!levelButton.disabled) {
                progressByLevel[currentLevel] = currentIndex;
                currentLevel = i;
                currentIndex = progressByLevel[i] || 0;
                loadLevel();
                resetMenu.classList.remove('visible');
                saveProgress();
            }
        });
        
        levelsSection.appendChild(levelButton);
    }
    
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
    const currentWordObj = loadedLevels[currentLevel][currentIndex];
    
    if (userAnswer === currentWordObj.word.toLowerCase()) {
        score += 10;
        showFeedback(true);
        currentIndex++;
        hintPercentage = 0;
        revealedLetters = '';
        
        progressByLevel[currentLevel] = currentIndex;
        
        if (currentIndex >= WORDS_PER_LEVEL) {
            completedLevels[currentLevel] = new Date().toISOString();
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
            
            currentLevel++;
            if (currentLevel >= TOTAL_LEVELS) {
                alert('Congratulations! You have completed all levels.');
                currentLevel = TOTAL_LEVELS - 1;
                currentIndex = WORDS_PER_LEVEL - 1;
            } else {
                highestLevelReached = Math.max(highestLevelReached, currentLevel);
                currentIndex = progressByLevel[currentLevel] || 0;
                loadLevel();
            }
        } else {
            speakWord(loadedLevels[currentLevel][currentIndex]);
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
        const currentWordObj = loadedLevels[currentLevel][currentIndex];
        speakWord(currentWordObj);
    }
    saveProgress();
    updateProgressBar();
});

forwardButton.addEventListener('click', () => {
    if (currentIndex < WORDS_PER_LEVEL - 1) {
        currentIndex++;
        hintPercentage = 0;
        revealedLetters = '';
        feedbackDisplay.textContent = ''; 
        const currentWordObj = loadedLevels[currentLevel][currentIndex];
        speakWord(currentWordObj);
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
        const levelData = loadLevelData(currentLevel);
        if (levelData) {
            speakWord(levelData[currentIndex]);
        }
    }
});
