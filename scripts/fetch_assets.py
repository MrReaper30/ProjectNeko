import urllib.request
import json
import base64
import os

API_KEY = "eb2891e0-6281-4274-8ddd-e9d701356ee7"
SAVE_PATH = "/sdcard/Download/ProjectNeko/assets/images/cats/cat_hero_v2.png"

url = "https://api.pixellab.ai/v1/generate-image-pixflux"

payload = {
    "description": "64x64 pixel art cute cat hero wearing golden armor",
    "image_size": {
        "width": 64,
        "height": 64
    },
    "no_background": True
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

print("🎨 Requesting PixelLab PixFlux Generation...")
req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        
        os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)
        
        # Flatten dictionary response keys
        img_val = data.get("image") or data.get("image_url") or data.get("url")
        
        if isinstance(img_val, dict):
            img_val = img_val.get("url") or img_val.get("base64") or img_val.get("src")
            
        if isinstance(img_val, str) and img_val.startswith("http"):
            img_bytes = urllib.request.urlopen(img_val).read()
            with open(SAVE_PATH, "wb") as f:
                f.write(img_bytes)
            print(f"✨ SUCCESS! Saved sprite to {SAVE_PATH}")
        elif isinstance(img_val, str):
            if "," in img_val:
                img_val = img_val.split(",")[1]
            with open(SAVE_PATH, "wb") as f:
                f.write(base64.b64decode(img_val))
            print(f"✨ SUCCESS! Saved base64 sprite to {SAVE_PATH}")
        else:
            print("⚠️ Raw Data Structure Received:", json.dumps(data, indent=2))

except Exception as e:
    print(f"❌ Error: {e}")
