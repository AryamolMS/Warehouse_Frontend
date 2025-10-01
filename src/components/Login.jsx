// AuthApp.js
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthApp() {
  return <Login />;
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert(`Login successful!\nEmail: ${email}`);
    }, 1500);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconCircle}>
              <Lock size={28} color="#fff" />
            </div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} color="#aaa" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={styles.input}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} color="#aaa" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                >
                  {showPassword ? <EyeOff size={18} color="#ccc" /> : <Eye size={18} color="#ccc" />}
                </button>
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={styles.footerText}>
            Don't have an account?{' '}
            <button
              type="button"
              style={{ ...styles.link, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => navigate('/registration')} // Navigate to Registration page
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #000000, #0a1a3c, #001f4d)',
    padding: 20,
  },
  container: { width: '100%', maxWidth: 400 },
  card: {
    background: '#111827',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 8px 20px rgba(0,0,0,0.7)',
    color: '#fff',
  },
  header: { textAlign: 'center', marginBottom: 20 },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'linear-gradient(to right, #0d47a1, #000000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  title: { fontSize: 24, fontWeight: 'bold', margin: 0, color: '#fff' },
  subtitle: { color: '#aaa', fontSize: 14, marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { fontSize: 14, fontWeight: 500, marginBottom: 6, color: '#ddd', display: 'block' },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' },
  input: {
    width: '100%',
    padding: '10px 36px 10px 36px',
    border: '1px solid #333',
    borderRadius: 6,
    fontSize: 14,
    outline: 'none',
    background: '#1f2937',
    color: '#fff',
    boxSizing: 'border-box',
  },
  iconButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  error: {
    background: '#3b0d0d',
    color: '#f88',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 13,
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(to right, #0d47a1, #001f4d)',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    cursor: 'pointer',
  },
  footerText: { textAlign: 'center', fontSize: 13, color: '#aaa', marginTop: 16 },
  link: { color: '#1e90ff', textDecoration: 'none', cursor: 'pointer' },
};
