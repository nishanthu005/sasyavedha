import React, { useState } from 'react';
import { FiLogIn, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Login({ onSwitchToSignup }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.identifier.trim() || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.identifier.trim(), formData.password);
    if (!result.success) setError(result.error || 'Login failed. Please try again.');
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '34px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <FiUserCheck size={34} color="var(--text)" />
          <h1 style={{ color: 'var(--text)', margin: '12px 0 8px', fontSize: '28px', fontWeight: 800 }}>SasyaVedha</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Smart Farming Assistant</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label>Email or Username</label>
            <input
              className="input"
              style={{ width: '100%' }}
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your email or username"
              autoComplete="username"
            />
          </div>
          <div>
            <label>Password</label>
            <input
              className="input"
              style={{ width: '100%' }}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="soft-row" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>{error}</div>}

          <button type="submit" className="btn btn-blue" disabled={isSubmitting}>
            <FiLogIn /> {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Don&apos;t have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            Sign up
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', marginTop: '20px' }}>
          <div>Final Year AI Project</div>
          <div style={{ marginTop: '5px' }}>React + Flask + Machine Learning</div>
        </div>
      </div>
    </div>
  );
}
