import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useCart } from '../../store/CartContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const menuItems = [
    { icon: '📍', label: '收货地址簿', desc: '管理收货地址（最多20个）', path: '/profile/addresses' },
    { icon: '📄', label: '发票信息管理', desc: '管理开票信息和发票模板', path: '/profile/invoices' },
    { icon: '⚙️', label: '操作偏好设置', desc: '配送方式、提醒方式、列表密度', path: '/profile/preferences' },
  ];

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">个人中心</h2>
      </div>

      {/* User info card */}
      <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#fff3e8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 700, color: '#ff6600',
        }}>
          {user.contactName.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user.dealerName}</h3>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8 }}>
            <span className="badge badge-primary" style={{ marginRight: 8 }}>{user.dealerLevel}级经销商</span>
            联系人：{user.contactName} | {user.phone}
          </div>
          <div style={{ fontSize: 13, color: '#8c8c8c' }}>
            信用额度：<span style={{ color: '#ff6600', fontWeight: 600 }}>¥{user.availableCredit?.toLocaleString()}</span> / ¥{user.creditLimit?.toLocaleString()}
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/profile')}>
          编辑资料
        </button>
      </div>

      {/* Menu */}
      <div style={{ display: 'grid', gap: 12 }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            className="card"
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: 20,
              cursor: 'pointer', transition: 'box-shadow 0.2s',
            }}
            onClick={() => navigate(item.path)}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
          >
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#8c8c8c' }}>{item.desc}</div>
            </div>
            <span style={{ color: '#bfbfbf', fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div style={{ marginTop: 32, paddingBottom: 32 }}>
        <button
          className="btn btn-ghost"
          style={{ color: '#ff4d4f' }}
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
