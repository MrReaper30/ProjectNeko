// Neutralize native browser alert popups globally
window.alert = function(msg) {
  if (typeof showToast === 'function') {
    showToast(msg);
  } else {
    console.log("ALERT BLOCKED:", msg);
  }
};

const GameState = {
  playerName: localStorage.getItem('neko_playerName') || 'CatHero',
  gold: parseInt(localStorage.getItem('neko_gold')) || 0,
  currentLevel: parseInt(localStorage.getItem('neko_currentLevel')) || 1,
  unlockedLevel: parseInt(localStorage.getItem('neko_unlockedLevel')) || 1,
  selectedCatColor: localStorage.getItem('neko_catColor') || '#ffb703',
  selectedCity: parseInt(localStorage.getItem('neko_selectedCity')) || 1,

  save() {
    localStorage.setItem('neko_playerName', this.playerName);
    localStorage.setItem('neko_gold', this.gold);
    localStorage.setItem('neko_currentLevel', this.currentLevel);
    localStorage.setItem('neko_unlockedLevel', this.unlockedLevel);
    localStorage.setItem('neko_catColor', this.selectedCatColor);
    localStorage.setItem('neko_selectedCity', this.selectedCity);
  }
};

document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());
