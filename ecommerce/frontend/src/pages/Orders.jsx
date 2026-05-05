import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import styles from './Orders.module.css';

const STATUS_COLOR = {
  pending: 'var(--sand)',
  processing: 'var(--bark)',
  shipped: 'var(--sage)',
  delivered: '#4a7c59',
  cancelled: 'var(--ember)',
  refunded: 'var(--ash)',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`);
      setOrders(orders.map(o => o._id === orderId ? data.order : o));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not cancel order');
    }
  };

  if (loading) return <div className={styles.loading}>Loading orders…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={44} strokeWidth={1} />
            <p className={styles.emptyTitle}>No orders yet</p>
            <p className={styles.emptySub}>When you place orders, they'll appear here</p>
            <Link to="/shop" className={styles.shopBtn}>Start shopping</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHead}>
                  <div>
                    <span className={styles.orderNum}>{order.orderNumber}</span>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className={styles.orderHeadRight}>
                    <span
                      className={styles.statusBadge}
                      style={{ background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status] }}
                    >
                      {order.status}
                    </span>
                    <span className={styles.orderTotal}>${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.items?.slice(0, 3).map((item) => (
                    <div key={item._id} className={styles.orderItem}>
                      {item.image && <img src={item.image} alt={item.name} className={styles.itemImg} />}
                      <div>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>Qty {item.quantity} · ${item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className={styles.moreItems}>+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderActions}>
                    {['pending', 'processing'].includes(order.status) && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        className={styles.cancelBtn}
                      >
                        <X size={13} /> Cancel
                      </button>
                    )}
                  </div>
                  <Link to={`/orders`} className={styles.detailLink}>
                    View details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
