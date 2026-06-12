from PIL import Image, ImageDraw
import os

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)

# Target output sizes
sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}


def draw_q(draw, size):
    """Draw a Q as a thick circle + tail at 4x supersampled resolution."""
    cx, cy = size // 2, size // 2
    # Q body: thick ring
    outer_r = int(size * 0.23)
    sw = int(size * 0.075)
    inner_r = outer_r - sw
    # Outer circle (filled)
    draw.ellipse(
        [cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r], fill=WHITE
    )
    # Inner cutout
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r], fill=BLACK
    )
    # Q tail: thick diagonal line at bottom-right
    tail_start = cx + int(outer_r * 0.55)
    tail_end = cx + int(size * 0.26)
    tsw = int(size * 0.065)
    # We approximate with a rotated rectangle (polygon)
    dx = tail_end - tail_start
    dy = tail_end - tail_start
    length = int((dx * dx + dy * dy) ** 0.5)
    if length == 0:
        return
    # Unit vector perpendicular to the tail direction
    perp_x = -dy / length
    perp_y = dx / length
    hw = tsw / 2
    pts = [
        (tail_start + perp_x * hw, tail_start + perp_y * hw),
        (tail_end + perp_x * hw, tail_end + perp_y * hw),
        (tail_end - perp_x * hw, tail_end - perp_y * hw),
        (tail_start - perp_x * hw, tail_start - perp_y * hw),
    ]
    draw.polygon(pts, fill=WHITE)
    # Round caps: small circles at start and end of tail
    cap_r = int(tsw / 2)
    draw.ellipse(
        [tail_start - cap_r, tail_start - cap_r, tail_start + cap_r, tail_start + cap_r],
        fill=WHITE,
    )
    draw.ellipse(
        [tail_end - cap_r, tail_end - cap_r, tail_end + cap_r, tail_end + cap_r],
        fill=WHITE,
    )


root = "android/app/src/main/res"
SCALE = 4  # Supersample factor

for density, target_px in sizes.items():
    px = target_px * SCALE
    img = Image.new("RGBA", (px, px), BLACK)
    draw = ImageDraw.Draw(img)
    draw_q(draw, px)
    # Downscale with high-quality resampling
    img_resized = img.resize((target_px, target_px), Image.LANCZOS)
    for name in [f"ic_launcher.png", f"ic_launcher_round.png", f"ic_launcher_foreground.png"]:
        path = os.path.join(root, f"mipmap-{density}", name)
        img_resized.save(path)
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
