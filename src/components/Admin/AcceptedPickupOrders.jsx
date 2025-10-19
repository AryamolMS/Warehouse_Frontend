import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Calendar, User, Box, Download, RefreshCw, Search, Truck, Clock, FileText, DollarSign, Receipt, Eye, X } from 'lucide-react';

function AcceptedPickupOrders() {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);

  const STORAGE_RATES = {
    'Ambient': 2.5,
    'Refrigerated': 5.0,
    'Frozen': 7.5,
    'Dry Storage': 2.0,
    'Hazardous': 10.0
  };

  const calculateStorageCost = (pickup) => {
    const deliveryDate = new Date(pickup.createdAt);
    const pickupDate = new Date(pickup.pickupDate);
    const daysStored = Math.max(1, Math.ceil((pickupDate - deliveryDate) / (1000 * 60 * 60 * 24)));
    
    // Default to Ambient if storage type not available
    const storageType = pickup.storageType || pickup.storage_type || 'Ambient';
    const storageRate = STORAGE_RATES[storageType] || STORAGE_RATES['Ambient'];
    
    const storageCost = (pickup.quantity || 0) * storageRate * daysStored;
    const handlingFee = (pickup.quantity || 0) * 0.5;
    const subtotal = storageCost + handlingFee;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    return {
      daysStored,
      storageRate,
      storageType,
      storageCost: storageCost.toFixed(2),
      handlingFee: handlingFee.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const openInvoice = (pickup) => {
    setSelectedPickup(pickup);
    setShowInvoice(true);
  };

  const downloadInvoice = () => {
    if (!selectedPickup) return;
    
    const invoice = calculateStorageCost(selectedPickup);
    const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const invoiceText = `WAREHOUSE STORAGE INVOICE
Invoice Date: ${invoiceDate}
Invoice #: INV-${selectedPickup.id.substring(0, 8).toUpperCase()}

BILL TO:
${selectedPickup.companyName}

STORAGE DETAILS:
Item: ${selectedPickup.item}
Quantity: ${selectedPickup.quantity} units
Storage Type: ${invoice.storageType}
Days Stored: ${invoice.daysStored} days
Rate: ${invoice.storageRate}/unit/day

CHARGES:
Storage Cost: ${invoice.storageCost}
Handling Fee: ${invoice.handlingFee}
Subtotal: ${invoice.subtotal}
Tax (18%): ${invoice.tax}
TOTAL DUE: ${invoice.total}

Pickup Date: ${formatDate(selectedPickup.pickupDate)}
Payment Due: Within 30 days

Thank you for using our warehouse services!`;
    
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${selectedPickup.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const fetchAcceptedPickups = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/pickup/get_all_pickup_requests_admin/?status=approved');
      
      if (response.ok) {
        const data = await response.json();
        const approvedPickups = (data.requests || data || []).filter(
          pickup => pickup.status?.toLowerCase() === 'approved'
        );
        setPickups(approvedPickups);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedPickups();
    const interval = setInterval(fetchAcceptedPickups, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const suppliers = [...new Set(pickups.map(p => p.companyName).filter(Boolean))];

  const filteredPickups = pickups.filter(pickup => {
    const matchesSearch = 
      pickup.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.item?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = filterSupplier === 'all' || pickup.companyName === filterSupplier;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const pickupDate = new Date(pickup.pickupDate);
      const today = new Date();
      const diffDays = Math.ceil((pickupDate - today) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today') matchesDate = diffDays === 0;
      else if (dateFilter === 'week') matchesDate = diffDays >= 0 && diffDays <= 7;
      else if (dateFilter === 'month') matchesDate = diffDays >= 0 && diffDays <= 30;
    }
    
    return matchesSearch && matchesSupplier && matchesDate;
  });

  const totalPickups = filteredPickups.length;
  const totalQuantity = filteredPickups.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const uniqueSuppliers = new Set(filteredPickups.map(p => p.companyName)).size;
  const totalRevenue = filteredPickups.reduce((sum, p) => {
    const invoice = calculateStorageCost(p);
    return sum + parseFloat(invoice.total);
  }, 0);

  const exportToCSV = () => {
    const headers = ['Company', 'Item', 'Quantity', 'Pickup Date', 'Pickup Time', 'Storage Cost', 'Total Invoice'];
    const csvData = filteredPickups.map(pickup => {
      const invoice = calculateStorageCost(pickup);
      return [
        pickup.companyName || '',
        pickup.item || '',
        pickup.quantity || 0,
        pickup.pickupDate || '',
        pickup.pickupTime || 'N/A',
        `$${invoice.storageCost}`,
        `$${invoice.total}`
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accepted_pickups_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)', top: '-250px', left: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none'}}></div>
      <div style={{position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)', bottom: '-200px', right: '-200px', animation: 'floatReverse 25s infinite ease-in-out', pointerEvents: 'none'}}></div>

      <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '24px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', zIndex: 10}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <button onClick={() => window.history.back()} style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px', cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center', transition: 'all 0.3s'}}>
              <ArrowLeft size={24} />
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'}}>
                <Truck size={28} color="#fff" />
              </div>
              <div>
                <div style={{fontSize: '24px', fontWeight: 700, color: '#fff'}}>Accepted Pickup Orders & Invoices</div>
                <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>Track pickups and storage billing</div>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            <button onClick={exportToCSV} disabled={filteredPickups.length === 0} style={{background: 'rgba(16, 185, 129, 0.2)', border: '2px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: filteredPickups.length === 0 ? 'not-allowed' : 'pointer', color: '#10b981', fontWeight: 600, opacity: filteredPickups.length === 0 ? 0.5 : 1, transition: 'all 0.3s'}}>
              <Download size={18} />
              Export CSV
            </button>
            <button onClick={fetchAcceptedPickups} disabled={loading} style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#60a5fa', fontWeight: 600, transition: 'all 0.3s'}}>
              <RefreshCw size={18} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{padding: '40px 48px', maxWidth: '1800px', margin: '0 auto', position: 'relative', zIndex: 10}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px'}}>
          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'}}>
                <CheckCircle size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Total Pickups</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#10b981'}}>{totalPickups}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'}}>
                <Box size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Total Quantity</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#60a5fa'}}>{totalQuantity.toLocaleString()}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'}}>
                <DollarSign size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Total Revenue</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#f59e0b'}}>${totalRevenue.toFixed(2)}</div>
          </div>

          <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '28px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
            <div style={{marginBottom: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'}}>
                <User size={28} color="#fff" />
              </div>
            </div>
            <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px'}}>Active Suppliers</div>
            <div style={{fontSize: '36px', fontWeight: 700, color: '#a78bfa'}}>{uniqueSuppliers}</div>
          </div>
        </div>

        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
            <div style={{position: 'relative'}}>
              <Search size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none'}} />
              <input type="text" placeholder="Search by supplier or item..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none'}} />
            </div>

            <div style={{position: 'relative'}}>
              <User size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none'}} />
              <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} style={{width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer'}}>
                <option value="all">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            <div style={{position: 'relative'}}>
              <Calendar size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none'}} />
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer'}}>
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Truck size={24} color="#10b981" />
            Accepted Pickup Orders ({filteredPickups.length})
          </h3>

          {loading && pickups.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px'}}>
              <RefreshCw size={40} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
              <div style={{fontSize: '16px', color: '#94a3b8'}}>Loading pickups...</div>
            </div>
          ) : filteredPickups.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '2px dashed rgba(71, 85, 105, 0.4)'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Truck size={40} color="#10b981" style={{opacity: 0.5}} />
              </div>
              <div style={{fontSize: '18px', fontWeight: 700, color: '#e2e8f0'}}>No accepted pickups found</div>
              <div style={{fontSize: '14px', color: '#94a3b8', textAlign: 'center'}}>
                {searchTerm || filterSupplier !== 'all' || dateFilter !== 'all' ? 'Try adjusting your filters' : 'Approved pickup requests will appear here'}
              </div>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {filteredPickups.map((pickup, index) => {
                const invoice = calculateStorageCost(pickup);
                return (
                  <div key={pickup.id || index} style={{background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '24px', border: '2px solid rgba(16, 185, 129, 0.3)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden'}}>
                    <div style={{position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderBottomLeftRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <CheckCircle size={16} color="#fff" />
                      <span style={{color: '#fff', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase'}}>Approved</span>
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '16px'}}>
                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <User size={16} color="#10b981" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Supplier</div>
                        </div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{pickup.companyName}</div>
                      </div>

                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <Package size={16} color="#10b981" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Item</div>
                        </div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{pickup.item}</div>
                      </div>

                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <Box size={16} color="#10b981" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Quantity</div>
                        </div>
                        <div style={{fontSize: '16px', color: '#10b981', fontWeight: 700}}>{pickup.quantity} units</div>
                      </div>

                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <Calendar size={16} color="#10b981" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Pickup Date</div>
                        </div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatDate(pickup.pickupDate)}</div>
                      </div>

                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <Clock size={16} color="#10b981" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Pickup Time</div>
                        </div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatTime(pickup.pickupTime)}</div>
                      </div>

                      <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <CheckCircle size={16} color="#10b981" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Approved On</div>
                        </div>
                        <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatDate(pickup.updatedAt || pickup.createdAt)}</div>
                      </div>
                    </div>

                    {pickup.specialInstructions && (
                      <div style={{marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                          <FileText size={16} color="#60a5fa" />
                          <div style={{fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase'}}>Special Instructions</div>
                        </div>
                        <div style={{fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6'}}>{pickup.specialInstructions}</div>
                      </div>
                    )}

                    <div style={{marginTop: '20px', padding: '20px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)', borderRadius: '12px', border: '2px solid rgba(245, 158, 11, 0.3)'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                            <Receipt size={20} color="#f59e0b" />
                            <div style={{fontSize: '14px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase'}}>Storage Invoice</div>
                          </div>
                          <div style={{fontSize: '24px', color: '#fff', fontWeight: 700}}>${invoice.total}</div>
                          <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '4px'}}>
                            {invoice.daysStored} days storage • {invoice.storageType}
                          </div>
                        </div>
                        <button 
                          onClick={() => openInvoice(pickup)}
                          style={{padding: '12px 24px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)', transition: 'all 0.3s'}}
                        >
                          <Eye size={18} />
                          View Invoice
                        </button>
                      </div>
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
              <div style={{fontSize: '14px', color: '#94a3b8'}}>Invoice #: INV-{selectedPickup.id.substring(0, 8).toUpperCase()}</div>
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
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{calculateStorageCost(selectedPickup).storageType}</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Days Stored</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{calculateStorageCost(selectedPickup).daysStored} days</div>
                </div>
                <div>
                  <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Storage Rate</div>
                  <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>${calculateStorageCost(selectedPickup).storageRate}/unit/day</div>
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
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Storage Cost ({selectedPickup.quantity} units × ${calculateStorageCost(selectedPickup).storageRate} × {calculateStorageCost(selectedPickup).daysStored} days)</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${calculateStorageCost(selectedPickup).storageCost}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Handling Fee ({selectedPickup.quantity} units × $0.50)</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${calculateStorageCost(selectedPickup).handlingFee}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Subtotal</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${calculateStorageCost(selectedPickup).subtotal}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)'}}>
                <div style={{fontSize: '14px', color: '#cbd5e1'}}>Tax (18%)</div>
                <div style={{fontSize: '14px', color: '#fff', fontWeight: 600}}>${calculateStorageCost(selectedPickup).tax}</div>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)', borderRadius: '12px', border: '2px solid rgba(245, 158, 11, 0.3)'}}>
                <div style={{fontSize: '18px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase'}}>Total Amount Due</div>
                <div style={{fontSize: '28px', color: '#f59e0b', fontWeight: 700}}>${calculateStorageCost(selectedPickup).total}</div>
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
        @keyframes floatReverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 30px) scale(1.1); }
          66% { transform: translate(20px, -20px) scale(0.9); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AcceptedPickupOrders;