import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductVO } from '../types';
import { useCart } from '../store/CartContext';
import { useApp } from '../store/AppContext';
import { getPrice, getDealerLevel } from '../store/CartContext';

interface Props {
  product: ProductVO;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useApp();
  const [qty, setQty] = React.useState(product.moq);

  const price = getPrice(product, qty);
  const dealerLevel = getDealerLevel();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, qty);
    showToast('success', `已添加"${product.name.slice(0, 12)}..."到购物车`);
  };

  const stockBadge = () => {
    switch (product.stockStatus) {
      case 'IN_STOCK':
        return <span className="badge badge-success">现货</span>;
      case 'PRE_ORDER':
        return <span className="badge badge-warning">预售(7天)</span>;
      case 'OUT_OF_STOCK':
        return <span className="badge badge-error">缺货</span>;
    }
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.productId}`)}>
      <div className="product-card-img">
        <div className="img-placeholder">
          📦
        </div>
        {product.isNew && <span className="corner-badge corner-badge-new">新品</span>}
        {product.isPromotion && <span className="corner-badge corner-badge-promo">促销</span>}
      </div>
      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-code">{product.materialCode}</div>
        <div className="product-card-price">
          ¥{price.toLocaleString()}
          <span className="unit">/{product.unit}</span>
        </div>
        <div className="product-card-tags">
          {stockBadge()}
          {product.vehicleModels.slice(0, 2).map((v, i) => (
            <span key={i} className="tag">
              {v.model}
            </span>
          ))}
          {product.vehicleModels.length > 2 && (
            <span className="tag">+{product.vehicleModels.length - 2}</span>
          )}
        </div>
        <div className="product-card-footer">
          <div className="stepper" onClick={(e) => e.stopPropagation()}>
            <button
              className="stepper-btn"
              disabled={qty <= product.moq}
              onClick={() => setQty(qty - 1)}
            >
              −
            </button>
            <input
              className="stepper-input"
              type="number"
              value={qty}
              min={product.moq}
              onChange={(e) => setQty(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
            />
            <button className="stepper-btn" onClick={() => setQty(qty + 1)}>
              +
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
            🛒 加购
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
          最小起订量: {product.moq}{product.unit} | {dealerLevel}级价
        </div>
        <div style={{ fontSize: 11, marginTop: 2 }}>
          <span style={{
            background: '#fff3e8', color: '#ff6600', padding: '1px 6px',
            borderRadius: 3, fontSize: 10, fontWeight: 500,
          }}>
            🏭 {product.baseWarehouseName}
          </span>
        </div>
      </div>
    </div>
  );
}
