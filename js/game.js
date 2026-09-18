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

  let catHp = 9;
  let maxCatHp = 9;

  let playerX = 30;
  let enemyX = canvas.width - 110;
  let enemySpeed = 0.8;

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
  let catHurtTimer = 0;
  let lastAutoAttack = Date.now();

  function updateHUD() {
    const coins = document.getElementById("coin-count");
    const dmg = document.getElementById("dmg-cost");
    const spd = document.getElementById("speed-cost");
    const waveHud = document.getElementById("city-wave-hud");
    const catHpHud = document.getElementById("cat-hp-hud");

    let atkLvl = GAME_STATE.stats.attackLevel || 1;
    let spdLvl = GAME_STATE.stats.speedLevel || 1;

    if (coins) coins.innerText = GAME_STATE.coins;
    if (dmg) dmg.innerText = (atkLvl * 20) + " 🪙";
    if (spd) spd.innerText = (spdLvl * 50) + " 🪙";
    if (waveHud) waveHud.innerText = `CITY ${GAME_STATE.currentCity + 1} | WAVE ${GAME_STATE.currentWave}/5`;
    if (catHpHud) catHpHud.innerText = `${catHp}/${maxCatHp}`;
  }

  function respawnSlime() {
    enemyHp = maxEnemyHp;
    enemyX = canvas.width - 110;
  }

  function attackEnemy() {
    enemyHp -= GAME_STATE.stats.attack;
    playerLungeX = 20;
    enemyShakeX = 10;
    enemyHurtTimer = 8;

    slashEffects.push({ x: enemyX + 40, y: canvas.height / 2, life: 1.0 });
    floatingTexts.push({ x: enemyX + 20, y: canvas.height / 2 - 20, text: "-" + GAME_STATE.stats.attack, life: 1.0 });

    if (enemyHp <= 0) {
      GAME_STATE.coins += 15;
      waveEarnedCoins += 15;
      waveKills++;
      enemiesRemaining--;

      if (enemiesRemaining <= 0) showWaveSummary();
      else respawnSlime();

      saveGameState();
    }
    updateHUD();
  }

  function showWaveSummary() {
    window.isPaused = true;
    let bonusCoins = GAME_STATE.currentWave * 25;
    let totalEarned = waveEarnedCoins + bonusCoins;
    GAME_STATE.coins += bonusCoins;

    // Convert coins to fish automatically
    let convertedFish = autoConvertCoinsToFish();

    document.getElementById("summary-kills").innerText = waveKills;
    document.getElementById("summary-base-coins").innerText = waveEarnedCoins;
    document.getElementById("summary-bonus-coins").innerText = bonusCoins;
    document.getElementById("summary-total-coins").innerText = `${totalEarned} 🪙 (➔ +${convertedFish} 🐟)`;

    document.getElementById("wave-summary-modal").style.display = "flex";
  }

  window.exitToMenu = function() {
    autoConvertCoinsToFish();
    window.location.href = "index.html";
  };

  window.nextWave = function() {
    document.getElementById("wave-summary-modal").style.display = "none";
    if (GAME_STATE.currentWave >= 5) {
      GAME_STATE.currentWave = 1;
      catHp = 9;
    } else {
      GAME_STATE.currentWave += 1;
    }

    enemiesRemaining = 5 + (GAME_STATE.currentWave * 2);
    waveKills = 0;
    waveEarnedCoins = 0;
    respawnSlime();
    saveGameState();
    window.isPaused = false;
    updateHUD();
  };

  window.restartCity = function() {
    autoConvertCoinsToFish();
    document.getElementById("gameover-modal").style.display = "none";
    GAME_STATE.currentWave = 1;
    catHp = 9;
    enemiesRemaining = 5;
    waveKills = 0;
    waveEarnedCoins = 0;
    respawnSlime();
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
      if (enemyShakeX > 0) enemyShakeX = -enemyShakeX * 0.6;
      else enemyShakeX = Math.abs(enemyShakeX) - 1;

      if (enemyHurtTimer > 0) enemyHurtTimer--;
      if (catHurtTimer > 0) catHurtTimer--;

      enemyX -= enemySpeed;

      if (enemyX - playerX <= 90) {
        catHp -= 1;
        catHurtTimer = 10;
        respawnSlime();
        updateHUD();

        if (catHp <= 0) {
          window.isPaused = true;
          autoConvertCoinsToFish();
          document.getElementById("gameover-modal").style.display = "flex";
        }
      }

      let attackInterval = Math.max(600, GAME_STATE.stats.speed);
      if (Date.now() - lastAutoAttack > attackInterval) {
        attackEnemy();
        lastAutoAttack = Date.now();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerY = canvas.height / 2 - 40;

    let playerIdleY = Math.sin(animTime) * 3;
    let playerBaseX = playerX + playerLungeX;

    if (playerImg.complete) {
      ctx.save();
      ctx.drawImage(playerImg, playerBaseX, centerY + playerIdleY, 80, 80);
      if (catHurtTimer > 0) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(playerBaseX, centerY + playerIdleY, 80, 80);
      }
      ctx.restore();
    }

    let enemyIdleY = Math.cos(animTime) * 2;
    if (enemyImg.complete) {
      ctx.save();
      ctx.drawImage(enemyImg, enemyX + enemyShakeX, centerY + enemyIdleY, 80, 80);
      if (enemyHurtTimer > 0) {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 0, 85, 0.6)';
        ctx.fillRect(enemyX + enemyShakeX, centerY + enemyIdleY, 80, 80);
      }
      ctx.restore();
    }

    ctx.fillStyle = "#222";
    ctx.fillRect(enemyX, centerY - 20, 80, 8);
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(enemyX, centerY - 20, Math.max(0, (enemyHp / maxEnemyHp) * 80), 8);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(enemyX, centerY - 20, 80, 8);

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
