// AdminDashboard.jsx - Main Layout with Sidebar
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, CheckCircle, AlertCircle, Sparkles, Truck, Package, ClipboardList, Users, BarChart3, LogOut, RefreshCw } from 'lucide-react';

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingPickups: 0,
    totalSuppliers: 0,
    totalStock: 0
  });
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    localStorage.removeItem("userRole");
    showToast("Logged out successfully!", 'success');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch pending pickups
      const pickupsResponse = await fetch('http://127.0.0.1:8000/api/pending_pickups/');
      if (pickupsResponse.ok) {
        const pickupsData = await pickupsResponse.json();
        setStats(prev => ({ ...prev, pendingPickups: pickupsData.count || 0 }));
      }

      // Fetch total suppliers
      const suppliersResponse = await fetch('http://127.0.0.1:8000/api/total_suppliers/');
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setStats(prev => ({ ...prev, totalSuppliers: suppliersData.total || 0 }));
      }

      // Fetch total stock
      const stockResponse = await fetch('http://127.0.0.1:8000/api/total_items/');
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        setStats(prev => ({ ...prev, totalStock: stockData.total || 0 }));
      }
    } catch (err) {
      showToast("Error fetching dashboard data: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { icon: Truck, label: "Pending Pickups", path: "/adminpickup" },
    { icon: Package, label: "Add Stock to Warehouse", path: "/admin_stock_management" },
    { icon: ClipboardList, label: "View Stock by Supplier", path: "/warehouseinventory" },
    { icon: Users, label: "Manage Suppliers", path: "/admin/suppliers" },
    { icon: BarChart3, label: "Reports & Analytics", path: "/admin/reports" }
  ];

  return (
    <div style={{minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', position: 'relative', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      {/* Background Effects */}
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', top: '-250px', left: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none', zIndex: 0}}></div>
      <div style={{position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)', bottom: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out reverse', pointerEvents: 'none', zIndex: 0}}></div>

      {/* Toast Notifications */}
      <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {toasts.map(toast => (
          <div key={toast.id} style={{background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.95)', backdropFilter: 'blur(10px)', color: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', maxWidth: '400px', animation: 'slideIn 0.3s ease-out'}}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{flex: 1, fontSize: '14px', fontWeight: 500}}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div style={{width: sidebarOpen ? '280px' : '0', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.05)', transition: 'width 0.3s ease', overflow: 'hidden', position: 'relative', zIndex: 100}}>
        <div style={{padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'}}>
            <Sparkles size={24} color="#fff" />
          </div>
          <div>
            <div style={{fontSize: '18px', fontWeight: 700, color: '#fff'}}>WareHub</div>
            <div style={{fontSize: '12px', color: '#94a3b8'}}>Admin Panel</div>
          </div>
        </div>

        <div style={{padding: '24px 16px'}}>
          <div style={{fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '8px'}}>Menu</div>
          {menuItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(item.path)} 
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '14px 16px', 
                borderRadius: '12px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.05)', 
                cursor: 'pointer', 
                marginBottom: '8px', 
                transition: 'all 0.2s', 
                color: '#e2e8f0'
              }}
            >
              {React.createElement(item.icon, { size: 20, color: '#60a5fa' })}
              <span style={{fontSize: '14px', fontWeight: 500}}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{position: 'absolute', bottom: '24px', left: '16px', right: '16px'}}>
          <div onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', cursor: 'pointer', transition: 'all 0.2s', color: '#fff', boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'}}>
            <LogOut size={20} />
            <span style={{fontSize: '14px', fontWeight: 600}}>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10}}>
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'}}>
              <Menu size={20} color="#60a5fa" />
            </button>
            <div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'}}>Admin Dashboard</div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '2px'}}>Welcome to Admin Panel</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <button 
              onClick={fetchDashboardStats} 
              disabled={loading}
              style={{background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: loading ? 0.6 : 1}}
            >
              <RefreshCw size={20} color="#60a5fa" style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
            </button>
            <div style={{width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '16px', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'}}>A</div>
          </div>
        </div>

        <div style={{padding: '48px', flex: 1, overflowY: 'auto'}}>
          <div style={{maxWidth: '1400px', margin: '0 auto'}}>
            {/* Stats Cards */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '48px'}}>
              {[
                { 
                  icon: Truck, 
                  label: "Pending Pickups to Approve", 
                  value: stats.pendingPickups, 
                  color: '#f59e0b',
                  bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  onClick: () => navigate('/admin/pending-deliveries')
                },
                { 
                  icon: Users, 
                  label: "Total Suppliers", 
                  value: stats.totalSuppliers, 
                  color: '#8b5cf6',
                  bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  onClick: () => navigate('/admin/suppliers')
                },
                { 
                  icon: Package, 
                  label: "Total Stock in Warehouse", 
                  value: stats.totalStock, 
                  color: '#10b981',
                  bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  onClick: () => navigate('/admin/stock-by-supplier')
                }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  onClick={stat.onClick}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)', 
                    backdropFilter: 'blur(20px)', 
                    borderRadius: '24px', 
                    padding: '36px', 
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    transition: 'all 0.3s', 
                    cursor: 'pointer', 
                    position: 'relative'
                  }}
                  className="stat-card"
                >
                  <div style={{position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', background: `linear-gradient(135deg, ${stat.color}40, ${stat.color}20)`, borderRadius: '24px', opacity: 0, transition: 'opacity 0.3s', zIndex: -1}} className="card-glow"></div>
                  
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px'}}>
                    <div style={{background: stat.bgGradient, borderRadius: '16px', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${stat.color}66`}}>
                      {React.createElement(stat.icon, { size: 36, color: '#fff' })}
                    </div>
                  </div>
                  
                  <div style={{fontSize: '16px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</div>
                  
                  <div style={{fontSize: '48px', fontWeight: 700, background: stat.bgGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    {loading ? '...' : stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5) !important;
        }
        button:active:not(:disabled) {
          transform: translateY(0px);
        }
        div[style*="cursor: pointer"]:hover {
          background: rgba(59, 130, 246, 0.15) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
        }
        .quick-action:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
          background: rgba(30, 41, 59, 0.8) !important;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6) !important;
        }
        .stat-card:hover .card-glow {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

export default Home;