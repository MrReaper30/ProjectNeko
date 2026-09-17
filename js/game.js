// Project Neko - Combat Engine v1.9.0
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
    maxPlayerHp = 9 + (GameState.skills.hpLvl * 2);
    playerHp = maxPlayerHp;
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

    let dmg = GameState.upgrades.damage;
    const critChance = GameState.skills.critLvl * 0.05;
    if (Math.random() < critChance) {
      dmg *= 2;
      alert("💥 CRITICAL HIT!");
    }

    enemyHp -= dmg;

    if (enemyHp <= 0) {
      enemyHp = 0;
      enemiesRemaining--;
      const baseCoins = 15 + GameState.currentWave * 5;
      const bonusMult = 1 + (GameState.skills.magLvl * 0.10);
      const coinsDropped = Math.floor(baseCoins * bonusMult);
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

    // Dynamic Recommendation Logic
    const recText = document.getElementById('recommendation-text');
    if (recText) {
      if (GameState.sardines >= GameState.getDmgCost()) {
        recText.textContent = `You have enough Sardines! Upgrade Damage to Lv.${GameState.upgrades.damageLvl + 1} for +5 ATK in your next attempt!`;
      } else if (GameState.sardines >= GameState.getSpdCost()) {
        recText.textContent = `You have enough Sardines! Upgrade Speed to strike faster (-100ms)!`;
      } else {
        recText.textContent = `Revisit earlier waves or spend Yarn in the Skill Tree for Nine Lives (+2 Max HP) & Critical Claw!`;
      }
    }

    const defSardines = document.getElementById('def-sardine-count');
    const defYarn = document.getElementById('def-yarn-count');
    if (defSardines) defSardines.textContent = GameState.sardines;
    if (defYarn) defYarn.textContent = GameState.yarn;
  }

  window.retryWave = function () {
    isPaused = false;
    waveCoinsEarned = 0;
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
    const isCityCompleted = GameState.currentWave >= GameState.maxWavesPerCity;

    if (isCityCompleted) {
      isPaused = true;
      const earnedSardines = GameState.convertCoinsToSardines(waveCoinsEarned);
      GameState.addYarn(5);
      GameState.currentCity++;
      GameState.currentWave = 1;
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
            🎉 City Cleared! +5 🧶 Yarn Bonus!
          </div>
        `;
      }
    } else {
      GameState.currentWave++;
      GameState.save();
      setupWaveStats();
      updateHUD();
    }
  }

  window.nextWave = function () {
    isPaused = false;
    waveCoinsEarned = 0;
    const victoryModal = document.getElementById('victory-modal');
    if (victoryModal) victoryModal.classList.remove('active');
    setupWaveStats();
    updateHUD();
    startCombatLoop();
  };

  function updateHUD() {
    const stageDisp = document.getElementById('stage-display');
    const coinDisp = document.getElementById('coin-display');
    const enemiesDisp = document.getElementById('enemies-left');

    if (stageDisp) stageDisp.textContent = `CITY ${GameState.currentCity}: WAVE ${GameState.currentWave}/${GameState.maxWavesPerCity}`;
    if (coinDisp) coinDisp.textContent = `🪙 ${waveCoinsEarned}`;
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
    } else {
      alert("Not enough 🐟 Sardines!");
    }
  };

  window.buySpeedBoost = function () {
    if (GameState.buySpeedUpgrade()) {
      startCombatLoop();
      updateHUD();
    } else {
      alert("Not enough 🐟 Sardines!");
    }
  };

  window.togglePause = function () {
    isPaused = !isPaused;
    const modal = document.getElementById('pause-modal');
    if (modal) modal.classList.toggle('active', isPaused);
  };

  document.addEventListener('DOMContentLoaded', initGame);
})();
