const gameState = {
  words: [],
  selectedWord: "",
  selectedHint: "",
  guessedLetters: [],
  wrongGuesses: 0,
  maxWrongGuesses: 6,
  gameOver: false
};

const hangmanImage = document.getElementById("hangmanImage");
const guessesLeft = document.getElementById("guessesLeft");
const hintText = document.getElementById("hintText");
const wordDisplay = document.getElementById("wordDisplay");
const message = document.getElementById("message");
const keyboard = document.getElementById("keyboard");
const playAgainBtn = document.getElementById("playAgainBtn");
const letterInput = document.getElementById("letterInput");
const guessBtn = document.getElementById("guessBtn");

async function loadWords() {
  try {
    const response = await fetch("data/words.json");

    if (!response.ok) {
      throw new Error("Could not load words.json");
    }

    gameState.words = await response.json();
    startNewGame();
  } catch (error) {
    message.textContent = "Error loading words file.";
    console.error(error);
  }
}

function startNewGame() {
  const randomIndex = Math.floor(Math.random() * gameState.words.length);
  const selectedItem = gameState.words[randomIndex];

  gameState.selectedWord = selectedItem.word.toUpperCase();
  gameState.selectedHint = selectedItem.hint;
  gameState.guessedLetters = [];
  gameState.wrongGuesses = 0;
  gameState.gameOver = false;

  guessesLeft.textContent = gameState.maxWrongGuesses - gameState.wrongGuesses;
  hintText.textContent = `Hint: ${gameState.selectedHint}`;
  message.textContent = "";

  letterInput.value = "";
  letterInput.disabled = false;
  guessBtn.disabled = false;

  updateHangmanImage();
  renderWord();
  renderKeyboard();
}

function renderWord() {
  wordDisplay.innerHTML = "";

  for (const letter of gameState.selectedWord) {
    const letterBox = document.createElement("div");
    letterBox.classList.add("letter-box");

    if (gameState.guessedLetters.includes(letter)) {
      letterBox.textContent = letter;
      letterBox.classList.add("revealed-letter");
    } else {
      letterBox.textContent = "_";
      letterBox.classList.add("hidden-letter");
    }

    wordDisplay.appendChild(letterBox);
  }
}

function renderKeyboard() {
  keyboard.innerHTML = "";

  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const button = document.createElement("button");

    button.textContent = letter;
    button.classList.add("key-btn");
    button.type = "button";

    button.addEventListener("click", function () {
      processGuess(letter);
    });

    keyboard.appendChild(button);
  }
}

function processGuess(letter) {
  if (gameState.gameOver) {
    return;
  }

  const upperLetter = letter.toUpperCase();

  if (!/^[A-Z]$/.test(upperLetter)) {
    message.textContent = "Please enter only one letter from A to Z.";
    return;
  }

  if (gameState.guessedLetters.includes(upperLetter)) {
    message.textContent = `You already guessed "${upperLetter}".`;
    return;
  }

  gameState.guessedLetters.push(upperLetter);

  const matchingButton = [...document.querySelectorAll(".key-btn")].find(
    function (button) {
      return button.textContent === upperLetter;
    }
  );

  if (matchingButton) {
    matchingButton.disabled = true;
  }

  if (gameState.selectedWord.includes(upperLetter)) {
    if (matchingButton) {
      matchingButton.classList.add("correct");
    }
    message.textContent = `Good guess! "${upperLetter}" is correct.`;
  } else {
    gameState.wrongGuesses++;
    guessesLeft.textContent = gameState.maxWrongGuesses - gameState.wrongGuesses;

    if (matchingButton) {
      matchingButton.classList.add("wrong");
    }

    updateHangmanImage();
    message.textContent = `Sorry, "${upperLetter}" is not in the word.`;
  }

  renderWord();
  checkGameResult();

  letterInput.value = "";
  letterInput.focus();
}

function updateHangmanImage() {
  hangmanImage.src = `images/hangman${gameState.wrongGuesses}.png`;
  hangmanImage.classList.remove("fade-in");

  void hangmanImage.offsetWidth;

  hangmanImage.classList.add("fade-in");
}

function checkGameResult() {
  const allLettersGuessed = [...gameState.selectedWord].every(function (letter) {
    return gameState.guessedLetters.includes(letter);
  });

  if (allLettersGuessed) {
    gameState.gameOver = true;
    message.textContent = "Congratulations! You won the game!";
    disableKeyboard();
    disableInput();
    return;
  }

  if (gameState.wrongGuesses >= gameState.maxWrongGuesses) {
    gameState.gameOver = true;
    revealWord();
    message.textContent = `You lost! The word was "${gameState.selectedWord}".`;
    disableKeyboard();
    disableInput();
  }
}

function revealWord() {
  wordDisplay.innerHTML = "";

  for (const letter of gameState.selectedWord) {
    const letterBox = document.createElement("div");
    letterBox.classList.add("letter-box", "revealed-letter");
    letterBox.textContent = letter;
    wordDisplay.appendChild(letterBox);
  }
}

function disableKeyboard() {
  const buttons = document.querySelectorAll(".key-btn");

  buttons.forEach(function (button) {
    button.disabled = true;
  });
}

function disableInput() {
  letterInput.disabled = true;
  guessBtn.disabled = true;
}

guessBtn.addEventListener("click", function () {
  processGuess(letterInput.value);
});

letterInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    processGuess(letterInput.value);
  }
});

letterInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 1);
});

playAgainBtn.addEventListener("click", startNewGame);

loadWords();