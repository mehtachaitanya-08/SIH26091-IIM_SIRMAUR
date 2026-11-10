import subprocess
import os

video_path = "Access to Opportunity_ Gallup Research _ Walton Family Foundation - Brave 2026-11-10 03-01-07.mp4"
out_dir = os.path.join("frontend", "public", "images")
os.makedirs(out_dir, exist_ok=True)

EXTRACTIONS = [
    # (filename, timestamp, filter_complex)
    ("hero_center.jpg", 3.0, "scale=900:600:force_original_aspect_ratio=increase,crop=900:600"),
    ("hero_sat_1.jpg", 4.0, "crop=600:400:1100:100"),
    ("hero_sat_2.jpg", 4.5, "crop=600:400:200:500"),
    ("hero_sat_3.jpg", 5.0, "crop=600:400:1100:500"),
    ("hero_sat_4.jpg", 5.5, "crop=600:400:200:100"),
    ("orbit_1.jpg", 25.5, "crop=400:400:760:100"),
    ("orbit_2.jpg", 26.0, "crop=400:400:1100:200"),
    ("orbit_3.jpg", 26.5, "crop=400:400:1200:450"),
    ("orbit_4.jpg", 27.0, "crop=400:400:1100:600"),
    ("orbit_5.jpg", 27.5, "crop=400:400:760:600"),
    ("orbit_6.jpg", 28.0, "crop=400:400:400:600"),
    ("orbit_7.jpg", 28.5, "crop=400:400:300:450"),
    ("orbit_8.jpg", 29.0, "crop=400:400:400:200"),
    ("harvest_immersion.jpg", 35.0, "scale=1920:1080"),
    ("avatar_ramesh.jpg", 2.0, "crop=300:300:810:350"),
    ("scenario_tailoring.jpg", 44.0, "scale=600:350:force_original_aspect_ratio=increase,crop=600:350")
]

for fname, ss, vf in EXTRACTIONS:
    out_file = os.path.join(out_dir, fname)
    cmd = [
        "ffmpeg", "-ss", str(ss), "-i", video_path,
        "-vframes", "1", "-vf", vf, "-q:v", "2",
        out_file, "-y"
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    size = os.path.getsize(out_file)
    print(f"Generated {fname} ({size} bytes)")

print("\nAll 16 local photographic assets extracted and verified in frontend/public/images/!")
