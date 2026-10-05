import { ArrowUpRight, Sparkles } from 'lucide-react';

const moments = [
  { title: 'Homey crochet', description: 'Warm little textures for cozy corners.' },
  { title: 'Giftable charm', description: 'Sweet details that feel personal and ready to share.' },
  { title: 'Pinterest mood', description: 'Soft color stories and handmade personality.' },
];

export default function BrandMomentSection() {
  return (
    <section className="yb-section yb-moment-section">
      <div className="container">
        <div className="yb-moment-shell">
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
              className="yb-btn yb-btn-pink"
              href="https://www.instagram.com/_crochet.by.shruti_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow the charm
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="yb-moment-grid">
            {moments.map(({ title, description }) => (
              <div key={title} className="yb-moment-card">
                <div className="yb-moment-art" aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
