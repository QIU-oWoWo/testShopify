import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useAuth } from '../../store/AuthContext';
import SearchBar from '../SearchBar';

export default function Header() {
  const { totalCount } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🛵</span>
          云销通
        </Link>

        <div className="header-search">
          <SearchBar />
        </div>

        {/* Right side: nav links + actions */}
        <div className="header-right">
          <nav className="header-nav-links">
            <Link to="/cart" className="header-nav-link">
              购物车
              {totalCount > 0 && (
                <span className="header-nav-badge">{totalCount > 99 ? '99+' : totalCount}</span>
              )}
            </Link>
            <Link to="/orders" className="header-nav-link">
              全部订单
            </Link>
            <Link to="/messages" className="header-nav-link">
              消息
              <span className="header-nav-badge">3</span>
            </Link>
          </nav>

          {isLoggedIn ? (
            <div className="dropdown" ref={dropdownRef}>
              <div
                className="header-avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: 'pointer' }}
              >
                {user?.contactName?.charAt(0) || '张'}
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu dropdown-menu-visible">
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.dealerName}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {user?.dealerLevel}级经销商
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>个人中心</Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)}>我的订单</Link>
                  <Link to="/reconciliation" onClick={() => setDropdownOpen(false)}>对账财务</Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      localStorage.removeItem('yunxiaotong_user');
                      window.location.reload();
                    }}
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
              登录
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
