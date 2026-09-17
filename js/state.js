// Project Neko - Persistent State Manager v1.3.0
window.GameState = {
  playerName: localStorage.getItem('neko_player_name') || 'CatHero',
  sardines: parseInt(localStorage.getItem('neko_sardines')) || 100,
  yarn: parseInt(localStorage.getItem('neko_yarn')) || 10,
  currentCity: parseInt(localStorage.getItem('neko_city')) || 1,
  currentWave: parseInt(localStorage.getItem('neko_wave')) || 1,
  maxWavesPerCity: 5,
  catColor: localStorage.getItem('neko_cat_color') || '#ffb703',

  soundEnabled: localStorage.getItem('neko_sound') !== 'false',
  vibrationEnabled: localStorage.getItem('neko_vibe') !== 'false',

  upgrades: {
    damageLvl: parseInt(localStorage.getItem('neko_dmg_lvl')) || 1,
    damage: parseInt(localStorage.getItem('neko_dmg_val')) || 10,
    speedLvl: parseInt(localStorage.getItem('neko_spd_lvl')) || 1,
    attackSpeed: parseInt(localStorage.getItem('neko_spd_val')) || 1000
  },

  getDmgCost: function() {
    return Math.floor(20 * Math.pow(1.4, this.upgrades.damageLvl - 1));
  },

  getSpdCost: function() {
    return Math.floor(50 * Math.pow(1.5, this.upgrades.speedLvl - 1));
  },

  addSardines: function(amount) {
    this.sardines += amount;
    this.save();
  },

  addYarn: function(amount) {
    this.yarn += amount;
    this.save();
  },

  buyDamageUpgrade: function() {
    const cost = this.getDmgCost();
    if (this.sardines >= cost) {
      this.sardines -= cost;
      this.upgrades.damageLvl++;
      this.upgrades.damage += 5;
      this.save();
      return true;
    }
    return false;
  },

  buySpeedUpgrade: function() {
    const cost = this.getSpdCost();
    if (this.sardines >= cost && this.upgrades.attackSpeed > 200) {
      this.sardines -= cost;
      this.upgrades.speedLvl++;
      this.upgrades.attackSpeed = Math.max(200, this.upgrades.attackSpeed - 100);
      this.save();
      return true;
    }
    return false;
  },

  save: function() {
    localStorage.setItem('neko_player_name', this.playerName);
    localStorage.setItem('neko_sardines', this.sardines);
    localStorage.setItem('neko_yarn', this.yarn);
    localStorage.setItem('neko_city', this.currentCity);
    localStorage.setItem('neko_wave', this.currentWave);
    localStorage.setItem('neko_cat_color', this.catColor);
    localStorage.setItem('neko_sound', this.soundEnabled);
    localStorage.setItem('neko_vibe', this.vibrationEnabled);
    localStorage.setItem('neko_dmg_lvl', this.upgrades.damageLvl);
    localStorage.setItem('neko_dmg_val', this.upgrades.damage);
    localStorage.setItem('neko_spd_lvl', this.upgrades.speedLvl);
    localStorage.setItem('neko_spd_val', this.upgrades.attackSpeed);
  }
};

window.alert = function(msg) {
  let toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #00f5d4;
    color: #000;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 0.85rem;
    z-index: 9999;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    transition: opacity 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
};
