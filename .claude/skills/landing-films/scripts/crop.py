"""Crop sections out of a full-page capture using CSS-pixel bounds (from <name>-rects.json).
python3 crop.py capture/stripe-still-full.png 2 out/ s-hero:0:761 s-banner:2957:3517
Each spec is name:top:bottom in CSS px; the second argument is the capture's device scale."""
import sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
src, dpr, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
im = Image.open(src).convert("RGB")
for spec in sys.argv[4:]:
    name, a, b = spec.split(":")
    c = im.crop((0, int(float(a) * dpr), im.width, min(im.height, int(float(b) * dpr))))
    c.save(f"{out.rstrip('/')}/{name}.webp", quality=90, method=6)
    print(name, c.size)
