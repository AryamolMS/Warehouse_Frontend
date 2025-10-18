import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, RefreshCw, Search, Download, Filter, Box, Calendar, Thermometer, User, Database } from 'lucide-react';

function WarehouseInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStorage, setFilterStorage] = useState('all');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/warehouse_inventory/');
      if (response.ok) {
        const data = await response.json();
        const inventoryData = data.inventory || data || [];
        setInventory(inventoryData);
      } else {
        console.error('Failed to fetch inventory');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 60000);
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

  const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];
  const storageTypes = [...new Set(inventory.map(item => item.storageType).filter(Boolean))];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStorage = filterStorage === 'all' || item.storageType === filterStorage;
    
    return matchesSearch && matchesCategory && matchesStorage;
  });

  const totalItems = filteredInventory.length;
  const totalQuantity = filteredInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const exportToCSV = () => {
    const headers = ['Item', 'Quantity', 'Unit', 'Category', 'Supplier', 'Storage Type', 'Delivery Date', 'Expiry Date'];
    const csvData = filteredInventory.map(item => [
      item.item || '',
      item.quantity || 0,
      item.unit || '',
      item.category || '',
      item.supplierName || '',
      item.storageType || '',
      item.deliveryDate || '',
      item.expiryDate || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
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
        animation: 'floatReverse 25s infinite ease-in-out',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        padding: '24px 48px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => window.history.back()} 
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                cursor: 'pointer',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                <Database size={28} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Warehouse Inventory</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>All accepted stock in warehouse</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={exportToCSV}
              disabled={filteredInventory.length === 0}
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: filteredInventory.length === 0 ? 'not-allowed' : 'pointer',
                color: '#10b981',
                fontWeight: 600,
                opacity: filteredInventory.length === 0 ? 0.5 : 1,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (filteredInventory.length > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Download size={18} />
              Export CSV
            </button>
            <button 
              onClick={fetchInventory}
              disabled={loading}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#60a5fa',
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: '1800px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ marginBottom: '16px' }}>
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
                <Package size={28} color="#fff" />
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Items</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#60a5fa' }}>{totalItems}</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ marginBottom: '16px' }}>
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
                <Box size={28} color="#fff" />
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Quantity</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#10b981' }}>{totalQuantity.toLocaleString()}</div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ marginBottom: '16px' }}>
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
                <Package size={28} color="#fff" />
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Categories</div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#f59e0b' }}>{categories.length}</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              <input 
                type="text" 
                placeholder="Search by item, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 48px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(30, 41, 59, 0.8)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Filter size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 48px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <Thermometer size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              <select 
                value={filterStorage}
                onChange={(e) => setFilterStorage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 48px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Storage Types</option>
                {storageTypes.map(storage => (
                  <option key={storage} value={storage}>{storage}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflowX: 'auto'
        }}>
          <h3 style={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Package size={24} color="#60a5fa" />
            Inventory Items ({filteredInventory.length})
          </h3>

          {loading && inventory.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 40px',
              gap: '16px'
            }}>
              <RefreshCw size={40} color="#60a5fa" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '16px', color: '#94a3b8' }}>Loading inventory...</div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 40px',
              gap: '16px',
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '16px',
              border: '2px dashed rgba(71, 85, 105, 0.4)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={40} color="#60a5fa" style={{ opacity: 0.5 }} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>No items in inventory</div>
              <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
                {searchTerm || filterCategory !== 'all' || filterStorage !== 'all' ? 'Try adjusting your filters' : 'Accept deliveries to add items to warehouse'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', minWidth: '1200px' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Item</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Quantity</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Category</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Supplier</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Storage Type</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Delivery Date</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      borderBottom: '2px solid rgba(71, 85, 105, 0.3)'
                    }}>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, index) => (
                    <tr 
                      key={item.id || index} 
                      style={{
                        background: index % 2 === 0 ? 'rgba(30, 41, 59, 0.3)' : 'rgba(30, 41, 59, 0.15)',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(30, 41, 59, 0.3)' : 'rgba(30, 41, 59, 0.15)';
                      }}
                    >
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Package size={20} color="#fff" />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{item.item}</div>
                            {item.batchNumber && (
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Batch: {item.batchNumber}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#10b981' }}>{item.quantity} {item.unit}</div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="#94a3b8" />
                          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{item.supplierName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Thermometer size={16} color="#94a3b8" />
                          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{item.storageType}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#94a3b8" />
                          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{formatDate(item.deliveryDate)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid rgba(71, 85, 105, 0.2)' }}>
                        {item.expiryDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} color="#ef4444" />
                            <span style={{ fontSize: '14px', color: '#fca5a5' }}>{formatDate(item.expiryDate)}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default WarehouseInventory;