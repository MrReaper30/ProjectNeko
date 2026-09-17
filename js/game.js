// Project Neko - Combat Engine v1.6.0
(function () {
  let playerHp = 9;
  let maxPlayerHp = 9;
  let enemyHp = 30;
  let maxEnemyHp = 30;
  let enemiesInWave = 4;
  let enemiesRemaining = 4;
  let waveCoinsEarned = 0;

  let attackTimer = null;
  let isPaused = false;

  function initGame() {
    setupWaveStats();
    applyPlayerSkin();
    updateHUD();
    startCombatLoop();

    const cat = document.getElementById('player-sprite');
    const slime = document.getElementById('enemy-sprite');

    if (slime) slime.addEventListener('click', playerAttack);
    if (cat) cat.addEventListener('click', playerAttack);
  }

  function applyPlayerSkin() {
    const cat = document.getElementById('player-sprite');
    if (cat && GameState.catColor) {
      cat.style.backgroundColor = GameState.catColor;
    }
  }

  function setupWaveStats() {
    const cityMultiplier = GameState.currentCity;
    const waveMultiplier = GameState.currentWave;
    
    enemiesInWave = 3 + waveMultiplier;
    enemiesRemaining = enemiesInWave;
    maxEnemyHp = Math.floor(25 + (cityMultiplier * 15) + (waveMultiplier * 8));
    enemyHp = maxEnemyHp;
    playerHp = maxPlayerHp;
    waveCoinsEarned = 0;
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
    if (enemyHp <= 0 || enemiesRemaining <= 0 || isPaused) return;

    const cat = document.getElementById('player-sprite');
    const slime = document.getElementById('enemy-sprite');

    if (cat) cat.classList.add('attacking-cat');
    if (slime) slime.classList.add('hit-slime');

    setTimeout(() => {
      if (cat) cat.classList.remove('attacking-cat');
      if (slime) slime.classList.remove('hit-slime');
    }, 180);

    enemyHp -= GameState.upgrades.damage;

    if (enemyHp <= 0) {
      enemyHp = 0;
      enemiesRemaining--;
      const coinsDropped = 15 + GameState.currentWave * 5;
      waveCoinsEarned += coinsDropped;

      if (enemiesRemaining > 0) {
        setTimeout(spawnNextEnemy, 400);
      } else {
        setTimeout(completeWave, 500);
      }
    } else {
      setTimeout(enemyAttack, 250);
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
    }, 180);

    playerHp -= 1;
    if (playerHp <= 0) {
      playerHp = 0;
      triggerDefeat();
    }

    updateHUD();
  }

  function triggerDefeat() {
    isPaused = true;
    const earnedSardines = GameState.convertCoinsToSardines(waveCoinsEarned);
    
    const defeatModal = document.getElementById('defeat-modal');
    if (defeatModal) defeatModal.classList.add('active');

    const convBox = document.getElementById('conversion-summary');
    if (convBox) {
      convBox.innerHTML = `
        <div class="conv-anim">
          <span>🪙 ${waveCoinsEarned} Coins</span>
          <span style="color:#00f5d4;">➔</span>
          <span style="color:#00f5d4; font-weight:bold;">+${earnedSardines} 🐟 Sardines</span>
        </div>
        <small style="color:#a0aec0; display:block; margin-top:4px;">(Conversion Rate: 5 🪙 = 1 🐟)</small>
      `;
    }

    updateDefeatModal();
  }

  window.retryWave = function () {
    isPaused = false;
    const defeatModal = document.getElementById('defeat-modal');
    if (defeatModal) defeatModal.classList.remove('active');
    setupWaveStats();
    updateHUD();
    startCombatLoop();
  };

  function spawnNextEnemy() {
    enemyHp = maxEnemyHp;
    updateHUD();
  }

  function completeWave() {
    isPaused = true;
    const earnedSardines = GameState.convertCoinsToSardines(waveCoinsEarned);
    let yarnBonus = 1;

    if (GameState.currentWave >= GameState.maxWavesPerCity) {
      yarnBonus = 5;
      GameState.addYarn(5);
      GameState.currentCity++;
      GameState.currentWave = 1;
    } else {
      GameState.addYarn(1);
      GameState.currentWave++;
    }

    GameState.save();

    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.add('active');

    const vicSummary = document.getElementById('victory-summary');
    if (vicSummary) {
      vicSummary.innerHTML = `
        <div class="conv-anim">
          <span>🪙 ${waveCoinsEarned} Coins</span>
          <span style="color:#00f5d4;">➔</span>
          <span style="color:#00f5d4; font-weight:bold;">+${earnedSardines} 🐟 Sardines</span>
        </div>
        <div style="margin-top:8px; color:#ff007f; font-weight:bold;">
          🎉 Bonus: +${yarnBonus} 🧶 Yarn Ball!
        </div>
      `;
    }
  }

  window.nextWave = function () {
    isPaused = false;
    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.remove('active');
    setupWaveStats();
    updateHUD();
    startCombatLoop();
  };

  function updateDefeatModal() {
    const defSardines = document.getElementById('def-sardine-count');
    const defYarn = document.getElementById('def-yarn-count');
    if (defSardines) defSardines.textContent = GameState.sardines;
    if (defYarn) defYarn.textContent = GameState.yarn;

    const defDmgFishBtn = document.getElementById('def-dmg-fish-btn');
    const defDmgYarnBtn = document.getElementById('def-dmg-yarn-btn');
    const defSpdFishBtn = document.getElementById('def-spd-fish-btn');
    const defSpdYarnBtn = document.getElementById('def-spd-yarn-btn');

    if (defDmgFishBtn) defDmgFishBtn.textContent = `+5 ATK (${GameState.getDmgCost()} 🐟)`;
    if (defDmgYarnBtn) defDmgYarnBtn.textContent = `+5 ATK (${GameState.getDmgYarnCost()} 🧶)`;
    if (defSpdFishBtn) defSpdFishBtn.textContent = `-100ms (${GameState.getSpdCost()} 🐟)`;
    if (defSpdYarnBtn) defSpdYarnBtn.textContent = `-100ms (${GameState.getSpdYarnCost()} 🧶)`;
  }

  window.buyDefeatUpgradeDmgFish = function () {
    if (GameState.buyDamageUpgrade()) {
      updateHUD();
      updateDefeatModal();
    } else {
      alert("Not enough 🐟 Sardines!");
    }
  };

  window.buyDefeatUpgradeDmgYarn = function () {
    if (GameState.buyDamageUpgradeYarn()) {
      updateHUD();
      updateDefeatModal();
    } else {
      alert("Not enough 🧶 Yarn Balls!");
    }
  };

  window.buyDefeatUpgradeSpdFish = function () {
    if (GameState.buySpeedUpgrade()) {
      updateHUD();
      updateDefeatModal();
    } else {
      alert("Not enough 🐟 Sardines!");
    }
  };

  window.buyDefeatUpgradeSpdYarn = function () {
    if (GameState.buySpeedUpgradeYarn()) {
      updateHUD();
      updateDefeatModal();
    } else {
      alert("Not enough 🧶 Yarn Balls!");
    }
  };

  function updateHUD() {
    const stageDisp = document.getElementById('stage-display');
    const coinDisp = document.getElementById('coin-display');
    const sardineDisp = document.getElementById('sardine-display');
    const yarnDisp = document.getElementById('yarn-display');
    const enemiesDisp = document.getElementById('enemies-left');

    if (stageDisp) stageDisp.textContent = `CITY ${GameState.currentCity}: WAVE ${GameState.currentWave}/${GameState.maxWavesPerCity}`;
    if (coinDisp) coinDisp.textContent = `🪙 ${waveCoinsEarned}`;
    if (sardineDisp) sardineDisp.textContent = `🐟 ${GameState.sardines}`;
    if (yarnDisp) yarnDisp.textContent = `🧶 ${GameState.yarn}`;
    if (enemiesDisp) enemiesDisp.textContent = `ENEMIES: ${enemiesRemaining} / ${enemiesInWave}`;

    const pHpText = document.getElementById('player-hp-text');
    const pHpFill = document.getElementById('player-hp-fill');
    if (pHpText) pHpText.textContent = `${playerHp}/${maxPlayerHp} HP`;
    if (pHpFill) pHpFill.style.width = `${(playerHp / maxPlayerHp) * 100}%`;

    const eHpFill = document.getElementById('enemy-hp-fill');
    if (eHpFill) eHpFill.style.width = `${(enemyHp / maxEnemyHp) * 100}%`;

    const dmgLvl = document.getElementById('dmg-lvl');
    const dmgStats = document.getElementById('dmg-stats');
    const dmgBtn = document.getElementById('dmg-buy-btn');

    if (dmgLvl) dmgLvl.textContent = `Lv.${GameState.upgrades.damageLvl}`;
    if (dmgStats) dmgStats.textContent = `ATK: ${GameState.upgrades.damage}`;
    if (dmgBtn) dmgBtn.textContent = `${GameState.getDmgCost()} 🐟`;

    const spdLvl = document.getElementById('spd-lvl');
    const spdStats = document.getElementById('spd-stats');
    const spdBtn = document.getElementById('spd-buy-btn');

    if (spdLvl) spdLvl.textContent = `Lv.${GameState.upgrades.speedLvl}`;
    if (spdStats) spdStats.textContent = `${GameState.upgrades.attackSpeed}ms`;
    if (spdBtn) spdBtn.textContent = `${GameState.getSpdCost()} 🐟`;
  }

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
