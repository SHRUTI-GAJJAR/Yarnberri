import { ArrowRight, Flower2, Gift, Heart, Sparkles, ToyBrick, WandSparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * `image` is optional. Only Crochet Flowers has generated transparent
 * artwork today (`/images/categories/Pastel Crochet Flower Bouquet Cutout.png`).
 * Adding artwork for the remaining collections is a one-line change: drop a
 * PNG into `public/images/categories/` and add the `image` field here.
 *
 * Never point more than one category at the same file, and never fabricate a
 * placeholder path - cards without artwork fall back to their Lucide icon.
 */
const categories = [
  {
    title: 'Crochet Flowers',
    slug: 'crochet-flowers',
    description: 'Soft floral favourites made for gifting and home styling.',
    icon: Flower2,
    image: '/images/categories/Pastel Crochet Flower Bouquet Cutout.png',
  },
  {
    title: 'Soft Toys',
    slug: 'soft-toys',
    description: 'Cuddly companions and playful charm for all ages.',
    icon: Heart,
  },
  {
    title: 'Keychains',
    slug: 'keychains',
    description: 'Tiny meaningful keepsakes for bags, keys, and little joys.',
    icon: Gift,
  },
  {
    title: 'Hair Accessories',
    slug: 'hair-accessories',
    description: 'Pretty crochet clips and little handmade details for everyday style.',
    icon: WandSparkles,
  },
  {
    title: 'Charms',
    slug: 'charms',
    description: 'Tiny crochet keepsakes to add a sweet handmade touch anywhere.',
    icon: ToyBrick,
  },
  {
    title: 'Handmade Gifts',
    slug: 'handmade-gifts',
    description: 'Curated cozy finds from the Yarnberri studio collection.',
    icon: Sparkles,
  },
];

const titleId = (slug) => `yb-category-title-${slug}`;

export default function CategorySection() {
  return (
    <section className="yb-section yb-category-section">
      <div className="container">
        <div className="yb-section-heading">
          <div className="yb-eyebrow">Created collections</div>
          <h2 className="yb-section-title">Handmade pieces for everyday little joys</h2>
        </div>

        <div className="row g-4">
          {categories.map(({ title, slug, description, icon: Icon, image }) => (
            <div key={slug} className="col-12 col-md-6 col-lg-4">
              <Link
                to={`/shop?category=${slug}`}
                className="yb-category-card"
                aria-labelledby={titleId(slug)}
              >
                {/* Front layer: artwork panel. Opaque, so it sits above the
                    content layer and can lift away from it on hover. */}
                <span className="yb-category-card__image">
                  {image ? (
                    <img
                      className="yb-category-card__artwork"
                      src={image}
                      alt={title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <Icon
                      className="yb-category-card__fallback"
                      size={46}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />
                  )}
                </span>

                {/* Rear layer: the card face. Always painted underneath the
                    artwork panel and never fully hidden, so the collection
                    is readable without hovering. */}
                <span className="yb-category-card__content">
                  <span className="yb-category-card__flourish" aria-hidden="true" />
                  <span className="yb-category-card__title" id={titleId(slug)}>
                    {title}
                  </span>
                  <span className="yb-category-card__description">{description}</span>
                  <span className="yb-category-card__explore">
                    Explore
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}