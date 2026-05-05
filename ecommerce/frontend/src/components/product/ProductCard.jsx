import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(
    user?.wishlist?.includes(product._id)
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in to add items to cart'); return; }
    try {
      setAdding(true);
      await addItem(product._id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        {discount > 0 && <span className={styles.badge}>−{discount}%</span>}
        {product.stock === 0 && <span className={styles.outBadge}>Sold Out</span>}

        <div className={styles.overlay}>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={styles.addBtn}
          >
            <ShoppingBag size={14} />
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.meta}>
          <span className={styles.category}>{product.category}</span>
          {product.rating?.count > 0 && (
            <span className={styles.rating}>
              <Star size={11} fill="currentColor" />
              {product.rating.average}
            </span>
          )}
        </div>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.pricing}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className={styles.original}>${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
