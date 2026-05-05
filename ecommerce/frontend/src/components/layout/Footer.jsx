import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>◈</span>
          <span className={styles.logoText}>Terroir</span>
          <p className={styles.tagline}>Objects made well, for living well.</p>
        </div>
        <div className={styles.grid}>
          <div>
            <h4 className={styles.colTitle}>Shop</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=lighting">Lighting</Link></li>
              <li><Link to="/shop?category=kitchen">Kitchen</Link></li>
              <li><Link to="/shop?category=home-decor">Decor</Link></li>
              <li><Link to="/shop?category=textiles">Textiles</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={styles.colTitle}>Account</h4>
            <ul className={styles.colLinks}>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={styles.colTitle}>Info</h4>
            <ul className={styles.colLinks}>
              <li><a href="#">About</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Terroir. All rights reserved.</span>
        <span>Built with care · Stripe secured</span>
      </div>
    </footer>
  );
}
