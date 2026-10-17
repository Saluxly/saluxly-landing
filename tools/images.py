"""Prepares the images the site serves: the four app screens from design/screens (or real
captures dropped into design/screens-real) as WebP with a PNG fallback, the share image,
and the favicons rendered from the conduction mark with headless Chrome.
Run: .venv/bin/python tools/images.py"""
import shutil
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/img"
OUT.mkdir(parents=True, exist_ok=True)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def screens() -> None:
    source = ROOT / "design/screens-real"
    if not source.exists():
        source = ROOT / "design/screens"
    for png in sorted(source.glob("screen-*.png")):
        name = png.stem.replace("@2x", "").replace("@3x", "")
        image = Image.open(png).convert("RGB")
        # The frame shows the screen at most 390 px wide on a 2x display: 780 px is plenty.
        if image.width > 780:
            image = image.resize((780, round(image.height * 780 / image.width)), Image.LANCZOS)
        image.save(OUT / f"{name}.webp", "WEBP", quality=82, method=6)
        image.save(OUT / f"{name}.png", "PNG", optimize=True)
        print(f"{name}: webp {(OUT / f'{name}.webp').stat().st_size // 1024} KB, png {(OUT / f'{name}.png').stat().st_size // 1024} KB, {image.width}x{image.height}")


def share_image() -> None:
    shutil.copy(ROOT / "design/og/og-image.png", OUT / "og-image.png")


def favicons() -> None:
    mark = (ROOT / "assets/img/mark.svg").read_text()
    page = ROOT / ".favicon.html"
    page.write_text(f'<!doctype html><meta charset="utf-8"><style>html,body{{margin:0;background:#17100C}}svg{{width:512px;height:512px;display:block}}</style>{mark}')
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=512,512",
                    f"--screenshot={OUT / 'favicon-512.png'}", page.as_uri()], check=True, capture_output=True)
    page.unlink()
    big = Image.open(OUT / "favicon-512.png").convert("RGBA")
    for size in (180, 32):
        big.resize((size, size), Image.LANCZOS).save(OUT / f"favicon-{size}.png", "PNG", optimize=True)
    big.save(OUT / "favicon-512.png", "PNG", optimize=True)


if __name__ == "__main__":
    screens()
    share_image()
    favicons()
    print("done")
