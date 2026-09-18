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

  let enemyHp = 50;
  let maxEnemyHp = 50;
  let particles = [];
  let slashEffects = [];
  let floatingTexts = [];

  // Animation States
  let animTime = 0;
  let playerLungeX = 0;
  let enemyShakeX = 0;
  let enemyHurtTimer = 0;

  function updateHUD() {
    const coins = document.getElementById("coin-count");
    const dmg = document.getElementById("dmg-cost");
    const spd = document.getElementById("speed-cost");
    if (coins) coins.innerText = GAME_STATE.coins;
    if (dmg) dmg.innerText = (GAME_STATE.stats.attackLevel * 20) + " 🪙";
    if (spd) spd.innerText = (GAME_STATE.stats.speedLevel * 50) + " 🪙";
  }

  function triggerHitFX(x, y, damage) {
    // Attack Lunge trigger
    playerLungeX = 35;
    
    // Enemy Recoil + Red Flash trigger
    enemyShakeX = 12;
    enemyHurtTimer = 10;

    // Particle Explosion
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        color: ['#00ffcc', '#ffd700', '#ff0055', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 6 + 2,
        life: 1.0
      });
    }

    // Slash Line Effect
    slashEffects.push({ x: x, y: y, life: 1.0 });

    // Floating Text
    floatingTexts.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text: "-" + damage,
      life: 1.0
    });
  }

  function attackEnemy(customX, customY) {
    let defaultEnemyX = canvas.width - 110;
    let defaultEnemyY = canvas.height / 2;

    let targetX = customX !== undefined ? customX : defaultEnemyX;
    let targetY = customY !== undefined ? customY : defaultEnemyY;

    enemyHp -= GAME_STATE.stats.attack;
    triggerHitFX(targetX, targetY, GAME_STATE.stats.attack);

    if (enemyHp <= 0) {
      enemyHp = maxEnemyHp;
      GAME_STATE.coins += 15;
      saveGameState();
    }
    updateHUD();
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (window.isPaused) return;
    const rect = canvas.getBoundingClientRect();
    attackEnemy(e.clientX - rect.left, e.clientY - rect.top);
  });

  let lastAutoAttack = Date.now();

  window.upgradeDamage = function() {
    let cost = GAME_STATE.stats.attackLevel * 20;
    if (GAME_STATE.coins >= cost) {
      GAME_STATE.coins -= cost;
      GAME_STATE.stats.attack += 5;
      GAME_STATE.stats.attackLevel += 1;
      saveGameState();
      updateHUD();
    }
  };

  window.upgradeSpeed = function() {
    let cost = GAME_STATE.stats.speedLevel * 50;
    if (GAME_STATE.coins >= cost) {
      GAME_STATE.coins -= cost;
      GAME_STATE.stats.speed = Math.max(250, GAME_STATE.stats.speed - 100);
      GAME_STATE.stats.speedLevel += 1;
      saveGameState();
      updateHUD();
    }
  };

  function render() {
    if (!window.isPaused) {
      animTime += 0.08;
      
      // Decay Attack Lunge
      if (playerLungeX > 0) playerLungeX -= 3;
      if (playerLungeX < 0) playerLungeX = 0;

      // Decay Enemy Shake
      if (enemyShakeX > 0) enemyShakeX = -enemyShakeX * 0.7;
      else enemyShakeX = Math.abs(enemyShakeX) - 1;

      if (enemyHurtTimer > 0) enemyHurtTimer--;

      // Auto Attack Logic
      if (Date.now() - lastAutoAttack > GAME_STATE.stats.speed) {
        attackEnemy();
        lastAutoAttack = Date.now();
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2 - 40;

    // 1. Idle Breathing Offset for Player
    let playerIdleY = Math.sin(animTime) * 4;
    let playerBaseX = 30 + playerLungeX;

    // Render Player
    if (playerImg.complete) {
      ctx.drawImage(playerImg, playerBaseX, centerY + playerIdleY, 80, 80);
    }

    // 2. Idle Breathing Offset for Enemy
    let enemyIdleY = Math.cos(animTime) * 3;
    let enemyBaseX = canvas.width - 110 + enemyShakeX;

    // Render Enemy with Red Hurt Tint
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

    // Health Bar
    ctx.fillStyle = "#222";
    ctx.fillRect(canvas.width - 120, centerY - 20, 100, 10);
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(canvas.width - 120, centerY - 20, Math.max(0, (enemyHp / maxEnemyHp) * 100), 10);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(canvas.width - 120, centerY - 20, 100, 10);

    // Render Slash Effects
    for (let i = slashEffects.length - 1; i >= 0; i--) {
      let s = slashEffects[i];
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.x - 20, s.y - 20);
      ctx.lineTo(s.x + 20, s.y + 20);
      ctx.stroke();
      s.life -= 0.15;
      if (s.life <= 0) slashEffects.splice(i, 1);
    }

    // Render Particles
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

    // Render Floating Text
    ctx.font = "12px 'Press Start 2P'";
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      let ft = floatingTexts[i];
      ft.y -= 1.5;
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
