import { ArrowRight, Flower2, Gift, Heart, Sparkles, ToyBrick, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Created Collections.
 *
 * Each card is ONE box holding two absolutely positioned layers that fill
 * exactly the same rectangle:
 *
 *   front  .yb-category-split-card__image    z-index 2
 *   back   .yb-category-split-card__content  z-index 1
 *
 * The artwork panel is opaque and sits on top, so at rest the card reads as
 * artwork ALONE - the category name is painted underneath and cannot be seen.
 * Hover (or keyboard focus) sends the artwork up-and-left and the name panel
 * down-and-right, so the two genuinely part instead of one simply fading. See
 * "CREATED COLLECTIONS - SPLIT-LAYER CARDS" in crochet.css before changing any
 * of it: the reveal is sized in relation to the travel distance, and both the
 * row spacing and the gap between neighbouring cards have to leave room for
 * the panels to leave the card box.
 *
 * The content layer deliberately carries ONLY the category name, followed by an
 * inline arrow so the revealed line reads as link text. There is no subtitle or
 * description: the arrow is the entire affordance, saying "this leads to the
 * category" without describing anything about the product.
 *
 * `image` is optional. Only Crochet Flowers has generated transparent artwork
 * today (`/images/categories/Pastel Crochet Flower Bouquet Cutout.png`).
 *
 * To give another collection its own artwork: drop a transparent PNG into
 * `public/images/categories/` and add one `image:` line here. Nothing else in
 * the card needs to change - the two-layer architecture is identical for
 * artwork and for the icon fallback.
 *
 * Never point two categories at the same file, and never add a placeholder
 * path: a missing image should fall back to the icon, not to a broken frame.
 */
const categories = [
  {
    title: 'Crochet Flowers',
    slug: 'crochet-flowers',
    icon: Flower2,
    image: '/images/categories/Pastel Crochet Flower Bouquet Cutout.png',
  },
  {
    title: 'Soft Toys',
    slug: 'soft-toys',
    icon: Heart,
    image: '/images/categories/Amigurumi Friends Crochet Plush Collection.png',
  },
  {
    title: 'Keychains',
    slug: 'keychains',
    icon: Gift,
    image: '/images/categories/Keychain_category_image.png',
  },
  {
    title: 'Hair Accessories',
    slug: 'hair-accessories',
    icon: WandSparkles,
    image: '/images/categories/hair_aces_category.png',
  },
  {
    title: 'Charms',
    slug: 'charms',
    icon: ToyBrick,
    image: '/images/categories/Pastel Crochet Flower Bouquet Cutout.png',
  },
  {
    title: 'Handmade Gifts',
    slug: 'handmade-gifts',
    icon: Sparkles,
    image: '/images/categories/Pastel Crochet Flower Bouquet Cutout.png',
  },
];

const titleId = (slug) => `yb-category-title-${slug}`;

export default function CategorySection() {
  return (
    <section className="yb-section yb-category-section">
      <div className="container yb-category-split-shell">
        <div className="yb-section-heading">
          <div className="yb-eyebrow">Created collections</div>
          <h2 className="yb-section-title">Handmade pieces for everyday little joys</h2>
        </div>

        {/* Column counts only - the split itself is pure CSS. All 6 cards sit on one
            horizontal line from lg up (~170px each in a 1320px container,
            ~115px in a 960px one) and step down to 2 per line on phones. */}
        <div className="row g-4 yb-category-split-grid">
          {categories.map(({ title, slug, icon: Icon, image }) => (
            <div key={slug} className="col-12 col-md-6 col-lg-2">
              <Link
                to={`/shop?category=${slug}`}
                className="yb-category-split-card"
                aria-labelledby={titleId(slug)}
              >
                {/* Back layer. Painted underneath the artwork panel and fully
                    covered by it at rest, so the name only becomes visible once
                    the two layers separate. */}
                <div className="yb-category-split-card__content">
                  <h3 className="yb-category-split-card__title" id={titleId(slug)}>
                    {title}
                    {/* The only affordance: trails the name so the line reads as
                        one piece of link text, and describes nothing. */}
                    <ArrowRight
                      className="yb-category-split-card__cue"
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </h3>
                </div>

                {/* Front layer. */}
                <div className="yb-category-split-card__image">
                  {image ? (
                    <img
                      className="yb-category-split-card__artwork"
                      src={image}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <Icon
                      className="yb-category-split-card__fallback"
                      size={54}
                      strokeWidth={1.3}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}