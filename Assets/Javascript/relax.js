// ===== BUBBLE POPPER GAME =====
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 300;
canvas.height = 250;

let bubbles = [];
let bubbleScore = 0;
let bubblesPopCount = 0;

function createBubbles(count) {
  bubbles = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: Math.random() * (canvas.height - 60) + 30,
      r: Math.random() * 15 + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    });
  }
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Get theme colors
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `rgba(${hexToRgb(getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary')).join(',')}, 0.5)`);
  gradient.addColorStop(1, `rgba(${hexToRgb(secondaryColor).join(',')}, 0.3)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach((b) => {
    // Update position
    b.x += b.vx;
    b.y += b.vy;

    // Bounce off walls
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.vy *= -1;

    // Keep bubble in bounds
    b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));
    b.y = Math.max(b.r, Math.min(canvas.height - b.r, b.y));

    // Draw bubble
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${hexToRgb(primaryColor).join(',')}, ${0.6 + Math.random() * 0.2})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${hexToRgb(secondaryColor).join(',')}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw shine
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();
    ctx.closePath();
  });
}

function hexToRgb(hex) {
  // Handle CSS variables like "94 181 238"
  if (typeof hex === 'string' && !hex.startsWith('#')) {
    return hex.split(' ').map(x => parseInt(x));
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [94, 181, 238];
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  bubbles = bubbles.filter((b) => {
    let dx = x - b.x;
    let dy = y - b.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= b.r) {
      bubbleScore += Math.round(b.r);
      bubblesPopCount++;
      document.getElementById("bubbleScore").textContent = bubbleScore;
      document.getElementById("bubblesPopped").textContent = Math.min(
        bubblesPopCount,
        20
      );

      // Play pop animation
      popBubbleEffect(b.x, b.y);

      if (bubblesPopCount >= 20) {
        setTimeout(() => {
          alert(
            "🎉 Great job! You popped 20 bubbles! Your stress relief score: " +
              bubbleScore
          );
          resetBubbleGame();
        }, 100);
      }

      return false;
    }
    return true;
  });
});

function popBubbleEffect(x, y) {
  // Draw pop effect
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(236, 72, 153, 0.8)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function resetBubbleGame() {
  bubbleScore = 0;
  bubblesPopCount = 0;
  document.getElementById("bubbleScore").textContent = "0";
  document.getElementById("bubblesPopped").textContent = "0";
  createBubbles(10);
  drawBubbles();
}

createBubbles(10);
let bubbleAnimationId = setInterval(drawBubbles, 30);

// ===== BREATHING GAME =====
let breathingActive = false;
let breathingCycles = 0;
const breathingBtn = document.getElementById("breathingBtn");
const breathingInstruction = document.getElementById("breathingInstruction");
const breathingCount = document.getElementById("breathingCount");

const breathingSequence = [
  { text: "Inhale...", duration: 4000 },
  { text: "Hold...", duration: 4000 },
  { text: "Exhale...", duration: 4000 },
  { text: "Hold...", duration: 2000 },
];

async function startBreathingExercise() {
  if (breathingActive) return;
  breathingActive = true;
  breathingBtn.textContent = "Breathing... (2-4 min)";
  breathingBtn.disabled = true;

  for (let cycle = 0; cycle < 4; cycle++) {
    for (let step of breathingSequence) {
      breathingInstruction.textContent = step.text;
      await new Promise((resolve) => setTimeout(resolve, step.duration));
    }
    breathingCycles++;
    breathingCount.textContent = breathingCycles;
  }

  breathingActive = false;
  breathingBtn.textContent = "Start Breathing";
  breathingBtn.disabled = false;
  breathingInstruction.textContent = "Great job! You completed a breathing session!";
}

breathingBtn.addEventListener("click", startBreathingExercise);

// ===== COLOR GAME =====
const colorGrid = document.getElementById("colorGrid");
const colors = [
  "#EC4899",
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#06B6D4",
  "#8B5CF6",
  "#F97316",
  "#14B8A6",
];

function createColorGame() {
  colorGrid.innerHTML = "";
  colors.forEach((color) => {
    const box = document.createElement("div");
    box.className = "color-box";
    box.style.setProperty("--color", color);
    box.addEventListener("click", () => {
      box.classList.add("clicked");
      updateColorLevel();
    });
    colorGrid.appendChild(box);
  });
}

function updateColorLevel() {
  const clicked = document.querySelectorAll(".color-box.clicked").length;
  const level = Math.round((clicked / colors.length) * 100);
  document.getElementById("colorLevel").textContent = level;
}

function resetColorGame() {
  createColorGame();
  document.getElementById("colorLevel").textContent = "0";
}

createColorGame();

// ===== MOOD JOURNAL =====
let journalEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];
const journalText = document.getElementById("journalText");
const journalStatus = document.getElementById("journalStatus");
document.getElementById("journalCount").textContent = journalEntries.length;

function saveJournal() {
  const text = journalText.value.trim();
  if (text.length < 3) {
    journalStatus.textContent = "Please write something meaningful!";
    journalStatus.style.color = "#ef4444";
    return;
  }

  const entry = {
    text: text,
    timestamp: new Date().toLocaleString(),
  };

  journalEntries.push(entry);
  localStorage.setItem("journalEntries", JSON.stringify(journalEntries));

  journalText.value = "";
  journalStatus.textContent = "✓ Entry saved! Keep reflecting.";
  journalStatus.style.color = "#10b981";
  document.getElementById("journalCount").textContent = journalEntries.length;

  setTimeout(() => {
    journalStatus.textContent = "";
  }, 3000);
}

// ===== FOCUS GAME =====
const focusGridContainer = document.getElementById("focusGridContainer");
const focusFeedback = document.getElementById("focusFeedback");
const focusTime = document.getElementById("focusTime");

let focusGameActive = false;
let focusStartTime = 0;
let focusTarget = null;

function startFocusGame() {
  focusGameActive = true;
  focusTarget = Math.floor(Math.random() * 16);
  focusStartTime = Date.now();
  focusGridContainer.innerHTML = "";
  focusFeedback.textContent = "Find the ⭐ as fast as you can!";
  document.querySelectorAll(".start-btn")[1].disabled = true;

  for (let i = 0; i < 16; i++) {
    const item = document.createElement("div");
    item.className = "focus-item";
    item.textContent = i === focusTarget ? "⭐" : "○";

    item.addEventListener("click", () => {
      if (!focusGameActive) return;

      if (i === focusTarget) {
        item.classList.add("correct");
        const endTime = Date.now();
        const timeSeconds = ((endTime - focusStartTime) / 1000).toFixed(2);
        focusTime.textContent = timeSeconds;

        focusGameActive = false;
        focusFeedback.textContent =
          "✓ Found it in " + timeSeconds + "s! Nice focus!";
        document.querySelectorAll(".start-btn")[1].disabled = false;
      }
    });

    focusGridContainer.appendChild(item);
  }
}

// ===== ZEN SLIDER =====
const zenSlider = document.getElementById("zenSlider");
const balanceValue = document.getElementById("balanceValue");
const balanceMessage = document.getElementById("balanceMessage");
const balanceViz = document.getElementById("balanceViz");

function createBalanceIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "balance-indicator";
  balanceViz.appendChild(indicator);
  updateBalanceIndicator();
}

function updateBalanceIndicator() {
  const value = zenSlider.value;
  balanceValue.textContent = value;

  const indicator = balanceViz.querySelector(".balance-indicator");
  indicator.style.left = value + "%";

  if (value < 40) {
    balanceMessage.textContent = "⬅️ Leaning left - more rest needed";
  } else if (value > 60) {
    balanceMessage.textContent = "➡️ Leaning right - balance with activities";
  } else {
    balanceMessage.textContent = "✓ Perfect balance!";
  }
}

zenSlider.addEventListener("input", updateBalanceIndicator);
createBalanceIndicator();

// ===== MOOD TRACKER =====
const moodButtons = document.querySelectorAll(".mood-btn");
moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const mood = btn.dataset.mood;
    console.log("Mood logged:", mood);
  });
});
