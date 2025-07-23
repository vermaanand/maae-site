const alphabet = {
  A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant',
  F: 'Fish', G: 'Grapes', H: 'Hen', I: 'Ice cream', J: 'Jug',
  K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Nest', O: 'Orange',
  P: 'Parrot', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
  U: 'Umbrella', V: 'Violin', W: 'Watch', X: 'Xylophone', Y: 'Yak', Z: 'Zebra'
};

let playerName = '';
let currentIndex = 0;
const letters = Object.keys(alphabet);
let recognition;

function startGame() {
  playerName = document.getElementById('player-name').value.trim();
  if (!playerName) {
    alert('Please enter your name!');
    return;
  }

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  setupSpeechRecognition();
  askQuestion();
}

function speak(text, callback = null) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  if (callback) utterance.onend = callback;
  speechSynthesis.speak(utterance);
}

function askQuestion() {
  if (currentIndex >= letters.length) {
    speak(`Fantastic ${playerName}! You completed the alphabet!`);
    document.getElementById('question').innerText = `🎉 Great work ${playerName}!`;
    document.getElementById('status').innerText = '';
    document.getElementById('image-display').style.display = 'none';
    return;
  }

  const letter = letters[currentIndex];
  const word = alphabet[letter];

  document.getElementById('question').innerText = `🛥️ माई : ${playerName}, what is ${letter} for?`;
  document.getElementById('image-display').src = `images/${letter}.jpg`;
  document.getElementById('image-display').style.display = 'block';
  document.getElementById('result').innerText = '';
  document.getElementById('status').innerHTML = `<span class="dots">● ● ●</span> Listening...`;

  const prompt = `${playerName}, can you tell me, ${letter} for...?`;

  speak(prompt, () => {
    recognition.start();
  });
}

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.toLowerCase();
    const letter = letters[currentIndex];
    const correct = alphabet[letter].toLowerCase();

    document.getElementById('status').innerText = `🗣️ You said: "${spoken}"`;

    if (spoken.includes(correct) || similarity(spoken, correct) > 0.6) {
      document.getElementById('result').innerText = `✅ Yes! ${letter} is for ${alphabet[letter]}`;
      speak(`Very good ${playerName}, ${letter} is for ${alphabet[letter]}`, () => {
        currentIndex++;
        setTimeout(askQuestion, 1500);
      });
    } else {
      document.getElementById('result').innerText = `❌ No ${playerName}, ${letter} is for ${alphabet[letter]}.`;
      speak(`No ${playerName}, it's ${letter} for ${alphabet[letter]}. Let's try next.`, () => {
        currentIndex++;
        setTimeout(askQuestion, 1500);
      });
    }
  };

  recognition.onerror = (event) => {
    document.getElementById('status').innerText = `⚠️ Error: ${event.error}`;
    speak(`Hmm, I didn't hear that clearly. Let's try again, ${playerName}.`, () => {
      setTimeout(askQuestion, 1000);
    });
  };
}

// --- Basic Similarity Check ---
function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length <= str2.length ? str1 : str2;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
