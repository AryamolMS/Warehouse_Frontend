import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate();

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
    // Mock admin login
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'Admin@123';
    if (email === adminEmail && password === adminPassword) {
      const adminDetails = { 
        email: adminEmail, 
        username: 'admin', 
        role: 'admin', 
        phone: '0000000000'
      };
      localStorage.setItem('userDetails', JSON.stringify(adminDetails));
      localStorage.setItem('authToken', 'mock-admin-token-12345');
      localStorage.setItem('phone', adminDetails.phone);
      setToast('Admin login successful!');
      setTimeout(() => {
        setToast('Redirecting to admin home...');
        navigate('/adminhome');
      }, 1000);
      return;
    }

    // Supplier login API
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Login failed');
    } else {
      const userDetails = { ...data.supplier, role: 'supplier' };
      
      // ✅ SAVE TO LOCALSTORAGE - THIS IS THE FIX
      localStorage.setItem('userDetails', JSON.stringify(userDetails));
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('phone', data.supplier.phone || '');
      
      // ✅ ADD THESE LINES FOR THE INVOICE PAGE
      localStorage.setItem('supplierCompanyName', data.supplier.companyName || data.supplier.company_name || '');
      localStorage.setItem('supplierId', data.supplier.id || data.supplier._id || '');
      localStorage.setItem('supplierEmail', data.supplier.email || '');
      
      console.log('✅ Supplier data saved to localStorage:', {
        companyName: data.supplier.companyName,
        id: data.supplier.id,
        email: data.supplier.email
      });
      
      setToast('Login successful!');
      setTimeout(() => {
        setToast('Redirecting to supplier home...');
        navigate('/supplierhome');
      }, 1000);
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div style={styles.page}>
      {/* Animated background */}
      <div style={styles.bgGradient}></div>
      <div style={styles.bgPattern}></div>
      
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Glow effect */}
          <div style={styles.cardGlow}></div>
          
          <div style={styles.header}>
            <div style={styles.iconCircle}>
              <div style={styles.iconGlow}></div>
              <Sparkles size={36} color="#fff" strokeWidth={2.5} style={styles.sparkleIcon} />
            </div>
            <h1 style={styles.title}>Welcome Back</h1>
            <p style={styles.subtitle}>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.formContainer}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={styles.input}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.iconButton}
                >
                  {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                </button>
              </div>
            </div>

            {error && (
              <div style={styles.error}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} style={{
              ...styles.button,
              ...(isLoading ? styles.buttonLoading : {})
            }}>
              {isLoading ? (
                <span style={styles.buttonContent}>
                  <span style={styles.spinner}></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {toast && (
            <div style={styles.toast}>
              <span style={styles.toastIcon}>✓</span>
              {toast}
            </div>
          )}
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
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    animation: 'rotate 20s linear infinite',
  },
  bgPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
    opacity: 0.6,
  },
  container: {
    width: '100%',
    maxWidth: '440px',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    padding: '48px 40px',
    borderRadius: '24px',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    color: '#fff',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cardGlow: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    position: 'relative',
    zIndex: 1,
  },
  iconCircle: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.2)',
  },
  iconGlow: {
    position: 'absolute',
    inset: '-8px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  sparkleIcon: {
    position: 'relative',
    zIndex: 1,
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
  },
  title: {
    fontSize: '32px',
    margin: '0 0 8px 0',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    margin: 0,
    fontWeight: '400',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative',
    zIndex: 1,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e2e8f0',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    left: '16px',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    transition: 'color 0.2s',
  },
  input: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: 'rgba(30, 41, 59, 0.6)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box',
  },
  iconButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  button: {
    padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    marginTop: '8px',
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
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
  error: {
    color: '#fca5a5',
    background: 'rgba(127, 29, 29, 0.3)',
    padding: '12px 16px',
    borderRadius: '10px',
    textAlign: 'center',
    fontSize: '14px',
    border: '1px solid rgba(248, 113, 113, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  toast: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    padding: '12px 16px',
    borderRadius: '10px',
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    animation: 'slideIn 0.3s ease-out',
  },
  toastIcon: {
    fontSize: '16px',
    fontWeight: '700',
  },
};

// Add keyframe animations via style tag
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4) !important;
  }
  button:active:not(:disabled) {
    transform: translateY(0);
  }
  input:hover {
    border-color: #475569 !important;
  }
`;
document.head.appendChild(styleSheet);