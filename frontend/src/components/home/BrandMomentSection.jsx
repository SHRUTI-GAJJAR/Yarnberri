import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';

/**
 * Brand moodboard.
 *
 * Three cards at ONE shared size. Every card uses the same aspect ratio and the
 * same copy block height, so the row reads as a tidy, deliberate set rather
 * than a scatter - the height and width differences in the previous version
 * made the cards look accidental next to each other.
 *
 * `align-items: stretch` (the grid default, set explicitly in CSS) makes the
 * cards fill the row height, and `.yb-moment-card` is a flex column so the art
 * band is identical across all three and the titles start on the same line.
 *
 * The one shared ratio is 3:2, which is the mildest crop against the sources
 * (the slides are 1.78 and 2.0 landscape). Each photo is a composed flat-lay
 * with the Yarnberri wordmark and collection name baked into the artwork, so a
 * taller portrait crop slices that text off - "Handmade Gifts" becomes
 * "de Gifts". 3:2 keeps every composition whole.
 *
 * Style comes from the shared frame rather than from variation: equal rounded
 * corners, a consistent inner padding, a hairline above the copy, and one hover
 * lift that all three cards share.
 *
 * The heart badge is decorative. The cards are not links, so it carries no
 * button semantics and is hidden from assistive tech - a "save" affordance that
 * saves nothing should not be announced as an action.
 */
const moments = [
  {
    title: 'Homey crochet',
    description: 'Warm little textures for cozy corners.',
    image: '/images/home-slides/slide-1-brand.png',
  },
  {
    title: 'Giftable charm',
    description: 'Sweet details that feel personal and ready to share.',
    image: '/images/home-slides/slide-2-flowers.png',
  },
  {
    title: 'Pinterest mood',
    description: 'Soft color stories and handmade personality.',
    image: '/images/home-slides/slide-3-gifts.png',
  },
];

export default function BrandMomentSection() {
  return (
    <section className="yb-section yb-moment-section">
      <div className="container">
        <div className="yb-moment-shell">
          {/* Two soft washes behind the panel, purely decorative. Cute without
              being loud: a pink glow up top, a sage one settling bottom-right. */}
          <span className="yb-moment-blob yb-moment-blob--pink" aria-hidden="true" />
          <span className="yb-moment-blob yb-moment-blob--sage" aria-hidden="true" />

          <div className="yb-moment-text">
            <div className="yb-eyebrow">
              <Sparkles size={14} />
              Yarnberri moodboard
            </div>
            <h2 className="yb-section-title">A soft little brand story, styled to feel dreamy.</h2>
            <p>
              Thoughtful textures, sweet colors, and tiny details bring the Yarnberri world to life —
              gentle, handmade, and full of feeling.
            </p>
            <a
              className="yb-btn yb-btn-pink yb-moment-cta"
              href="https://www.instagram.com/_yarnberri_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow the charm
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="yb-moment-grid">
            {moments.map(({ title, description, image }) => (
              <article key={title} className="yb-moment-card">
                <div className="yb-moment-art">
                  <img src={image} alt="" loading="lazy" decoding="async" />
                  <span className="yb-moment-pin" aria-hidden="true">
                    <Heart size={13} strokeWidth={2} />
                  </span>
                </div>

                <div className="yb-moment-copy">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}