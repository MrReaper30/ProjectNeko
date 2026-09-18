window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  let activeSkin = GAME_ASSETS.skins.find(s => s.id === GAME_STATE.selectedSkin) || GAME_ASSETS.skins[0];
  const playerImg = new Image();
  playerImg.src = activeSkin.sprite;

  const enemyImg = new Image();
  enemyImg.src = GAME_ASSETS.enemies.toxic_slime;

  let enemiesRemaining = 5;
  let waveKills = 0;
  let waveEarnedCoins = 0;

  let enemyHp = 50;
  let maxEnemyHp = 50;
  let particles = [];
  let slashEffects = [];
  let floatingTexts = [];

  let animTime = 0;
  let playerLungeX = 0;
  let enemyShakeX = 0;
  let enemyHurtTimer = 0;
  let lastAutoAttack = Date.now();

  function updateHUD() {
    const coins = document.getElementById("coin-count");
    const dmg = document.getElementById("dmg-cost");
    const spd = document.getElementById("speed-cost");
    const waveHud = document.getElementById("city-wave-hud");
    const enemyLeft = document.getElementById("enemy-left-count");

    // Fallback checks to prevent NaN
    let atkLvl = GAME_STATE.stats.attackLevel || 1;
    let spdLvl = GAME_STATE.stats.speedLevel || 1;

    if (coins) coins.innerText = GAME_STATE.coins;
    if (dmg) dmg.innerText = (atkLvl * 20) + " 🪙";
    if (spd) spd.innerText = (spdLvl * 50) + " 🪙";
    if (waveHud) waveHud.innerText = `CITY ${GAME_STATE.currentCity + 1} | WAVE ${GAME_STATE.currentWave}/5`;
    if (enemyLeft) enemyLeft.innerText = enemiesRemaining;
  }

  function triggerHitFX(x, y, damage) {
    playerLungeX = 25;
    enemyShakeX = 10;
    enemyHurtTimer = 8;

    const particlesEnabled = document.getElementById("particles-toggle")?.checked ?? true;
    if (particlesEnabled) {
      for (let i = 0; i < 10; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: ['#00ffcc', '#ffd700', '#ff0055'][Math.floor(Math.random() * 3)],
          size: Math.random() * 5 + 2,
          life: 1.0
        });
      }
    }

    slashEffects.push({ x: x, y: y, life: 1.0 });
    floatingTexts.push({
      x: x + (Math.random() - 0.5) * 15,
      y: y - 10,
      text: "-" + damage,
      life: 1.0
    });
  }

  function attackEnemy() {
    let targetX = canvas.width - 110;
    let targetY = canvas.height / 2;

    enemyHp -= GAME_STATE.stats.attack;
    triggerHitFX(targetX, targetY, GAME_STATE.stats.attack);

    if (enemyHp <= 0) {
      enemyHp = maxEnemyHp;
      GAME_STATE.coins += 15;
      waveEarnedCoins += 15;
      waveKills++;
      enemiesRemaining--;

      if (enemiesRemaining <= 0) {
        showWaveSummary();
      }
      saveGameState();
    }
    updateHUD();
  }

  function showWaveSummary() {
    window.isPaused = true;
    let bonusCoins = GAME_STATE.currentWave * 25;
    let totalEarned = waveEarnedCoins + bonusCoins;
    GAME_STATE.coins += bonusCoins;
    saveGameState();

    document.getElementById("summary-kills").innerText = waveKills;
    document.getElementById("summary-base-coins").innerText = waveEarnedCoins;
    document.getElementById("summary-bonus-coins").innerText = bonusCoins;
    document.getElementById("summary-total-coins").innerText = totalEarned;

    document.getElementById("wave-summary-modal").style.display = "flex";
  }

  window.nextWave = function() {
    document.getElementById("wave-summary-modal").style.display = "none";
    GAME_STATE.currentWave = (GAME_STATE.currentWave % 5) + 1;
    enemiesRemaining = 5 + (GAME_STATE.currentWave * 2);
    waveKills = 0;
    waveEarnedCoins = 0;
    saveGameState();
    window.isPaused = false;
    updateHUD();
  };

  window.upgradeDamage = function() {
    let atkLvl = GAME_STATE.stats.attackLevel || 1;
    let cost = atkLvl * 20;
    if (GAME_STATE.coins >= cost) {
      GAME_STATE.coins -= cost;
      GAME_STATE.stats.attack += 5;
      GAME_STATE.stats.attackLevel = atkLvl + 1;
      saveGameState();
      updateHUD();
    }
  };

  window.upgradeSpeed = function() {
    let spdLvl = GAME_STATE.stats.speedLevel || 1;
    let cost = spdLvl * 50;
    if (GAME_STATE.coins >= cost) {
      GAME_STATE.coins -= cost;
      GAME_STATE.stats.speed = Math.max(600, GAME_STATE.stats.speed - 150);
      GAME_STATE.stats.speedLevel = spdLvl + 1;
      saveGameState();
      updateHUD();
    }
  };

  function render() {
    if (!window.isPaused) {
      animTime += 0.05;

      if (playerLungeX > 0) playerLungeX -= 2;
      if (playerLungeX < 0) playerLungeX = 0;

      if (enemyShakeX > 0) enemyShakeX = -enemyShakeX * 0.6;
      else enemyShakeX = Math.abs(enemyShakeX) - 1;

      if (enemyHurtTimer > 0) enemyHurtTimer--;

      let attackInterval = Math.max(600, GAME_STATE.stats.speed);
      if (Date.now() - lastAutoAttack > attackInterval) {
        attackEnemy();
        lastAutoAttack = Date.now();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerY = canvas.height / 2 - 40;

    let playerIdleY = Math.sin(animTime) * 3;
    let playerBaseX = 30 + playerLungeX;

    if (playerImg.complete) {
      ctx.drawImage(playerImg, playerBaseX, centerY + playerIdleY, 80, 80);
    }

    let enemyIdleY = Math.cos(animTime) * 2;
    let enemyBaseX = canvas.width - 110 + enemyShakeX;

    if (enemyImg.complete) {
      ctx.save();
      ctx.drawImage(enemyImg, enemyBaseX, centerY + enemyIdleY, 80, 80);

      if (enemyHurtTimer > 0) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 0, 85, 0.6)';
        ctx.fillRect(enemyBaseX, centerY + enemyIdleY, 80, 80);
      }
      ctx.restore();
    }

    ctx.fillStyle = "#222";
    ctx.fillRect(canvas.width - 120, centerY - 20, 100, 10);
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(canvas.width - 120, centerY - 20, Math.max(0, (enemyHp / maxEnemyHp) * 100), 10);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(canvas.width - 120, centerY - 20, 100, 10);

    for (let i = slashEffects.length - 1; i >= 0; i--) {
      let s = slashEffects[i];
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x - 15, s.y - 15);
      ctx.lineTo(s.x + 15, s.y + 15);
      ctx.stroke();
      s.life -= 0.15;
      if (s.life <= 0) slashEffects.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(p.x, p.y, p.size, p.size);
      if (p.life <= 0) particles.splice(i, 1);
    }

    ctx.font = "12px 'Press Start 2P'";
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      let ft = floatingTexts[i];
      ft.y -= 1.2;
      ft.life -= 0.04;
      ctx.fillStyle = "#ffd700";
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.fillText(ft.text, ft.x, ft.y);
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(render);
  }

  updateHUD();
  render();
});
