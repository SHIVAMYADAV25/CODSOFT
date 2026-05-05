import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, Shield, Leaf } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import styles from './Home.module.css';

const CATEGORIES = [
  { label: 'Lighting', slug: 'lighting', emoji: '💡', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { label: 'Kitchen', slug: 'kitchen', emoji: '☕', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
  { label: 'Decor', slug: 'home-decor', emoji: '🏺', img: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=400' },
  { label: 'Textiles', slug: 'textiles', emoji: '🧣', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Thoughtfully curated</p>
          <h1 className={styles.heroTitle}>
            Objects that<br />
            <em>age gracefully</em>
          </h1>
          <p className={styles.heroSub}>
            Handcrafted goods for the considered home. Each piece selected for longevity, not trend.
          </p>
          <div className={styles.heroCta}>
            <Link to="/shop" className={styles.btnPrimary}>
              Explore Collection <ArrowRight size={16} />
            </Link>
            <Link to="/shop?featured=true" className={styles.btnGhost}>
              Featured pieces
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroImgFrame}>
            <img
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"
              alt="Curated home objects"
              className={styles.heroImg}
            />
          </div>
          <div className={styles.heroDeco1} />
          <div className={styles.heroDeco2} />
        </div>
      </section>

      {/* Category Strip */}
      <section className={styles.categories}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Browse by category</h2>
          <div className={styles.catGrid}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className={styles.catCard}>
                <img src={cat.img} alt={cat.label} className={styles.catImg} />
                <div className={styles.catOverlay}>
                  <span className={styles.catLabel}>{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featured}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Featured pieces</h2>
              <p className={styles.sectionSub}>Editors' picks from our current collection</p>
            </div>
            <Link to="/shop" className={styles.viewAll}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : (
            <div className={styles.productGrid}>
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>Every piece is a commitment</h2>
          <p className={styles.bannerText}>
            We only stock things we'd buy ourselves. No fast furniture. No throwaway objects.
            Just materials that develop character with time.
          </p>
          <Link to="/shop" className={styles.bannerBtn}>Start browsing</Link>
        </div>
      </section>

      {/* Value Props */}
      <section className={styles.values}>
        <div className={styles.container}>
          <div className={styles.valuesGrid}>
            {[
              { icon: <Truck size={22} />, title: 'Free shipping', text: 'On all orders over $75' },
              { icon: <RefreshCw size={22} />, title: '30-day returns', text: 'No questions asked' },
              { icon: <Shield size={22} />, title: 'Secure checkout', text: 'Stripe encrypted payments' },
              { icon: <Leaf size={22} />, title: 'Ethical sourcing', text: 'Materials we stand behind' },
            ].map((v) => (
              <div key={v.title} className={styles.valueProp}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <div>
                  <h4 className={styles.valueTitle}>{v.title}</h4>
                  <p className={styles.valueText}>{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
