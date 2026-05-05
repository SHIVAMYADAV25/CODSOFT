import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <span>Free shipping on orders over $75</span>
      </div>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>◈</span>
            <span className={styles.logoText}>Terroir</span>
          </Link>

          {/* Desktop Links */}
          <ul className={styles.navLinks}>
            <li><Link to="/" className={isActive('/') ? styles.activeLink : styles.navLink}>Home</Link></li>
            <li><Link to="/shop" className={isActive('/shop') ? styles.activeLink : styles.navLink}>Shop</Link></li>
            <li><Link to="/shop?category=lighting" className={styles.navLink}>Lighting</Link></li>
            <li><Link to="/shop?category=kitchen" className={styles.navLink}>Kitchen</Link></li>
            <li><Link to="/shop?category=home-decor" className={styles.navLink}>Decor</Link></li>
          </ul>

          {/* Actions */}
          <div className={styles.actions}>
            {searchOpen ? (
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search products…"
                  className={styles.searchInput}
                />
                <button type="button" onClick={() => setSearchOpen(false)} className={styles.iconBtn}>
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
                <Search size={18} />
              </button>
            )}

            {user ? (
              <div className={styles.userMenu}>
                <button className={styles.iconBtn} aria-label="Account">
                  <User size={18} />
                </button>
                <div className={styles.dropdown}>
                  <div className={styles.dropdownUser}>{user.name}</div>
                  <Link to="/profile" className={styles.dropdownItem}>Profile</Link>
                  <Link to="/orders" className={styles.dropdownItem}>Orders</Link>
                  <button onClick={logout} className={styles.dropdownItem}>Sign out</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className={styles.iconBtn} aria-label="Login">
                <User size={18} />
              </Link>
            )}

            <Link to="/cart" className={styles.cartBtn} aria-label="Cart">
              <ShoppingBag size={18} />
              {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
            </Link>

            <button className={styles.mobileMenu} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={styles.mobileNav}>
            <Link to="/" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Home</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Shop All</Link>
            <Link to="/shop?category=lighting" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Lighting</Link>
            <Link to="/shop?category=kitchen" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Kitchen</Link>
            <Link to="/shop?category=home-decor" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Decor</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Profile</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Orders</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className={styles.mobileLink}>Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className={styles.mobileLink}>Sign in</Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
