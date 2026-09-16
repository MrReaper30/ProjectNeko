const urlParams = new URLSearchParams(window.location.search);
let level = parseInt(urlParams.get("level")) || (typeof GameState !== "undefined" ? GameState.currentLevel : 1);
let city = (typeof GameState !== "undefined" ? GameState.selectedCity : 1);
let gold = typeof GameState !== "undefined" ? GameState.gold : 0;

let wave = 1;
let totalWaveEnemies = Math.floor(5 + level * 1.5);
let enemiesRemaining = totalWaveEnemies;

let dmg = 10;
let spd = 1000;
let dmgLvl = 1;
let spdLvl = 1;
let dmgCost = 20;
let spdCost = 50;

let catLives = 9;
let maxCatLives = 9;
let enemyMaxHp = 100;
let enemyCurrentHp = 100;

let isPaused = false;
let audioMuted = false;
let vibMuted = false;

let autoAttackTimer = null;
let enemyAttackTimer = null;

// Web Audio API Sound Synthesizer
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function playSound(type) {
  if (audioMuted) return;
  if (!audioCtx) audioCtx = new AudioCtx();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'hit') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'hurt') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'win') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.floor(n);
}

function triggerVib(ms) {
  if (!vibMuted && navigator.vibrate) navigator.vibrate(ms);
}

function applyCatSkin() {
  if (typeof GameState !== "undefined" && GameState.selectedCatColor) {
    const c = GameState.selectedCatColor;
    const body = document.getElementById('cat-body');
    const head = document.getElementById('cat-head');
    const earL = document.getElementById('cat-ear-left');
    const earR = document.getElementById('cat-ear-right');
    if (body) body.setAttribute('fill', c);
    if (head) head.setAttribute('fill', c);
    if (earL) earL.setAttribute('fill', c);
    if (earR) earR.setAttribute('fill', c);
  }
}

function setCityTheme() {
  const arena = document.getElementById('arena-bg');
  if (arena) {
    if (city === 1) arena.style.background = 'linear-gradient(180deg, #0b132b 0%, #1c2541 100%)'; // Whispering Woods
    else if (city === 2) arena.style.background = 'linear-gradient(180deg, #2b0880 0%, #590d82 100%)'; // Neon Metropolis
    else if (city === 3) arena.style.background = 'linear-gradient(180deg, #370617 0%, #6a040f 100%)'; // Volcanic Peaks
  }
}

function spawnEnemy() {
  const enemyBox = document.getElementById('enemy-box');
  if (enemyBox) enemyBox.classList.remove('in-range');
  
  enemyMaxHp = Math.floor(80 * Math.pow(1.2, level - 1));
  enemyCurrentHp = enemyMaxHp;

  const enemyEl = document.getElementById('enemy');
  if (enemyEl) {
    if (city === 1) {
      // Slime Sprite
      enemyEl.innerHTML = '<path d="M 18 70 C 18 30, 82 30, 82 70 C 82 85, 18 85, 18 70 Z" fill="#2a9d8f"/><ellipse cx="50" cy="80" rx="35" ry="6" fill="#264653" opacity="0.3"/><circle cx="38" cy="54" r="6" fill="#ffffff"/><circle cx="62" cy="54" r="6" fill="#ffffff"/><circle cx="40" cy="54" r="3" fill="#03071e"/><circle cx="64" cy="54" r="3" fill="#03071e"/>';
    } else if (city === 2) {
      // Cyber Drone Sprite
      enemyEl.innerHTML = '<polygon points="50,15 85,40 85,75 50,95 15,75 15,40" fill="#7209b7"/><circle cx="50" cy="55" r="18" fill="#4cc9f0"/><circle cx="50" cy="55" r="8" fill="#fff"/>';
    } else {
      // Lava Elemental Sprite
      enemyEl.innerHTML = '<polygon points="10,40 30,10 50,40" fill="#d00000"/><polygon points="90,40 70,10 50,40" fill="#d00000"/><circle cx="50" cy="60" r="30" fill="#dc2f02"/><circle cx="40" cy="55" r="5" fill="#ffba08"/><circle cx="60" cy="55" r="5" fill="#ffba08"/>';
    }
  }

  updateUI();

  setTimeout(() => {
    if (!isPaused && enemyBox) {
      enemyBox.classList.add('in-range');
      startEnemyAttackLoop();
    }
  }, 100);
}

function startEnemyAttackLoop() {
  if (enemyAttackTimer) clearInterval(enemyAttackTimer);
  enemyAttackTimer = setInterval(() => {
    if (isPaused) return;
    const enemyBox = document.getElementById('enemy-box');
    if (enemyBox && enemyBox.classList.contains('in-range') && enemyCurrentHp > 0) {
      damageCat();
    }
  }, 1400);
}

function damageCat() {
  catLives--;
  playSound('hurt');
  triggerVib(80);
  const catSprite = document.getElementById('cat-sprite');
  if (catSprite) {
    catSprite.classList.add('cat-hurt');
    setTimeout(() => catSprite.classList.remove('cat-hurt'), 120);
  }

  if (catLives <= 0) {
    showToast("DEFECTED! RESTARTING...");
    catLives = 9;
    enemiesRemaining = totalWaveEnemies;
    spawnEnemy();
  }
  updateUI();
}

function hitEnemy() {
  if (isPaused || enemyCurrentHp <= 0) return;

  enemyCurrentHp -= dmg;
  playSound('hit');
  triggerVib(30);

  const catSprite = document.getElementById('cat-sprite');
  if (catSprite) {
    catSprite.classList.add('cat-slash');
    setTimeout(() => catSprite.classList.remove('cat-slash'), 100);
  }

  const enemyEl = document.getElementById('enemy');
  if (enemyEl) {
    enemyEl.classList.add('hit-flash');
    setTimeout(() => enemyEl.classList.remove('hit-flash'), 80);
  }

  if (enemyCurrentHp <= 0) {
    if (enemyAttackTimer) clearInterval(enemyAttackTimer);
    gold += Math.floor(12 * Math.pow(1.15, level));
    if (typeof GameState !== "undefined") {
      GameState.gold = gold;
      GameState.save();
    }
    
    enemiesRemaining--;

    if (enemiesRemaining <= 0) {
      playSound('win');
      showToast("LEVEL CLEAR!");
      if (typeof GameState !== "undefined" && level >= GameState.unlockedLevel) {
        GameState.unlockedLevel = level + 1;
        GameState.save();
      }
      window.location.href = 'levels.html';
      return;
    }

    spawnEnemy();
  } else {
    updateUI();
  }
}

function updateUI() {
  document.getElementById('gold-display').innerText = "🪙 " + fmt(gold);
  document.getElementById('level-num').innerText = level;
  document.getElementById('enemy-counter').innerText = "ENEMIES LEFT: " + enemiesRemaining + " / " + totalWaveEnemies;
  
  document.getElementById('dmg-lvl').innerText = "Lv." + dmgLvl;
  document.getElementById('dmg-val').innerText = fmt(dmg);
  document.getElementById('dmg-cost').innerText = fmt(dmgCost);
  toggleBtnState('btn-dmg', gold >= dmgCost);

  document.getElementById('spd-lvl').innerText = "Lv." + spdLvl;
  document.getElementById('spd-val').innerText = spd;
  document.getElementById('spd-cost').innerText = fmt(spdCost);
  toggleBtnState('btn-spd', gold >= spdCost && spd > 200);

  document.getElementById('lives-display').innerText = "🐾 " + catLives + " / 9 LIVES";
  document.getElementById('cat-hp-bar').style.width = ((catLives / maxCatLives) * 100) + "%";
  document.getElementById('hp-bar').style.width = Math.max(0, (enemyCurrentHp / enemyMaxHp) * 100) + "%";
}

function toggleBtnState(id, canAfford) {
  const btn = document.getElementById(id);
  if (btn) {
    if (canAfford) btn.classList.remove('disabled');
    else btn.classList.add('disabled');
  }
}

function buyDamage() {
  if (gold >= dmgCost) {
    gold -= dmgCost;
    dmgLvl++;
    dmg = Math.floor(dmg * 1.25);
    dmgCost = Math.floor(dmgCost * 1.5);
    updateUI();
  }
}

function buySpeed() {
  if (spd <= 200) return;
  if (gold >= spdCost) {
    gold -= spdCost;
    spdLvl++;
    spd = Math.max(200, spd - 80);
    spdCost = Math.floor(spdCost * 1.6);
    resetAutoAttack();
    updateUI();
  }
}

function resetAutoAttack() {
  if (autoAttackTimer) clearInterval(autoAttackTimer);
  autoAttackTimer = setInterval(hitEnemy, spd);
}

function togglePause() {
  isPaused = !isPaused;
  const modal = document.getElementById('pause-modal');
  if (modal) {
    if (isPaused) modal.classList.add('active');
    else modal.classList.remove('active');
  }
}

function toggleAudio() {
  audioMuted = !audioMuted;
  document.getElementById('btn-audio').innerText = audioMuted ? "Audio: OFF" : "Audio: ON";
}

function toggleVib() {
  vibMuted = !vibMuted;
  document.getElementById('btn-vib').innerText = vibMuted ? "Vibration: OFF" : "Vibration: ON";
}

document.addEventListener('DOMContentLoaded', () => {
  const clickZone = document.getElementById('click-zone');
  if (clickZone) {
    clickZone.addEventListener('click', (e) => {
      if (!e.target.closest('.controls') && !e.target.closest('header') && !e.target.closest('.modal-overlay')) {
        hitEnemy();
      }
    });
  }

  applyCatSkin();
  setCityTheme();
  spawnEnemy();
  resetAutoAttack();
});

function showToast(msg) {
  let toast = document.getElementById('game-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'game-toast';
    toast.style.cssText = 'position:fixed; top:40%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.85); color:#00f5d4; border:2px solid #00f5d4; padding:12px 24px; border-radius:12px; font-weight:900; font-size:1.1rem; z-index:999; transition:opacity 0.3s; opacity:0; pointer-events:none; text-align:center;';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 1000);
}
