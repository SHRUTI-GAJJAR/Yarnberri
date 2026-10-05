import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BrandCTA() {
  return (
    <section className="yb-section yb-cta-section">
      <div className="container">
        <div className="yb-cta-shell">
          <div className="yb-cta-text">
            <div className="yb-eyebrow">
              <Sparkles size={14} />
              Something cute is waiting
            </div>
            <h2>Find your next favorite handmade piece.</h2>
          </div>

          <Link to="/shop" className="yb-btn yb-btn-primary">
            Explore Yarnberri
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
