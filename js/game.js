window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Canvas scaling
  canvas.width = 800;
  canvas.height = 400;

  // Player state
  let activeSkin = GAME_ASSETS.skins.find(s => s.id === GAME_STATE.selectedSkin) || GAME_ASSETS.skins[0];
  const playerImg = new Image();
  playerImg.src = activeSkin.sprite;

  // Enemy state
  const enemyImg = new Image();
  enemyImg.src = GAME_ASSETS.enemies.toxic_slime;

  let player = { x: 100, y: 180, speed: 5 };
  let enemy = { x: 650, y: 180, hp: 50 };

  // Tap/Click interaction to attack
  canvas.addEventListener("click", () => {
    enemy.hp -= GAME_STATE.stats.attack;
    if (enemy.hp <= 0) {
      enemy.hp = 50;
      GAME_STATE.yarn += 10;
      saveGameState();
    }
  });

  function gameLoop() {
    ctx.fillStyle = "#1a1a24";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render Player Sprite
    if (playerImg.complete) {
      ctx.drawImage(playerImg, player.x, player.y, 64, 64);
    } else {
      ctx.fillStyle = "#00ffcc";
      ctx.fillRect(player.x, player.y, 64, 64);
    }

    // Render Enemy Sprite
    if (enemyImg.complete) {
      ctx.drawImage(enemyImg, enemy.x, enemy.y, 64, 64);
    } else {
      ctx.fillStyle = "#ff0055";
      ctx.fillRect(enemy.x, enemy.y, 64, 64);
    }

    // Render HUD
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText("YARN: " + GAME_STATE.yarn, 20, 30);
    ctx.fillText("ENEMY HP: " + enemy.hp, 600, 30);
    ctx.fillText("TAP TO ATTACK", 320, 380);

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});
