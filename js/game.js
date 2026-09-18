window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Load selected skin sprite path
  let activeSkin = GAME_ASSETS.skins.find(s => s.id === GAME_STATE.selectedSkin) || GAME_ASSETS.skins[0];
  const playerImg = new Image();
  playerImg.src = activeSkin.sprite;

  // Load enemy sprite
  const enemyImg = new Image();
  enemyImg.src = GAME_ASSETS.enemies.toxic_slime;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Player
    if (playerImg.complete) {
      ctx.drawImage(playerImg, 50, canvas.height / 2 - 32, 64, 64);
    }
    
    // Draw Enemy
    if (enemyImg.complete) {
      ctx.drawImage(enemyImg, canvas.width - 110, canvas.height / 2 - 32, 64, 64);
    }

    requestAnimationFrame(draw);
  }

  draw();
});
