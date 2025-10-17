import React, { useState, useEffect } from 'react';
import { Package, Truck, Menu, X, CheckCircle, AlertCircle, Sparkles, ClipboardList, Users, BarChart3, LogOut, Plus, Search, Calendar, User, Phone, MapPin, FileText, Eye, ArrowRight } from 'lucide-react';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingPickups: 0
  });
  const [currentView, setCurrentView] = useState('dashboard');
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

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
    showToast("Logged out successfully!", 'success');
    setTimeout(() => {
      console.log("Redirecting to login page...");
    }, 1000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const itemsResponse = await fetch('http://127.0.0.1:8000/api/total_items/');
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          setStats(prev => ({ ...prev, totalItems: itemsData.total || 0 }));
        }

        const pickupsResponse = await fetch('http://127.0.0.1:8000/api/pending_pickups/');
        if (pickupsResponse.ok) {
          const pickupsData = await pickupsResponse.json();
          setStats(prev => ({ ...prev, pendingPickups: pickupsData.count || 0 }));
          setPendingDeliveries(pickupsData.requests || []);
        }
      } catch (err) {
        showToast("Error fetching dashboard data: " + err.message, 'error');
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { icon: Truck, label: "Pending Deliveries", view: "pending-deliveries" },
    { icon: Package, label: "Add Stock to Warehouse", view: "add-stock" },
    { icon: ClipboardList, label: "View Stock by Supplier", view: "stock-by-supplier" },
    { icon: Users, label: "Manage Suppliers", view: "suppliers" },
    { icon: BarChart3, label: "Reports & Analytics", view: "reports" }
  ];

  const handleProcessDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setCurrentView('add-stock');
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', position: 'relative', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', top: '-250px', left: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none', zIndex: 0}}></div>
      <div style={{position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)', bottom: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out reverse', pointerEvents: 'none', zIndex: 0}}></div>

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
            <div key={idx} onClick={() => setCurrentView(item.view)} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: currentView === item.view ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)', border: currentView === item.view ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', marginBottom: '8px', transition: 'all 0.2s', color: '#e2e8f0'}}>
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

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10}}>
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'}}>
              <Menu size={20} color="#60a5fa" />
            </button>
            <div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'}}>
                {currentView === 'dashboard' && 'Dashboard'}
                {currentView === 'pending-deliveries' && 'Pending Deliveries'}
                {currentView === 'add-stock' && 'Add Stock to Warehouse'}
                {currentView === 'stock-by-supplier' && 'Stock by Supplier'}
              </div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '2px'}}>Welcome to Admin Panel</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '16px', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'}}>A</div>
          </div>
        </div>

        <div style={{padding: '48px', flex: 1, overflowY: 'auto'}}>
          {currentView === 'dashboard' && (
            <DashboardView stats={stats} pendingDeliveries={pendingDeliveries} setCurrentView={setCurrentView} />
          )}
          {currentView === 'pending-deliveries' && (
            <PendingDeliveriesView deliveries={pendingDeliveries} handleProcessDelivery={handleProcessDelivery} />
          )}
          {currentView === 'add-stock' && (
            <AddStockView selectedDelivery={selectedDelivery} showToast={showToast} setCurrentView={setCurrentView} />
          )}
          {currentView === 'stock-by-supplier' && (
            <StockBySupplierView showToast={showToast} />
          )}
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
      `}</style>
    </div>
  );
}

function DashboardView({ stats, pendingDeliveries, setCurrentView }) {
  return (
    <div style={{maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '48px'}}>
        {[
          { icon: Package, label: "Total Items in Warehouse", value: stats.totalItems, color: '#3b82f6' },
          { icon: Truck, label: "Pending Delivery Requests", value: stats.pendingPickups, color: '#f59e0b' }
        ].map((stat, idx) => (
          <div key={idx} style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'transform 0.3s', cursor: 'pointer', position: 'relative'}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
              <div style={{background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`, borderRadius: '16px', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${stat.color}66`}}>
                {React.createElement(stat.icon, { size: 36, color: '#fff' })}
              </div>
            </div>
            <div style={{fontSize: '16px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</div>
            <div style={{fontSize: '48px', fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <h3 style={{fontSize: '22px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Truck size={24} color="#60a5fa" />
            Recent Delivery Requests
          </h3>
          <button onClick={() => setCurrentView('pending-deliveries')} style={{padding: '10px 20px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', color: '#60a5fa', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
            View All <ArrowRight size={16} />
          </button>
        </div>
        
        {pendingDeliveries.slice(0, 3).map((delivery, idx) => (
          <div key={idx} style={{background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', padding: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <div style={{fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px'}}>{delivery.supplier_name}</div>
              <div style={{display: 'flex', gap: '16px', fontSize: '14px', color: '#94a3b8'}}>
                <span><Calendar size={14} style={{display: 'inline', marginRight: '4px'}} />{delivery.delivery_date}</span>
                <span><Truck size={14} style={{display: 'inline', marginRight: '4px'}} />{delivery.vehicle_number}</span>
              </div>
            </div>
            <span style={{padding: '6px 16px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderRadius: '8px', fontSize: '12px', fontWeight: 600}}>
              PENDING
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingDeliveriesView({ deliveries, handleProcessDelivery }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeliveries = deliveries.filter(d => 
    d.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <p style={{color: '#94a3b8', fontSize: '16px'}}>Review and process supplier delivery requests</p>
        <div style={{position: 'relative', width: '350px'}}>
          <Search size={20} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
          <input 
            type="text" 
            placeholder="Search by supplier or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{width: '100%', padding: '12px 12px 12px 44px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px'}}
          />
        </div>
      </div>

      <div style={{display: 'grid', gap: '24px'}}>
        {filteredDeliveries.map((delivery, idx) => (
          <div key={idx} style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px'}}>
              <div style={{flex: 1}}>
                <h3 style={{fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px'}}>{delivery.supplier_name}</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                    <Calendar size={18} />
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b'}}>Delivery Date</div>
                      <div style={{fontSize: '14px', fontWeight: 600}}>{delivery.delivery_date}</div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                    <Truck size={18} />
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b'}}>Vehicle Number</div>
                      <div style={{fontSize: '14px', fontWeight: 600}}>{delivery.vehicle_number}</div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                    <Phone size={18} />
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b'}}>Contact</div>
                      <div style={{fontSize: '14px', fontWeight: 600}}>{delivery.contact_number}</div>
                    </div>
                  </div>
                  {delivery.driver_name && (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8'}}>
                      <User size={18} />
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b'}}>Driver</div>
                        <div style={{fontSize: '14px', fontWeight: 600}}>{delivery.driver_name}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span style={{padding: '10px 20px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderRadius: '10px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'}}>
                PENDING
              </span>
            </div>
            
            <div style={{background: 'rgba(30, 41, 59, 0.5)', padding: '20px', borderRadius: '14px', marginBottom: '24px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px'}}>
                <div>
                  <div style={{fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase'}}>Item Description</div>
                  <div style={{color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6'}}>{delivery.item_description || 'No description provided'}</div>
                </div>
                <div>
                  <div style={{fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase'}}>Estimated Quantity</div>
                  <div style={{color: '#fff', fontSize: '20px', fontWeight: 700}}>{delivery.estimated_quantity || 'N/A'}</div>
                </div>
              </div>
              {delivery.notes && (
                <div style={{marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)'}}>
                  <div style={{fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>Notes</div>
                  <div style={{color: '#94a3b8', fontSize: '14px'}}>{delivery.notes}</div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => handleProcessDelivery(delivery)}
              style={{width: '100%', padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'}}
            >
              <Package size={20} />
              Process Delivery & Add Stock
            </button>
          </div>
        ))}
        
        {filteredDeliveries.length === 0 && (
          <div style={{textAlign: 'center', padding: '60px', color: '#64748b'}}>
            <Truck size={48} style={{margin: '0 auto 16px', opacity: 0.3}} />
            <div style={{fontSize: '18px', fontWeight: 600}}>No pending deliveries found</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddStockView({ selectedDelivery, showToast, setCurrentView }) {
  const [formData, setFormData] = useState({
    supplier_id: selectedDelivery?.supplier_id || '',
    supplier_name: selectedDelivery?.supplier_name || '',
    delivery_id: selectedDelivery?.id || '',
    item_name: '',
    category: '',
    quantity: selectedDelivery?.estimated_quantity || '',
    unit: 'pcs',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    storage_location: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/add_stock/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        showToast('Stock added to warehouse successfully!', 'success');
        if (formData.delivery_id) {
          await fetch(`http://127.0.0.1:8000/api/admin/complete_delivery/${formData.delivery_id}/`, {
            method: 'POST'
          });
        }
        setCurrentView('pending-deliveries');
      } else {
        showToast('Failed to add stock', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  return (
    <div style={{maxWidth: '1100px', margin: '0 auto'}}>
      <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
        <h2 style={{fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <Package size={28} color="#60a5fa" />
          Add Stock to Warehouse
        </h2>
        <p style={{color: '#94a3b8', marginBottom: '32px'}}>Enter actual stock details received from supplier</p>
        
        {selectedDelivery && (
          <div style={{background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '32px'}}>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px'}}>Processing delivery from:</div>
            <div style={{fontSize: '18px', fontWeight: 600, color: '#fff'}}>{selectedDelivery.supplier_name}</div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Vehicle: {selectedDelivery.vehicle_number} | Date: {selectedDelivery.delivery_date}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px'}}>
            <FormField 
              label="Supplier Name" 
              value={formData.supplier_name}
              onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
              required
            />
            <FormField 
              label="Item Name" 
              value={formData.item_name}
              onChange={(e) => setFormData({...formData, item_name: e.target.value})}
              required
            />
            <FormField 
              label="Category" 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
            <div style={{display: 'flex', gap: '12px'}}>
              <div style={{flex: 2}}>
                <FormField 
                  label="Quantity" 
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div style={{flex: 1}}>
                <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600}}>Unit</label>
                <select 
                  value={formData.unit} 
                  onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                  style={{width: '100%', padding: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px'}}
                >
                  <option value="pcs">Pcs</option>
                  <option value="kg">Kg</option>
                  <option value="ltr">Ltr</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            <FormField 
              label="Batch Number" 
              value={formData.batch_number}
              onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
            />
            <FormField 
              label="Manufacturing Date" 
              type="date"
              value={formData.manufacturing_date}
              onChange={(e) => setFormData({...formData, manufacturing_date: e.target.value})}
            />
            <FormField 
              label="Expiry Date" 
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
            />
            <FormField 
              label="Storage Location" 
              value={formData.storage_location}
              onChange={(e) => setFormData({...formData, storage_location: e.target.value})}
            />
          </div>
          
          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600}}>Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              style={{width: '100%', padding: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', minHeight: '100px', resize: 'vertical'}}
              placeholder="Any additional notes about this stock..."
            />
          </div>
          
          <div style={{display: 'flex', gap: '16px'}}>
            <button 
              type="button"
              onClick={() => setCurrentView('pending-deliveries')}
              style={{flex: 1, padding: '16px', background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer'}}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{flex: 2, padding: '16px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'}}
            >
              Add to Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockBySupplierView({ showToast }) {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/stock_by_supplier/');
        if (response.ok) {
          const data = await response.json();
          setStockData(data.stock || []);
        }
      } catch (err) {
        showToast('Error fetching stock data: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [showToast]);

  if (loading) {
    return (
      <div style={{textAlign: 'center', padding: '60px', color: '#94a3b8'}}>
        <div style={{fontSize: '18px', fontWeight: 600}}>Loading stock data...</div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: '1400px', margin: '0 auto'}}>
      <p style={{color: '#94a3b8', fontSize: '16px', marginBottom: '24px'}}>View all warehouse stock organized by supplier</p>
      
      <div style={{display: 'grid', gap: '24px'}}>
        {stockData.map((supplier, idx) => (
          <div key={idx} style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <h3 style={{fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px'}}>
              <User size={24} color="#60a5fa" />
              {supplier.supplier_name}
            </h3>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px'}}>
              {supplier.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', padding: '20px'}}>
                  <div style={{fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '12px'}}>{item.item_name}</div>
                  <div style={{display: 'grid', gap: '8px', fontSize: '14px', color: '#94a3b8'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Category:</span>
                      <span style={{color: '#e2e8f0', fontWeight: 600}}>{item.category}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Quantity:</span>
                      <span style={{color: '#60a5fa', fontWeight: 700}}>{item.quantity} {item.unit}</span>
                    </div>
                    {item.storage_location && (
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Location:</span>
                        <span style={{color: '#e2e8f0'}}>{item.storage_location}</span>
                      </div>
                    )}
                    {item.batch_number && (
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span>Batch:</span>
                        <span style={{color: '#e2e8f0'}}>{item.batch_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {stockData.length === 0 && (
          <div style={{textAlign: 'center', padding: '60px', color: '#64748b'}}>
            <Package size={48} style={{margin: '0 auto 16px', opacity: 0.3}} />
            <div style={{fontSize: '18px', fontWeight: 600}}>No stock data available</div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, required = false }) {
  return (
    <div>
      <label style={{display: 'block', fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600}}>
        {label} {required && <span style={{color: '#ef4444'}}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        style={{width: '100%', padding: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px'}}
      />
    </div>
  );
}

export default AdminDashboard;