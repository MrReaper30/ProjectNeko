import urllib.request
import json
import base64
import os

API_KEY = "eb2891e0-6281-4274-8ddd-e9d701356ee7"
BASE_DIR = "/sdcard/Download/ProjectNeko/assets/images"

ASSETS_TO_GENERATE = [
    # Cat Skins
    {"path": "cats/shadow_cat.png", "desc": "64x64 pixel art dark shadow ninja cat, transparent background", "size": 64},
    {"path": "cats/cyber_cat.png", "desc": "64x64 pixel art neon cyberpunk cat with glowing visor, transparent background", "size": 64},
    {"path": "cats/emperor_cat.png", "desc": "64x64 pixel art majestic golden emperor cat wearing a crown, transparent background", "size": 64},
    
    # Enemies & Bosses
    {"path": "enemies/toxic_slime.png", "desc": "64x64 pixel art glowing green toxic slime monster sprite, transparent background", "size": 64},
    {"path": "enemies/lava_slime.png", "desc": "64x64 pixel art molten lava slime monster sprite, transparent background", "size": 64},
    {"path": "enemies/king_slime.png", "desc": "64x64 pixel art massive giant king slime wearing a royal crown boss sprite, transparent background", "size": 64},
    
    # Items & UI Icons
    {"path": "ui/yarn_ball.png", "desc": "32x32 pixel art bright pink yarn ball icon, transparent background", "size": 32},
    {"path": "ui/golden_sardine.png", "desc": "32x32 pixel art shiny golden sardine fish icon, transparent background", "size": 32}
]

def fetch_and_save(item):
    save_path = os.path.join(BASE_DIR, item["path"])
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    url = "https://api.pixellab.ai/v1/generate-image-pixflux"
    payload = {
        "description": item["desc"],
        "image_size": {"width": item["size"], "height": item["size"]},
        "no_background": True
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    print(f"🎨 Generating: {item['path']}...")
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            img_val = data.get("image") or data.get("image_url") or data.get("url")
            
            if isinstance(img_val, dict):
                img_val = img_val.get("url") or img_val.get("base64") or img_val.get("src")
                
            if isinstance(img_val, str) and img_val.startswith("http"):
                img_bytes = urllib.request.urlopen(img_val).read()
                with open(save_path, "wb") as f:
                    f.write(img_bytes)
                print(f"  ✨ Saved to {save_path}")
            elif isinstance(img_val, str):
                if "," in img_val:
                    img_val = img_val.split(",")[1]
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(img_val))
                print(f"  ✨ Saved base64 to {save_path}")
    except Exception as e:
        print(f"  ❌ Failed {item['path']}: {e}")

if __name__ == "__main__":
    for asset in ASSETS_TO_GENERATE:
        fetch_and_save(asset)
    print("🚀 Batch generation completed!")
