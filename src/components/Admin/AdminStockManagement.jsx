import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, AlertCircle, X, RefreshCw, User, Calendar, Box, Thermometer, FileText, Check, XCircle, Search, Filter, Eye, Database } from 'lucide-react';

function AdminStockManagement() {
  const [toasts, setToasts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

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

  const fetchAllDeliveries = async () => {
    setLoading(true);
    try {
      // Fetch deliveries from all suppliers
      const response = await fetch('http://127.0.0.1:8000/api/get_all_deliveries/');
      if (response.ok) {
        const data = await response.json();
        const deliveriesData = data.deliveries || data || [];
        setDeliveries(deliveriesData);
      } else {
        showToast('Failed to fetch deliveries', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDeliveries();
    const interval = setInterval(fetchAllDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  const handleAccept = (delivery) => {
    setSelectedDelivery(delivery);
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedDelivery) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/accept_delivery/${selectedDelivery.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDeliveries(prev => 
          prev.map(d => d.id === selectedDelivery.id ? { ...d, status: 'accepted' } : d)
        );
        showToast(data.message || 'Delivery accepted and added to warehouse!', 'success');
        await fetchAllDeliveries();
      } else {
        showToast(data.message || data.error || 'Failed to accept delivery', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setShowAcceptModal(false);
      setSelectedDelivery(null);
    }
  };

  const handleReject = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to reject this delivery?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reject_delivery/${deliveryId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDeliveries(prev => 
          prev.map(d => d.id === deliveryId ? { ...d, status: 'rejected' } : d)
        );
        showToast('Delivery rejected', 'success');
        await fetchAllDeliveries();
      } else {
        showToast(data.message || data.error || 'Failed to reject delivery', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = (status || 'pending').toLowerCase();
    switch(statusLower) {
      case 'accepted':
      case 'delivered':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '#10b981' };
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '#f59e0b' };
      case 'rejected':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '#ef4444' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '#94a3b8' };
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      delivery.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = deliveries.filter(d => d.status?.toLowerCase() === 'pending').length;
  const acceptedCount = deliveries.filter(d => d.status?.toLowerCase() === 'accepted').length;

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', padding: '0', margin: '0', position: 'relative', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', top: '-250px', left: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none'}}></div>
      <div style={{position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)', bottom: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out reverse', pointerEvents: 'none'}}></div>

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

      {/* Header */}
      <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', zIndex: 10}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <button onClick={() => window.history.back()} style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', color: '#60a5fa'}}>
            <ArrowLeft size={24} />
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'}}>
              <Database size={28} color="#fff" />
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'}}>Stock Management</div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Review and accept supplier deliveries</div>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchAllDeliveries}
          disabled={loading}
          style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s', color: '#60a5fa', fontWeight: 600}}
        >
          <RefreshCw size={18} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      <div style={{padding: '40px 48px', maxWidth: '1600px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10}}>
        {/* Stats Cards */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px'}}>
          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'}}>
                <Package size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Pending Deliveries</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#f59e0b'}}>{pendingCount}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'}}>
                <CheckCircle size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Accepted Stock</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#10b981'}}>{acceptedCount}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'}}>
                <Box size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Total Deliveries</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#60a5fa'}}>{deliveries.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
            <div style={{position: 'relative'}}>
              <Search size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
              <input 
                type="text" 
                placeholder="Search by item, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', transition: 'all 0.3s'}}
              />
            </div>

            <div style={{position: 'relative'}}>
              <Filter size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Package size={24} color="#60a5fa" />
            Supplier Deliveries ({filteredDeliveries.length})
          </h3>

          {loading && deliveries.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px'}}>
              <RefreshCw size={40} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
              <div style={{fontSize: '16px', color: '#94a3b8'}}>Loading deliveries...</div>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '2px dashed rgba(71, 85, 105, 0.4)'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Package size={40} color="#60a5fa" style={{opacity: 0.5}} />
              </div>
              <div style={{fontSize: '18px', fontWeight: 700, color: '#e2e8f0'}}>No deliveries found</div>
              <div style={{fontSize: '14px', color: '#94a3b8', textAlign: 'center'}}>
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No suppliers have sent deliveries yet'}
              </div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {filteredDeliveries.map((delivery, index) => {
                const statusColors = getStatusColor(delivery.status);
                const isPending = delivery.status?.toLowerCase() === 'pending';
                
                return (
                  <div key={delivery.id || index} style={{background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '28px', border: '1px solid rgba(71, 85, 105, 0.3)', transition: 'all 0.3s'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <User size={24} color="#fff" />
                        </div>
                        <div>
                          <div style={{fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px'}}>{delivery.supplierName || 'Unknown Supplier'}</div>
                          <div style={{fontSize: '13px', color: '#94a3b8'}}>Delivery ID: #{delivery.id}</div>
                        </div>
                      </div>
                      <span style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        background: statusColors.bg,
                        color: statusColors.color,
                        border: `2px solid ${statusColors.border}40`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {formatStatus(delivery.status)}
                      </span>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px'}}>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Item</div>
                        <div style={{fontSize: '15px', color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Package size={16} color="#60a5fa" />
                          {delivery.item || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Quantity</div>
                        <div style={{fontSize: '15px', color: '#e2e8f0', fontWeight: 600}}>
                          {delivery.quantity || 0} {delivery.unit || 'units'}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Category</div>
                        <div style={{fontSize: '15px', color: '#e2e8f0', fontWeight: 600}}>
                          {delivery.category || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Delivery Date</div>
                        <div style={{fontSize: '15px', color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Calendar size={16} color="#60a5fa" />
                          {formatDate(delivery.deliveryDate)}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px'}}>Storage Type</div>
                        <div style={{fontSize: '15px', color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Thermometer size={16} color="#60a5fa" />
                          {delivery.storageType || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    <div style={{display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(71, 85, 105, 0.3)', flexWrap: 'wrap'}}>
                      <button 
                        onClick={() => handleViewDetails(delivery)}
                        style={{padding: '12px 20px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'}}
                      >
                        <Eye size={18} />
                        View Details
                      </button>
                      
                      {isPending && (
                        <>
                          <button 
                            onClick={() => handleAccept(delivery)}
                            style={{flex: 1, padding: '12px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
                          >
                            <Check size={18} />
                            Accept & Add to Stock
                          </button>
                          <button 
                            onClick={() => handleReject(delivery.id)}
                            style={{padding: '12px 20px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'}}
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDelivery && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '20px'}} onClick={() => setShowDetailsModal(false)}>
          <div style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px'}}>
              <h2 style={{margin: 0, fontSize: '24px', fontWeight: 700}}>Delivery Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px'}}>
                <X size={24} />
              </button>
            </div>

            {/* Item Details */}
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px'}}>Item Information</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px'}}>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Item Name</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.item}</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Quantity</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.quantity} {selectedDelivery.unit}</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Category</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.category}</div>
                </div>
                {selectedDelivery.batchNumber && (
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Batch Number</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.batchNumber}</div>
                  </div>
                )}
                {selectedDelivery.manufacturer && (
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Manufacturer</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.manufacturer}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Storage Details */}
            <div style={{marginBottom: '24px'}}>
              <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px'}}>Storage & Packaging</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px'}}>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Storage Type</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.storageType}</div>
                </div>
                {selectedDelivery.temperatureRequirement && (
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Temperature</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.temperatureRequirement}</div>
                  </div>
                )}
                {selectedDelivery.packagingType && (
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Packaging</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.packagingType}</div>
                  </div>
                )}
                {selectedDelivery.palletCount && (
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Pallets</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.palletCount}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Documentation */}
            {(selectedDelivery.invoiceNumber || selectedDelivery.poNumber) && (
              <div style={{marginBottom: '24px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px'}}>Documentation</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px'}}>
                  {selectedDelivery.invoiceNumber && (
                    <div>
                      <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Invoice Number</div>
                      <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.invoiceNumber}</div>
                    </div>
                  )}
                  {selectedDelivery.poNumber && (
                    <div>
                      <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>PO Number</div>
                      <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.poNumber}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedDelivery.notes && (
              <div style={{marginBottom: '24px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '12px'}}>Additional Notes</h3>
                <div style={{background: 'rgba(30, 41, 59, 0.4)', padding: '16px', borderRadius: '12px', color: '#cbd5e1', lineHeight: '1.6'}}>
                  {selectedDelivery.notes}
                </div>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)'}}>
              <button 
                onClick={() => setShowDetailsModal(false)}
                style={{padding: '12px 24px', background: 'rgba(71, 85, 105, 0.4)', color: '#e2e8f0', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Modal */}
      {showAcceptModal && selectedDelivery && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'}} onClick={() => setShowAcceptModal(false)}>
          <div style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', minWidth: '500px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'}}>
                <CheckCircle size={28} color="#fff" />
              </div>
              <h2 style={{margin: 0, fontSize: '24px', fontWeight: 700}}>Accept Delivery</h2>
            </div>
            
            <div style={{background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(71, 85, 105, 0.3)'}}>
              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Supplier</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.supplierName}</div>
              </div>
              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Item</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.item}</div>
              </div>
              <div>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Quantity</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedDelivery.quantity} {selectedDelivery.unit}</div>
              </div>
            </div>

            <p style={{color: '#cbd5e1', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6'}}>
              Are you sure you want to accept this delivery? This will add the stock to your warehouse database.
            </p>

            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                onClick={confirmAccept}
                style={{flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s'}}
              >
                <Check size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}} />
                Yes, Accept & Add to Stock
              </button>
              <button 
                onClick={() => setShowAcceptModal(false)}
                style={{flex: 1, padding: '14px 24px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
        input:focus, select:focus {
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
        }
      `}</style>
    </div>
  );
}

export default AdminStockManagement;
