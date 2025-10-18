import React, { useState, useEffect } from 'react';
import { Truck, ArrowLeft, Package, Calendar, CheckCircle, AlertCircle, X, RefreshCw, Box } from 'lucide-react';


function RequestPickupPage() {
  const [toasts, setToasts] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [supplierId, setSupplierId] = useState(null);
  const [pickupForm, setPickupForm] = useState({
    deliveryId: '',
    itemName: '',
    availableQuantity: 0,
    unit: '',
    quantity: '',
    pickupDate: '',
    pickupTime: '',
    specialInstructions: ''
  });


  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };


  useEffect(() => {
    const loggedInSupplier = JSON.parse(localStorage.getItem("userDetails"));
    if (loggedInSupplier && loggedInSupplier.id) {
      setSupplierId(loggedInSupplier.id);
    } else {
      showToast("Could not find supplier details. Please log in again.", 'error');
    }
  }, []);


  const fetchDeliveredItems = async () => {
    if (!supplierId) return;
    
    setLoadingItems(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/get_deliveries/${supplierId}/`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const deliveriesData = data.deliveries || data || [];
      
      console.log("Fetched deliveries for supplier:", deliveriesData);
      setDeliveredItems(deliveriesData);
      
      if (deliveriesData.length === 0) {
        showToast("You haven't delivered any items to the warehouse yet.", 'warning');
      }
    } catch (err) {
      showToast("Error fetching delivered items: " + err.message, 'error');
      console.error("Error fetching deliveries:", err);
    } finally {
      setLoadingItems(false);
    }
  };


  const fetchPickupRequests = async () => {
    if (!supplierId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/pickup/${supplierId}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (response.ok) {
        const requests = data.requests || data || [];
        console.log("Fetched pickup requests:", requests);
        setPickupRequests(requests);
      } else {
        showToast(`Error: ${data.error || 'Failed to fetch pickup requests.'}`, 'error');
      }
    } catch (err) {
      showToast("An error occurred while fetching requests: " + err.message, 'error');
      console.error("Error fetching pickup requests:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (supplierId) {
      fetchDeliveredItems();
      fetchPickupRequests();
    }
  }, [supplierId]);


  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };


  const handleItemSelect = (e) => {
    const deliveryId = e.target.value;
    if (!deliveryId) {
      setPickupForm({
        deliveryId: '',
        itemName: '',
        availableQuantity: 0,
        unit: '',
        quantity: '',
        pickupDate: '',
        pickupTime: '',
        specialInstructions: ''
      });
      return;
    }

    const selectedItem = deliveredItems.find(item => item.id.toString() === deliveryId);
    if (selectedItem) {
      console.log("Selected item:", selectedItem);
      setPickupForm(prev => ({
        ...prev,
        deliveryId: deliveryId,
        itemName: selectedItem.item,
        availableQuantity: selectedItem.quantity,
        unit: selectedItem.unit || '',
        quantity: ''
      }));
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPickupForm(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async () => {
    const requiredFields = ['deliveryId', 'quantity', 'pickupDate', 'pickupTime'];
    const emptyFields = requiredFields.filter(field => !pickupForm[field]);
    
    if (emptyFields.length > 0) {
      showToast('Please fill in all required fields!', 'warning');
      return;
    }

    const requestedQuantity = Number(pickupForm.quantity);
    if (requestedQuantity <= 0) {
      showToast('Quantity must be greater than 0!', 'warning');
      return;
    }

    if (requestedQuantity > pickupForm.availableQuantity) {
      showToast(`Cannot request more than available quantity (${pickupForm.availableQuantity} ${pickupForm.unit})!`, 'warning');
      return;
    }

    try {
      if (!supplierId) {
        showToast("Could not find supplier details. Please log in again.", 'error');
        return;
      }

      const payload = {
        supplierId: supplierId,
        item: pickupForm.itemName,
        quantity: requestedQuantity,
        pickupDate: pickupForm.pickupDate,
        pickupTime: pickupForm.pickupTime,
        specialInstructions: pickupForm.specialInstructions || ''
      };

      console.log("Submitting pickup request:", payload);

      const response = await fetch("http://127.0.0.1:8000/api/pickup/request/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (response.ok) {
        showToast("Pickup request submitted successfully! We'll collect from the warehouse.", 'success');
        setPickupForm({
          deliveryId: '',
          itemName: '',
          availableQuantity: 0,
          unit: '',
          quantity: '',
          pickupDate: '',
          pickupTime: '',
          specialInstructions: ''
        });
        fetchPickupRequests();
        fetchDeliveredItems();
      } else {
        showToast(`Error: ${data.error || 'Failed to submit pickup request.'}`, 'error');
        console.error("Server error response:", data);
      }
    } catch (err) {
      showToast("An error occurred: " + err.message, 'error');
      console.error("Error submitting pickup request:", err);
    }
  };


  const handleGoBack = () => {
    window.history.back();
  };


  const getStatusColor = (status) => {
    const statusLower = (status || 'pending').toLowerCase();
    switch(statusLower) {
      case 'approved':
      case 'completed':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' };
      case 'confirmed':
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
      case 'rejected':
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' };
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
          <button onClick={handleGoBack} style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', color: '#60a5fa'}}>
            <ArrowLeft size={24} />
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'}}>
              <Truck size={28} color="#fff" />
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'}}>Request Warehouse Pickup</div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Schedule pickup from your stored inventory</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10}}>
        
        {/* Pickup Form */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div>
            <div style={{marginBottom: '32px'}}>
              <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <Box size={24} color="#60a5fa" />
                Select Item from Your Warehouse Stock
              </h3>
              
              {loadingItems ? (
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '20px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px'}}>
                  <RefreshCw size={20} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
                  <span style={{color: '#94a3b8', fontSize: '14px'}}>Loading your delivered items...</span>
                </div>
              ) : deliveredItems.length === 0 ? (
                <div style={{padding: '40px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '2px dashed rgba(71, 85, 105, 0.4)', textAlign: 'center'}}>
                  <Package size={48} color="#60a5fa" style={{opacity: 0.5, margin: '0 auto 16px'}} />
                  <div style={{fontSize: '16px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px'}}>No items in warehouse</div>
                  <div style={{fontSize: '14px', color: '#94a3b8'}}>You need to send stock to the warehouse first before requesting a pickup.</div>
                  <button onClick={handleGoBack} style={{marginTop: '20px', padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s'}}>
                    Go Back to Home
                  </button>
                </div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>
                      Select Item <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select 
                      name="deliveryId" 
                      value={pickupForm.deliveryId} 
                      onChange={handleItemSelect}
                      style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.3s'}}
                    >
                      <option value="">-- Choose an item from your deliveries --</option>
                      {deliveredItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item} - {item.quantity} {item.unit} (Delivered: {formatDate(item.deliveryDate)})
                        </option>
                      ))}
                    </select>
                    <div style={{marginTop: '8px', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic'}}>
                      Showing {deliveredItems.length} item{deliveredItems.length !== 1 ? 's' : ''} you've delivered to the warehouse
                    </div>
                  </div>
                  
                  {pickupForm.deliveryId && (
                    <>
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>
                          Available Quantity
                        </label>
                        <div style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', background: 'rgba(30, 41, 59, 0.4)', color: '#60a5fa', fontWeight: 600, boxSizing: 'border-box'}}>
                          {pickupForm.availableQuantity} {pickupForm.unit}
                        </div>
                      </div>
                      
                      <div>
                        <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>
                          Pickup Quantity <span style={{color: '#ef4444'}}>*</span>
                        </label>
                        <input 
                          type="number" 
                          name="quantity" 
                          value={pickupForm.quantity} 
                          onChange={handleChange} 
                          min="1" 
                          max={pickupForm.availableQuantity}
                          placeholder={`Max: ${pickupForm.availableQuantity} ${pickupForm.unit}`}
                          style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} 
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {pickupForm.deliveryId && (
              <>
                <div style={{marginBottom: '32px'}}>
                  <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <Calendar size={24} color="#60a5fa" />
                    Pickup Schedule
                  </h3>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>
                        Pickup Date <span style={{color: '#ef4444'}}>*</span>
                      </label>
                      <input type="date" name="pickupDate" value={pickupForm.pickupDate} onChange={handleChange} style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                    </div>
                    <div>
                      <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>
                        Preferred Time <span style={{color: '#ef4444'}}>*</span>
                      </label>
                      <input type="time" name="pickupTime" value={pickupForm.pickupTime} onChange={handleChange} style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                    </div>
                  </div>
                </div>

                <div style={{marginBottom: '32px'}}>
                  <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>Special Instructions</label>
                  <textarea name="specialInstructions" value={pickupForm.specialInstructions} onChange={handleChange} rows={4} placeholder="Any special handling requirements, specific warehouse location, or additional notes..." style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', resize: 'vertical', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)'}}>
                  <button type="button" onClick={handleGoBack} style={{padding: '16px 32px', background: 'rgba(71, 85, 105, 0.4)', color: '#e2e8f0', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '16px', transition: 'all 0.3s'}}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleSubmit} style={{padding: '16px 32px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '16px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Truck size={20} />
                    Submit Pickup Request
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Pickup Requests Table */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '32px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
            <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '12px'}}>
              <Package size={24} color="#60a5fa" />
              Your Pickup Requests
            </h3>
            <button onClick={fetchPickupRequests} disabled={loading} style={{padding: '12px 24px', background: loading ? 'rgba(71, 85, 105, 0.4)' : 'rgba(59, 130, 246, 0.2)', color: loading ? '#94a3b8' : '#60a5fa', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s', opacity: loading ? 0.6 : 1}}>
              <RefreshCw size={18} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '20px'}}>
              <RefreshCw size={48} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
              <div style={{fontSize: '18px', color: '#94a3b8', fontWeight: 600}}>Loading pickup requests...</div>
            </div>
          ) : pickupRequests.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '2px dashed rgba(71, 85, 105, 0.4)'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Package size={40} color="#60a5fa" style={{opacity: 0.5}} />
              </div>
              <div style={{fontSize: '18px', fontWeight: 700, color: '#e2e8f0'}}>No pickup requests found</div>
              <div style={{fontSize: '14px', color: '#94a3b8', textAlign: 'center'}}>Submit your first pickup request using the form above!</div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {pickupRequests.map((request, index) => {
                const statusColors = getStatusColor(request.status);
                return (
                  <div key={request.id || index} style={{background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(71, 85, 105, 0.3)', transition: 'all 0.3s', cursor: 'default'}} className="request-card">
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'}}>
                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Item Name</div>
                        <div style={{fontSize: '16px', color: '#f1f5f9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Package size={18} color="#60a5fa" />
                          {request.item || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Quantity</div>
                        <div style={{fontSize: '16px', color: '#cbd5e1', fontWeight: 600}}>
                          {request.quantity || 0} units
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Pickup Date</div>
                        <div style={{fontSize: '16px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Calendar size={18} color="#60a5fa" />
                          {formatDate(request.pickupDate) || 'Not set'}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Pickup Time</div>
                        <div style={{fontSize: '16px', color: '#cbd5e1', fontWeight: 600}}>
                          {request.pickupTime && request.pickupTime !== 'null' && request.pickupTime !== '' 
                            ? request.pickupTime 
                            : <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Not specified</span>}
                        </div>
                      </div>

                      <div>
                        <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Status</div>
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          background: statusColors.bg,
                          color: statusColors.color,
                          display: 'inline-block',
                          textTransform: 'capitalize',
                          border: `2px solid ${statusColors.color}40`
                        }}>
                          {formatStatus(request.status)}
                        </span>
                      </div>
                    </div>

                    {request.specialInstructions && request.specialInstructions !== 'null' && request.specialInstructions !== '' && (
                      <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(71, 85, 105, 0.3)'}}>
                        <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'}}>Special Instructions</div>
                        <div style={{fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(51, 65, 85, 0.4)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(71, 85, 105, 0.3)'}}>
                          {request.specialInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, textarea:focus, select:focus {
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
        input::placeholder, textarea::placeholder {
          color: #64748b;
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .request-card:hover {
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(59, 130, 246, 0.4) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
}

export default RequestPickupPage;
