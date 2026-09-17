// Project Neko - Persistent State Manager v1.1.0
window.GameState = {
  playerName: localStorage.getItem('neko_player_name') || 'CatHero',
  gold: parseInt(localStorage.getItem('neko_gold')) || 0,
  currentLevel: parseInt(localStorage.getItem('neko_level')) || 1,
  
  upgrades: {
    damageLvl: parseInt(localStorage.getItem('neko_dmg_lvl')) || 1,
    damage: parseInt(localStorage.getItem('neko_dmg_val')) || 10,
    speedLvl: parseInt(localStorage.getItem('neko_spd_lvl')) || 1,
    attackSpeed: parseInt(localStorage.getItem('neko_spd_val')) || 1000
  },

  getDmgCost: function() {
    return Math.floor(20 * Math.pow(1.5, this.upgrades.damageLvl - 1));
  },

  getSpdCost: function() {
    return Math.floor(50 * Math.pow(1.6, this.upgrades.speedLvl - 1));
  },

  addGold: function(amount) {
    this.gold += amount;
    this.save();
  },

  buyDamageUpgrade: function() {
    const cost = this.getDmgCost();
    if (this.gold >= cost) {
      this.gold -= cost;
      this.upgrades.damageLvl++;
      this.upgrades.damage += 5;
      this.save();
      return true;
    }
    return false;
  },

  buySpeedUpgrade: function() {
    const cost = this.getSpdCost();
    if (this.gold >= cost && this.upgrades.attackSpeed > 200) {
      this.gold -= cost;
      this.upgrades.speedLvl++;
      this.upgrades.attackSpeed = Math.max(200, this.upgrades.attackSpeed - 100);
      this.save();
      return true;
    }
    return false;
  },

  save: function() {
    localStorage.setItem('neko_player_name', this.playerName);
    localStorage.setItem('neko_gold', this.gold);
    localStorage.setItem('neko_level', this.currentLevel);
    localStorage.setItem('neko_dmg_lvl', this.upgrades.damageLvl);
    localStorage.setItem('neko_dmg_val', this.upgrades.damage);
    localStorage.setItem('neko_spd_lvl', this.upgrades.speedLvl);
    localStorage.setItem('neko_spd_val', this.upgrades.attackSpeed);
  }
};

// Global Alert Suppressor (Replaces native blocking alerts with Toast)
window.alert = function(msg) {
  let toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 245, 212, 0.95);
    color: #000;
    padding: 12px 24px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 0.85rem;
    z-index: 9999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    transition: opacity 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
};
