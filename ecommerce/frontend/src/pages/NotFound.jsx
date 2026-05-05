import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className={styles.homeBtn}>Go home</Link>
    </div>
  );
}
