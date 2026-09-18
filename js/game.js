window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Load active player sprite and enemy sprite
  let activeSkin = GAME_ASSETS.skins.find(s => s.id === GAME_STATE.selectedSkin) || GAME_ASSETS.skins[0];
  const playerImg = new Image();
  playerImg.src = activeSkin.sprite;

  const enemyImg = new Image();
  enemyImg.src = GAME_ASSETS.enemies.toxic_slime;

  // DOM HUD Elements
  const coinDisplay = document.getElementById("coin-count") || document.querySelector(".coins-count");
  const dmgCostEl = document.getElementById("dmg-cost");
  const speedCostEl = document.getElementById("speed-cost");

  function updateHUD() {
    if (coinDisplay) coinDisplay.innerText = GAME_STATE.coins;
    if (dmgCostEl) dmgCostEl.innerText = (GAME_STATE.stats.attackLevel * 20) + " 🪙";
    if (speedCostEl) speedCostEl.innerText = (GAME_STATE.stats.speedLevel * 50) + " 🪙";
  }

  // Upgrades using coins
  window.upgradeDamage = function() {
    let cost = GAME_STATE.stats.attackLevel * 20;
    if (GAME_STATE.coins >= cost) {
      GAME_STATE.coins -= cost;
      GAME_STATE.stats.attack += 5;
      GAME_STATE.stats.attackLevel += 1;
      saveGameState();
      updateHUD();
    } else {
      alert("Not enough coins!");
    }
  };

  window.upgradeSpeed = function() {
    let cost = GAME_STATE.stats.speedLevel * 50;
    if (GAME_STATE.coins >= cost) {
      GAME_STATE.coins -= cost;
      GAME_STATE.stats.speed = Math.max(200, GAME_STATE.stats.speed - 100);
      GAME_STATE.stats.speedLevel += 1;
      saveGameState();
      updateHUD();
    } else {
      alert("Not enough coins!");
    }
  };

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render PixelLab Cat Sprite
    if (playerImg.complete && playerImg.naturalWidth !== 0) {
      ctx.drawImage(playerImg, 60, canvas.height / 2 - 40, 80, 80);
    } else {
      ctx.fillStyle = "#ffa500";
      ctx.beginPath();
      ctx.arc(100, canvas.height / 2, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render PixelLab Enemy Sprite
    if (enemyImg.complete && enemyImg.naturalWidth !== 0) {
      ctx.drawImage(enemyImg, canvas.width - 140, canvas.height / 2 - 40, 80, 80);
    } else {
      ctx.fillStyle = "#00ffcc";
      ctx.beginPath();
      ctx.arc(canvas.width - 100, canvas.height / 2, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  updateHUD();
  render();
});
