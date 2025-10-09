import React, { useState } from 'react';
import { Truck, ClipboardList, PhoneCall, Package, Sparkles } from 'lucide-react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Home_Supplier() {
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // ✅ Get logged-in supplier from localStorage
  const supplierData = JSON.parse(localStorage.getItem("supplier")) || {};

  const [supplier] = useState({
    name: supplierData.companyName || "ABC Suppliers Pvt Ltd",
    contact: supplierData.phone || "+91 98765 43210",
    deliveriesToday: 5,
    pendingDeliveries: 12,
    lastDelivery: "Yesterday"
  });


  const [pickupForm, setPickupForm] = useState({
    item: "",
    quantity: "",
    pickupDate: ""
  });

  const [deliveryForm, setDeliveryForm] = useState({
    item: "",
    quantity: "",
    deliveryDate: "",
    notes: ""
  });

  const [pickupRequests, setPickupRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  const handlePickupChange = (e) => {
    const { name, value } = e.target;
    setPickupForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePickupSubmit = () => {
    if (pickupForm.item && pickupForm.quantity && pickupForm.pickupDate) {
      const newRequest = {
        id: Date.now(),
        ...pickupForm,
        status: "Pending"
      };
      setPickupRequests(prev => [...prev, newRequest]);
      setPickupForm({ item: "", quantity: "", pickupDate: "" });
      setShowPickupModal(false);
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryForm(prev => ({ ...prev, [name]: value }));
  };

 const handleDeliverySubmit = async () => {
  const { item, quantity, deliveryDate, notes } = deliveryForm;

  if (!item || !quantity || !deliveryDate) {
    toast.warn("Please fill all required fields!", { position: "top-center" });
    return;
  }

  try {
    const supplier = JSON.parse(localStorage.getItem("supplier"));

    const payload = {
      item,
      quantity: Number(quantity),
      deliveryDate,
      notes,
      supplierId: supplier.id, // ✅ match backend key
    };

    const response = await fetch("http://127.0.0.1:8000/api/add_delivery/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      toast.success("Delivery added successfully!", { position: "top-right" });
      setDeliveries((prev) => [...prev, payload]);
      setDeliveryForm({ item: "", quantity: "", deliveryDate: "", notes: "" });
      setShowDeliveryModal(false);
    } else {
      toast.error(`Error: ${data.error}`, { position: "top-right" });
    }
  } catch (err) {
    toast.error("Error: " + err.message, { position: "top-right" });
  }
};






  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '0',
      margin: '0',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
        top: '-250px',
        left: '-250px',
        animation: 'float 20s infinite ease-in-out',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)',
        bottom: '-200px',
        right: '-200px',
        animation: 'float 25s infinite ease-in-out reverse',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'pulse 15s infinite ease-in-out',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.5px'
          }}>
            {supplier.name}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#60a5fa',
          fontSize: '15px',
          fontWeight: 500
        }}>
          <PhoneCall size={18} />
          <span>{supplier.contact}</span>
        </div>
      </div>

      <div style={{
        padding: '40px 48px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {[
            { icon: ClipboardList, label: "Today's Deliveries", value: supplier.deliveriesToday },
            { icon: Package, label: "Pending Deliveries", value: supplier.pendingDeliveries },
            { icon: Truck, label: "Last Delivery", value: supplier.lastDelivery }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'transform 0.3s',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4))',
                borderRadius: '20px',
                opacity: 0.3,
                filter: 'blur(20px)',
                zIndex: -1,
                animation: 'glow 3s infinite ease-in-out'
              }}></div>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
              }}>
                {React.createElement(stat.icon, { size: 28, color: '#fff' })}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#94a3b8',
                marginBottom: '8px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>{stat.label}</div>
              <div style={{
                fontSize: '36px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {[
            { icon: ClipboardList, label: "View Deliveries", onClick: null },
            { icon: Package, label: "Add New Delivery", onClick: () => setShowDeliveryModal(true) },
            { icon: PhoneCall, label: "Contact Warehouse", onClick: null },
            { icon: Truck, label: "Request Pickup", onClick: () => setShowPickupModal(true) }
          ].map((action, idx) => (
            <div key={idx} onClick={action.onClick} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                borderRadius: '12px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                {React.createElement(action.icon, { size: 24, color: '#fff' })}
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#e2e8f0'
              }}>{action.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Package size={24} color="#60a5fa" />
            Deliveries
          </div>
          {deliveries.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#64748b',
              fontSize: '16px'
            }}>No deliveries added yet.</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 8px'
              }}>
                <thead>
                  <tr>
                    {['Item', 'Quantity', 'Delivery Date', 'Notes'].map((header, idx) => (
                      <th key={idx} style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: '#fff',
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderTopLeftRadius: idx === 0 ? '12px' : '0',
                        borderTopRightRadius: idx === 3 ? '12px' : '0'
                      }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery.id} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      transition: 'all 0.2s'
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0',
                        borderTopLeftRadius: '8px',
                        borderBottomLeftRadius: '8px'
                      }}>{delivery.item}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0'
                      }}>{delivery.quantity}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0'
                      }}>{delivery.deliveryDate}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0',
                        borderTopRightRadius: '8px',
                        borderBottomRightRadius: '8px'
                      }}>{delivery.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Truck size={24} color="#60a5fa" />
            Pickup Requests
          </div>
          {pickupRequests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#64748b',
              fontSize: '16px'
            }}>No pickup requests yet.</div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 8px'
              }}>
                <thead>
                  <tr>
                    {['Item', 'Quantity', 'Pickup Date', 'Status'].map((header, idx) => (
                      <th key={idx} style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: '#fff',
                        padding: '14px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        borderTopLeftRadius: idx === 0 ? '12px' : '0',
                        borderTopRightRadius: idx === 3 ? '12px' : '0'
                      }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pickupRequests.map((req) => (
                    <tr key={req.id} style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      transition: 'all 0.2s'
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0',
                        borderTopLeftRadius: '8px',
                        borderBottomLeftRadius: '8px'
                      }}>{req.item}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0'
                      }}>{req.quantity}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0'
                      }}>{req.pickupDate}</td>
                      <td style={{
                        padding: '16px',
                        fontSize: '15px',
                        color: '#e2e8f0',
                        borderTopRightRadius: '8px',
                        borderBottomRightRadius: '8px'
                      }}>{req.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showPickupModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }} onClick={() => setShowPickupModal(false)}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '36px',
            minWidth: '420px',
            maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#fff'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{marginBottom: '24px', color: '#fff', fontSize: '24px', fontWeight: 700}}>Request Pickup Order</h2>
            <div>
              {['item', 'quantity', 'pickupDate'].map((field) => (
                <div key={field} style={{marginBottom: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>
                    {field === 'pickupDate' ? 'Pickup Date' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input 
                    type={field === 'quantity' ? 'number' : field === 'pickupDate' ? 'date' : 'text'} 
                    name={field} 
                    value={pickupForm[field]} 
                    onChange={handlePickupChange} 
                    min={field === 'quantity' ? '1' : undefined}
                    style={{
                      width: '100%', 
                      padding: '14px', 
                      borderRadius: '12px', 
                      border: '2px solid rgba(71, 85, 105, 0.4)', 
                      fontSize: '15px', 
                      outline: 'none', 
                      background: 'rgba(30, 41, 59, 0.6)', 
                      color: '#fff', 
                      boxSizing: 'border-box', 
                      transition: 'all 0.3s'
                    }} 
                  />
                </div>
              ))}
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px'}}>
                <button onClick={() => setShowPickupModal(false)} style={{padding: '14px 24px', background: 'rgba(71, 85, 105, 0.4)', color: '#e2e8f0', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}>Cancel</button>
                <button onClick={handlePickupSubmit} style={{padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px'}}>Request Pickup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }} onClick={() => setShowDeliveryModal(false)}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '36px',
            minWidth: '420px',
            maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#fff'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{marginBottom: '24px', color: '#fff', fontSize: '24px', fontWeight: 700}}>Add New Delivery</h2>
            <div>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>Item Name</label>
                <input type="text" name="item" value={deliveryForm.item} onChange={handleDeliveryChange} style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
              </div>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>Quantity</label>
                <input type="number" name="quantity" value={deliveryForm.quantity} onChange={handleDeliveryChange} min="1" style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
              </div>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>Delivery Date</label>
                <input type="date" name="deliveryDate" value={deliveryForm.deliveryDate} onChange={handleDeliveryChange} style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.3s'}} />
              </div>
              <div style={{marginBottom: '28px'}}>
                <label style={{display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600, fontSize: '14px', letterSpacing: '0.3px'}}>Notes</label>
                <textarea name="notes" value={deliveryForm.notes} onChange={handleDeliveryChange} rows={3} style={{width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid rgba(71, 85, 105, 0.4)', fontSize: '15px', outline: 'none', background: 'rgba(30, 41, 59, 0.6)', color: '#fff', resize: 'vertical', boxSizing: 'border-box', transition: 'all 0.3s'}} />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button onClick={() => setShowDeliveryModal(false)} style={{padding: '14px 24px', background: 'rgba(71, 85, 105, 0.4)', color: '#e2e8f0', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}>Cancel</button>
                <button onClick={handleDeliverySubmit} style={{padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px'}}>Add Delivery</button>
              </div>
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
        input:focus, textarea:focus {
          border-color: rgba(59, 130, 246, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        button:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        button:active:not(:disabled) {
          transform: translateY(0px);
        }
      `}</style>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="dark"
/>

    </div>
  );
}

export default Home_Supplier;