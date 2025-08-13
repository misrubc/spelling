/***********************
 * Spelling App Logic
 ***********************/

// ======= Config =======
const WORDS_PER_LEVEL = 50;

// ======= State ========
let currentLevel = 0;
let currentIndex = 0;
let score = 0;

let progressByLevel = {};        // { [levelIndex]: lastIndex }
let completedLevels = {};        // { [levelIndex]: isoDate }
let highestLevelReached = 0;

let hintPercentage = 0;          // kept for compat with older hint logic
let revealedLetters = '';        // kept for compat (letters)
let revealedIndices = new Set(); // positions revealed via hints

// Cache for loaded level word arrays
const loadedLevels = {};

const TOTAL_LEVELS = wordBank.getTotalLevels(WORDS_PER_LEVEL);

// ======= DOM ========
const wordDisplay      = document.getElementById('word-display');
const userInput        = document.getElementById('user-input');      // single-line input
const scoreDisplay     = document.getElementById('score-display');
const levelDisplay     = document.getElementById('level-display');
const progressBar      = document.getElementById('progress-bar');
const feedbackDisplay  = document.getElementById('feedback-display');

const playButton       = document.getElementById('play-button');
const submitButton     = document.getElementById('submit-button');
const backButton       = document.getElementById('back-button');
const forwardButton    = document.getElementById('forward-button');
const hintButton       = document.getElementById('hint-button');
const definitionButton = document.getElementById('definition-button');

const settingsIcon     = document.getElementById('settings-icon');
const resetMenu        = document.getElementById('reset-menu');
const resetButton      = document.getElementById('reset-button');

const levelSelect      = document.getElementById('level-select');

// ======= Speech =======
const synth = window.speechSynthesis;

// ======= Utilities =======
function playAudioUrl(url, fallbackWord) {
  try {
    if (url) {
      // Stop any speech first to avoid overlap
      synth.cancel();
      const a = new Audio(url);
      a.play().catch(() => {
        // If the audio fails (404 or blocked), fallback to TTS
        if (fallbackWord) speakWord({ word: fallbackWord });
      });
    } else if (fallbackWord) {
      speakWord({ word: fallbackWord });
    }
  } catch (e) {
    if (fallbackWord) speakWord({ word: fallbackWord });
  }
}

function saveProgress() {
  localStorage.setItem('currentLevel', String(currentLevel));
  localStorage.setItem('currentIndex', String(currentIndex));
  localStorage.setItem('score', String(score));
  localStorage.setItem('hintPercentage', String(hintPercentage));
  localStorage.setItem('revealedLetters', revealedLetters);
  localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  localStorage.setItem('highestLevelReached', String(highestLevelReached));
  localStorage.setItem('progressByLevel', JSON.stringify(progressByLevel));
}

function updateScoreDisplay() {
  if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
}

function updateLevelDisplay() {
  if (levelDisplay) levelDisplay.textContent = `Level: ${currentLevel + 1}`;
  if (levelSelect) levelSelect.value = String(currentLevel);
}

function updateProgressBar() {
  if (!progressBar) return;
  const pct = Math.round((currentIndex / WORDS_PER_LEVEL) * 100);
  progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

function showFeedback(isCorrect) {
  if (!feedbackDisplay) return;
  feedbackDisplay.textContent = isCorrect ? 'Correct!' : 'Incorrect';
  feedbackDisplay.className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
  setTimeout(() => { feedbackDisplay.textContent = ''; }, 900);
}

function speakWord(wordObj) {
  if (!wordObj || !wordObj.word) return;
  // Prevent piling up multiple utterances
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(wordObj.word);
  synth.speak(utterance);
  if (userInput) userInput.focus();
}

function positionalFeedback(target, guess) {
  const out = [];
  for (let i = 0; i < target.length; i++) {
    const t = target[i];
    const g = guess[i] || '';
    // also reveal indices from hints
    if (revealedIndices.has(i)) {
      out.push(t);
    } else {
      out.push(g && g.toLowerCase() === t.toLowerCase() ? t : '_');
    }
  }
  return out.join(' ');
}

// ======= Word/Level Handling =======
function loadLevelData(levelNumber) {
  if (loadedLevels[levelNumber]) return true;
  const levelWords = wordBank.getLevelWords(levelNumber, WORDS_PER_LEVEL);
  if (!levelWords || !Array.isArray(levelWords) || levelWords.length === 0) {
    console.error(`No words for level ${levelNumber}`);
    return false;
  }
  loadedLevels[levelNumber] = levelWords;
  return true;
}

function updateWordDisplay() {
  const levelData = loadedLevels[currentLevel];
  if (!levelData || !levelData[currentIndex]) {
    if (wordDisplay) wordDisplay.textContent = '';
    if (userInput) userInput.value = '';
    return;
  }
  const len = levelData[currentIndex].word ? levelData[currentIndex].word.length : 0;
  if (wordDisplay) wordDisplay.textContent = len ? Array(len).fill('_').join(' ') : '';
  if (userInput) userInput.value = '';
}

function loadLevel() {
  if (!loadLevelData(currentLevel)) {
    console.error('Failed to load level data');
    return;
  }
  // Clamp index within bounds of this level
  currentIndex = Math.max(0, Math.min(currentIndex, WORDS_PER_LEVEL - 1));

  // Reset per-word hint state
  hintPercentage = 0;
  revealedLetters = '';
  revealedIndices.clear();

  // Update UI
  updateLevelDisplay();
  updateScoreDisplay();
  updateProgressBar();
  updateWordDisplay();

  // Speak current word once
  const levelData = loadedLevels[currentLevel];
  speakWord(levelData[currentIndex]);
}

// ======= Actions =======
function handlePlay() {
  const levelData = loadedLevels[currentLevel];
  if (levelData && levelData[currentIndex]) {
    speakWord(levelData[currentIndex]);
  }
}

function goBack() {
  if (currentIndex > 0) {
    currentIndex--;
    hintPercentage = 0;
    revealedLetters = '';
    revealedIndices.clear();

    updateProgressBar();
    updateWordDisplay();
    const levelData = loadedLevels[currentLevel];
    speakWord(levelData[currentIndex]);
    saveProgress();
  }
}

function goForward() {
  if (currentIndex < WORDS_PER_LEVEL - 1) {
    currentIndex++;
    hintPercentage = 0;
    revealedLetters = '';
    revealedIndices.clear();

    updateProgressBar();
    updateWordDisplay();
    const levelData = loadedLevels[currentLevel];
    speakWord(levelData[currentIndex]);
    saveProgress();
  }
}

function handleSubmit() {
  if (!userInput) return;
  const userAnswer = userInput.value.trim().toLowerCase();
  const currentWordObj = loadedLevels[currentLevel] && loadedLevels[currentLevel][currentIndex];
  if (!currentWordObj) return;

  if (userAnswer === currentWordObj.word.toLowerCase()) {
    score += 10;
    showFeedback(true);

    // advance to next word
    currentIndex++;
    hintPercentage = 0;
    revealedLetters = '';
    revealedIndices.clear();

    progressByLevel[currentLevel] = currentIndex;

    // level completion
    if (currentIndex >= WORDS_PER_LEVEL) {
      completedLevels[currentLevel] = new Date().toISOString();
      localStorage.setItem('completedLevels', JSON.stringify(completedLevels));

      currentLevel++;
      if (currentLevel >= TOTAL_LEVELS) {
        alert('Congratulations! You have completed all levels.');
        currentLevel = TOTAL_LEVELS - 1;
        currentIndex = WORDS_PER_LEVEL - 1;
      } else {
        currentIndex = progressByLevel[currentLevel] || 0;
      }
    }

    // persist + refresh UI and speak next word (once)
    updateScoreDisplay();
    updateLevelDisplay();
    updateProgressBar();
    updateWordDisplay();
    saveProgress();

    const levelData = loadedLevels[currentLevel] || (loadLevelData(currentLevel) && loadedLevels[currentLevel]);
    if (levelData && levelData[currentIndex]) {
      setTimeout(() => speakWord(levelData[currentIndex]), 300);
    }
  } else {
    // incorrect
    score = Math.max(0, score - 2);
    showFeedback(false);

    // Show per-position hint and KEEP it visible (don’t overwrite with underscores)
    const target = currentWordObj.word;
    const hintStr = positionalFeedback(target, userAnswer);
    if (wordDisplay) wordDisplay.textContent = hintStr;

    updateScoreDisplay();
    updateProgressBar();
    saveProgress();
    return; // prevent updateWordDisplay() from resetting to underscores
  }
}

// ======= Hint & Definition =======
function getHint() {
  const currentWordObj = loadedLevels[currentLevel] && loadedLevels[currentLevel][currentIndex];
  if (!currentWordObj) return;

  const word = currentWordObj.word;
  // reveal up to 25% of letters per click (by positions)
  const toReveal = Math.max(1, Math.ceil(word.length * 0.25));
  const hiddenPositions = [];
  for (let i = 0; i < word.length; i++) {
    if (!revealedIndices.has(i)) hiddenPositions.push(i);
  }
  // random reveal
  for (let k = 0; k < toReveal && hiddenPositions.length > 0; k++) {
    const pick = Math.floor(Math.random() * hiddenPositions.length);
    const pos = hiddenPositions.splice(pick, 1)[0];
    revealedIndices.add(pos);
  }

  // Update display to reflect revealed positions
  const currentGuess = (userInput && userInput.value) ? userInput.value : '';
  const hintStr = positionalFeedback(word, currentGuess);
  if (wordDisplay) wordDisplay.textContent = hintStr;
}

function getDefinition() {
  const currentWordObj = loadedLevels[currentLevel] && loadedLevels[currentLevel][currentIndex];
  if (!currentWordObj) return;

  const definition = currentWordObj.definition || "Definition not available.";
  const usage = currentWordObj.usage || "Usage example not available.";
  const audioUS = currentWordObj.audioUS || null;
  const theWord = currentWordObj.word;

  // Toggle: if same def is showing, clear it
  if (feedbackDisplay && feedbackDisplay.innerHTML.includes('definition-container') &&
      feedbackDisplay.innerHTML.includes(definition)) {
    feedbackDisplay.innerHTML = '';
    return;
  }

  // Speaker button shows only when audio exists (we still keep a fallback)
  const speakerHTML = audioUS
    ? `<button id="def-audio-btn" class="audio-btn" title="Play audio" aria-label="Play audio">🔊</button>`
    : '';

  if (feedbackDisplay) {
    feedbackDisplay.innerHTML = `
      <div class="definition-container">
        <div class="definition-header">
          <strong>Definition:</strong>
          
        </div>
        <p class="definition-text">${definition}</p>
        <p class="usage"><strong>Usage:</strong> ${usage}</p>
        ${speakerHTML}
      </div>
    `;
  }

  // Wire the speaker after injection; fallback to TTS if anything fails
  const btn = document.getElementById('def-audio-btn');
  if (btn) {
    btn.onclick = () => playAudioUrl(audioUS, theWord);
  }
}


// ======= Level Select (single-bind) =======
function onLevelChange() {
  // Save progress of the level we leave
  progressByLevel[currentLevel] = currentIndex;

  currentLevel = parseInt(levelSelect.value, 10) || 0;
  currentIndex = progressByLevel[currentLevel] || 0;

  // Load & show the new level once
  loadLevel();
  saveProgress();
}

function populateLevelSelect() {
  if (!levelSelect) return;

  levelSelect.innerHTML = '';
  for (let i = 0; i < TOTAL_LEVELS; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Level ${i + 1}`;
    levelSelect.appendChild(opt);
  }
  levelSelect.value = String(currentLevel);

  // Bind once (no stacking)
  levelSelect.onchange = onLevelChange;
}

// ======= Settings / Reset (optional) =======
function handleClickOutside(e) {
  if (!resetMenu || !settingsIcon) return;
  if (!resetMenu.contains(e.target) && !settingsIcon.contains(e.target)) {
    resetMenu.style.display = 'none';
  }
}

function resetProgress() {
  localStorage.clear();
  currentLevel = 0;
  currentIndex = 0;
  score = 0;
  hintPercentage = 0;
  revealedLetters = '';
  revealedIndices.clear();
  completedLevels = {};
  highestLevelReached = 0;
  progressByLevel = {};
  saveProgress();
  loadLevel();
}

// ======= Event Listeners (bind once) =======
if (playButton)    playButton.addEventListener('click', handlePlay);
if (submitButton)  submitButton.addEventListener('click', handleSubmit);
if (backButton)    backButton.addEventListener('click', goBack);
if (forwardButton) forwardButton.addEventListener('click', goForward);
if (hintButton)    hintButton.addEventListener('click', getHint);
if (definitionButton) definitionButton.addEventListener('click', getDefinition);
if (resetButton)   resetButton.addEventListener('click', resetProgress);

document.addEventListener('click', handleClickOutside);

// Submit on Enter for single-line input
if (userInput) {
  userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  });
}

// ======= Init (single, ordered) =======
window.addEventListener('load', () => {
  // restore state
  currentLevel         = parseInt(localStorage.getItem('currentLevel')) || 0;
  currentIndex         = parseInt(localStorage.getItem('currentIndex')) || 0;
  score                = parseInt(localStorage.getItem('score')) || 0;
  hintPercentage       = parseInt(localStorage.getItem('hintPercentage')) || 0;
  revealedLetters      = localStorage.getItem('revealedLetters') || '';
  completedLevels      = JSON.parse(localStorage.getItem('completedLevels')) || {};
  highestLevelReached  = parseInt(localStorage.getItem('highestLevelReached')) || 0;
  progressByLevel      = JSON.parse(localStorage.getItem('progressByLevel')) || {};

  // Build dropdown once, then load the level (which speaks exactly once)
  populateLevelSelect();
  loadLevel();
});
