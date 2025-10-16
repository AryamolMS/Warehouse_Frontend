import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div style={styles.page}>
      {/* Header/Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <Package size={32} color="#1e90ff" />
            <span style={styles.logoText}>Warehouse Management</span>
          </div>
          <div style={styles.navButtons}>
            <button onClick={() => navigate('/login')} style={styles.loginButton}>
              Login
            </button>
            <button onClick={() => navigate('/registration')} style={styles.signupButton}>
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Welcome to Warehouse Management
          </h1>
          <p style={styles.heroSubtitle}>
            Connect suppliers and manage your business efficiently with our platform
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.primaryButton}>
              Get Started
            </button>
            <button style={styles.secondaryButton}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.features}>
        <h2 style={styles.featuresTitle}>Why Choose Us?</h2>
        <div style={styles.featureGrid}>
          <div 
            style={{
              ...styles.featureCard,
              ...(hoveredCard === 0 ? styles.featureCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon}>
              <Users size={32} color="#1e90ff" />
            </div>
            <h3 style={styles.featureTitle}>Easy Management</h3>
            <p style={styles.featureText}>
              Streamline your supplier relationships and manage orders efficiently
            </p>
          </div>

          <div 
            style={{
              ...styles.featureCard,
              ...(hoveredCard === 1 ? styles.featureCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon}>
              <TrendingUp size={32} color="#1e90ff" />
            </div>
            <h3 style={styles.featureTitle}>Grow Your Business</h3>
            <p style={styles.featureText}>
              Access analytics and insights to make better business decisions
            </p>
          </div>

          <div 
            style={{
              ...styles.featureCard,
              ...(hoveredCard === 2 ? styles.featureCardHover : {})
            }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.featureIcon}>
              <Shield size={32} color="#1e90ff" />
            </div>
            <h3 style={styles.featureTitle}>Secure & Reliable</h3>
            <p style={styles.featureText}>
              Your data is protected with enterprise-grade security measures
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2025 Warehouse Management. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000000, #0a1a3c, #001f4d)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    padding: '20px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  navContent: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  navButtons: {
    display: 'flex',
    gap: 12,
  },
  loginButton: {
    padding: '10px 24px',
    background: 'transparent',
    border: '1px solid #1e90ff',
    borderRadius: 6,
    color: '#1e90ff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  signupButton: {
    padding: '10px 24px',
    background: '#1e90ff',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  hero: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: 800,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 40,
    lineHeight: 1.6,
  },
  heroButtons: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '14px 32px',
    background: 'linear-gradient(to right, #0d47a1, #001f4d)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  secondaryButton: {
    padding: '14px 32px',
    background: 'transparent',
    border: '2px solid #fff',
    borderRadius: 8,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  features: {
    padding: '80px 40px',
    background: 'rgba(0,0,0,0.3)',
  },
  featuresTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 60,
  },
  featureGrid: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 40,
  },
  featureCard: {
    background: '#111827',
    padding: 32,
    borderRadius: 12,
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  featureCardHover: {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 30px rgba(30, 144, 255, 0.3)',
    background: '#1a2332',
  },
  featureIcon: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: 'rgba(30, 144, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 1.6,
  },
  footer: {
    padding: '30px 40px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
};