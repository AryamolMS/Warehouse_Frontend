import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, DollarSign, Calendar, Package, Clock, CheckCircle, AlertCircle, Download, RefreshCw, User, Box, Eye, X, Receipt, Truck } from 'lucide-react';

// ✅ Move STORAGE_RATES outside the component
const STORAGE_RATES = {
  'Ambient': 2.5,
  'Refrigerated': 5.0,
  'Frozen': 7.5,
  'Dry Storage': 2.0,
  'Hazardous': 10.0
};

function SupplierInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);

  const calculateInvoiceFromPickup = useCallback((pickup) => {
    const deliveryDate = new Date(pickup.createdAt);
    const pickupDate = new Date(pickup.pickupDate);
    const diffTime = pickupDate.getTime() - deliveryDate.getTime();
    const daysStored = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const storageType = pickup.storageType || pickup.storage_type || 'Ambient';
    const dailyRate = STORAGE_RATES[storageType] || STORAGE_RATES['Ambient'];
    
    const storageCost = (pickup.quantity || 0) * dailyRate * daysStored;
    const handlingFee = (pickup.quantity || 0) * 0.5;
    const subtotal = storageCost + handlingFee;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return {
      id: pickup.id,
      invoiceNumber: `INV-${pickup.id.substring(0, 8).toUpperCase()}`,
      item: pickup.item,
      quantity: pickup.quantity,
      unit: 'units',
      daysStored: daysStored,
      dailyStorageRate: dailyRate,
      storageType: storageType,
      storageCost: storageCost.toFixed(2),
      handlingFee: handlingFee.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: parseFloat(total.toFixed(2)),
      status: 'pending',
      storageStartDate: pickup.createdAt,
      storageEndDate: pickup.updatedAt || pickup.createdAt,
      createdAt: pickup.updatedAt || pickup.createdAt,
      pickupDate: pickup.pickupDate,
      pickupTime: pickup.pickupTime,
      companyName: pickup.companyName,
      specialInstructions: pickup.specialInstructions,
      supplier: pickup.supplier
    };
  }, []);

  const fetchInvoices = useCallback(async (companyName) => {
    if (!companyName) {
      console.log('No company name provided');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pickup/get_all_pickup_requests_admin/?status=approved');
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        const allPickups = data.requests || data || [];
        console.log('All Pickups:', allPickups);
        
        const supplierApprovedPickups = allPickups.filter(
          pickup => pickup.status?.toLowerCase() === 'approved' && 
                   pickup.companyName === companyName
        );
        
        console.log('Filtered Supplier Pickups for', companyName, ':', supplierApprovedPickups);
        
        const calculatedInvoices = supplierApprovedPickups.map(pickup => 
          calculateInvoiceFromPickup(pickup)
        );
        
        console.log('Calculated Invoices:', calculatedInvoices);
        setInvoices(calculatedInvoices);
      } else {
        console.error('API request failed with status:', response.status);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [calculateInvoiceFromPickup]);

  // Load supplier info from localStorage on mount
  useEffect(() => {
    const storedSupplier = localStorage.getItem('supplierCompanyName');
    const storedSupplierId = localStorage.getItem('supplierId');
    
    console.log('Loaded from localStorage:', { storedSupplier, storedSupplierId });
    
    if (storedSupplier) setSupplierName(storedSupplier);
    if (storedSupplierId) setSupplierId(storedSupplierId);
  }, []);

  // Fetch invoices when supplierName is set
  useEffect(() => {
    if (supplierName) {
      console.log('Fetching invoices for supplier:', supplierName);
      fetchInvoices(supplierName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierName]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid':
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '#10b981' };
      case 'pending':
        return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '#f59e0b' };
      case 'overdue':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '#ef4444' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '#94a3b8' };
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const openInvoice = useCallback((invoice) => {
    setSelectedPickup(invoice);
    setShowInvoice(true);
  }, []);

  const downloadInvoice = useCallback(() => {
    if (!selectedPickup) return;
    
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const invoiceText = `WAREHOUSE STORAGE INVOICE
Invoice Date: ${invoiceDate}
Invoice #: ${selectedPickup.invoiceNumber}

BILL TO:
${selectedPickup.companyName}

STORAGE DETAILS:
Item: ${selectedPickup.item}
Quantity: ${selectedPickup.quantity} units
Storage Type: ${selectedPickup.storageType}
Days Stored: ${selectedPickup.daysStored} days
Rate: $${selectedPickup.dailyStorageRate}/unit/day

CHARGES:
Storage Cost: $${selectedPickup.storageCost}
Handling Fee: $${selectedPickup.handlingFee}
Subtotal: $${selectedPickup.subtotal}
Tax (18%): $${selectedPickup.tax}
TOTAL DUE: $${selectedPickup.totalAmount.toFixed(2)}

Pickup Date: ${formatDate(selectedPickup.pickupDate)}
Payment Due: Within 30 days

Thank you for using our warehouse services!`;
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPickup.invoiceNumber}_${supplierName.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [selectedPickup, supplierName]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', top: '-250px', right: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none'}}></div>

      <div style={{maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10}}>
        <div style={{marginBottom: '32px'}}>
          <button 
            onClick={() => window.history.back()} 
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              color: '#60a5fa',
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: '24px',
              transition: 'all 0.3s'
            }}
          >
            <ArrowLeft size={24} />
          </button>
          
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
            <div>
              <h1 style={{color: '#fff', fontSize: '32px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px'}}>
                <FileText size={36} />
                Storage Invoices
              </h1>
              <p style={{color: '#94a3b8', fontSize: '16px'}}>{supplierName || 'Loading...'}</p>
            </div>
            <button 
              onClick={() => fetchInvoices(supplierName)}
              disabled={loading || !supplierName}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: loading || !supplierName ? 'not-allowed' : 'pointer',
                color: '#60a5fa',
                fontWeight: 600,
                transition: 'all 0.3s',
                opacity: loading || !supplierName ? 0.5 : 1
              }}
            >
              <RefreshCw size={18} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
              Refresh
            </button>
          </div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px'}}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{marginBottom: '16px'}}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
              }}>
                <DollarSign size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase'}}>Total Amount</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#10b981'}}>${totalAmount.toFixed(2)}</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{marginBottom: '16px'}}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
              }}>
                <Clock size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase'}}>Pending Amount</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#f59e0b'}}>${pendingAmount.toFixed(2)}</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{marginBottom: '16px'}}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
              }}>
                <FileText size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase'}}>Total Invoices</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#60a5fa'}}>{invoices.length}</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}>
          <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Truck size={24} color="#10b981" />
            Your Accepted Pickups & Invoices ({invoices.length})
          </h3>

          {loading ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'}}>
              <RefreshCw size={40} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
              <div>Loading invoices...</div>
            </div>
          ) : invoices.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '16px',
              border: '2px dashed rgba(71, 85, 105, 0.4)'
            }}>
              <FileText size={48} color="#60a5fa" style={{opacity: 0.5, marginBottom: '16px'}} />
              <div style={{fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px'}}>No invoices yet</div>
              <div style={{fontSize: '14px', color: '#94a3b8'}}>Invoices will appear here after your pickup requests are approved</div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {invoices.map((invoice, index) => {
                const statusColor = getStatusColor(invoice.status);
                return (
                  <div key={invoice.id || index} style={{
                    background: 'rgba(30, 41, 59, 0.6)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderBottomLeftRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <CheckCircle size={16} color="#fff" />
                      <span style={{color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase'}}>Approved</span>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginTop: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px'}}>
                      <div>
                        <div style={{fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px'}}>
                          {invoice.invoiceNumber}
                        </div>
                        <div style={{fontSize: '14px', color: '#94a3b8'}}>
                          Issued: {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                      <span style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: statusColor.bg,
                        color: statusColor.color,
                        border: `2px solid ${statusColor.border}40`,
                        fontSize: '13px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {invoice.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '20px',
                      marginBottom: '20px',
                      padding: '20px',
                      background: 'rgba(15, 23, 42, 0.5)',
                      borderRadius: '12px'
                    }}>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>
                          <Package size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}} />
                          Item
                        </div>
                        <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{invoice.item}</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>Quantity</div>
                        <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{invoice.quantity} {invoice.unit}</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>
                          <Clock size={14} style={{display: 'inline', marginRight: '6px', verticalAlign: 'middle'}} />
                          Days Stored
                        </div>
                        <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{invoice.daysStored} days</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>Storage Type</div>
                        <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{invoice.storageType}</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>Pickup Date</div>
                        <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{formatDate(invoice.pickupDate)}</div>
                      </div>
                      <div>
                        <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>Pickup Time</div>
                        <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{formatTime(invoice.pickupTime)}</div>
                      </div>
                    </div>

                    {invoice.specialInstructions && (
                      <div style={{marginBottom: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <FileText size={16} color="#60a5fa" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Special Instructions</div>
                        </div>
                        <div style={{fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6'}}>{invoice.specialInstructions}</div>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '20px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                      borderRadius: '12px',
                      border: '2px solid rgba(245, 158, 11, 0.3)',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <Receipt size={20} color="#f59e0b" />
                          <div style={{fontSize: '14px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase'}}>Storage Invoice</div>
                        </div>
                        <div style={{fontSize: '28px', fontWeight: 700, color: '#f59e0b'}}>${invoice.totalAmount.toFixed(2)}</div>
                        <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '4px'}}>
                          Storage: ${invoice.storageCost} + Handling: ${invoice.handlingFee} + Tax: ${invoice.tax}
                        </div>
                      </div>
                      <button
                        onClick={() => openInvoice(invoice)}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
                        }}
                      >
                        <Eye size={18} />
                        View Invoice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showInvoice && selectedPickup && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px'}} onClick={() => setShowInvoice(false)}>
          <div style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '40px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '2px solid rgba(255, 255, 255, 0.1)', color: '#fff', position: 'relative'}} onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setShowInvoice(false)} style={{position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.3s'}}>
              <X size={20} />
            </button>

            <div style={{textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '24px'}}>
              <div style={{width: '80px', height: '80px', margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.4)'}}>
                <Receipt size={40} color="#fff" />
              </div>
              <h2 style={{fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff'}}>Storage Invoice</h2>
              <div style={{fontSize: '14px', color: '#94a3b8'}}>Invoice #: {selectedPickup.invoiceNumber}</div>
              <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style={{marginBottom: '32px', padding: '20px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
              <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px'}}>Bill To</div>
              <div style={{fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px'}}>{selectedPickup.companyName}</div>
              <div style={{fontSize: '14px', color: '#cbd5e1'}}>Supplier ID: {selectedPickup.supplier}</div>
            </div>

            <div style={{marginBottom: '32px', padding: '20px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
              <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px'}}>Storage Details</div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Item</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedPickup.item}</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Quantity</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedPickup.quantity} units</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Storage Type</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedPickup.storageType}</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Days Stored</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedPickup.daysStored} days</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Storage Rate</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>${selectedPickup.dailyStorageRate}/unit/day</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Pickup Date</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatDate(selectedPickup.pickupDate)}</div>
                </div>
              </div>
            </div>

            <div style={{marginBottom: '32px', padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
              <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px'}}>Charges</div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Storage Cost ({selectedPickup.quantity} units × ${selectedPickup.dailyStorageRate} × {selectedPickup.daysStored} days)</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${selectedPickup.storageCost}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Handling Fee ({selectedPickup.quantity} units × $0.50)</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${selectedPickup.handlingFee}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Subtotal</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${selectedPickup.subtotal}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Tax (18%)</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${selectedPickup.tax}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(245, 158, 11, 0.3)'}}>
                <div style={{fontSize: '18px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase'}}>Total Amount Due</div>
                <div style={{fontSize: '28px', color: '#f59e0b', fontWeight: 700}}>${selectedPickup.totalAmount.toFixed(2)}</div>
              </div>
            </div>

            <div style={{padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '24px'}}>
              <div style={{fontSize: '12px', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px'}}>Payment Terms</div>
              <div style={{fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6'}}>
                Payment is due within 30 days from the invoice date. Late payments may incur additional charges.
              </div>
            </div>

            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                onClick={downloadInvoice}
                style={{flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
              >
                <Download size={18} />
                Download Invoice
              </button>
              <button 
                onClick={() => setShowInvoice(false)}
                style={{flex: 1, padding: '14px 24px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s'}}
              >
                Close
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SupplierInvoices;
