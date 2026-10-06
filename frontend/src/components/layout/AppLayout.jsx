import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import LogoutDialog from "../common/LogoutDialog";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Orders", to: "/orders" },
];

const SEARCH_FIELD_ID = "yb-navbar-search-input";

// Hover-capable devices already expand the field on hover/focus. Touch
// layouts have no hover, so those are the only ones that need search mode.
function usePrefersHover() {
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");

    const syncPreference = () => setCanHover(query.matches);

    syncPreference();
    query.addEventListener("change", syncPreference);

    return () => query.removeEventListener("change", syncPreference);
  }, []);

  return canHover;
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const canHover = usePrefersHover();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navbarSearch, setNavbarSearch] = useState("");
  const searchInputRef = useRef(null);
  const searchButtonRef = useRef(null);
  const restoreFocusRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    setSearchOpen(false);
    setNavbarSearch("");
  }, [location.pathname, location.search]);

  // Focus moves after React has committed the new DOM, otherwise the target
  // ref can still be null on the frame the request is scheduled.
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
      return;
    }

    if (restoreFocusRef.current) {
      restoreFocusRef.current = false;
      searchButtonRef.current?.focus();
    }
  }, [searchOpen]);

  // On hover-capable devices the field is already revealed by
  // :focus-within, so no mode class is applied and the navbar looks
  // identical before and after. Touch layouts switch to explicit mode.
  const openSearch = () => {
    if (canHover) {
      searchInputRef.current?.focus();
      return;
    }

    setSearchOpen(true);
  };

  // Dismissing also drops the query. Leaving it behind would keep
  // `data-has-value` set, which on touch would strand an expanded field in a
  // navbar row that has already given its space back to the icon actions.
  const closeSearch = ({ restoreFocus = true } = {}) => {
    restoreFocusRef.current = restoreFocus;
    setNavbarSearch("");
    setSearchOpen(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = navbarSearch.trim();

    if (!query) {
      openSearch();
      return;
    }

    navigate(`/shop?${new URLSearchParams({ search: query }).toString()}`);
    setMobileOpen(false);
    closeSearch({ restoreFocus: false });
  };

  // While the field is empty the magnifier toggles search mode instead of
  // submitting. With text in place it falls through to a normal submit so
  // the existing desktop behaviour is untouched.
  const handleSearchButtonClick = (event) => {
    if (navbarSearch.trim()) return;

    event.preventDefault();
    openSearch();
  };

  const handleSearchKeyDown = (event) => {
    if (event.key !== "Escape") return;

    event.preventDefault();

    if (searchOpen) {
      // Touch: closeSearch clears the query too.
      closeSearch();
      return;
    }

    // Desktop: drop focus to release :focus-within, and clear so no stale
    // text keeps the group expanded.
    setNavbarSearch("");

    // Desktop path: the group is revealed by :focus-within, so dropping
    // focus is what collapses it back to the resting icon.
    searchInputRef.current?.blur();
  };

  const handleClearSearch = () => {
    setNavbarSearch("");
    searchInputRef.current?.focus();
  };

  // The magnifier doubles as the close control while search mode is open, and
  // it is the form's submit button. `preventDefault` matters here: without it
  // the click's default submit action fires against the re-rendered form,
  // `handleSearchSubmit` sees an empty query and calls `openSearch()`, so the
  // field closes and immediately reopens.
  const handleSearchCloseClick = (event) => {
    event.preventDefault();
    closeSearch();
  };

  return (
    <div className={`yb-page ${isHomePage ? "yb-home-page" : ""}`}>
      {/* ================= HEADER ================= */}
      <header className={`yb-header${searchOpen ? " yb-header-search-mode" : ""}`}>
        <div className="container">
          <div className="yb-header-inner">
            {/* Logo */}
            <Link
              to="/"
              className="yb-logo"
              onClick={() => setMobileOpen(false)}
              aria-label="Yarnberri home"
            >
              <img
                src="/images/logo/yarnberri-logo.png"
                alt="Yarnberri"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="yb-desktop-nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `yb-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="yb-header-actions">
              {/* shadcn/ui Button Group, Yarnberri skin. The magnifier opens
                  search mode on touch layouts and submits once the field has
                  text; the trailing X clears the field. */}
              <form
                className="yarnberri-search-navbar"
                onSubmit={handleSearchSubmit}
                role="search"
              >
                <ButtonGroup
                  className="yarnberri-search-navbar-group"
                  data-open={searchOpen ? "true" : "false"}
                  data-has-value={navbarSearch.trim() ? "true" : "false"}
                  aria-label="Search products"
                >
                  <Button
                    ref={searchOpen ? undefined : searchButtonRef}
                    type={searchOpen ? "button" : "submit"}
                    className="yarnberri-search-btn-lead"
                    onClick={searchOpen ? handleSearchCloseClick : handleSearchButtonClick}
                    aria-label={searchOpen ? "Close search" : "Search products"}
                    aria-expanded={searchOpen}
                    aria-controls={SEARCH_FIELD_ID}
                    title={searchOpen ? "Close search" : "Search products"}
                  >
                    {searchOpen ? (
                      <ArrowLeft size={18} strokeWidth={1.8} />
                    ) : (
                      <Search size={19} strokeWidth={1.8} />
                    )}
                  </Button>

                  <Input
                    id={SEARCH_FIELD_ID}
                    ref={searchInputRef}
                    type="search"
                    enterKeyHint="search"
                    aria-label="Search products"
                    placeholder="Search products"
                    value={navbarSearch}
                    onChange={(event) => setNavbarSearch(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />

                  {/* Kept in the layout at all times so the field does not
                      change width as soon as text appears; `visibility`
                      removes it from tab order until it is actionable. */}
                  <Button
                    type="button"
                    className="yarnberri-search-btn-clear"
                    onClick={handleClearSearch}
                    disabled={!navbarSearch.trim()}
                    data-hidden={navbarSearch.trim() ? undefined : "true"}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X size={16} strokeWidth={2} />
                  </Button>
                </ButtonGroup>
              </form>

              <Link
                to="/cart"
                className="yb-icon-btn yb-cart-btn yb-nav-action yb-nav-action-expand"
                aria-label={`Cart with ${totalItems} items`}
              >
                <ShoppingCart size={19} strokeWidth={1.8} />
                <span className="yb-nav-action-label" aria-hidden="true">Cart</span>

                {totalItems > 0 && (
                  <span key={totalItems} className="yb-cart-badge" aria-hidden="true">{totalItems}</span>
                )}
              </Link>

              <Link
                to="/wishlist"
                className="yb-icon-btn yb-nav-action yb-nav-action-expand yb-wishlist-btn"
                aria-label={`Wishlist${wishlistCount ? ` with ${wishlistCount} saved products` : ""}`}
              >
                <Heart size={19} strokeWidth={1.8} fill={wishlistCount > 0 ? "currentColor" : "none"} />
                <span className="yb-nav-action-label" aria-hidden="true">Wishlist</span>
                {wishlistCount > 0 && (
                  <span key={wishlistCount} className="yb-cart-badge yb-wishlist-badge" aria-hidden="true">{wishlistCount}</span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to="/account" className="yb-account-btn">
                    <User size={17} strokeWidth={1.8} />
                    <span>{user.name || "Account"}</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link to="/admin" className="yb-admin-btn">
                      Admin
                    </Link>
                  )}

                  <LogoutDialog>
                    {/* The caller supplies the trigger so the same dialog can
                        also be opened from the mobile menu, where there is no
                        room for an icon button. */}
                    <button
                      type="button"
                      className="yb-logout-btn"
                      aria-label="Sign out"
                    >
                      <LogOut size={17} />
                    </button>
                  </LogoutDialog>
                </>
              ) : (
                <Link to="/login" className="yb-login-btn" aria-label="Sign in">
                  <ShoppingBag size={17} strokeWidth={1.8} />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu */}
              <button
                type="button"
                className="yb-mobile-menu-btn"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X size={21} />
                ) : (
                  <Menu size={21} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileOpen && (
            <div className="yb-mobile-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `yb-mobile-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="yb-mobile-nav-link"
              >
                Wishlist
              </Link>

              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="yb-mobile-nav-link"
              >
                Cart
              </Link>

              {user && (
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="yb-mobile-nav-link"
                >
                  My Account
                </Link>
              )}

              {/* Admin is also hidden from the header below 992px, so without
                  this row an admin has no way into the workspace on a phone. */}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="yb-mobile-nav-link"
                >
                  Admin workspace
                </Link>
              )}

              {/* The sign-out row. The header's logout button is `display:
                  none` below 992px, and this menu previously had no
                  substitute, so on a phone a signed-in user could not sign out
                  at all. `onSignedOut` closes the menu only AFTER the sign-out,
                  so the panel never lingers over a signed-in header. */}
              {user && (
                <LogoutDialog onSignedOut={() => setMobileOpen(false)}>
                  <button type="button" className="yb-mobile-signout">
                    <LogOut size={17} strokeWidth={1.8} />
                    Sign out
                  </button>
                </LogoutDialog>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Home page divider only */}
      {isHomePage && <div className="yb-yarn-divider" aria-hidden="true" />}

      {/* ================= PAGE CONTENT ================= */}
      <main>{children}</main>
    </div>
  );
}