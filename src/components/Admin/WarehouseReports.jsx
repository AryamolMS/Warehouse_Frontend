import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

const WarehouseReport = () => {
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  const suppliers = [
    { id: 1, name: 'ABC Suppliers Ltd' },
    { id: 2, name: 'XYZ Trading Co' },
    { id: 3, name: 'Global Imports Inc' },
    { id: 4, name: 'Local Distributors' }
  ];

  const stockData = [
    { category: 'Electronics', available: 450, delivered: 120, pending: 30 },
    { category: 'Furniture', available: 230, delivered: 85, pending: 15 },
    { category: 'Clothing', available: 680, delivered: 200, pending: 45 },
    { category: 'Food Items', available: 520, delivered: 180, pending: 25 },
    { category: 'Hardware', available: 340, delivered: 95, pending: 20 }
  ];

  const monthlyTrend = [
    { month: 'Aug', stock: 1850, delivered: 520 },
    { month: 'Sep', stock: 1920, delivered: 580 },
    { month: 'Oct', stock: 2050, delivered: 640 },
    { month: 'Nov', stock: 2180, delivered: 710 },
    { month: 'Dec', stock: 2220, delivered: 680 },
    { month: 'Jan', stock: 2320, delivered: 750 }
  ];

  const supplierBills = [
    { supplier: 'ABC Suppliers Ltd', totalBill: 45600, items: 320, status: 'Paid' },
    { supplier: 'XYZ Trading Co', totalBill: 32400, items: 180, status: 'Paid' },
    { supplier: 'Global Imports Inc', totalBill: 58900, items: 450, status: 'Pending' },
    { supplier: 'Local Distributors', totalBill: 28700, items: 220, status: 'Paid' }
  ];

  const pieData = [
    { name: 'Available', value: 2220, color: '#10b981' },
    { name: 'Delivered', value: 680, color: '#3b82f6' },
    { name: 'Pending', value: 135, color: '#f59e0b' }
  ];

  const totalStock = stockData.reduce((acc, item) => acc + item.available, 0);
  const totalDelivered = stockData.reduce((acc, item) => acc + item.delivered, 0);
  const totalBills = supplierBills.reduce((acc, item) => acc + item.totalBill, 0);

  const handleExport = () => {
    alert('Exporting report to PDF...');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#1a1a1a',
      padding: '2rem',
    },
    innerContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      background: '#1e3a5f',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      color: 'white',
    },
    filterCard: {
      background: '#1e3a5f',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    statCard: {
      background: '#1e3a5f',
      borderRadius: '16px',
      padding: '1.75rem',
      height: '100%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    },
    chartCard: {
      background: '#1e3a5f',
      borderRadius: '16px',
      padding: '2rem',
      height: '100%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    },
    button: {
      background: '#3b82f6',
      color: 'white',
      padding: '0.75rem 2rem',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      transition: 'transform 0.2s',
    },
    select: {
      width: '100%',
      padding: '0.875rem',
      borderRadius: '8px',
      border: '2px solid #2d4a6b',
      fontSize: '1rem',
      background: '#0f2540',
      color: 'white',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
    },
    tableHeader: {
      background: '#0f2540',
      fontWeight: '600',
      color: '#9ca3af',
      padding: '1rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    tableCell: {
      padding: '1rem',
      borderBottom: '1px solid #2d4a6b',
    },
    badge: {
      padding: '0.375rem 0.875rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600',
      display: 'inline-block',
    },
    viewButton: {
      background: '#3b82f6',
      color: 'white',
      padding: '0.5rem 1.25rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background 0.2s',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
                Warehouse Monthly Report
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                Overview of stock, deliveries, and supplier bills
              </p>
            </div>
            <button style={styles.button} onClick={handleExport}>
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterCard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e5e7eb' }}>
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={styles.select}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#e5e7eb' }}>
                Filter by Supplier
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Suppliers</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={styles.statCard} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                  Total Stock Available
                </p>
                <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '2.5rem', fontWeight: '700', color: '#ffffff' }}>
                  {totalStock.toLocaleString()}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+12% from last month</span>
                </div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                📦
              </div>
            </div>
          </div>

          <div style={styles.statCard} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                  Items Delivered
                </p>
                <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '2.5rem', fontWeight: '700', color: '#ffffff' }}>
                  {totalDelivered.toLocaleString()}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3b82f6' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>+8% from last month</span>
                </div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                🚚
              </div>
            </div>
          </div>

          <div style={styles.statCard} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                  Total Bills
                </p>
                <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '2.5rem', fontWeight: '700', color: '#ffffff' }}>
                  ${totalBills.toLocaleString()}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>⚠️ 1 pending payment</span>
                </div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                💰
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={styles.chartCard}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>
              Stock by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="available" fill="#10b981" name="Available" radius={[8, 8, 0, 0]} />
                <Bar dataKey="delivered" fill="#3b82f6" name="Delivered" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>
              Stock Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div style={{ ...styles.chartCard, marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>
            6-Month Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '0.875rem' }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="stock" stroke="#10b981" strokeWidth={3} name="Stock Available" dot={{ r: 5 }} />
              <Line type="monotone" dataKey="delivered" stroke="#3b82f6" strokeWidth={3} name="Delivered" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier Bills Table */}
        <div style={styles.chartCard}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: '600', color: '#ffffff' }}>
            Supplier Bills Summary
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Supplier Name</th>
                  <th style={styles.tableHeader}>Total Bill</th>
                  <th style={styles.tableHeader}>Items Supplied</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {supplierBills.map((bill, index) => (
                  <tr key={index}>
                    <td style={{ ...styles.tableCell, fontWeight: '600', color: '#ffffff' }}>
                      {bill.supplier}
                    </td>
                    <td style={{ ...styles.tableCell, color: '#e5e7eb', fontWeight: '600' }}>
                      ${bill.totalBill.toLocaleString()}
                    </td>
                    <td style={{ ...styles.tableCell, color: '#9ca3af' }}>
                      {bill.items} items
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.badge,
                        background: bill.status === 'Paid' ? '#d1fae5' : '#fed7aa',
                        color: bill.status === 'Paid' ? '#065f46' : '#92400e'
                      }}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <button 
                        style={styles.viewButton}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseReport;