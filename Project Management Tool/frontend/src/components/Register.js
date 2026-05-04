import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must include uppercase, lowercase and a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration">
        <div className="auth-illustration__inner">
          <span className="auth-illustration__eyebrow">Free forever</span>
          <h1 className="auth-illustration__title">
            <h1>Your work,<br /><em>organised</em><br />at last.</h1>
          </h1>
          <div className="auth-illustration__graphic">
            {['Design System', 'Backend API', 'Launch Campaign'].map((name, i) => (
              <div key={name} className={`auth-card-demo auth-card-demo--${i + 1}`} style={{ transform: `translateX(${i * 16}px)` }}>
                <div className="demo-card__header">
                  <div className="demo-dot" style={{ background: ['#4A7C59', '#C8622A', '#9B7A2A'][i] }} />
                  <span>{name}</span>
                </div>
                <div className="demo-card__progress">
                  <div className="demo-progress-bar" style={{ width: ['90%', '45%', '20%'][i] }} />
                </div>
              </div>
            ))}
          </div>
          <p className="auth-illustration__desc">
            Join thousands of teams shipping faster with ProjectFlow.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container fade-in">
          <div className="auth-form-header">
            <div className="auth-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7v7H3V3z" fill="#C8622A" />
                <path d="M14 3h7v7h-7V3z" fill="#C8622A" fillOpacity="0.5" />
                <path d="M3 14h7v7H3v-7z" fill="#C8622A" fillOpacity="0.5" />
                <path d="M14 14h7v7h-7v-7z" fill="#C8622A" fillOpacity="0.2" />
              </svg>
              <span>ProjectFlow</span>
            </div>
            <h2 className="auth-form-title">Create account</h2>
            <p className="auth-form-subtitle">Start managing your projects today</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-fields">
              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={handleChange('name')}
                error={errors.name}
                required
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                placeholder="alex@company.com"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                hint="At least 8 characters with uppercase, lowercase, and a number"
                required
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="auth-submit-btn">
              Create Account
            </Button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;