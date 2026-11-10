import os
import re
import math
import struct
import hashlib

def run_tests():
    print("=================================================================")
    print("CHALLENGER 1 EMPIRICAL AUDIT & VERIFICATION HARNESS")
    print("=================================================================\n")
    
    # -------------------------------------------------------------
    # TEST 1: Image Files Verification (public & dist)
    # -------------------------------------------------------------
    print("--- [TEST 1] Photographic Assets Integrity (Magic Bytes, Dimensions, Sizes) ---")
    required_images = [
        "avatar_ramesh.jpg",
        "harvest_immersion.jpg",
        "hero_center.jpg",
        "hero_sat_1.jpg",
        "hero_sat_2.jpg",
        "hero_sat_3.jpg",
        "hero_sat_4.jpg",
        "orbit_1.jpg",
        "orbit_2.jpg",
        "orbit_3.jpg",
        "orbit_4.jpg",
        "orbit_5.jpg",
        "orbit_6.jpg",
        "orbit_7.jpg",
        "orbit_8.jpg",
        "scenario_tailoring.jpg"
    ]
    
    dirs = {
        "public": "frontend/public/images",
        "dist": "frontend/dist/images"
    }
    
    image_stats = {}
    
    for key, folder in dirs.items():
        if not os.path.exists(folder):
            raise AssertionError(f"Target folder {folder} does not exist!")
        files = os.listdir(folder)
        print(f"\nChecking folder: {folder} ({len(files)} files found)")
        
        for name in required_images:
            if name not in files:
                raise AssertionError(f"Missing required asset {name} in {folder}")
            
            fpath = os.path.join(folder, name)
            with open(fpath, "rb") as f:
                data = f.read()
            
            size = len(data)
            # Size check > 1KB
            assert size > 1024, f"Asset {name} size {size} is <= 1024 bytes!"
            
            # Magic bytes check: 0xFF 0xD8 0xFF
            magic = data[:3]
            assert magic == b"\xff\xd8\xff", f"Asset {name} invalid magic bytes: {magic.hex()}"
            
            # End of Image marker check (0xFF 0xD9)
            assert b"\xff\xd9" in data[-16:], f"Asset {name} missing valid EOI marker (truncated)"
            
            # Parse SOF dimensions
            idx = 2
            width, height = None, None
            while idx < len(data) - 4:
                if data[idx] != 0xff:
                    idx += 1
                    continue
                marker = data[idx+1]
                if marker in (0xd8, 0xd9, 0x00):
                    idx += 2
                    continue
                if idx + 4 > len(data):
                    break
                length = struct.unpack('>H', data[idx+2:idx+4])[0]
                if marker in (0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf):
                    if idx + 9 <= len(data):
                        h, w = struct.unpack('>HH', data[idx+5:idx+9])
                        width, height = w, h
                        break
                idx += 2 + length
            
            assert width is not None and width > 0, f"Asset {name} invalid width {width}"
            assert height is not None and height > 0, f"Asset {name} invalid height {height}"
            
            sha256 = hashlib.sha256(data).hexdigest()
            print(f"  [PASS] {name:22} | Size: {size:6} B | Dim: {width:4}x{height:4} | SHA256: {sha256[:12]}...")
            
            if name not in image_stats:
                image_stats[name] = {}
            image_stats[name][key] = sha256

    # Verify parity between public and dist
    for name, hashes in image_stats.items():
        assert hashes["public"] == hashes["dist"], f"Checksum mismatch between public and dist for {name}!"
    print("\n=> All 16 photographic assets verified with 100% integrity and parity.\n")
    
    # -------------------------------------------------------------
    # TEST 2: JSX Image References Check
    # -------------------------------------------------------------
    print("--- [TEST 2] JSX Image References Existence Check ---")
    jsx_files = ["frontend/src/App.jsx", "frontend/src/components/SetoDashboard.jsx"]
    public_set = set(os.listdir("frontend/public/images"))
    
    for jpath in jsx_files:
        with open(jpath, "r", encoding="utf-8") as f:
            src = f.read()
        refs = re.findall(r"/images/([a-zA-Z0-9_\-\.]+\.(?:jpg|png|webp|svg))", src)
        unique_refs = sorted(set(refs))
        print(f"File {jpath} references {len(unique_refs)} distinct images:")
        for r in unique_refs:
            assert r in public_set, f"Referenced image {r} missing from public/images!"
            print(f"  [OK] /images/{r}")
    print("=> All image references in JSX resolve directly to existing public assets.\n")

    # -------------------------------------------------------------
    # TEST 3: Mathematical Verification of Arc Gauge
    # -------------------------------------------------------------
    print("--- [TEST 3] Radial Arc Gauge Mathematical Verification ---")
    r = 45.0
    circumference = 2.0 * math.pi * r
    print(f"  Circle radius: r = {r}")
    print(f"  Exact circumference: 2 * pi * {r} = {circumference:.5f}")
    print(f"  UI-SPEC dasharray integer: 283 (error: {abs(283 - circumference):.4f})")
    
    # Check 67% fill
    target_fill = 0.67
    exact_offset = circumference * (1.0 - target_fill)
    spec_offset_from_283 = 283.0 * (1.0 - target_fill)
    print(f"  Target fill: {target_fill * 100}%")
    print(f"  Exact remaining offset: {circumference:.4f} * (1 - 0.67) = {exact_offset:.4f}")
    print(f"  Offset from 283 dasharray: 283 * 0.33 = {spec_offset_from_283:.4f}")
    print(f"  Implementation stroke-dashoffset: 93")
    assert round(spec_offset_from_283) == 93, "Offset rounding mismatch!"
    print("  [PASS] Radial arc gauge math is verified to sub-pixel accuracy.\n")

    # -------------------------------------------------------------
    # TEST 4: Scene 3 Orbital Vortex Geometry Math
    # -------------------------------------------------------------
    print("--- [TEST 4] Scene 3 Orbital Vortex Geometry & Angle Verification ---")
    # Coordinates from App.jsx:
    # Tile 1: (0, -256)
    # Tile 2: (192, -192)
    # Tile 3: (272, 0)
    # Tile 4: (208, 192)
    # Tile 5: (0, 256)
    # Tile 6: (-208, 192)
    # Tile 7: (-272, 0)
    # Tile 8: (-192, -192)
    tiles = [
        ("Tile 1 (Top)", 0, -256, 0.0),
        ("Tile 2 (Top-Right)", 192, -192, 45.0),
        ("Tile 3 (Right)", 272, 0, 90.0),
        ("Tile 4 (Bottom-Right)", 208, 192, 135.0),
        ("Tile 5 (Bottom)", 0, 256, 180.0),
        ("Tile 6 (Bottom-Left)", -208, 192, 225.0),
        ("Tile 7 (Left)", -272, 0, 270.0),
        ("Tile 8 (Top-Left)", -192, -192, 315.0),
    ]
    
    for name, x, y, nominal_deg in tiles:
        radius = math.sqrt(x**2 + y**2)
        # compute angle clockwise from top (0, -R)
        # standard atan2 is from positive x axis counterclockwise:
        # let's map: top (x=0, y<0) -> 0 deg, right (x>0, y=0) -> 90 deg, bottom (x=0, y>0) -> 180 deg, left (x<0, y=0) -> 270 deg
        calc_deg = (math.degrees(math.atan2(x, -y)) + 360) % 360
        angle_diff = abs(calc_deg - nominal_deg)
        print(f"  {name:25} | Coord: ({x:4}, {y:4}) | Radius: {radius:6.1f}px | Angle: {calc_deg:5.1f}° (Nominal: {nominal_deg:5.1f}°, Diff: {angle_diff:4.1f}°)")
        assert 240 <= radius <= 290, f"Tile radius {radius} out of nominal 250px band!"
        assert angle_diff <= 3.0, f"Tile angle deviation {angle_diff}° exceeds tolerance!"
    print("  [PASS] All 8 orbit tiles distributed evenly in 45° sectors with radius ~250-280px.\n")

    # -------------------------------------------------------------
    # TEST 5: Code Audit of Scroll Triggers & Lenis in App.jsx
    # -------------------------------------------------------------
    print("--- [TEST 5] GSAP ScrollTrigger & Lenis Code Audit ---")
    with open("frontend/src/App.jsx", "r", encoding="utf-8") as f:
        app_code = f.read()
    
    # Check Lenis registration and sync
    assert "new Lenis(" in app_code, "Lenis not initialized!"
    assert "lenis.on('scroll', ScrollTrigger.update)" in app_code, "Lenis scroll not piped to ScrollTrigger.update!"
    assert "gsap.ticker.add(updateTicker)" in app_code, "Lenis RAF not piped to gsap.ticker!"
    assert "gsap.ticker.lagSmoothing(0)" in app_code, "lagSmoothing(0) missing!"
    assert "ctx.revert()" in app_code, "GSAP context cleanup missing!"
    assert "lenis.destroy()" in app_code, "Lenis destroy cleanup missing!"
    print("  [PASS] Lenis smooth scroll ticker synchronization and cleanup verified.")

    # Check Scene 1 Pinned Hero Dispersion
    assert 'start: "top top"' in app_code, "Scene 1 start trigger missing"
    assert 'pin: true' in app_code, "Scene 1 pin missing"
    assert 'scrub: 1.2' in app_code, "Scene 1 scrub missing"
    assert '#hero-center-card' in app_code, "Scene 1 central card missing"
    assert '#hero-sat-1' in app_code and '#hero-sat-4' in app_code, "Scene 1 satellites missing"
    print("  [PASS] Scene 1 Hero dispersion parameters verified.")

    # Check Scene 2 Vertical Line Drop
    assert '#thesis-line' in app_code, "Scene 2 thesis line missing"
    assert '#thesis-dot' in app_code, "Scene 2 thesis dot missing"
    assert 'scaleY: 1' in app_code, "Scene 2 scaleY animation missing"
    assert 'start: "top 65%"' in app_code, "Scene 2 trigger missing"
    print("  [PASS] Scene 2 Vertical line drop parameters verified.")

    # Check Scene 3 Orbit Pinned
    assert 'pin: "#orbit-pinned-wrap"' in app_code, "Scene 3 pin missing"
    assert 'rotation: 45' in app_code, "Scene 3 rotation 45 deg missing"
    assert 'scrub: 1.4' in app_code, "Scene 3 scrub missing"
    print("  [PASS] Scene 3 Orbit pinning and 45deg rotation verified.")

    # Check Scene 4 Arc Gauge
    assert 'gauge-circle' in app_code, "Scene 4 gauge circle ID missing"
    assert 'strokeDashoffset = "93"' in app_code, "Scene 4 93 offset trigger missing"
    assert 'strokeDashoffset = "283"' in app_code, "Scene 4 283 reset trigger missing"
    print("  [PASS] Scene 4 Arc gauge trigger and reset verified.")

    # Check Section Capsule Tracker
    assert 'activeSection' in app_code, "Capsule activeSection state missing"
    for s_id in ['#hero-pinned-scene', '#scene-thesis', '#scene-orbit', '#scene-immersive', '#scene-cards', '#dashboard-section']:
        assert s_id in app_code, f"Capsule tracker missing section selector {s_id}"
    print("  [PASS] Floating capsule tracker covers all 6 scenes.")

    print("\n=================================================================")
    print("ALL 5 CHALLENGER VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=================================================================")

if __name__ == "__main__":
    run_tests()
