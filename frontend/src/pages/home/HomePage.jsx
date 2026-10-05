import { Link } from 'react-router-dom';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import WhyYarnberri from '../../components/home/WhyYarnberri';
import BrandMomentSection from '../../components/home/BrandMomentSection';
import BrandCTA from '../../components/home/BrandCTA';

const INSTAGRAM_URL = 'https://www.instagram.com/_yarnberri_/';
const WHATSAPP_NUMBER = '';
// TODO: Replace this placeholder with the real Yarnberri WhatsApp number when available.
const WHATSAPP_URL = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : '#';

export default function HomePage() {
  const handleWhatsAppClick = (event) => {
    if (!WHATSAPP_NUMBER) {
      event.preventDefault();
    }
  };

  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <WhyYarnberri />
      <BrandMomentSection />
      <BrandCTA />

      <footer className="yb-home-footer">
        <div className="container">
          <div className="yb-home-footer-inner">
            <div className="yb-footer-brand">
              <img src="/images/logo/yarnberri-logo.png" alt="Yarnberri logo" />
              <p>Little stitches, thoughtful gifts, and everyday joy, made by hand with love.</p>
            </div>

            <div className="yb-footer-column">
              <h3>Shop</h3>
              <Link to="/shop">Shop</Link>
              <Link to="/shop">New arrivals</Link>
              <Link to="/shop">Handmade favourites</Link>
            </div>

            <div className="yb-footer-column">
              <h3>Help</h3>
              <Link to="/account">Contact</Link>
              <Link to="/orders">Shipping &amp; orders</Link>
            </div>

            <div className="yb-footer-column">
              <h3>Connect</h3>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Yarnberri Instagram">
                <FaInstagram />
                <span>Instagram</span>
              </a>
              <a
                href={WHATSAPP_NUMBER ? WHATSAPP_URL : undefined}
                target={WHATSAPP_NUMBER ? '_blank' : undefined}
                rel={WHATSAPP_NUMBER ? 'noopener noreferrer' : undefined}
                aria-label="Yarnberri WhatsApp"
                aria-disabled={!WHATSAPP_NUMBER}
                onClick={handleWhatsAppClick}
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="yb-footer-bottom">
            <span>© 2026 Yarnberri</span>
            <span>Made with tiny stitches, thoughtful hands, and lots of love.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
