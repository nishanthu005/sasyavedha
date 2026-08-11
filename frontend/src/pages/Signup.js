import React, { useState } from 'react';
import { FiUserCheck, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Signup({ onSwitchToLogin }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
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

    const { username, email, password, confirmPassword } = formData;

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(username.trim(), email.trim(), password);
    if (!result.success) setError(result.error || 'Signup failed. Please try again.');
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '34px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <FiUserCheck size={34} color="var(--text)" />
          <h1 style={{ color: 'var(--text)', margin: '12px 0 8px', fontSize: '28px', fontWeight: 800 }}>SasyaVedha</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label>Username</label>
            <input
              className="input"
              style={{ width: '100%' }}
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
            />
          </div>
          <div>
            <label>Email Address</label>
            <input
              className="input"
              style={{ width: '100%' }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label>Confirm Password</label>
            <input
              className="input"
              style={{ width: '100%' }}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {error && <div className="soft-row" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>{error}</div>}

          <button type="submit" className="btn btn-blue" disabled={isSubmitting}>
            <FiUserPlus /> {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            Sign in
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
