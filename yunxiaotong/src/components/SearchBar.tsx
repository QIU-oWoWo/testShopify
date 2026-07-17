import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProducts } from '../mock';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const suggestions =
    query.length >= 1
      ? mockProducts
          .filter(
            (p) =>
              p.name.includes(query) ||
              p.materialCode.includes(query) ||
              p.brand.includes(query)
          )
          .slice(0, 5)
      : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="搜索物料编码 / VIN码 / 品名关键词..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <button type="submit" className="search-btn">
          🔍
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            marginTop: 4,
            zIndex: 300,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((p) => (
            <div
              key={p.productId}
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                navigate(`/product/${p.productId}`);
              }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderBottom: '1px solid #f5f5f5',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fff3e8')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                📦
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>{p.materialCode}</div>
              </div>
              <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                ¥{p.priceLevels[0].priceA}
              </span>
            </div>
          ))}
          <div
            onClick={handleSubmit}
            style={{
              padding: '10px',
              textAlign: 'center',
              color: '#ff6600',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            查看全部 "{query}" 相关结果 →
          </div>
        </div>
      )}
    </div>
  );
}
