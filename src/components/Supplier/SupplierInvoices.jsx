// SupplierInvoices.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, DollarSign, Calendar, Package, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';

function SupplierInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState('');

  useEffect(() => {
    // Get supplier name from localStorage (set during login)
    const storedSupplier = localStorage.getItem('supplierCompanyName');
    if (storedSupplier) {
      setSupplierName(storedSupplier);
      fetchInvoices(storedSupplier);
    }
  }, []);

  const fetchInvoices = async (companyName) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/invoices/supplier/${encodeURIComponent(companyName)}/`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
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

  const downloadInvoice = (invoice) => {
    // Generate invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .invoice-details { margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f3f4f6; }
          .total { font-size: 24px; font-weight: bold; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>WAREHOUSE STORAGE INVOICE</h1>
          <p>Invoice Number: ${invoice.invoiceNumber}</p>
        </div>
        
        <div class="invoice-details">
          <p><strong>Date:</strong> ${formatDate(invoice.createdAt)}</p>
          <p><strong>Company:</strong> ${supplierName}</p>
          <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Days Stored</th>
              <th>Daily Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.item}</td>
              <td>${invoice.quantity} ${invoice.unit}</td>
              <td>${invoice.daysStored} days</td>
              <td>$${invoice.dailyStorageRate.toFixed(2)}</td>
              <td>$${invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total">
          TOTAL AMOUNT: $${invoice.totalAmount.toFixed(2)}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
          <p><strong>Storage Period:</strong></p>
          <p>From: ${formatDate(invoice.storageStartDate)}</p>
          <p>To: ${formatDate(invoice.storageEndDate)}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
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
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={24} />
        </button>
        
        <h1 style={{color: '#fff', fontSize: '32px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px'}}>
          <FileText size={36} />
          Storage Invoices
        </h1>
        <p style={{color: '#94a3b8', fontSize: '16px'}}>{supplierName}</p>
      </div>

      {/* Stats */}
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

      {/* Invoices List */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <h3 style={{color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <FileText size={24} color="#60a5fa" />
          Your Invoices ({invoices.length})
        </h3>

        {loading ? (
          <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>Loading invoices...</div>
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
            <div style={{fontSize: '14px', color: '#94a3b8'}}>Invoices will appear here after pickup approvals</div>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {invoices.map((invoice) => {
              const statusColor = getStatusColor(invoice.status);
              return (
                <div key={invoice.id} style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  transition: 'all 0.3s'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px'}}>
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
                        <Package size={14} style={{display: 'inline', marginRight: '6px'}} />
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
                        <Clock size={14} style={{display: 'inline', marginRight: '6px'}} />
                        Days Stored
                      </div>
                      <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>{invoice.daysStored} days</div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase'}}>Daily Rate</div>
                      <div style={{fontSize: '16px', color: '#e2e8f0', fontWeight: 600}}>${invoice.dailyStorageRate}/unit/day</div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    border: '2px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    <div>
                      <div style={{fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 600}}>TOTAL AMOUNT</div>
                      <div style={{fontSize: '28px', fontWeight: 700, color: '#10b981'}}>${invoice.totalAmount.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => downloadInvoice(invoice)}
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
                      <Download size={18} />
                      Download Invoice
                    </button>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#94a3b8'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span>Storage Start:</span>
                      <span style={{color: '#e2e8f0', fontWeight: 600}}>{formatDate(invoice.storageStartDate)}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Storage End:</span>
                      <span style={{color: '#e2e8f0', fontWeight: 600}}>{formatDate(invoice.storageEndDate)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierInvoices;
