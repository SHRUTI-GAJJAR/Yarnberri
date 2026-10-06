import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Closing call to action.
 *
 * Kept as a single soft panel rather than a full-bleed banner. The page already
 * ends on a busy three-column footer, so this sits above it as one warm card
 * with a lot of breathing room - the eye lands, rests, and then moves down into
 * the footer instead of being hit by a second dense block.
 *
 * The decorative dots and the yarn squiggle are CSS backgrounds on pseudo
 * elements. No image assets, so nothing here costs a request, and both sit
 * behind the content (`z-index: 0`) so they can never intercept a click on the
 * button.
 */
export default function BrandCTA() {
  return (
    <section className="yb-section yb-cta-section">
      <div className="container">
        <div className="yb-cta-shell">
          <span className="yb-cta-dots" aria-hidden="true" />
          <span className="yb-cta-yarn" aria-hidden="true" />

          <div className="yb-cta-text">
            <div className="yb-eyebrow">
              <Sparkles size={14} />
              Something cute is waiting
            </div>
            <h2>Find your next favorite handmade piece.</h2>
          </div>

          <Link to="/shop" className="yb-btn yb-btn-primary yb-cta-button">
            Explore Yarnberri
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}