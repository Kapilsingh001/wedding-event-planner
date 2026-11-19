import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../services/api';
import { registerSchema } from './authSchemas';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm: '',
    },
  });

  async function onSubmit(formData) {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data: existing } = await api.get('/users', {
        params: { email: formData.email.trim() },
      });
      if (existing && existing.length > 0) {
        setError('This email is already registered.');
        setLoading(false);
        return;
      }
      await api.post('/users', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      setError('Cannot reach the server. Is JSON Server running on port 3001?');
    } finally {
      setLoading(false);
    }
  }

  const EyeIcon = ({ visible }) =>
    visible ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>Create <span>Account</span></h1>
          <p className="auth-subtitle">Join us to start planning your perfect event</p>
        </div>

        <div className="auth-divider">✦</div>

        {/* Alerts */}
        {error && (
          <div className="auth-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="auth-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="name">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input
                id="name"
                type="text"
                {...register('name')}
                placeholder="Your full name"
              />
            </div>
            {errors.name && (
              <span className="auth-field-error" style={{ color: '#c0392b', fontSize: '12px', marginTop: '4px' }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <span className="auth-field-error" style={{ color: '#c0392b', fontSize: '12px', marginTop: '4px' }}>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Minimum 6 characters"
              />
              <button type="button" className="auth-eye" onClick={() => setShowPassword((p) => !p)} aria-label="Toggle password">
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {errors.password && (
              <span className="auth-field-error" style={{ color: '#c0392b', fontSize: '12px', marginTop: '4px' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                {...register('confirm')}
                placeholder="Repeat your password"
              />
              <button type="button" className="auth-eye" onClick={() => setShowConfirm((p) => !p)} aria-label="Toggle confirm password">
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
            {errors.confirm && (
              <span className="auth-field-error" style={{ color: '#c0392b', fontSize: '12px', marginTop: '4px' }}>
                {errors.confirm.message}
              </span>
            )}
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-btn-spinner" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
