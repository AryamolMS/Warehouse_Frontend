import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ClipboardList, PhoneCall, Package, Sparkles, X, CheckCircle, AlertCircle, Thermometer, Calendar, Box, Weight } from 'lucide-react';

function Home_Supplier() {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDeliveries, setShowDeliveries] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [supplier, setSupplier] = useState({
    id: null,
    name: "Loading...",
    phone: "Fetching...",
    deliveriesToday: 0,
    totalDeliveries: 0,
    lastDelivery: "N/A"
  });
  const [deliveryForm, setDeliveryForm] = useState({
    item: "",
    quantity: "",
    unit: "kg",
    category: "",
    deliveryDate: "",
    deliveryTime: "",
    storageType: "",
    expiryDate: "",
    batchNumber: "",
    manufacturer: "",
    packagingType: "",
    palletCount: "",
    specialHandling: "",
    temperatureRequirement: "",
    hazardousClass: "",
    invoiceNumber: "",
    poNumber: "",
    notes: ""
  });
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deliveryPerPage, setDeliveryPerPage] = useState(5);

  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem("userDetails");
    localStorage.removeItem("userRole");
    showToast("Logged out successfully!", 'success');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };
  
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

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDeliverySubmit = async () => {
    const { item, quantity, unit, category, deliveryDate, storageType } = deliveryForm;
    if (!item || !quantity || !unit || !category || !deliveryDate || !storageType) {
      showToast("Please fill all required fields!", 'warning');
      return;
    }
    try {
      const loggedInSupplier = JSON.parse(localStorage.getItem("userDetails"));
      if (!loggedInSupplier || !loggedInSupplier.id) {
        showToast("Could not find supplier details. Please log in again.", 'error');
        return;
      }
      const payload = {
        ...deliveryForm,
        quantity: Number(quantity),
        palletCount: deliveryForm.palletCount ? Number(deliveryForm.palletCount) : null,
        supplierId: loggedInSupplier.id,
      };
      
      console.log("Sending delivery payload:", payload);
      
      const response = await fetch("http://127.0.0.1:8000/api/add_delivery/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        showToast("Stock delivery scheduled successfully!", 'success');
        const newDelivery = {id: data.id || Date.now(), ...payload};
        setDeliveries((prev) => [...prev, newDelivery]);
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const updatedDeliveries = [...deliveries, newDelivery];
        
        const todayCount = updatedDeliveries.filter(d => {
          if (!d.deliveryDate) return false;
          const deliveryDateStr = d.deliveryDate.split('T')[0];
          return deliveryDateStr === todayStr;
        }).length;
        
        const totalCount = updatedDeliveries.length;
        
        const sortedDeliveries = [...updatedDeliveries].sort((a, b) => 
          new Date(b.deliveryDate) - new Date(a.deliveryDate)
        );
        const lastDeliveryDate = sortedDeliveries[0].deliveryDate.split('T')[0];
        
        setSupplier(prev => ({
          ...prev,
          deliveriesToday: todayCount,
          totalDeliveries: totalCount,
          lastDelivery: lastDeliveryDate
        }));
        
        setDeliveryForm({ 
          item: "", 
          quantity: "", 
          unit: "kg",
          category: "",
          deliveryDate: "", 
          deliveryTime: "",
          storageType: "",
          expiryDate: "",
          batchNumber: "",
          manufacturer: "",
          packagingType: "",
          palletCount: "",
          specialHandling: "",
          temperatureRequirement: "",
          hazardousClass: "",
          invoiceNumber: "",
          poNumber: "",
          notes: "" 
        });
        setShowDeliveryModal(false);
      } else {
        showToast(`Error: ${data.error || 'Failed to schedule delivery.'}`, 'error');
      }
    } catch (err) {
      showToast("An error occurred: " + err.message, 'error');
    }
  };

  useEffect(() => {
    const storedSupplier = JSON.parse(localStorage.getItem("userDetails")) || null;
    if (storedSupplier) {
      setSupplier(prev => ({
        ...prev,
        id: storedSupplier.id,
        name: storedSupplier.companyName || storedSupplier.name || "Unknown Supplier",
        phone: storedSupplier.phone || "No contact"
      }));
    }
  }, []);

  useEffect(() => {
    if (!supplier.id) return;
    const fetchDeliveries = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get_deliveries/${supplier.id}/`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const deliveriesData = data.deliveries || data || [];
        setDeliveries(deliveriesData);
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const todayCount = deliveriesData.filter(d => {
          if (!d.deliveryDate) return false;
          const deliveryDateStr = d.deliveryDate.split('T')[0];
          return deliveryDateStr === todayStr;
        }).length;
        
        const totalCount = deliveriesData.length;
        
        let lastDeliveryDate = "N/A";
        if (deliveriesData.length > 0) {
          const sortedDeliveries = [...deliveriesData].sort((a, b) => 
            new Date(b.deliveryDate) - new Date(a.deliveryDate)
          );
          lastDeliveryDate = sortedDeliveries[0].deliveryDate.split('T')[0];
        }
        
        setSupplier(prev => ({
          ...prev,
          deliveriesToday: todayCount,
          totalDeliveries: totalCount,
          lastDelivery: lastDeliveryDate
        }));
        
      } catch (err) {
        showToast("Error fetching deliveries: " + err.message, 'error');
      }
    };
    fetchDeliveries();
  }, [supplier.id]);

  const totalDeliveryPages = Math.ceil(deliveries.length / deliveryPerPage);
  const startDeliveryIndex = (deliveryPage - 1) * deliveryPerPage;
  const endDeliveryIndex = startDeliveryIndex + deliveryPerPage;
  const currentDeliveries = deliveries.slice(startDeliveryIndex, endDeliveryIndex);

  const handleDeliveryPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalDeliveryPages) {
      setDeliveryPage(newPage);
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', padding: '0', margin: '0', position: 'relative', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'}}>
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)', top: '-250px', left: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none'}}></div>
      <div style={{position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)', bottom: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out reverse', pointerEvents: 'none'}}></div>
      <div style={{position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'pulse 15s infinite ease-in-out', pointerEvents: 'none'}}></div>

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

      <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', zIndex: 10}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'}}>
            <Sparkles size={28} color="#fff" />
          </div>
          <div style={{fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px'}}>{supplier.name}</div>
        </div>
        <button onClick={handleLogout} style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)', transition: 'all 0.3s'}}>
          <X size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div style={{padding: '40px 48px', maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px'}}>
          {[
            { icon: ClipboardList, label: "Today's Deliveries", value: supplier.deliveriesToday },
            { icon: Package, label: "Total Deliveries", value: supplier.totalDeliveries },
            { icon: Truck, label: "Last Delivery", value: supplier.lastDelivery }
          ].map((stat, idx) => (
            <div key={idx} style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'transform 0.3s', cursor: 'pointer', position: 'relative'}}>
              <div style={{position: 'absolute', top: '-2px', left: '-2px', right: '-2px', bottom: '-2px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4))', borderRadius: '20px', opacity: 0.3, filter: 'blur(20px)', zIndex: -1, animation: 'glow 3s infinite ease-in-out'}}></div>
              <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '12px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'}}>
                {React.createElement(stat.icon, { size: 28, color: '#fff' })}
              </div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>{stat.label}</div>
              <div style={{fontSize: '36px', fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px'}}>
          {[
            { icon: ClipboardList, label: showDeliveries ? "Hide Deliveries" : "View Deliveries", onClick: () => setShowDeliveries(prev => !prev) },
            { icon: Package, label: "Send Stock to Warehouse", onClick: () => setShowDeliveryModal(true) },
            { icon: PhoneCall, label: "Contact Warehouse", onClick: () => setShowWarehouseModal(true) },
            { icon: Truck, label: "Request Pickup", onClick: ()=> navigate('/requestpickup')  }
          ].map((action, idx) => (
            <div key={idx} onClick={action.onClick} style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'}}>
                {React.createElement(action.icon, { size: 24, color: '#fff' })}
              </div>
              <div style={{fontSize: '16px', fontWeight: 600, color: '#e2e8f0'}}>{action.label}</div>
            </div>
          ))}
        </div>

        {showDeliveries && (
          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '32px', marginBottom: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <Package size={24} color="#60a5fa" />
                Stock Deliveries
              </div>
              {deliveries.length > 0 && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <label style={{fontSize: '14px', color: '#94a3b8', fontWeight: 500}}>Items per page:</label>
                  <select value={deliveryPerPage} onChange={(e) => {setDeliveryPerPage(Number(e.target.value)); setDeliveryPage(1);}} style={{padding: '6px 12px', borderRadius: '8px', border: '2px solid rgba(71, 85, 105, 0.4)', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', outline: 'none'}}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              )}
            </div>
            {deliveries.length === 0 ? (
              <div style={{textAlign: 'center', padding: '48px', color: '#64748b', fontSize: '16px'}}>No deliveries scheduled yet.</div>
            ) : (
              <>
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px'}}>
                    <thead>
                      <tr>
                        {['Item', 'Quantity', 'Category', 'Delivery Date', 'Storage Type', 'Batch #'].map((header, idx) => (
                          <th key={idx} style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', borderTopLeftRadius: idx === 0 ? '12px' : '0', borderTopRightRadius: idx === 5 ? '12px' : '0'}}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentDeliveries.map((delivery, index) => (
                        <tr key={delivery.id || index} style={{background: 'rgba(30, 41, 59, 0.6)', transition: 'all 0.2s'}}>
                          <td style={{padding: '16px', fontSize: '15px', color: '#e2e8f0', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px'}}>{delivery.item}</td>
                          <td style={{padding: '16px', fontSize: '15px', color: '#e2e8f0'}}>{delivery.quantity} {delivery.unit || ''}</td>
                          <td style={{padding: '16px', fontSize: '15px', color: '#e2e8f0'}}>{delivery.category || '-'}</td>
                          <td style={{padding: '16px', fontSize: '15px', color: '#e2e8f0'}}>{delivery.deliveryDate}</td>
                          <td style={{padding: '16px', fontSize: '15px', color: '#e2e8f0'}}>{delivery.storageType || '-'}</td>
                          <td style={{padding: '16px', fontSize: '15px', color: '#e2e8f0', borderTopRightRadius: '8px', borderBottomRightRadius: '8px'}}>{delivery.batchNumber || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalDeliveryPages > 1 && (
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', flexWrap: 'wrap', gap: '16px'}}>
                    <div style={{color: '#94a3b8', fontSize: '14px', fontWeight: 500}}>
                      Showing {startDeliveryIndex + 1} to {Math.min(endDeliveryIndex, deliveries.length)} of {deliveries.length} deliveries
                    </div>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                      <button onClick={() => handleDeliveryPageChange(1)} disabled={deliveryPage === 1} style={{padding: '8px 14px', borderRadius: '8px', border: 'none', background: deliveryPage === 1 ? 'rgba(71, 85, 105, 0.3)' : 'rgba(59, 130, 246, 0.2)', color: deliveryPage === 1 ? '#64748b' : '#60a5fa', cursor: deliveryPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'}}>First</button>
                      <button onClick={() => handleDeliveryPageChange(deliveryPage - 1)} disabled={deliveryPage === 1} style={{padding: '8px 14px', borderRadius: '8px', border: 'none', background: deliveryPage === 1 ? 'rgba(71, 85, 105, 0.3)' : 'rgba(59, 130, 246, 0.2)', color: deliveryPage === 1 ? '#64748b' : '#60a5fa', cursor: deliveryPage === 1 ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'}}>Previous</button>
                      <div style={{padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)', color: '#fff', fontSize: '14px', fontWeight: 600}}>{deliveryPage} / {totalDeliveryPages}</div>                      <button onClick={() => handleDeliveryPageChange(deliveryPage + 1)} disabled={deliveryPage === totalDeliveryPages} style={{padding: '8px 14px', borderRadius: '8px', border: 'none', background: deliveryPage === totalDeliveryPages ? 'rgba(71, 85, 105, 0.3)' : 'rgba(59, 130, 246, 0.2)', color: deliveryPage === totalDeliveryPages ? '#64748b' : '#60a5fa', cursor: deliveryPage === totalDeliveryPages ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'}}>Next</button>
                      <button onClick={() => handleDeliveryPageChange(totalDeliveryPages)} disabled={deliveryPage === totalDeliveryPages} style={{padding: '8px 14px', borderRadius: '8px', border: 'none', background: deliveryPage === totalDeliveryPages ? 'rgba(71, 85, 105, 0.3)' : 'rgba(59, 130, 246, 0.2)', color: deliveryPage === totalDeliveryPages ? '#64748b' : '#60a5fa', cursor: deliveryPage === totalDeliveryPages ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s'}}>Last</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ENHANCED DELIVERY MODAL WITH MORE FIELDS */}
      {showDeliveryModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '20px'}} onClick={() => setShowDeliveryModal(false)}>
          <div style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', maxWidth: '1000px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px'}}>
              <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'}}>
                <Package size={24} color="#fff" />
              </div>
              <h2 style={{margin: 0, color: '#fff', fontSize: '24px', fontWeight: 700}}>Send Stock to Warehouse</h2>
            </div>
            
            <div>
              {/* Item Details Section */}
              <div style={{marginBottom: '28px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Box size={18} />
                  Item Details
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Item Name <span style={{color: '#ef4444'}}>*</span></label>
                    <input type="text" name="item" value={deliveryForm.item} onChange={handleDeliveryChange} placeholder="e.g., Organic Rice" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Quantity <span style={{color: '#ef4444'}}>*</span></label>
                    <input type="number" name="quantity" value={deliveryForm.quantity} onChange={handleDeliveryChange} min="1" placeholder="100" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Unit <span style={{color: '#ef4444'}}>*</span></label>
                    <select name="unit" value={deliveryForm.unit} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.3s'}}>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                      <option value="liters">Liters</option>
                      <option value="tons">Tons</option>
                      <option value="pallets">Pallets</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Category <span style={{color: '#ef4444'}}>*</span></label>
                    <select name="category" value={deliveryForm.category} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.3s'}}>
                      <option value="">Select Category</option>
                      <option value="Food">Food Items</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Textiles">Textiles & Clothing</option>
                      <option value="Raw Materials">Raw Materials</option>
                      <option value="Pharmaceuticals">Pharmaceuticals</option>
                      <option value="Chemicals">Chemicals</option>
                      <option value="Perishables">Perishables</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Batch Number</label>
                    <input type="text" name="batchNumber" value={deliveryForm.batchNumber} onChange={handleDeliveryChange} placeholder="e.g., BTH-2025-001" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Manufacturer</label>
                    <input type="text" name="manufacturer" value={deliveryForm.manufacturer} onChange={handleDeliveryChange} placeholder="Manufacturer name" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                </div>
              </div>

              {/* Delivery Schedule Section */}
              <div style={{marginBottom: '28px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Calendar size={18} />
                  Delivery Schedule
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Delivery Date <span style={{color: '#ef4444'}}>*</span></label>
                    <input type="date" name="deliveryDate" value={deliveryForm.deliveryDate} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Delivery Time</label>
                    <input type="time" name="deliveryTime" value={deliveryForm.deliveryTime} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Expiry Date</label>
                    <input type="date" name="expiryDate" value={deliveryForm.expiryDate} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                </div>
              </div>

              {/* Storage & Packaging Section */}
              <div style={{marginBottom: '28px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Thermometer size={18} />
                  Storage & Packaging
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Storage Type <span style={{color: '#ef4444'}}>*</span></label>
                    <select name="storageType" value={deliveryForm.storageType} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.3s'}}>
                      <option value="">Select Storage Type</option>
                      <option value="Ambient">Ambient (Room Temperature)</option>
                      <option value="Refrigerated">Refrigerated (2-8°C)</option>
                      <option value="Frozen">Frozen (-18°C or below)</option>
                      <option value="Climate Controlled">Climate Controlled</option>
                      <option value="Dry Storage">Dry Storage</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Temperature Requirement</label>
                    <input type="text" name="temperatureRequirement" value={deliveryForm.temperatureRequirement} onChange={handleDeliveryChange} placeholder="e.g., 2-8°C" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Packaging Type</label>
                    <select name="packagingType" value={deliveryForm.packagingType} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.3s'}}>
                      <option value="">Select Packaging</option>
                      <option value="Cardboard Boxes">Cardboard Boxes</option>
                      <option value="Wooden Crates">Wooden Crates</option>
                      <option value="Plastic Containers">Plastic Containers</option>
                      <option value="Bags/Sacks">Bags/Sacks</option>
                      <option value="Drums">Drums</option>
                      <option value="Palletized">Palletized</option>
                      <option value="Shrink Wrapped">Shrink Wrapped</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Pallet Count</label>
                    <input type="number" name="palletCount" value={deliveryForm.palletCount} onChange={handleDeliveryChange} min="0" placeholder="Number of pallets" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                </div>
              </div>

              {/* Safety & Compliance Section */}
              <div style={{marginBottom: '28px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <AlertCircle size={18} />
                  Safety & Compliance
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Hazardous Classification</label>
                    <select name="hazardousClass" value={deliveryForm.hazardousClass} onChange={handleDeliveryChange} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.3s'}}>
                      <option value="">Non-Hazardous</option>
                      <option value="Class 1">Class 1 - Explosives</option>
                      <option value="Class 2">Class 2 - Gases</option>
                      <option value="Class 3">Class 3 - Flammable Liquids</option>
                      <option value="Class 4">Class 4 - Flammable Solids</option>
                      <option value="Class 5">Class 5 - Oxidizers</option>
                      <option value="Class 6">Class 6 - Toxic Materials</option>
                      <option value="Class 7">Class 7 - Radioactive</option>
                      <option value="Class 8">Class 8 - Corrosives</option>
                      <option value="Class 9">Class 9 - Miscellaneous</option>
                    </select>
                  </div>
                  <div style={{gridColumn: 'span 2'}}>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Special Handling Instructions</label>
                    <input type="text" name="specialHandling" value={deliveryForm.specialHandling} onChange={handleDeliveryChange} placeholder="e.g., Fragile, Keep Upright, Stack Limit: 5" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                </div>
              </div>

              {/* Documentation Section */}
              <div style={{marginBottom: '28px'}}>
                <h3 style={{color: '#60a5fa', fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <ClipboardList size={18} />
                  Documentation
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Invoice Number</label>
                    <input type="text" name="invoiceNumber" value={deliveryForm.invoiceNumber} onChange={handleDeliveryChange} placeholder="e.g., INV-2025-001" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Purchase Order (PO) Number</label>
                    <input type="text" name="poNumber" value={deliveryForm.poNumber} onChange={handleDeliveryChange} placeholder="e.g., PO-2025-001" style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div style={{marginBottom: '28px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px'}}>Additional Notes</label>
                <textarea name="notes" value={deliveryForm.notes} onChange={handleDeliveryChange} rows={3} placeholder="Any additional information, special requirements, or delivery instructions..." style={{width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '14px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', resize: 'vertical', boxSizing: 'border-box', transition: 'all 0.3s'}} />
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <button onClick={() => setShowDeliveryModal(false)} style={{padding: '14px 24px', background: 'rgba(71, 85, 105, 0.4)', color: '#e2e8f0', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}>Cancel</button>
                <button onClick={handleDeliverySubmit} style={{padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Package size={18} />
                  Schedule Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWarehouseModal && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)'}} onClick={() => setShowWarehouseModal(false)}>
          <div style={{background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '36px', minWidth: '480px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#fff'}} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px'}}>
              <div style={{background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '16px', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'}}>
                <PhoneCall size={32} color="#fff" />
              </div>
              <h2 style={{color: '#fff', fontSize: '26px', fontWeight: 700, margin: 0}}>Warehouse Contact</h2>
            </div>
            
            <div style={{background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '24px', marginBottom: '20px'}}>
              <div style={{marginBottom: '20px'}}>
                <div style={{fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Warehouse Name</div>
                <div style={{fontSize: '18px', color: '#e2e8f0', fontWeight: 600}}>Central Distribution Hub</div>
              </div>
              
              <div style={{marginBottom: '20px'}}>
                <div style={{fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Contact Person</div>
                <div style={{fontSize: '18px', color: '#e2e8f0', fontWeight: 600}}>John Anderson</div>
                <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Warehouse Manager</div>
              </div>
              
              <div style={{marginBottom: '20px'}}>
                <div style={{fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Phone Number</div>
                <div style={{fontSize: '18px', color: '#60a5fa', fontWeight: 600}}>+1 (555) 123-4567</div>
              </div>
              
              <div style={{marginBottom: '20px'}}>
                <div style={{fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Email</div>
                <div style={{fontSize: '16px', color: '#60a5fa', fontWeight: 500}}>contact@warehouse.com</div>
              </div>
              
              <div>
                <div style={{fontSize: '13px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Address</div>
                <div style={{fontSize: '15px', color: '#e2e8f0', lineHeight: '1.6'}}>
                  1234 Industrial Park Drive<br />
                  Building 5, Suite 200<br />
                  Springfield, ST 12345
                </div>
              </div>
            </div>
            
            <div style={{background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
              <div style={{fontSize: '13px', color: '#60a5fa', fontWeight: 600, marginBottom: '8px'}}>📞 Operating Hours</div>
              <div style={{fontSize: '14px', color: '#e2e8f0'}}>
                Monday - Friday: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 2:00 PM<br />
                Sunday: Closed
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
              <button onClick={() => setShowWarehouseModal(false)} style={{padding: '14px 28px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px'}}>Close</button>
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
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
      `}</style>
    </div>
  );
}

export default Home_Supplier;