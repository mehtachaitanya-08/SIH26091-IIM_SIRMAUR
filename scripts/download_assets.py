import os
import urllib.request

ASSETS = {
    "hero_center.jpg": "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=900&q=80",
    "hero_sat_1.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    "hero_sat_2.jpg": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80",
    "hero_sat_3.jpg": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    "hero_sat_4.jpg": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    "orbit_1.jpg": "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80",
    "orbit_2.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "orbit_3.jpg": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80",
    "orbit_4.jpg": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    "orbit_5.jpg": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    "orbit_6.jpg": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "orbit_7.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "orbit_8.jpg": "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=400&q=80",
    "harvest_immersion.jpg": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80",
    "avatar_ramesh.jpg": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    "scenario_tailoring.jpg": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
}

out_dir = os.path.join("frontend", "public", "images")
os.makedirs(out_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
for fname, url in ASSETS.items():
    dest = os.path.join(out_dir, fname)
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        print(f"Downloading {fname} from {url}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        print(f"Downloaded: {fname} ({os.path.getsize(dest)} bytes)")
    else:
        print(f"Already exists: {fname} ({os.path.getsize(dest)} bytes)")

print("\nVerification check:")
all_good = True
for fname in ASSETS.keys():
    dest = os.path.join(out_dir, fname)
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        print(f"  [OK] {fname}: {os.path.getsize(dest)} bytes")
    else:
        print(f"  [FAIL] {fname} missing or too small")
        all_good = False

if all_good:
    print("\nAll 16 assets populated successfully in frontend/public/images/!")
else:
    print("\nSome assets failed.")
