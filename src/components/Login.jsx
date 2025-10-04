import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function AuthApp() {
  return <Login />;
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [focusedInput, setFocusedInput] = useState('');
  const navigate = useNavigate();


 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setToast('');

  if (!email || !password) {
    setError('Please fill in all fields');
    return;
  }

  setIsLoading(true);

  try {
    // Admin credentials for frontend testing
    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin1234";

    // Check if admin is logging in
    if (email === adminEmail && password === adminPassword) {
      setToast('Admin login successful!');

      // Clear toast and navigate after 1.5s
      setTimeout(() => {
        setToast('');
        navigate('/adminhome');
      }, 1500);

      return; // Skip backend API call for admin
    }

    // Normal user login (supplier/student)
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Login failed');
    } else {
      setToast('Login successful!');
      window.supplierData = data.supplier;

      // Clear toast and navigate after 1.5s
      setTimeout(() => {
        setToast('');
        navigate('/supplierhome');
      }, 1500);
    }
  } catch (err) {
    setError('Network error. Please try again.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div style={styles.page}>
      <div style={styles.orb1}></div>
      <div style={styles.orb2}></div>
      <div style={styles.orb3}></div>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.cardGlow}></div>
          
          <div style={styles.header}>
            <div style={styles.iconCircle}>
              <Sparkles size={32} color="#fff" strokeWidth={2} />
            </div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Enter your credentials to access your account</p>
          </div>

          <div style={styles.formContainer}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{
                ...styles.inputWrapper,
                ...(focusedInput === 'email' ? styles.inputWrapperFocused : {})
              }}>
                <Mail size={20} color="#64748b" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput('')}
                  placeholder="you@example.com"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={{
                ...styles.inputWrapper,
                ...(focusedInput === 'password' ? styles.inputWrapperFocused : {})
              }}>
                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput('')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="Enter your password"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                >
                  {showPassword ? 
                    <EyeOff size={20} color="#64748b" /> : 
                    <Eye size={20} color="#64748b" />
                  }
                </button>
              </div>
            </div>

            <div style={styles.forgotPassword}>
              <a href="#" style={styles.forgotLink}>Forgot password?</a>
            </div>

            {error && (
              <div style={styles.error}>
                <span style={styles.errorIcon}>⚠</span>
                {error}
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={isLoading} 
              style={{
                ...styles.button,
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isLoading ? (
                <span style={styles.buttonLoading}>
                  <span style={styles.spinner}></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine}></span>
          </div>

          <p style={styles.footerText}>
            Don't have an account?{' '}
            <a href="#" style={styles.link}>
              Create one now
            </a>
          </p>
        </div>
      </div>

      {toast && (
        <div style={styles.toast}>
          <span style={styles.toastIcon}>✓</span>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        input:focus {
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5) !important;
        }

        button:active:not(:disabled) {
          transform: translateY(0px);
        }

        a:hover {
          color: #93c5fd !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  orb1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
    top: '-250px',
    left: '-250px',
    animation: 'float 20s infinite ease-in-out',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)',
    bottom: '-200px',
    right: '-200px',
    animation: 'float 25s infinite ease-in-out reverse',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'pulse 15s infinite ease-in-out',
    pointerEvents: 'none',
  },
  container: { 
    width: '100%', 
    maxWidth: '440px',
    position: 'relative',
    zIndex: 10,
  },
  card: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px 32px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    color: '#fff',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cardGlow: {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4))',
    borderRadius: '24px',
    opacity: 0.3,
    filter: 'blur(20px)',
    zIndex: -1,
    animation: 'glow 3s infinite ease-in-out',
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '32px',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)',
    position: 'relative',
  },
  title: { 
    fontSize: '32px', 
    fontWeight: '700', 
    margin: '0 0 8px 0', 
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  subtitle: { 
    color: '#94a3b8', 
    fontSize: '15px', 
    margin: 0,
    fontWeight: '400',
  },
  formContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: { 
    fontSize: '14px', 
    fontWeight: '600', 
    marginBottom: '8px', 
    color: '#e2e8f0', 
    display: 'block',
    letterSpacing: '0.3px',
  },
  inputWrapper: { 
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  inputWrapperFocused: {
    transform: 'translateY(-2px)',
  },
  inputIcon: { 
    position: 'absolute', 
    left: '16px', 
    top: '50%', 
    transform: 'translateY(-50%)',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '14px 48px',
    border: '2px solid rgba(71, 85, 105, 0.4)',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    background: 'rgba(30, 41, 59, 0.6)',
    color: '#fff',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontWeight: '400',
  },
  iconButton: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    zIndex: 1,
  },
  forgotPassword: {
    textAlign: 'right',
    marginTop: '-8px',
  },
  forgotLink: {
    color: '#60a5fa',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: '18px',
  },
  button: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
    letterSpacing: '0.3px',
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0 20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(71, 85, 105, 0.4)',
  },
  dividerText: {
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  footerText: { 
    textAlign: 'center', 
    fontSize: '14px', 
    color: '#94a3b8', 
    margin: '0',
    fontWeight: '400',
  },
  link: { 
    color: '#60a5fa', 
    textDecoration: 'none', 
    fontWeight: '600',
    transition: 'color 0.2s ease',
  },
  toast: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    padding: '14px 28px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    zIndex: 1000,
    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    animation: 'slideDown 0.4s ease-out',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  toastIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};