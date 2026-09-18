const GAME_STATE = {
  yarn: 100,
  sardines: 50,
  currentCity: 0,
  currentWave: 1,
  selectedSkin: 'cat_hero_v2',
  unlockedSkins: ['cat_hero_v2'],
  stats: { hp: 100, maxHp: 100, attack: 15, speed: 5 }
};

const CITIES = [
  { id: 'meow_city', name: 'Meow City', unlocked: true, waves: 5 },
  { id: 'purr_polis', name: 'Purrpolis', unlocked: false, waves: 5 },
  { id: 'neko_district', name: 'Neko District', unlocked: false, waves: 5 }
];

const GAME_ASSETS = {
  skins: [
    { id: 'cat_hero_v2', name: 'Cat Hero V2', sprite: 'assets/images/cats/cat_hero_v2.png', cost: 0, unlocked: true },
    { id: 'shadow_cat', name: 'Shadow Neko', sprite: 'assets/images/cats/shadow_cat.png', cost: 10, unlocked: false },
    { id: 'cyber_cat', name: 'Cyberpunk Neko', sprite: 'assets/images/cats/cyber_cat.png', cost: 20, unlocked: false },
    { id: 'emperor_cat', name: 'Golden Emperor', sprite: 'assets/images/cats/emperor_cat.png', cost: 50, unlocked: false }
  ],
  enemies: {
    toxic_slime: 'assets/images/enemies/toxic_slime.png',
    lava_slime: 'assets/images/enemies/lava_slime.png',
    king_slime: 'assets/images/enemies/king_slime.png'
  },
  ui: {
    yarn_ball: 'assets/images/ui/yarn_ball.png',
    golden_sardine: 'assets/images/ui/golden_sardine.png'
  }
};

function saveGameState() { 
  localStorage.setItem('neko_state', JSON.stringify(GAME_STATE)); 
}

function loadGameState() {
  const saved = localStorage.getItem('neko_state');
  if (saved) { 
    try { Object.assign(GAME_STATE, JSON.parse(saved)); } catch(e){} 
  }
}

loadGameState();
