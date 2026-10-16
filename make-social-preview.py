#!/usr/bin/env python3
"""Generate social-preview.png (1200x630) for the One HTML Page Challenge site.

Reproduces the site's hero: white rounded card with the project logo on the
site's dark diagonal-striped background. No machine-specific paths; fonts
resolve via OHPC_FONT_DIR -> ./fonts -> ~/.fonts -> system font dirs.
"""
import os
from PIL import Image, ImageDraw, ImageFont
Image.MAX_IMAGE_PIXELS = None

W, H = 1200, 630
HERE = os.path.dirname(os.path.abspath(__file__))


def find_font(name, size):
    env_dir = os.environ.get("OHPC_FONT_DIR")
    candidates = []
    if env_dir:
        candidates.append(os.path.join(env_dir, name))
    candidates += [
        os.path.join("fonts", name),
        os.path.join(os.path.expanduser("~"), ".fonts", name),
        os.path.join("/usr/share/fonts/truetype/dejavu", name),
        os.path.join("/usr/share/fonts/truetype/liberation", name),
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()


def stripe_color(x, y):
    # site CSS: repeating-linear-gradient(45deg, #000000, #1e1e1e 10px, #15191d 10px, #15191d 20px)
    phase = (x + y) % 20
    if phase < 10:
        t = phase / 10.0
        return (int(0x1E * t), int(0x1E * t), int(0x1E * t))
    return (0x15, 0x19, 0x1D)


def main():
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        for x in range(W):
            px[x, y] = stripe_color(x, y)  # noqa

    draw = ImageDraw.Draw(img, "RGBA")

    # white card like the site's .card, with a soft shadow
    card = (70, 50, W - 70, H - 50)
    draw.rounded_rectangle((70, 58, W - 66, H - 44), radius=26, fill=(0, 0, 0, 70))
    draw.rounded_rectangle(card, radius=26, fill=(255, 255, 255, 255))

    # logo (the project's own asset)
    logo = Image.open(os.path.join(HERE, "one-html-page-logo.png")).convert("RGBA")
    logo_w = 560
    logo_h = int(logo.height * logo_w / logo.width)
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    img.paste(logo, ((W - logo_w) // 2, 100), logo)

    # tagline from the site's meta description
    tag = "Create anything you want within 1 single HTML file."
    f_tag = find_font("DejaVuSans.ttf", 28)
    tw = draw.textlength(tag, font=f_tag)
    draw.text(((W - tw) / 2, 100 + logo_h + 38), tag, font=f_tag, fill=(73, 80, 87))

    # domain in muted text-muted grey (plain text, not a button)
    dom = "onehtmlpagechallenge.com"
    f_dom = find_font("DejaVuSans.ttf", 24)
    dw = draw.textlength(dom, font=f_dom)
    draw.text(((W - dw) / 2, 100 + logo_h + 88), dom, font=f_dom, fill=(108, 117, 125))

    out = os.path.join(HERE, "social-preview.png")
    img.save(out, optimize=True)
    print("wrote", out, img.size)


if __name__ == "__main__":
    main()
