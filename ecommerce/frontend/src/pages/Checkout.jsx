import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreditCard, MapPin, Package, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './Checkout.module.css';

const STEPS = ['Shipping', 'Payment', 'Review'];

const initialAddress = {
  street: '', city: '', state: '', zip: '', country: 'US',
};

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(
    user?.addresses?.find(a => a.isDefault) || initialAddress
  );
  const [payment, setPayment] = useState({
    method: 'stripe',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/26',
    cvv: '123',
    name: user?.name || '',
  });
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal > 75 ? 0 : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) return;

    setPlacing(true);
    try {
      const items = cart.items.map((item) => ({
        product: typeof item.product === 'object' ? item.product._id : item.product,
        quantity: item.quantity,
      }));

      const { data } = await api.post('/orders', {
        items,
        shippingAddress: address,
        paymentMethod: payment.method,
      });

      // Simulate payment success then mark paid
      await api.put(`/orders/${data.order._id}/pay`, {
        paymentResult: {
          id: `sim_${Date.now()}`,
          status: 'succeeded',
          email: user.email,
        },
      });

      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const isAddressValid = address.street && address.city && address.state && address.zip;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Checkout</h1>

        {/* Step Indicator */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepCircle} ${i < step ? styles.stepDone : i === step ? styles.stepActive : ''}`}>
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <MapPin size={18} />
                  <h2>Shipping Address</h2>
                </div>
                <div className={styles.form}>
                  <div className={styles.formFull}>
                    <label className={styles.label}>Street address</label>
                    <input
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      placeholder="123 Main St, Apt 4B"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div>
                      <label className={styles.label}>City</label>
                      <input name="city" value={address.city} onChange={handleAddressChange} placeholder="New York" className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>State</label>
                      <input name="state" value={address.state} onChange={handleAddressChange} placeholder="NY" className={styles.input} />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div>
                      <label className={styles.label}>ZIP code</label>
                      <input name="zip" value={address.zip} onChange={handleAddressChange} placeholder="10001" className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>Country</label>
                      <select name="country" value={address.country} onChange={handleAddressChange} className={styles.input}>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!isAddressValid}
                  className={styles.nextBtn}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <CreditCard size={18} />
                  <h2>Payment Details</h2>
                </div>
                <div className={styles.stripeBanner}>
                  🔒 Secured by Stripe · Test mode: use card 4242 4242 4242 4242
                </div>
                <div className={styles.form}>
                  <div className={styles.formFull}>
                    <label className={styles.label}>Cardholder name</label>
                    <input
                      value={payment.name}
                      onChange={(e) => setPayment({ ...payment, name: e.target.value })}
                      placeholder="Jane Doe"
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formFull}>
                    <label className={styles.label}>Card number</label>
                    <input
                      value={payment.cardNumber}
                      onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      className={styles.input}
                      maxLength={19}
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div>
                      <label className={styles.label}>Expiry (MM/YY)</label>
                      <input
                        value={payment.expiry}
                        onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                        placeholder="12/26"
                        className={styles.input}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className={styles.label}>CVV</label>
                      <input
                        value={payment.cvv}
                        onChange={(e) => setPayment({ ...payment, cvv: e.target.value })}
                        placeholder="123"
                        className={styles.input}
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.btnRow}>
                  <button onClick={() => setStep(0)} className={styles.backBtn}>← Back</button>
                  <button onClick={() => setStep(2)} className={styles.nextBtn} style={{ flex: 1 }}>
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <Package size={18} />
                  <h2>Review your order</h2>
                </div>

                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewSubtitle}>Shipping to</h3>
                  <p className={styles.reviewText}>
                    {address.street}, {address.city}, {address.state} {address.zip}, {address.country}
                  </p>
                </div>

                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewSubtitle}>Items ({cart.items.length})</h3>
                  {cart.items.map((item) => {
                    const product = item.product;
                    const name = product?.name || 'Product';
                    const price = product?.price || item.price;
                    const img = product?.images?.[0];
                    return (
                      <div key={typeof product === 'object' ? product?._id : product} className={styles.reviewItem}>
                        {img && <img src={img} alt={name} className={styles.reviewItemImg} />}
                        <div>
                          <p className={styles.reviewItemName}>{name}</p>
                          <p className={styles.reviewItemQty}>Qty: {item.quantity} × ${price?.toFixed(2)}</p>
                        </div>
                        <span className={styles.reviewItemTotal}>${(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.btnRow}>
                  <button onClick={() => setStep(1)} className={styles.backBtn}>← Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className={styles.placeBtn}
                  >
                    {placing ? 'Placing order…' : `Place Order · $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Order Summary</h3>
            <div className={styles.sidebarItems}>
              {cart.items.map((item) => {
                const product = item.product;
                const price = product?.price || item.price;
                const name = product?.name || 'Product';
                return (
                  <div key={typeof product === 'object' ? product?._id : product} className={styles.sidebarItem}>
                    <span className={styles.sidebarItemName}>{name} <span className={styles.sidebarQty}>×{item.quantity}</span></span>
                    <span>${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.sidebarLines}>
              <div className={styles.sidebarLine}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className={styles.sidebarLine}><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
              <div className={styles.sidebarLine}><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            </div>
            <div className={styles.sidebarTotal}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
