let startTime = null;
let timerInterval;

function startGame() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    document.getElementById('timer').innerText = Math.floor((Date.now() - startTime) / 1000);
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
}

function submitScore() {
  const name = document.getElementById('playerName').value;
  const score = Math.floor((Date.now() - startTime) / 1000);

  fetch('/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  })
  .then(response => response.text())
  .then(data => alert(data))
  .catch(err => alert("Error: " + err));
}

startGame();
