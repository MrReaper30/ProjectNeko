// Project Neko - Persistent State Manager v2.3.0
window.GameState = {
  playerName: localStorage.getItem('neko_player_name') || 'CatHero',
  sardines: parseInt(localStorage.getItem('neko_sardines')) || 100,
  yarn: parseInt(localStorage.getItem('neko_yarn')) || 10,
  currentCity: parseInt(localStorage.getItem('neko_city')) || 1,
  currentWave: parseInt(localStorage.getItem('neko_wave')) || 1,
  unlockedCityMax: parseInt(localStorage.getItem('neko_unlocked_city_max')) || 1,
  maxWavesPerCity: 5,
  catColor: localStorage.getItem('neko_cat_color') || '#ffb703',

  soundEnabled: localStorage.getItem('neko_sound') !== 'false',
  vibrationEnabled: localStorage.getItem('neko_vibe') !== 'false',

  unlockedSkins: JSON.parse(localStorage.getItem('neko_unlocked_skins')) || ['#ffb703', '#ff4757'],

  upgrades: {
    damageLvl: parseInt(localStorage.getItem('neko_dmg_lvl')) || 1,
    damage: parseInt(localStorage.getItem('neko_dmg_val')) || 10,
    speedLvl: parseInt(localStorage.getItem('neko_spd_lvl')) || 1,
    attackSpeed: parseInt(localStorage.getItem('neko_spd_val')) || 1000
  },

  skills: {
    critLvl: parseInt(localStorage.getItem('neko_skill_crit')) || 0,
    hpLvl: parseInt(localStorage.getItem('neko_skill_hp')) || 0,
    magLvl: parseInt(localStorage.getItem('neko_skill_mag')) || 0
  },

  // Coin Costs for In-Combat Boosts
  getDmgCoinCost: function() {
    return Math.floor(25 * Math.pow(1.3, this.upgrades.damageLvl - 1));
  },

  getSpdCoinCost: function() {
    return Math.floor(40 * Math.pow(1.4, this.upgrades.speedLvl - 1));
  },

  isSkinUnlocked: function(hex) {
    return this.unlockedSkins.includes(hex);
  },

  unlockSkin: function(hex, costType, costAmount) {
    if (this.isSkinUnlocked(hex)) return true;

    if (costType === 'sardines') {
      if (this.sardines >= costAmount) {
        this.sardines -= costAmount;
        this.unlockedSkins.push(hex);
        this.save();
        return true;
      }
    } else if (costType === 'yarn') {
      if (this.yarn >= costAmount) {
        this.yarn -= costAmount;
        this.unlockedSkins.push(hex);
        this.save();
        return true;
      }
    }
    return false;
  },

  convertCoinsToSardines: function(coins) {
    const earnedSardines = Math.floor(coins / 5);
    this.sardines += earnedSardines;
    this.save();
    return earnedSardines;
  },

  addSardines: function(amount) {
    this.sardines += amount;
    this.save();
  },

  addYarn: function(amount) {
    this.yarn += amount;
    this.save();
  },

  save: function() {
    localStorage.setItem('neko_player_name', this.playerName);
    localStorage.setItem('neko_sardines', this.sardines);
    localStorage.setItem('neko_yarn', this.yarn);
    localStorage.setItem('neko_city', this.currentCity);
    localStorage.setItem('neko_wave', this.currentWave);
    localStorage.setItem('neko_unlocked_city_max', this.unlockedCityMax);
    localStorage.setItem('neko_cat_color', this.catColor);
    localStorage.setItem('neko_sound', this.soundEnabled);
    localStorage.setItem('neko_vibe', this.vibrationEnabled);
    localStorage.setItem('neko_unlocked_skins', JSON.stringify(this.unlockedSkins));
    localStorage.setItem('neko_dmg_lvl', this.upgrades.damageLvl);
    localStorage.setItem('neko_dmg_val', this.upgrades.damage);
    localStorage.setItem('neko_spd_lvl', this.upgrades.speedLvl);
    localStorage.setItem('neko_spd_val', this.upgrades.attackSpeed);
    localStorage.setItem('neko_skill_crit', this.skills.critLvl);
    localStorage.setItem('neko_skill_hp', this.skills.hpLvl);
    localStorage.setItem('neko_skill_mag', this.skills.magLvl);
  }
};

window.alert = function(msg) {
  let toast = document.createElement('div');
  toast.className = 'toast-popup';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
};
