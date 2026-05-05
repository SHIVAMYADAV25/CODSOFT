import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.split}>
        <div className={styles.visual}>
          <div className={styles.visualContent}>
            <span className={styles.logoMark}>◈</span>
            <h2 className={styles.visualTitle}>Welcome back to Terroir</h2>
            <p className={styles.visualSub}>Objects made well, for living well.</p>
          </div>
        </div>

        <div className={styles.formSide}>
          <div className={styles.formWrap}>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.sub}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.link}>Create one</Link>
            </p>

            <div className={styles.demoBox}>
              <p className={styles.demoTitle}>Demo credentials</p>
              <p>User: <code>jane@example.com</code> / <code>user123</code></p>
              <p>Admin: <code>admin@shop.com</code> / <code>admin123</code></p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={styles.input}
                  required
                  autoComplete="email"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <div className={styles.pwdWrap}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className={styles.input}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
