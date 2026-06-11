from PIL import Image, ImageDraw, ImageFont
import os

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)

sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}


def draw_q(draw, size):
    cx, cy = size // 2, size // 2
    r = int(size * 0.38)
    # Outer circle
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)
    # Inner circle (cutout) — makes a thick ring
    ir = int(size * 0.18)
    draw.ellipse([cx - ir, cy - ir, cx + ir, cy + ir], fill=BLACK)
    # Q tail
    t = int(size * 0.10)
    pts = [
        (cx + int(r * 0.55), cy + int(r * 0.55)),
        (cx + int(r * 0.80), cy + int(r * 0.80)),
        (cx + int(r * 0.70), cy + int(r * 0.85)),
        (cx + int(r * 0.45), cy + int(r * 0.60)),
    ]
    draw.polygon(pts, fill=WHITE)


root = "android/app/src/main/res"

for density, px in sizes.items():
    img = Image.new("RGBA", (px, px), BLACK)
    draw = ImageDraw.Draw(img)
    draw_q(draw, px)
    for name in [f"ic_launcher.png", f"ic_launcher_round.png", f"ic_launcher_foreground.png"]:
        path = os.path.join(root, f"mipmap-{density}", name)
        img.save(path)
        print(f"  {path}")

bg_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
'''
with open(os.path.join(root, "values", "ic_launcher_background.xml"), "w") as f:
    f.write(bg_xml)

print("Updated ic_launcher_background.xml")
print("Done!")
