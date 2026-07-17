import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { categories } from '../../mock';

export default function CategoryNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentCategory =
    new URLSearchParams(location.search).get('category') || 'all';

  return (
    <nav className="category-nav">
      <div className="category-nav-inner">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${currentCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              if (cat.id === 'all') {
                navigate('/');
              } else {
                navigate(`/?category=${cat.id}`);
              }
            }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}

        {/* Spacer */}
        <span style={{ flex: 1, minWidth: 16 }} />

        {/* Order entry buttons */}
        <button
          className={`category-tab ${location.pathname === '/orders/custom' ? 'active' : ''}`}
          style={{ fontWeight: location.pathname === '/orders/custom' ? 600 : 500 }}
          onClick={() => navigate('/orders/custom')}
        >
          🔧 定制订单
        </button>
      </div>
    </nav>
  );
}
