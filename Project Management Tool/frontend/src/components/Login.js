import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(form);
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
          <div className="auth-illustration__title">
            <span className="auth-illustration__eyebrow">Since 2024</span>
            <h1>Manage<br /><em>everything,</em><br />simply.</h1>
          </div>
          <div className="auth-illustration__graphic">
            <div className="auth-card-demo auth-card-demo--1">
              <div className="demo-card__header">
                <div className="demo-dot" style={{ background: '#4A7C59' }} />
                <span>Design Sprint</span>
              </div>
              <div className="demo-card__progress">
                <div className="demo-progress-bar" style={{ width: '72%' }} />
              </div>
              <div className="demo-card__meta">72% complete · 8 tasks</div>
            </div>
            <div className="auth-card-demo auth-card-demo--2">
              <div className="demo-card__header">
                <div className="demo-dot" style={{ background: '#C8622A' }} />
                <span>API Integration</span>
              </div>
              <div className="demo-card__progress">
                <div className="demo-progress-bar" style={{ width: '34%' }} />
              </div>
              <div className="demo-card__meta">34% complete · 12 tasks</div>
            </div>
          </div>
          <p className="auth-illustration__desc">
            ProjectFlow brings your team's work together — projects, tasks, and deadlines in one clear view.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container fade-in">
          <div className="auth-form-header">
            <div className="auth-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7v7H3V3z" fill="#C8622A" fillOpacity="1" />
                <path d="M14 3h7v7h-7V3z" fill="#C8622A" fillOpacity="0.5" />
                <path d="M3 14h7v7H3v-7z" fill="#C8622A" fillOpacity="0.5" />
                <path d="M14 14h7v7h-7v-7z" fill="#C8622A" fillOpacity="0.2" />
              </svg>
              <span>ProjectFlow</span>
            </div>
            <h2 className="auth-form-title">Welcome back</h2>
            <p className="auth-form-subtitle">Sign in to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-form-fields">
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                error={errors.password}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg" className="auth-submit-btn">
              Sign In
            </Button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;