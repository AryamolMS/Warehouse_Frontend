import React, { useState } from 'react';
import { Package, TrendingUp, AlertCircle, Users, Truck, BarChart3, Box, ClipboardList } from 'lucide-react';

function Home() {
  const [stats] = useState({
    totalInventory: 12458,
    pendingOrders: 47,
    lowStock: 8,
    activeStaff: 23
  });

  const [recentActivity] = useState([
    { id: 1, type: 'inbound', item: 'Electronics - Batch #4521', time: '10 mins ago' },
    { id: 2, type: 'outbound', item: 'Order #8834 Shipped', time: '25 mins ago' },
    { id: 3, type: 'alert', item: 'Low Stock Alert: Item SKU-2341', time: '1 hour ago' },
    { id: 4, type: 'inbound', item: 'Raw Materials - Batch #9012', time: '2 hours ago' }
  ]);

  const styles = {
    root: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      margin: 0,
      padding: 0,
    },
    header: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px 24px',
    },
    headerContent: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logoBox: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '8px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#a0aec0',
      margin: 0,
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    userName: {
      fontSize: '14px',
      color: '#e2e8f0',
    },
    avatar: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 600,
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    },
    main: {
      width: '100%',
      padding: '32px 24px',
      minHeight: 'calc(100vh - 88px)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      marginBottom: '32px',
    },
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },
    iconBox: (gradient) => ({
      padding: '12px',
      borderRadius: '12px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    }),
    cardLabel: {
      fontSize: '14px',
      color: '#a0aec0',
      fontWeight: 500,
      marginBottom: '4px',
    },
    cardValue: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#fff',
    },
    cardFooter: {
      fontSize: '12px',
      marginTop: '8px',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '65% 35%',
      gap: '24px',
      width: '100%',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#fff',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    viewAllButton: {
      fontSize: '14px',
      color: '#667eea',
      fontWeight: 500,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px 8px',
      transition: 'color 0.2s',
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      marginBottom: '12px',
      transition: 'all 0.2s',
      cursor: 'pointer',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#e2e8f0',
      margin: 0,
    },
    activityTime: {
      fontSize: '12px',
      color: '#718096',
      margin: 0,
    },
    quickActionButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      color: '#e2e8f0',
      marginBottom: '12px',
      transition: 'all 0.2s',
      textAlign: 'left',
    },
    badge: {
      fontSize: '11px',
      fontWeight: 600,
      padding: '4px 8px',
      borderRadius: '12px',
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#fca5a5',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoBox}>
              <Box size={32} color="#fff" />
            </div>
            <div>
              <h1 style={styles.title}>WareHub</h1>
              <p style={styles.subtitle}>Warehouse Management System</p>
            </div>
          </div>
          <div style={styles.userSection}>
            <span style={styles.userName}>Welcome, Aryamol</span>
            <div style={styles.avatar}>A</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.border = '1px solid rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.iconBox('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                <Package size={24} color="#fff" />
              </div>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <p style={styles.cardLabel}>Total Inventory</p>
            <p style={styles.cardValue}>{stats.totalInventory.toLocaleString()}</p>
            <p style={{...styles.cardFooter, color: '#10b981'}}>+12% from last month</p>
          </div>

          <div 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(168, 85, 247, 0.3)';
              e.currentTarget.style.border = '1px solid rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.iconBox('linear-gradient(135deg, #a855f7 0%, #ec4899 100%)')}>
                <Truck size={24} color="#fff" />
              </div>
              <ClipboardList size={20} color="#94a3b8" />
            </div>
            <p style={styles.cardLabel}>Pending Orders</p>
            <p style={styles.cardValue}>{stats.pendingOrders}</p>
            <p style={{...styles.cardFooter, color: '#94a3b8'}}>Awaiting fulfillment</p>
          </div>

          <div 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.iconBox('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}>
                <AlertCircle size={24} color="#fff" />
              </div>
              <span style={styles.badge}>Alert</span>
            </div>
            <p style={styles.cardLabel}>Low Stock Items</p>
            <p style={styles.cardValue}>{stats.lowStock}</p>
            <p style={{...styles.cardFooter, color: '#fca5a5'}}>Needs immediate attention</p>
          </div>

          <div 
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.3)';
              e.currentTarget.style.border = '1px solid rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.iconBox('linear-gradient(135deg, #10b981 0%, #059669 100%)')}>
                <Users size={24} color="#fff" />
              </div>
              <div style={{
                width: '8px', 
                height: '8px', 
                backgroundColor: '#10b981', 
                borderRadius: '50%',
                boxShadow: '0 0 10px #10b981'
              }}></div>
            </div>
            <p style={styles.cardLabel}>Active Staff</p>
            <p style={styles.cardValue}>{stats.activeStaff}</p>
            <p style={{...styles.cardFooter, color: '#10b981'}}>Currently on duty</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={styles.contentGrid}>
          {/* Recent Activity */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <span>Recent Activity</span>
              <button 
                style={styles.viewAllButton}
                onMouseEnter={(e) => e.currentTarget.style.color = '#764ba2'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#667eea'}
              >
                View All
              </button>
            </div>
            <div>
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  style={styles.activityItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <div style={styles.iconBox(
                    activity.type === 'inbound' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                    activity.type === 'outbound' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  )}>
                    {activity.type === 'inbound' ? <Package size={20} color="#fff" /> :
                     activity.type === 'outbound' ? <Truck size={20} color="#fff" /> :
                     <AlertCircle size={20} color="#fff" />}
                  </div>
                  <div style={styles.activityContent}>
                    <p style={styles.activityTitle}>{activity.item}</p>
                    <p style={styles.activityTime}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.card}>
            <div style={styles.sectionTitle}>
              <span>Quick Actions</span>
            </div>
            <div>
              <button 
                style={styles.quickActionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)';
                  e.currentTarget.style.border = '1px solid rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                }}
              >
                <Package size={20} color="#667eea" />
                <span>Add New Item</span>
              </button>
              <button 
                style={styles.quickActionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)';
                  e.currentTarget.style.border = '1px solid rgba(168, 85, 247, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                }}
              >
                <Truck size={20} color="#a855f7" />
                <span>Process Order</span>
              </button>
              <button 
                style={styles.quickActionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)';
                  e.currentTarget.style.border = '1px solid rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                }}
              >
                <BarChart3 size={20} color="#10b981" />
                <span>View Reports</span>
              </button>
              <button 
                style={styles.quickActionButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)';
                  e.currentTarget.style.border = '1px solid rgba(245, 158, 11, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                }}
              >
                <ClipboardList size={20} color="#f59e0b" />
                <span>Inventory Check</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;