import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useWishlist } from '../../context/WishlistContext';

export default function WishlistButton({ product, className = '', onClick }) {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const pulseTimer = useRef(null);
  const productId = product?._id || product?.id;
  const isSaved = Boolean(productId && isInWishlist(productId));

  useEffect(() => () => window.clearTimeout(pulseTimer.current), []);

  const handleClick = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.(event);

    if (!productId) return;
    if (!user) {
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    setSaving(true);
    setJustSaved(false);
    try {
      await toggleWishlist(productId);
      if (!isSaved) {
        setJustSaved(true);
        window.clearTimeout(pulseTimer.current);
        pulseTimer.current = window.setTimeout(() => setJustSaved(false), 420);
      }
      notify(
        isSaved ? 'Removed from your wishlist.' : 'Saved to your wishlist.',
        'success'
      );
    } catch (requestError) {
      notify(
        requestError?.response?.data?.message || 'Unable to update your wishlist right now.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      className={`yb-product-wishlist-button ${isSaved ? 'is-saved' : ''} ${justSaved ? 'just-saved' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isSaved}
      aria-busy={saving}
      disabled={saving || !productId}
    >
      <Heart size={19} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
