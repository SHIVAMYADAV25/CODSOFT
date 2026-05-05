import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './Cart.module.css';

export default function Cart() {
  const { cart, updateItem, removeItem, subtotal, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal > 75 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleRemove = async (productId, name) => {
    try {
      await removeItem(productId);
      toast.success(`${name} removed from cart`);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <div className={styles.loading}>Loading cart…</div>;

  if (!cart?.items?.length) {
    return (
      <div className={styles.empty}>
        <ShoppingBag size={48} strokeWidth={1} />
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptySub}>Add some pieces you love</p>
        <Link to="/shop" className={styles.shopBtn}>Explore Collection</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Cart</h1>
        <p className={styles.subtitle}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {cart.items.map((item) => {
              const product = item.product;
              const imgSrc = product?.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300';
              const name = product?.name || item.name || 'Product';
              const price = product?.price || item.price;
              const slug = product?.slug;
              const productId = typeof product === 'object' ? product?._id : product;

              return (
                <div key={productId} className={styles.item}>
                  <Link to={slug ? `/product/${slug}` : '#'} className={styles.itemImg}>
                    <img src={imgSrc} alt={name} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link to={slug ? `/product/${slug}` : '#'} className={styles.itemName}>{name}</Link>
                    <p className={styles.itemPrice}>${price?.toFixed(2)}</p>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateItem(productId, item.quantity - 1)}><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateItem(productId, item.quantity + 1)}><Plus size={13} /></button>
                    </div>
                    <span className={styles.lineTotal}>${(price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => handleRemove(productId, name)} className={styles.removeBtn}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {subtotal < 75 && (
              <p className={styles.shippingNote}>
                Add ${(75 - subtotal).toFixed(2)} more for free shipping
              </p>
            )}

            <button
              onClick={() => {
                if (!user) { navigate('/login'); return; }
                navigate('/checkout');
              }}
              className={styles.checkoutBtn}
            >
              Checkout <ArrowRight size={16} />
            </button>

            <Link to="/shop" className={styles.continueLink}>
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
