function buySkin(colorHex) {
  if (typeof GameState !== "undefined") {
    GameState.selectedCatColor = colorHex;
    GameState.save();
    showToast("Skin Equipped!");
  }
}

function showToast(msg) {
  let toast = document.getElementById('game-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'game-toast';
    toast.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#00f5d4; color:#000; padding:10px 20px; border-radius:20px; font-weight:bold; font-size:0.85rem; z-index:2000; transition:opacity 0.3s; opacity:0; pointer-events:none;';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 1200);
}
