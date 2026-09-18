window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resize();

  let activeSkin = GAME_ASSETS.skins.find(s => s.id === GAME_STATE.selectedSkin) || GAME_ASSETS.skins[0];
  const playerImg = new Image();
  playerImg.src = activeSkin.sprite;

  const enemyImg = new Image();
  enemyImg.src = GAME_ASSETS.enemies.toxic_slime;

  let enemyHp = 50;
  let maxEnemyHp = 50;
  let particles = [];
  let floatingTexts = [];

  function updateHUD() {
    const coins = document.getElementById("coin-count");
    const dmg = document.getElementById("dmg-cost");
    const spd = document.getElementById("speed-cost");
    if (coins) coins.innerText = GAME_STATE.coins;
    if (dmg) dmg.innerText = (GAME_STATE.stats.attackLevel * 20) + " 🪙";
    if (spd) spd.innerText = (GAME_STATE.stats.speedLevel * 50) + " 🪙";
  }

  function createHitEffect(x, y) {
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: ['#00ffcc', '#ffd700', '#ff0055'][Math.floor(Math.random() * 3)],
        size: Math.random() * 6 + 2,
        life: 1.0
      });
    }
    floatingTexts.push({
      x: x,
      y: y,
      text: "-" + GAME_STATE.stats.attack,
      life: 1.0
    });
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    enemyHp -= GAME_STATE.stats.attack;
    createHitEffect(clickX, clickY);

    if (enemyHp <= 0) {
      enemyHp = maxEnemyHp;
      GAME_STATE.coins += 15;
      saveGameState();
    }
    updateHUD();
  });

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
      GAME_STATE.stats.speedLevel += 1;
      saveGameState();
      updateHUD();
    }
  };

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2 - 32;

    // Draw Player Sprite
    if (playerImg.complete) {
      ctx.drawImage(playerImg, 40, centerY, 80, 80);
    }

    // Draw Enemy Sprite
    if (enemyImg.complete) {
      ctx.drawImage(enemyImg, canvas.width - 120, centerY, 80, 80);
    }

    // Enemy Health Bar
    ctx.fillStyle = "#333";
    ctx.fillRect(canvas.width - 130, centerY - 25, 100, 10);
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(canvas.width - 130, centerY - 25, (enemyHp / maxEnemyHp) * 100, 10);

    // Update Particles
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

    // Floating Damage Text
    ctx.font = "10px 'Press Start 2P'";
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      let ft = floatingTexts[i];
      ft.y -= 1.5;
      ft.life -= 0.03;
      ctx.fillStyle = "#ffd700";
      ctx.globalAlpha = Math.max(0, ft.life);
      ctx.fillText(ft.text, ft.x, ft.y);
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(loop);
  }

  updateHUD();
  loop();
});
