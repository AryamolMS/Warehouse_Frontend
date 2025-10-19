import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Calendar, CheckCircle, AlertCircle, X, RefreshCw, User, Clock, FileText, Check, XCircle, Search, Filter } from 'lucide-react';

function AdminPickupRequests() {
  const [toasts, setToasts] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stockStatusMap, setStockStatusMap] = useState({});

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

  const checkWarehouseStock = async (item, quantity) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/check-warehouse-stock/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item: item,
            requestedQuantity: quantity
          })
        }
      );
      
      const data = await response.json();
      return {
        available: data.available,
        currentStock: data.currentStock,
        requestedQuantity: quantity,
        canFulfill: data.currentStock >= quantity
      };
    } catch (err) {
      console.error('Stock check error:', err);
      return { available: false, canFulfill: false };
    }
  };

 const fetchPickupRequests = async () => {
  setLoading(true);
  console.log('[AdminPickupRequests] Fetching pickup requests...');
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/pickup/get_all_pickup_requests_admin/');
    
    console.log('[AdminPickupRequests] Response status:', response.status);
    console.log('[AdminPickupRequests] Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('[AdminPickupRequests] Received data:', data);
      
      const requests = data.requests || data || [];
      console.log('[AdminPickupRequests] Processed requests:', requests);
      console.log('[AdminPickupRequests] Number of requests:', requests.length);
      
      setPickupRequests(requests);
    } else {
      const errorData = await response.json();
      console.error('[AdminPickupRequests] Error response:', errorData);
      showToast(errorData.error || 'Failed to fetch pickup requests', 'error');
    }
  } catch (err) {
    console.error('[AdminPickupRequests] Fetch error:', err);
    showToast('Error: ' + err.message, 'error');
  } finally {
    setLoading(false);
    console.log('[AdminPickupRequests] Loading complete. Requests count:', pickupRequests.length);
  }
};


  // Check stock status for all pending requests
  useEffect(() => {
    const checkAllStocks = async () => {
      const newStockMap = {};
      
      for (const request of pickupRequests) {
        if (request.status?.toLowerCase() === 'pending') {
          const stockStatus = await checkWarehouseStock(request.item, request.quantity);
          newStockMap[request.id] = stockStatus;
        }
      }
      
      setStockStatusMap(newStockMap);
    };
    
    if (pickupRequests.length > 0) {
      checkAllStocks();
    }
  }, [pickupRequests]);

  useEffect(() => {
    fetchPickupRequests();
    const interval = setInterval(fetchPickupRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (request) => {
    setLoading(true);
    
    const stockCheck = stockStatusMap[request.id] || await checkWarehouseStock(request.item, request.quantity);
    
    if (!stockCheck.canFulfill) {
      showToast(
        `Insufficient stock! Available: ${stockCheck.currentStock} units, Requested: ${request.quantity} units`,
        'error'
      );
      setLoading(false);
      return;
    }
    
    setSelectedRequest({
      ...request,
      stockInfo: stockCheck
    });
    setShowApproveModal(true);
    setLoading(false);
  };

 // AdminPickupRequests.jsx - Update confirmApproval function

const confirmApproval = async () => {
  if (!selectedRequest) return;
  
  try {
    // Step 1: Approve the pickup request
    const response = await fetch(
      `http://127.0.0.1:8000/api/pickup/approve/${selectedRequest.id}/`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Step 2: Generate invoice for storage
      try {
        const invoiceResponse = await fetch(
          `http://127.0.0.1:8000/api/generate-storage-invoice/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pickupRequestId: selectedRequest.id
            })
          }
        );
        
        const invoiceData = await invoiceResponse.json();
        
        if (invoiceResponse.ok && invoiceData.success) {
          showToast(
            `Pickup approved! Invoice ${invoiceData.invoice.invoiceNumber} generated successfully`,
            'success'
          );
        } else {
          showToast(
            `Pickup approved but invoice generation failed: ${invoiceData.error}`,
            'warning'
          );
        }
      } catch (invoiceErr) {
        console.error('Invoice generation error:', invoiceErr);
        showToast(
          `Pickup approved but invoice generation failed`,
          'warning'
        );
      }
      
      // Update local state
      setPickupRequests(prev => 
        prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'approved' } : r)
      );
      
      // Refresh the list
      await fetchPickupRequests();
    } else {
      showToast(data.message || data.error || 'Failed to approve pickup request', 'error');
    }
  } catch (err) {
    console.error('Approval error:', err);
    showToast('Error: ' + err.message, 'error');
  } finally {
    setShowApproveModal(false);
    setSelectedRequest(null);
  }
};


  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmRejection = async () => {
    if (!selectedRequest) return;
    
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/pickup/reject/${selectedRequest.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: rejectionReason || 'No reason provided'
          })
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPickupRequests(prev => 
          prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'rejected', rejectionReason: rejectionReason } : r)
        );
        showToast(data.message || 'Pickup request rejected', 'success');
        await fetchPickupRequests();
      } else {
        showToast(data.message || data.error || 'Failed to reject pickup request', 'error');
      }
    } catch (err) {
      console.error('Rejection error:', err);
      showToast('Error: ' + err.message, 'error');
    } finally {
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const getStatusColor = (status) => {
    const statusLower = (status || 'pending').toLowerCase();
    switch(statusLower) {
      case 'approved':
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '#10b981' };
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '#f59e0b' };
      case 'confirmed':
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '#3b82f6' };
      case 'rejected':
      case 'cancelled':
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

  const filteredRequests = pickupRequests.filter(request => {
    const matchesSearch = 
      request.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      request.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const pendingCount = pickupRequests.filter(r => r.status?.toLowerCase() === 'pending').length;
  const approvedCount = pickupRequests.filter(r => r.status?.toLowerCase() === 'approved').length;

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
            <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)'}}>
              <Package size={28} color="#fff" />
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'}}>Pickup Requests Management</div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Review and approve supplier pickup requests</div>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchPickupRequests}
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
                <Clock size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Pending Requests</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#f59e0b'}}>{pendingCount}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'}}>
                <CheckCircle size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Approved Requests</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#10b981'}}>{approvedCount}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'}}>
                <Package size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Total Requests</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#60a5fa'}}>{pickupRequests.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
            <div style={{position: 'relative'}}>
              <Search size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b'}} />
              <input 
                type="text" 
                placeholder="Search by supplier or item..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Package size={24} color="#60a5fa" />
            Pickup Requests ({filteredRequests.length})
          </h3>

          {loading && pickupRequests.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px'}}>
              <RefreshCw size={40} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
              <div style={{fontSize: '16px', color: '#94a3b8'}}>Loading pickup requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '2px dashed rgba(71, 85, 105, 0.4)'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Package size={40} color="#60a5fa" style={{opacity: 0.5}} />
              </div>
              <div style={{fontSize: '18px', fontWeight: 700, color: '#e2e8f0'}}>No pickup requests found</div>
              <div style={{fontSize: '14px', color: '#94a3b8', textAlign: 'center'}}>
                {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No suppliers have requested pickups yet'}
              </div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {filteredRequests.map((request) => {
                const statusColor = getStatusColor(request.status);
                const isPending = request.status?.toLowerCase() === 'pending';
                const stockStatus = stockStatusMap[request.id];
                
                return (
                  <div key={request.id} style={{background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(71, 85, 105, 0.3)', transition: 'all 0.3s'}}>
                    {isPending && stockStatus && (
                      <div style={{padding: '12px', borderRadius: '12px', marginBottom: '16px', background: stockStatus.canFulfill ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: stockStatus.canFulfill ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid rgba(239, 68, 68, 0.3)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: stockStatus.canFulfill ? '#10b981' : '#ef4444', fontWeight: 600}}>
                          {stockStatus.canFulfill ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                          Warehouse Stock: {stockStatus.currentStock} units
                          {!stockStatus.canFulfill && ' (Insufficient)'}
                        </div>
                      </div>
                    )}

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px'}}>
                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Supplier</div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{request.companyName}</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Item</div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{request.item}</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Quantity</div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{request.quantity} units</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Status</div>
                        <div style={{display: 'inline-block', padding: '6px 12px', borderRadius: '8px', background: statusColor.bg, color: statusColor.color, fontWeight: 600, fontSize: '13px'}}>
                          {formatStatus(request.status)}
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Date</div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatDate(request.requestDate || request.createdAt)}</div>
                      </div>
                    </div>

                    {isPending && (
                      <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                        <button 
                          onClick={() => handleApprove(request)}
                          disabled={stockStatus && !stockStatus.canFulfill}
                          style={{flex: 1, padding: '12px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: stockStatus && !stockStatus.canFulfill ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: stockStatus && !stockStatus.canFulfill ? 0.5 : 1, transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'}}
                        >
                          <Check size={18} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(request)}
                          style={{flex: 1, padding: '12px 20px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s'}}
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'}} onClick={() => setShowApproveModal(false)}>
          <div style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', minWidth: '500px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'}}>
                <Check size={28} color="#fff" />
              </div>
              <h2 style={{margin: 0, fontSize: '24px', fontWeight: 700}}>Approve Pickup Request</h2>
            </div>

            <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '2px solid rgba(16, 185, 129, 0.3)'}}>
              <div style={{fontSize: '14px', color: '#10b981', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <CheckCircle size={18} />
                Stock Verification Passed
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Current Stock</div>
                  <div style={{fontSize: '18px', color: '#10b981', fontWeight: 700}}>{selectedRequest.stockInfo?.currentStock} units</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>After Pickup</div>
                  <div style={{fontSize: '18px', color: '#fff', fontWeight: 700}}>{selectedRequest.stockInfo?.currentStock - selectedRequest.quantity} units</div>
                </div>
              </div>
            </div>

            <div style={{background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(71, 85, 105, 0.3)'}}>
              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Supplier</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedRequest.companyName}</div>
              </div>
              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Item</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedRequest.item}</div>
              </div>
              <div>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Quantity</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedRequest.quantity} units</div>
              </div>
            </div>

            <p style={{color: '#cbd5e1', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6'}}>
              Are you sure you want to approve this pickup request? The warehouse stock will be updated accordingly.
            </p>

            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                onClick={confirmApproval}
                style={{flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)', transition: 'all 0.3s'}}
              >
                <Check size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}} />
                Yes, Approve
              </button>
              <button 
                onClick={() => setShowApproveModal(false)}
                style={{flex: 1, padding: '14px 24px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'}} onClick={() => setShowRejectModal(false)}>
          <div style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', minWidth: '500px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'}}>
                <XCircle size={28} color="#fff" />
              </div>
              <h2 style={{margin: 0, fontSize: '24px', fontWeight: 700}}>Reject Pickup Request</h2>
            </div>
            
            <div style={{background: 'rgba(30, 41, 59, 0.4)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(71, 85, 105, 0.3)'}}>
              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Supplier</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedRequest.companyName}</div>
              </div>
              <div style={{marginBottom: '16px'}}>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Item</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedRequest.item}</div>
              </div>
              <div>
                <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase'}}>Quantity</div>
                <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedRequest.quantity} units</div>
              </div>
            </div>

            <div style={{marginBottom: '24px'}}>
              <label style={{display: 'block', fontSize: '14px', color: '#cbd5e1', marginBottom: '8px', fontWeight: 600}}>
                Reason for Rejection (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason why this request is being rejected..."
                style={{width: '100%', minHeight: '100px', padding: '12px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit'}}
              />
            </div>

            <p style={{color: '#fca5a5', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6'}}>
              Are you sure you want to reject this pickup request? The supplier will be notified of the rejection.
            </p>

            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                onClick={confirmRejection}
                style={{flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)', transition: 'all 0.3s'}}
              >
                <XCircle size={18} style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle'}} />
                Yes, Reject
              </button>
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
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
        input:focus, select:focus, textarea:focus {
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
        }
      `}</style>
    </div>
  );
}

export default AdminPickupRequests;