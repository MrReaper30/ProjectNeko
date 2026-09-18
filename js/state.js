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

if (typeof module !== 'undefined') {
  module.exports = { GAME_ASSETS };
}
