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

  function updateHUD() {
    const coins = document.getElementById("coin-count");
    const dmg = document.getElementById("dmg-cost");
    const spd = document.getElementById("speed-cost");
    if (coins) coins.innerText = GAME_STATE.coins;
    if (dmg) dmg.innerText = (GAME_STATE.stats.attackLevel * 20) + " 🪙";
    if (spd) spd.innerText = (GAME_STATE.stats.speedLevel * 50) + " 🪙";
  }

  function spawnHitFX(x, y, damage) {
    // Particle Explosion
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: ['#00ffcc', '#ffd700', '#ff0055', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 5 + 3,
        life: 1.0
      });
    }

    // Slash FX
    slashEffects.push({
      x: x,
      y: y,
      life: 1.0
    });

    // Damage Number
    floatingTexts.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text: "-" + damage,
      life: 1.0
    });
  }

  function triggerAttack(manualX, manualY) {
    let enemyX = canvas.width - 110;
    let enemyY = canvas.height / 2;
    
    let targetX = manualX !== undefined ? manualX : enemyX;
    let targetY = manualY !== undefined ? manualY : enemyY;

    enemyHp -= GAME_STATE.stats.attack;
    spawnHitFX(targetX, targetY, GAME_STATE.stats.attack);

    if (enemyHp <= 0) {
      enemyHp = maxEnemyHp;
      GAME_STATE.coins += 15;
      saveGameState();
    }
    updateHUD();
  }

  // Tap to attack with particles
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    triggerAttack(clickX, clickY);
  });

  // Auto attack loop based on Speed Stat
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
      GAME_STATE.stats.speed = Math.max(300, GAME_STATE.stats.speed - 100);
      GAME_STATE.stats.speedLevel += 1;
      saveGameState();
      updateHUD();
    }
  };

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2 - 40;

    // Auto Attack Trigger
    if (Date.now() - lastAutoAttack > GAME_STATE.stats.speed) {
      triggerAttack();
      lastAutoAttack = Date.now();
    }

    // Draw Player Sprite
    if (playerImg.complete) {
      ctx.drawImage(playerImg, 30, centerY, 80, 80);
    }

    // Draw Enemy Sprite
    if (enemyImg.complete) {
      ctx.drawImage(enemyImg, canvas.width - 110, centerY, 80, 80);
    }

    // Enemy Health Bar
    ctx.fillStyle = "#222";
    ctx.fillRect(canvas.width - 120, centerY - 20, 100, 12);
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(canvas.width - 120, centerY - 20, Math.max(0, (enemyHp / maxEnemyHp) * 100), 12);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(canvas.width - 120, centerY - 20, 100, 12);

    // Render Slash FX
    for (let i = slashEffects.length - 1; i >= 0; i--) {
      let s = slashEffects[i];
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.x - 20, s.y - 20);
      ctx.lineTo(s.x + 20, s.y + 20);
      ctx.stroke();
      s.life -= 0.1;
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

    // Render Floating Damage Text
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
