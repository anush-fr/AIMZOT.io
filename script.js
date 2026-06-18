// ============================
// AIMZOT
// ============================

const target = document.getElementById("target");
const scoreElement = document.getElementById("score");
const accuracyElement = document.getElementById("accuracy");
const timerElement = document.getElementById("timer");
const highScoreElement = document.getElementById("highScore");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const finalScore = document.getElementById("finalScore");
const finalAccuracy = document.getElementById("finalAccuracy");
const hitSound = document.getElementById("hitSound");
const missSound = document.getElementById("missSound");
const gameArea = document.getElementById("gameArea");

// ============================
// GAME STATE
// ============================

let score = 0;
let shots = 0;
let timeLeft = 30;
let gameRunning = false;
let timerInterval = null;
let spawnTime = 0;
let totalReactionTime = 0;
let hits = 0;
let highScore = Number(localStorage.getItem("aimzot_highscore")) || 0;

highScoreElement.textContent = highScore;

// ============================
// START GAME
// ============================

startBtn.addEventListener("click", startGame);
retryBtn.addEventListener("click", startGame);

function startGame() {
  score = 0;
  shots = 0;
  timeLeft = 30;
  spawnTime = 0;
  totalReactionTime = 0;
  hits = 0;

  gameRunning = true;

  scoreElement.textContent = 0;
  accuracyElement.textContent = "100.0";
  timerElement.textContent = 30;

  target.style.width = "90px";
  target.style.height = "90px";

  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");

  moveTarget();

  clearInterval(timerInterval);

  timerInterval = setInterval(function () {
    timeLeft -= 1;
    timerElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// ============================
// END GAME
// ============================

function endGame() {
  gameRunning = false;

  clearInterval(timerInterval);
  timerInterval = null;

  target.style.display = "none";

  finalScore.textContent = score;

  var accuracy = shots > 0 ? ((score / shots) * 100).toFixed(1) : "0.0";
  finalAccuracy.textContent = accuracy;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("aimzot_highscore", highScore);
    highScoreElement.textContent = highScore;
  }

  gameOverScreen.classList.remove("hidden");
}

// ============================
// TARGET CLICK
// ============================

target.addEventListener("click", function (e) {
  if (!gameRunning) return;

  e.stopPropagation();

  var reaction = Date.now() - spawnTime;
  totalReactionTime += reaction;
  hits += 1;

  score += 1;
  shots += 1;

  scoreElement.textContent = score;
  accuracyElement.textContent = ((score / shots) * 100).toFixed(1);

  playHit();
  flashScreen();
  difficultyScale();
  moveTarget();
});

// ============================
// MISS CLICK
// ============================

gameArea.addEventListener("click", function () {
  if (!gameRunning) return;

  shots += 1;
  accuracyElement.textContent = ((score / shots) * 100).toFixed(1);

  playMiss();
});

// ============================
// MOVE TARGET
// ============================

function moveTarget() {
  target.style.display = "flex";
  spawnTime = Date.now();

  var rect = gameArea.getBoundingClientRect();
  var hudHeight = 120;

  var maxX = rect.width - target.offsetWidth - 20;
  var maxY = rect.height - target.offsetHeight - hudHeight;

  var x = 10 + Math.random() * maxX;
  var y = hudHeight + Math.random() * maxY;

  target.style.left = x + "px";
  target.style.top = y + "px";

  target.style.animation = "none";
  void target.offsetWidth;
  target.style.animation = "spawn 0.18s ease-out";
}

// ============================
// DIFFICULTY SCALING
// ============================

function difficultyScale() {
  var size = Math.max(45, 90 - score * 1.2);
  target.style.width = size + "px";
  target.style.height = size + "px";
}

// ============================
// VISUAL EFFECT
// ============================

function flashScreen() {
  var flash = document.createElement("div");
  flash.className = "hit-flash";
  document.body.appendChild(flash);

  setTimeout(function () {
    flash.remove();
  }, 120);
}

// ============================
// SOUNDS
// ============================

function playHit() {
  if (!hitSound) return;
  hitSound.currentTime = 0;
  hitSound.play().catch(function () {});
}

function playMiss() {
  if (!missSound) return;
  missSound.currentTime = 0;
  missSound.play().catch(function () {});
}

// ============================
// ESC TO QUIT
// ============================

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && gameRunning) {
    endGame();
  }
});
