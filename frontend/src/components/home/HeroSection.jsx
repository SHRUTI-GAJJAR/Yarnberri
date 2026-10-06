import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Flower2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AUTOPLAY_DELAY = 4500;

// TODO: Replace temporary hero images with final Yarnberri artwork/product photography.
const heroSlides = [
  {
    src: '/images/home-slides/slide-1-brand.png',
    alt: 'Crocheted floral art arranged on soft pastel fabric',
    caption: 'Little flowers, made by hand',
  },
  {
    src: '/images/home-slides/slide-2-flowers.png',
    alt: 'Soft pink yarn and a crochet hook on a cozy couch',
    caption: 'Soft yarn, ready for a new stitch',
  },
  {
    src: '/images/home-slides/slide-3-gifts.png',
    alt: 'Hands crocheting with soft white yarn',
    caption: 'Made slowly, stitch by stitch',
  },
];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncPreference = () => setPrefersReducedMotion(query.matches);

    syncPreference();
    query.addEventListener('change', syncPreference);

    return () => query.removeEventListener('change', syncPreference);
  }, []);

  return prefersReducedMotion;
}

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const currentSlideIndex = activeIndex % heroSlides.length;
  const currentSlide = heroSlides[currentSlideIndex];

  const goToSlide = useCallback((index) => {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  }, []);

  // The countdown is keyed to the active slide, so manual navigation always
  // gets a full interval before the carousel advances on its own.
  useEffect(() => {
    if (prefersReducedMotion || isPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, isPaused, prefersReducedMotion]);

  const pauseAutoplay = () => setIsPaused(true);
  const resumeAutoplay = () => setIsPaused(false);

  const showProgress = !prefersReducedMotion && !isPaused;

  return (
    /* ART DIRECTION
       -------------
       The hero is a two-column editorial spread: the copy sits in a
       narrower left rail and the carousel occupies a wider right column.

       The copy used to be centred in a 760px box under a full-bleed band,
       which left roughly 280px of dead space on either side at 1440px and
       read as a generic centred landing page. Left-aligning it against a
       shared rail - so the eyebrow, headline and plate all start on the
       same line - is what makes the composition feel deliberate.

       `.yb-hero-intro` is the grid itself and carries the rail as a margin,
       replacing the old `.container`. A Bootstrap container centres itself
       at a fixed max-width, so the plate could never have shared an edge
       with the headline; owning the rail here is what keeps them aligned at
       every breakpoint.

       DOM order is plate -> copy -> values so that on narrow screens, where
       this collapses to a single column, the reading order matches the
       visual order. On wide screens the copy moves to the left column and
       the plate to the right. */
    <section className="yb-home-hero">
      {/* `container` is what aligns this hero with the sections below: the
          category section's left edge is set by Bootstrap's container
          max-width stepping (1280 / 1140 / 960 / 720) plus its own shell
          padding, so it moves in jumps as the viewport resizes. Inheriting
          the same class makes the two left edges identical at every width,
          which a `vw` formula could only ever approximate. */}
      <div className="container yb-hero-shell">
        <div className="yb-hero-stage">
          <div
            className="yb-hero-visual"
            aria-label="Handmade crochet and gifting inspiration"
            onMouseEnter={pauseAutoplay}
            onMouseLeave={resumeAutoplay}
            onFocusCapture={pauseAutoplay}
            onBlurCapture={resumeAutoplay}
          >
            <Flower2 className="yb-hero-flower" size={25} aria-hidden="true" />

            <div
              className="yb-hero-slider"
              role="region"
              aria-roledescription="carousel"
              aria-label="Featured Yarnberri imagery"
            >
              {/* A real track: the slides sit side by side and the track is
                  translated one slide-width at a time. Percentage offsets are
                  relative to the TRACK's own width, which is exactly one slide,
                  so `-${index * 100}%` advances precisely one slide. */}
              <div
                className="yb-hero-track"
                style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
              >
                {heroSlides.map((slide, index) => (
                  <div
                    key={slide.src}
                    className={`yb-hero-slide ${index === currentSlideIndex ? 'active' : ''}`}
                    aria-hidden={index !== currentSlideIndex}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${heroSlides.length}`}
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      /* All three are `eager`. In the old crossfade the
                         offscreen slides were stacked and invisible, so
                         `lazy` was safe. In a track they sit just off to
                         the side of the viewport, which is close enough
                         that a lazy image can still be blank when the
                         slide animates in. Three images is not worth
                         deferring - and the first is the LCP element. */
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              {/* Keeps the caption readable over pale, busy photography. */}
              <div className="yb-hero-scrim" aria-hidden="true" />

              <button
                type="button"
                className="yb-slider-button yb-slider-prev"
                onClick={() => goToSlide(currentSlideIndex - 1)}
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="yb-slider-button yb-slider-next"
                onClick={() => goToSlide(currentSlideIndex + 1)}
                aria-label="Next slide"
              >
                <ChevronRight size={18} />
              </button>

              <div className="yb-slider-dots" aria-label="Slide navigation">
                {heroSlides.map((slide, index) => (
                  <button
                    key={`${slide.alt}-dot`}
                    type="button"
                    className={`yb-slider-dot ${index === currentSlideIndex ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Show slide ${index + 1}: ${slide.caption}`}
                    aria-current={index === currentSlideIndex ? 'true' : undefined}
                  />
                ))}
              </div>

              <div className="yb-hero-caption" aria-live="polite">
                <span className="yb-hero-caption-count">
                  {String(currentSlideIndex + 1).padStart(2, '0')}
                  <span aria-hidden="true"> / </span>
                  {String(heroSlides.length).padStart(2, '0')}
                </span>
                <span className="yb-hero-caption-text">{currentSlide.caption}</span>
              </div>

              {showProgress && (
                <span className="yb-hero-progress" key={currentSlideIndex} aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        <div className="yb-hero-lead">
          <div className="yb-eyebrow">
            <Sparkles size={14} />
            Handmade crochet boutique
          </div>

          <h1 className="yb-hero-title">
            Little handmade things,
            <span>made to make you smile.</span>
          </h1>

          <p className="yb-hero-copy">
            Small-batch crochet keepsakes and thoughtful gifts, made slowly to bring a little
            handmade joy to everyday moments.
          </p>

          <div className="yb-hero-actions">
            <Link to="/shop" className="yb-btn yb-btn-primary">
              Shop the collection
              <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="yb-btn yb-btn-outline">
              Discover handmade
            </Link>
          </div>
        </div>

        <ul className="yb-hero-meta">
          <li>
            <strong>Handmade</strong> with love
          </li>
          <li>
            <strong>Gift-ready</strong> pieces
          </li>
          <li>
            <strong>Soft</strong> crochet charm
          </li>
        </ul>
      </div>
    </section>
  );
}
