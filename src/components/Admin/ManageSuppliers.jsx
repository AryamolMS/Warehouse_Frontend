import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Users, Search, Mail, Phone, Building, MapPin, Calendar, Edit, Trash2, Eye, RefreshCw, Download, Filter, X, CheckCircle, AlertCircle, Package, CreditCard, FileText, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get-suppliers/');
      console.log(response);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Suppliers Response:', data);
        
        const suppliersList = data.suppliers || data.data || data || [];
        setSuppliers(suppliersList);
        showToast(`Loaded ${suppliersList.length} suppliers successfully`, 'success');
      } else {
        showToast('Failed to fetch suppliers', 'error');
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      showToast('Error loading suppliers: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const viewSupplierDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetails(true);
  };

  const exportToCSV = () => {
    const headers = ['Company Name', 'Email', 'Phone', 'Contact Person', 'Address', 'City', 'Business Type', 'Status', 'Registration Date'];
    const csvData = filteredSuppliers.map(supplier => [
      supplier.companyName || '',
      supplier.email || '',
      supplier.phone || '',
      supplier.contactPerson || '',
      supplier.address || '',
      supplier.city || '',
      supplier.businessType || '',
      supplier.isActive ? 'Active' : 'Inactive',
      formatDate(supplier.createdAt)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (supplier.companyName || '').toLowerCase().includes(searchLower) ||
      (supplier.email || '').toLowerCase().includes(searchLower) ||
      (supplier.phone || '').toLowerCase().includes(searchLower) ||
      (supplier.city || '').toLowerCase().includes(searchLower) ||
      (supplier.contactPerson || '').toLowerCase().includes(searchLower)
    );

    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? supplier.isActive === true :
      filterStatus === 'inactive' ? supplier.isActive === false :
      filterStatus === 'verified' ? supplier.isVerified === true : true;

    return matchesSearch && matchesStatus;
  });

  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const verifiedSuppliers = suppliers.filter(s => s.isVerified).length;

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', position: 'relative', overflow: 'hidden'}}>
      {/* Background Effects */}
      <div style={{position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)', top: '-250px', left: '-250px', animation: 'float 20s infinite ease-in-out', pointerEvents: 'none'}}></div>
      <div style={{position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)', bottom: '-200px', right: '-200px', animation: 'floatReverse 25s infinite ease-in-out', pointerEvents: 'none'}}></div>

      {/* Toast Notifications */}
      <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {toasts.map(toast => (
          <div key={toast.id} style={{background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)', backdropFilter: 'blur(10px)', color: '#fff', padding: '16px 20px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', animation: 'slideIn 0.3s ease-out'}}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{flex: 1, fontSize: '14px', fontWeight: 500}}>{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px'}}>
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)', padding: '24px 48px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', zIndex: 10}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <button onClick={() => navigate('/adminhome')} style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px', cursor: 'pointer', color: '#60a5fa', display: 'flex', alignItems: 'center', transition: 'all 0.3s'}}>
              <ArrowLeft size={24} />
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)'}}>
                <Users size={28} color="#fff" />
              </div>
              <div>
                <div style={{fontSize: '24px', fontWeight: 700, color: '#fff'}}>Manage Suppliers</div>
                <div style={{fontSize: '14px', color: '#94a3b8', marginTop: '4px'}}>View and manage all registered suppliers</div>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            <button onClick={exportToCSV} disabled={filteredSuppliers.length === 0} style={{background: 'rgba(16, 185, 129, 0.2)', border: '2px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: filteredSuppliers.length === 0 ? 'not-allowed' : 'pointer', color: '#10b981', fontWeight: 600, opacity: filteredSuppliers.length === 0 ? 0.5 : 1, transition: 'all 0.3s'}}>
              <Download size={18} />
              Export CSV
            </button>
            <button onClick={fetchSuppliers} disabled={loading} style={{background: 'rgba(59, 130, 246, 0.2)', border: '2px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#60a5fa', fontWeight: 600, transition: 'all 0.3s'}}>
              <RefreshCw size={18} style={{animation: loading ? 'spin 1s linear infinite' : 'none'}} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{padding: '40px 48px', maxWidth: '1800px', margin: '0 auto', position: 'relative', zIndex: 10}}>
        {/* Search and Filter Bar */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
            <div style={{position: 'relative'}}>
              <Search size={20} style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none'}} />
              <input 
                type="text" 
                placeholder="Search by company, email, phone, city..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{width: '100%', padding: '14px 14px 14px 48px', background: 'rgba(30, 41, 59, 0.6)', border: '2px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none'}} 
              />
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div style={{background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
          <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
            <Users size={24} color="#8b5cf6" />
            Registered Suppliers ({filteredSuppliers.length})
          </h3>

          {loading ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px'}}>
              <RefreshCw size={40} color="#60a5fa" style={{animation: 'spin 1s linear infinite'}} />
              <div style={{fontSize: '16px', color: '#94a3b8'}}>Loading suppliers...</div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', gap: '16px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '16px', border: '2px dashed rgba(71, 85, 105, 0.4)'}}>
              <div style={{width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Users size={40} color="#8b5cf6" style={{opacity: 0.5}} />
              </div>
              <div style={{fontSize: '18px', fontWeight: 700, color: '#e2e8f0'}}>No suppliers found</div>
              <div style={{fontSize: '14px', color: '#94a3b8', textAlign: 'center'}}>
                {searchTerm ? 'Try adjusting your search or filters' : 'No suppliers registered yet'}
              </div>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px'}}>
              {filteredSuppliers.map((supplier, index) => (
                <div 
                  key={supplier.id || index} 
                  style={{
                    background: 'rgba(30, 41, 59, 0.6)', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    border: '2px solid rgba(139, 92, 246, 0.3)', 
                    transition: 'all 0.3s', 
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Status Badges */}
                  <div style={{position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px'}}>
                    {supplier.isActive && (
                      <div style={{padding: '4px 12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase'}}>
                        Active
                      </div>
                    )}
                    {supplier.isVerified && (
                      <div style={{padding: '4px 12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase'}}>
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Company Avatar */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', marginTop: '8px'}}>
                    <div style={{width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'}}>
                      {(supplier.companyName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px'}}>{supplier.companyName || 'N/A'}</div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>{supplier.businessType || 'Business'}</div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <Mail size={16} color="#60a5fa" />
                      <span style={{fontSize: '14px', color: '#e2e8f0', wordBreak: 'break-word'}}>{supplier.email || 'N/A'}</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <Phone size={16} color="#10b981" />
                      <span style={{fontSize: '14px', color: '#e2e8f0'}}>{supplier.phone || 'N/A'}</span>
                    </div>
                    {supplier.city && (
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <MapPin size={16} color="#f59e0b" />
                        <span style={{fontSize: '14px', color: '#e2e8f0'}}>{supplier.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div style={{padding: '12px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '10px', marginBottom: '16px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Calendar size={14} color="#8b5cf6" />
                      <span style={{fontSize: '12px', color: '#94a3b8'}}>Registered:</span>
                      <span style={{fontSize: '12px', color: '#e2e8f0', fontWeight: 600}}>{formatDate(supplier.createdAt)}</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button 
                    onClick={() => viewSupplierDetails(supplier)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <Eye size={16} />
                    View Full Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Supplier Details Modal */}
      {showDetails && selectedSupplier && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '20px'}} onClick={() => setShowDetails(false)}>
          <div style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '40px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', border: '2px solid rgba(255, 255, 255, 0.1)', color: '#fff', position: 'relative'}} onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setShowDetails(false)} style={{position: 'absolute', top: '20px', right: '20px', background: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.3s'}}>
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '24px'}}>
              <div style={{width: '100px', height: '100px', margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 700, boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)'}}>
                {(selectedSupplier.companyName || 'S').charAt(0).toUpperCase()}
              </div>
              <h2 style={{fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff'}}>{selectedSupplier.companyName}</h2>
              <div style={{fontSize: '14px', color: '#94a3b8', marginBottom: '12px'}}>{selectedSupplier.businessType || 'Business'}</div>
              <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px'}}>
                {selectedSupplier.isActive && (
                  <div style={{padding: '6px 16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#10b981'}}>
                    ACTIVE
                  </div>
                )}
                {selectedSupplier.isVerified && (
                  <div style={{padding: '6px 16px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#60a5fa'}}>
                    VERIFIED
                  </div>
                )}
              </div>
            </div>

            <div style={{display: 'grid', gap: '20px'}}>
              {/* Company Information */}
              <div style={{padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Building size={18} />
                  Company Information
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Registration Number</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.registrationNumber || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Contact Person</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.contactPerson || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Mail size={18} />
                  Contact Information
                </div>
                <div style={{display: 'grid', gap: '12px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <Mail size={18} color="#60a5fa" />
                    <div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>Email</div>
                      <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.email}</div>
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <Phone size={18} color="#10b981" />
                    <div>
                      <div style={{fontSize: '12px', color: '#94a3b8'}}>Phone</div>
                      <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div style={{padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <MapPin size={18} />
                  Location Details
                </div>
                <div style={{display: 'grid', gap: '12px'}}>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Address</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>City</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.city || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div style={{padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <CreditCard size={18} />
                  Banking Information
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Bank Name</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.bankName || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Account Number</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.bankAccount || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>IFSC Code</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.ifsc || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Payment Method</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.paymentMethod || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              {selectedSupplier.productCategories && selectedSupplier.productCategories.length > 0 && (
                <div style={{padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                  <div style={{fontSize: '14px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Package size={18} />
                    Product Categories
                  </div>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
{(
  Array.isArray(selectedSupplier.productCategories)
    ? selectedSupplier.productCategories
    : (selectedSupplier.productCategories || "").split(",")
).map((cat, index) => (
  <span key={index} className="category-pill">{cat.trim()}</span>
))}

                  </div>
                </div>
              )}

              {/* Registration Details */}
              <div style={{padding: '24px', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)'}}>
                <div style={{fontSize: '14px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Calendar size={18} />
                  Registration Details
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Registered On</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatDate(selectedSupplier.createdAt)}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Last Updated</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{formatDate(selectedSupplier.updatedAt)}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Supplier ID</div>
                    <div style={{fontSize: '14px', color: '#fff', fontWeight: 600, fontFamily: 'monospace'}}>{selectedSupplier.id}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '12px', color: '#94a3b8', marginBottom: '4px'}}>Username</div>
                    <div style={{fontSize: '16px', color: '#fff', fontWeight: 600}}>{selectedSupplier.username || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{marginTop: '24px', display: 'flex', gap: '12px'}}>
              <button 
                onClick={() => setShowDetails(false)}
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
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ManageSuppliers;
