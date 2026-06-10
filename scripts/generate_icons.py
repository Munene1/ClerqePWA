from PIL import Image, ImageDraw
import os

GREEN = (53, 153, 139)  # #35998B
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
    # Outer circle radius ~37% of size, inner ~25% (creates a thick donut Q)
    outer_r = int(size * 0.37)
    inner_r = int(size * 0.23)
    # Fill outer circle
    draw.ellipse([cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r], fill=WHITE)
    # Cut out inner circle (donut hole)
    draw.ellipse([cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=GREEN)
    # Tail: a filled rectangle at bottom-right
    t_w = int(size * 0.08)
    t_h = int(size * 0.20)
    tx = cx + int(outer_r * 0.6) - t_w // 2
    ty = cy + int(outer_r * 0.5)
    # Rotate the tail 45 degrees roughly - simpler: draw a polygon
    pts = [
        (cx + int(outer_r * 0.65), cy + int(outer_r * 0.55)),
        (cx + int(outer_r * 0.95), cy + int(outer_r * 0.85)),
        (cx + int(outer_r * 0.85), cy + int(outer_r * 0.95)),
        (cx + int(outer_r * 0.55), cy + int(outer_r * 0.65)),
    ]
    draw.polygon(pts, fill=WHITE)

root = "android/app/src/main/res"

for density, px in sizes.items():
    img = Image.new("RGBA", (px, px), GREEN)
    draw = ImageDraw.Draw(img)
    draw_q(draw, px)
    for name in [f"ic_launcher.png", f"ic_launcher_round.png", f"ic_launcher_foreground.png"]:
        path = os.path.join(root, f"mipmap-{density}", name)
        img.save(path)
        print(f"  {path}")

bg_xml = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#35998B</color>
</resources>
'''
with open(os.path.join(root, "values", "ic_launcher_background.xml"), "w") as f:
    f.write(bg_xml)

print("Updated ic_launcher_background.xml")
print("Done!")
