import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Star, Minus, Plus, ArrowLeft, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        setActiveImg(0);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please sign in to add to cart'); return; }
    try {
      setAdding(true);
      await addItem(product._id, qty);
      toast.success(`${product.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!product) return (
    <div className={styles.loading}>
      <p>Product not found</p>
      <Link to="/shop">← Back to shop</Link>
    </div>
  );

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/shop" className={styles.back}>
          <ArrowLeft size={15} /> Back to shop
        </Link>

        <div className={styles.layout}>
          {/* Images */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              <img
                src={product.images?.[activeImg] || product.images?.[0]}
                alt={product.name}
              />
              {discount > 0 && <span className={styles.discBadge}>−{discount}%</span>}
            </div>
            {product.images?.length > 1 && (
              <div className={styles.thumbs}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.activeThumb : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.infoTop}>
              <span className={styles.category}>{product.category?.replace('-', ' ')}</span>
              {product.rating?.count > 0 && (
                <span className={styles.ratingBadge}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={i < Math.round(product.rating.average) ? 'currentColor' : 'none'} />
                  ))}
                  <span>{product.rating.average} ({product.rating.count})</span>
                </span>
              )}
            </div>

            <h1 className={styles.name}>{product.name}</h1>
            {product.brand && <p className={styles.brand}>by {product.brand}</p>}

            <div className={styles.pricing}>
              <span className={styles.price}>${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Stock */}
            <div className={styles.stock}>
              {product.stock > 10
                ? <span className={styles.inStock}>In stock</span>
                : product.stock > 0
                ? <span className={styles.lowStock}>Only {product.stock} left</span>
                : <span className={styles.outStock}>Sold out</span>
              }
            </div>

            {/* Qty + Add */}
            {product.stock > 0 && (
              <div className={styles.actions}>
                <div className={styles.qtyControl}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus size={14} /></button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={styles.addBtn}
                >
                  <ShoppingBag size={16} />
                  {adding ? 'Adding…' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Perks */}
            <div className={styles.perks}>
              <div className={styles.perk}>
                <Truck size={15} />
                <span>Free shipping over $75</span>
              </div>
              <div className={styles.perk}>
                <RefreshCw size={15} />
                <span>30-day returns</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((t) => (
                  <span key={t} className={styles.tag}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <section className={styles.reviews}>
          <h2 className={styles.reviewsTitle}>
            Reviews
            {product.rating?.count > 0 && (
              <span className={styles.reviewCount}>{product.rating.count} reviews · {product.rating.average} avg</span>
            )}
          </h2>

          {product.reviews?.length > 0 ? (
            <div className={styles.reviewList}>
              {product.reviews.map((r) => (
                <div key={r._id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewName}>{r.name}</span>
                    <span className={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill={i < r.rating ? 'currentColor' : 'none'} />
                      ))}
                    </span>
                  </div>
                  <p className={styles.reviewComment}>{r.comment}</p>
                  <span className={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noReviews}>No reviews yet. Be the first!</p>
          )}

          {user && (
            <form onSubmit={handleReview} className={styles.reviewForm}>
              <h3 className={styles.reviewFormTitle}>Leave a review</h3>
              <div className={styles.ratingSelect}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                    className={`${styles.starBtn} ${n <= reviewForm.rating ? styles.starActive : ''}`}
                  >
                    <Star size={20} fill={n <= reviewForm.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your thoughts…"
                required
                className={styles.reviewTextarea}
              />
              <button type="submit" disabled={submittingReview} className={styles.submitReview}>
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
