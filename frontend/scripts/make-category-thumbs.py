"""Generate small icon versions of the category artwork.

The source files in public/images/categories are 1254x1254 transparent PNGs
between 1.5 MB and 3 MB each. They are right for the full-size home page cards
and far too heavy for a ~24 px icon inside a shop filter pill, so this script
cuts each one down.

For every source image it:

  1. keys out a flat near-white background, but only where it is reachable from
     the image border (see remove_flat_background for why this is a flood fill
     rather than a colour threshold);
  2. reads the alpha channel and finds the bounding box of the actual artwork,
     so a mostly-empty 1254 px canvas does not leave the visible artwork sitting
     tiny in the middle of the icon;
  3. crops to that box plus a small, proportional transparent margin, which also
     makes every icon optically the same weight regardless of how much empty
     space the original had;
  4. scales the longest side to TARGET px (downscaling only - these sources are
     all larger than the target, so no icon is ever enlarged and blurred);
  5. writes an optimised 8-bit RGBA PNG into the thumbs folder.

Run from the frontend directory:

    python scripts/make-category-thumbs.py

The generated files are committed, so this only needs re-running when a source
image in public/images/categories changes. The sources themselves are left
untouched - the home page cards still use them at full size.
"""

from pathlib import Path

from PIL import Image

SOURCE_DIR = Path(__file__).resolve().parent.parent / "public" / "images" / "categories"
OUTPUT_DIR = SOURCE_DIR / "thumbs"

# Source filename -> category slug. Output is written as "<slug>.png" so the app
# refers to `/images/categories/thumbs/soft-toys.png` rather than repeating a
# long name with spaces in it. These slugs match `categories` in
# frontend/src/components/home/CategorySection.jsx.
SLUG_BY_SOURCE = {
    "Pastel Crochet Flower Bouquet Cutout.png": "flowers",
    "Amigurumi Friends Crochet Plush Collection.png": "soft-toys",
    "Keychain_category_image.png": "keychains",
    "hair_aces_category.png": "hair-accessories",
    "Crocheted Kawaii Charm Collection.png": "charms",
    "Handmade Crochet Gift Collection.png": "handmade-gifts",
}

# 96 px covers a 24 px icon at 2x, and a 32 px icon at 3x. Anything larger just
# adds bytes to a decorative element.
TARGET = 96

# Transparent margin around the artwork, as a fraction of the longer side. Keeps
# the artwork from touching the pill's border once the CSS sizes the icon.
PADDING_RATIO = 0.04

# How far a pixel may stray from white and still count as background. The source
# backgrounds are not a single flat value - they carry a faint paper texture and
# a soft vignette that runs from 253 down to about 239 - so a threshold of 0
# would key out nothing and a threshold that only accepts pure white would leave
# a grey halo around every charm.
BACKGROUND_TOLERANCE = 26

# Also require low saturation. The artwork contains genuinely near-white pixels
# (the plush toys' muzzles, the charms' highlight beads) and dropping those
# would eat into the product; near-white *and* unsaturated is a much safer test
# for "paper backdrop" than near-white on its own.
BACKGROUND_MAX_CHROMA = 12


def remove_flat_background(image: Image.Image) -> Image.Image:
    """Clear a near-white backdrop, but only the part connected to the border.

    A plain "every light pixel becomes transparent" threshold is wrong for these
    sources. The charm collection is a grid of 30 separate kawaii charms on
    near-white paper, and several of the charms are themselves mostly white - the
    flood fill removes the surrounding paper and stops when it hits an opaque
    charm, so their white bodies survive.

    Flooding from the border rather than from the image's own corners matters
    too: seeding all four corners plus the mid-edges means a backdrop that is
    slightly tinted in one corner still gets cleared.

    Returns the image unchanged if it already has real transparency, so the
    already-cut-out sources are never touched.
    """
    alpha = image.getchannel("A")

    # Already cut out (the flower bouquet, plush toys, etc.). Alpha has range, so
    # there is genuinely nothing opaque-and-flat to remove.
    if alpha.getextrema()[0] < 250:
        return image

    width, height = image.size
    pixels = image.load()

    def is_backdrop(x: int, y: int) -> bool:
        red, green, blue, _ = pixels[x, y]
        if min(red, green, blue) < 255 - BACKGROUND_TOLERANCE:
            return False
        # Chroma = spread between the channel extremes. Needs low spread so the
        # white parts of the artwork (plush muzzles, highlight beads) are kept.
        if max(red, green, blue) - min(red, green, blue) > BACKGROUND_MAX_CHROMA:
            return False
        return True

    backdrop = set()

    # Seed every pixel on the border that already qualifies as backdrop.
    for x in range(width):
        for y in (0, height - 1):
            if is_backdrop(x, y):
                backdrop.add((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if is_backdrop(x, y):
                backdrop.add((x, y))

    # 4-connected flood fill over qualifying pixels only.
    stack = list(backdrop)
    while stack:
        x, y = stack.pop()
        for next_x, next_y in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if not (0 <= next_x < width and 0 <= next_y < height):
                continue
            if (next_x, next_y) in backdrop:
                continue
            if not is_backdrop(next_x, next_y):
                continue
            backdrop.add((next_x, next_y))
            stack.append((next_x, next_y))

    for x, y in backdrop:
        red, green, blue, _ = pixels[x, y]
        pixels[x, y] = (red, green, blue, 0)

    return image


def build_thumbnail(source: Path, target: Path) -> None:
    with Image.open(source) as image:
        image = remove_flat_background(image.convert("RGBA"))
        bounds = image.getbbox()

        if bounds is None:
            raise SystemExit(f"{source.name} is fully transparent - nothing to crop")

        artwork = image.crop(bounds)

        longest = max(artwork.size)
        padding = max(2, round(longest * PADDING_RATIO))
        artwork = artwork.crop(
            (
                -padding,
                -padding,
                artwork.width + padding,
                artwork.height + padding,
            )
        )

        # Integer floor is deliberate: round() can push a side to TARGET+1, which
        # then gets clamped back down and leaves one axis a pixel off the square.
        scale = TARGET / max(artwork.size)
        thumbnail = artwork.resize(
            (
                max(1, round(artwork.width * scale)),
                max(1, round(artwork.height * scale)),
            ),
            Image.LANCZOS,
        )

    target.parent.mkdir(parents=True, exist_ok=True)
    thumbnail.save(target, format="PNG", optimize=True)

    source_kb = round(source.stat().st_size / 1024)
    target_kb = round(target.stat().st_size / 1024)
    print(f"{target.name:<48} {thumbnail.width}x{thumbnail.height}  {source_kb} KB -> {target_kb} KB")


def main() -> None:
    sources = sorted(SOURCE_DIR.glob("*.png"))

    if not sources:
        raise SystemExit(f"No PNG files found in {SOURCE_DIR}")

    unmapped = [source for source in sources if source.name not in SLUG_BY_SOURCE]

    if unmapped:
        # Fail loudly rather than emitting files nothing references. These source
        # names are hand-editable, so a renamed or added category has to be added
        # to SLUG_BY_SOURCE before this script is re-run.
        raise SystemExit(
            "No slug mapped for: "
            + ", ".join(source.name for source in unmapped)
            + "\nAdd each to SLUG_BY_SOURCE, then re-run."
        )

    for source in sources:
        slug = SLUG_BY_SOURCE[source.name]
        build_thumbnail(source, OUTPUT_DIR / f"{slug}.png")


if __name__ == "__main__":
    main()