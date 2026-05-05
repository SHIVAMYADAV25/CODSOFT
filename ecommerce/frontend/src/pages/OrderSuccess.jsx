import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error);
  }, [id]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.icon}><CheckCircle size={56} strokeWidth={1.5} /></div>
        <h1 className={styles.title}>Order confirmed!</h1>
        <p className={styles.sub}>
          Thank you for your order. We'll send you a confirmation shortly.
        </p>

        {order && (
          <div className={styles.card}>
            <div className={styles.orderMeta}>
              <div>
                <span className={styles.metaLabel}>Order number</span>
                <span className={styles.metaValue}>{order.orderNumber}</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Total</span>
                <span className={styles.metaValue}>${order.total?.toFixed(2)}</span>
              </div>
              <div>
                <span className={styles.metaLabel}>Status</span>
                <span className={`${styles.metaValue} ${styles.statusBadge}`}>{order.status}</span>
              </div>
            </div>

            <div className={styles.items}>
              {order.items?.map((item) => (
                <div key={item._id} className={styles.item}>
                  {item.image && <img src={item.image} alt={item.name} className={styles.itemImg} />}
                  <div>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemDetails}>Qty {item.quantity} · ${item.price?.toFixed(2)} each</p>
                  </div>
                  <span className={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className={styles.shipping}>
              <Package size={15} />
              <span>
                Shipping to: {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
              </span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <Link to="/orders" className={styles.ordersBtn}>
            View all orders <ArrowRight size={15} />
          </Link>
          <Link to="/shop" className={styles.shopBtn}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
