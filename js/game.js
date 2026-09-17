// Project Neko - Combat Engine v1.0.9
(function () {
  let playerHp = 9;
  let maxPlayerHp = 9;
  let enemyHp = 30;
  let maxEnemyHp = 30;
  let enemiesRemaining = 6;
  const totalEnemies = 6;

  let attackTimer = null;
  let isPaused = false;

  function initGame() {
    updateHUD();
    startCombatLoop();

    // Tap sprite to trigger instant player attack
    const playerSprite = document.getElementById('player-sprite');
    const enemySprite = document.getElementById('enemy-sprite');

    if (enemySprite) {
      enemySprite.addEventListener('click', playerAttack);
    }
    if (playerSprite) {
      playerSprite.addEventListener('click', playerAttack);
    }
  }

  function startCombatLoop() {
    if (attackTimer) clearInterval(attackTimer);
    attackTimer = setInterval(() => {
      if (!isPaused && enemiesRemaining > 0 && enemyHp > 0) {
        playerAttack();
      }
    }, GameState.upgrades.attackSpeed);
  }

  function playerAttack() {
    if (enemyHp <= 0 || enemiesRemaining <= 0) return;

    // Visual animation
    const cat = document.getElementById('player-sprite');
    const slime = document.getElementById('enemy-sprite');

    if (cat) cat.classList.add('attacking-cat');
    if (slime) slime.classList.add('hit-slime');

    setTimeout(() => {
      if (cat) cat.classList.remove('attacking-cat');
      if (slime) slime.classList.remove('hit-slime');
    }, 200);

    // Deal damage
    enemyHp -= GameState.upgrades.damage;
    if (enemyHp <= 0) {
      enemyHp = 0;
      enemiesRemaining--;
      GameState.addGold(15 + GameState.currentLevel * 5);

      if (enemiesRemaining > 0) {
        setTimeout(spawnNextEnemy, 500);
      } else {
        setTimeout(victoryLevel, 600);
      }
    } else {
      // Enemy counter-attacks
      setTimeout(enemyAttack, 300);
    }

    updateHUD();
  }

  function enemyAttack() {
    if (isPaused || enemyHp <= 0) return;

    const cat = document.getElementById('player-sprite');
    const slime = document.getElementById('enemy-sprite');

    if (slime) slime.classList.add('attacking-slime');
    if (cat) cat.classList.add('hit-cat');

    setTimeout(() => {
      if (slime) slime.classList.remove('attacking-slime');
      if (cat) cat.classList.remove('hit-cat');
    }, 200);

    playerHp -= 1;
    if (playerHp <= 0) {
      playerHp = 0;
      alert("Defeat! Returning to city stages...");
      window.location.href = "cities.html";
    }

    updateHUD();
  }

  function spawnNextEnemy() {
    maxEnemyHp = Math.floor(30 + GameState.currentLevel * 12);
    enemyHp = maxEnemyHp;
    updateHUD();
  }

  function victoryLevel() {
    alert("Level Cleared! +50 Gold Bonus!");
    GameState.addGold(50);
    GameState.currentLevel++;
    window.location.href = "cities.html";
  }

  function updateHUD() {
    // Top HUD
    const lvlDisp = document.getElementById('level-display');
    const goldDisp = document.getElementById('gold-display');
    const enemiesDisp = document.getElementById('enemies-left');

    if (lvlDisp) lvlDisp.textContent = `LEVEL ${GameState.currentLevel}`;
    if (goldDisp) goldDisp.textContent = `🪙 ${GameState.gold}`;
    if (enemiesDisp) enemiesDisp.textContent = `${enemiesRemaining} / ${totalEnemies}`;

    // Player HP
    const pHpText = document.getElementById('player-hp-text');
    const pHpFill = document.getElementById('player-hp-fill');
    if (pHpText) pHpText.textContent = `${playerHp} / ${maxPlayerHp} LIVES`;
    if (pHpFill) pHpFill.style.width = `${(playerHp / maxPlayerHp) * 100}%`;

    // Enemy HP
    const eHpFill = document.getElementById('enemy-hp-fill');
    if (eHpFill) eHpFill.style.width = `${(enemyHp / maxEnemyHp) * 100}%`;

    // Upgrade buttons
    const dmgLvl = document.getElementById('dmg-lvl');
    const dmgStats = document.getElementById('dmg-stats');
    const dmgBtn = document.getElementById('dmg-buy-btn');

    if (dmgLvl) dmgLvl.textContent = `Lv.${GameState.upgrades.damageLvl}`;
    if (dmgStats) dmgStats.textContent = `ATK: ${GameState.upgrades.damage}`;
    if (dmgBtn) dmgBtn.textContent = `${GameState.getDmgCost()} 🪙`;

    const spdLvl = document.getElementById('spd-lvl');
    const spdStats = document.getElementById('spd-stats');
    const spdBtn = document.getElementById('spd-buy-btn');

    if (spdLvl) spdLvl.textContent = `Lv.${GameState.upgrades.speedLvl}`;
    if (spdStats) spdStats.textContent = `${GameState.upgrades.attackSpeed}ms`;
    if (spdBtn) spdBtn.textContent = `${GameState.getSpdCost()} 🪙`;
  }

  // Global Upgrades
  window.buyDamageBoost = function () {
    if (GameState.buyDamageUpgrade()) {
      updateHUD();
    }
  };

  window.buySpeedBoost = function () {
    if (GameState.buySpeedUpgrade()) {
      startCombatLoop();
      updateHUD();
    }
  };

  window.togglePause = function () {
    isPaused = !isPaused;
    const modal = document.getElementById('pause-modal');
    if (modal) modal.classList.toggle('active', isPaused);
  };

  document.addEventListener('DOMContentLoaded', initGame);
})();
