import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockProducts } from '../../mock';
import { useCart } from '../../store/CartContext';
import { useApp } from '../../store/AppContext';
import { getPrice, getDealerLevel } from '../../store/CartContext';
import Stepper from '../../components/Stepper';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useApp();
  const product = mockProducts.find((p) => p.productId === productId);

  const [qty, setQty] = useState(product?.moq || 1);
  const [activeTab, setActiveTab] = useState<'specs' | 'prices' | 'stock'>('specs');

  if (!product) {
    return (
      <div className="container">
        <EmptyState icon="🔍" text="未找到该商品" actionText="返回首页" onAction={() => navigate('/')} />
      </div>
    );
  }

  const dealerLevel = getDealerLevel();
  const price = getPrice(product, qty);

  const handleAddToCart = () => {
    addToCart(product, qty);
    showToast('success', `已添加 ${qty} ${product.unit} "${product.name.slice(0, 15)}..." 到购物车`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  const stockBadge = () => {
    switch (product.stockStatus) {
      case 'IN_STOCK': return <span className="badge badge-success">现货</span>;
      case 'PRE_ORDER': return <span className="badge badge-warning">预售(7天)</span>;
      case 'OUT_OF_STOCK': return <span className="badge badge-error">缺货</span>;
    }
  };

  // Related products (same category, exclude current)
  const relatedProducts = mockProducts
    .filter((p) => p.categoryPath[0] === product.categoryPath[0] && p.productId !== product.productId)
    .slice(0, 4);

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>首页</span>
        {' > '}
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/?category=${product.categoryPath[0] === '电池' ? 'battery' : product.categoryPath[0] === '配件' ? 'parts' : product.categoryPath[0] === '轮胎' ? 'tire' : product.categoryPath[0] === '润滑油' ? 'oil' : product.categoryPath[0] === '附件' ? 'accessory' : 'tool'}`)}>
          {product.categoryPath[0]}
        </span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>{product.name}</span>
      </div>

      {/* Product Detail */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, padding: 24 }}>
        {/* Left: Image gallery placeholder */}
        <div>
          <div style={{
            width: '100%', paddingTop: '100%', position: 'relative',
            background: '#fafafa', borderRadius: 8, overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 120, opacity: 0.3 }}>📦</span>
            {product.isNew && <span className="corner-badge corner-badge-new">新品</span>}
            {product.isPromotion && <span className="corner-badge corner-badge-promo" style={{ top: 32 }}>促销</span>}
          </div>
          {/* Thumbnail row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                width: 64, height: 64, borderRadius: 4, background: '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, border: i === 0 ? '2px solid #ff6600' : '2px solid transparent',
              }}>
                📦
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {product.isNew && <span className="corner-badge corner-badge-new" style={{ position: 'static' }}>新品</span>}
            {product.isPromotion && <span className="corner-badge corner-badge-promo" style={{ position: 'static' }}>促销</span>}
            {stockBadge()}
            <span style={{
              background: '#fff3e8', color: '#ff6600', padding: '3px 10px',
              borderRadius: 4, fontSize: 12, fontWeight: 600,
            }}>
              🏭 发货基地：{product.baseWarehouseName}
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{product.name}</h1>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 8 }}>
            物料编码：{product.materialCode}
            <span style={{ cursor: 'pointer', marginLeft: 8, color: '#ff6600' }}>📋 复制</span>
          </div>
          <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 16 }}>
            品牌：{product.brand} | 产地：{product.origin} | 重量：{product.weight}kg
          </div>

          {/* Price */}
          <div style={{
            background: '#fff3e8', borderRadius: 8, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
              {dealerLevel}级经销商价格
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>
              ¥{price.toLocaleString()}
              <span style={{ fontSize: 14, fontWeight: 400, color: '#8c8c8c', marginLeft: 8 }}>
                /{product.unit}
              </span>
            </div>
            {product.priceLevels.length > 1 && (
              <div style={{ fontSize: 12, color: '#ff6600', marginTop: 4 }}>
                💡 购买更多享阶梯优惠，最低 ¥{product.priceLevels[product.priceLevels.length - 1][`price${dealerLevel}` as keyof typeof product.priceLevels[0]]}/起
              </div>
            )}
          </div>

          {/* Vehicle models */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>适配车型</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {product.vehicleModels.map((v, i) => (
                <span key={i} className="tag">{v.brand} {v.model} ({v.year})</span>
              ))}
              {product.vehicleModels.length === 0 && (
                <span style={{ fontSize: 13, color: '#8c8c8c' }}>通用配件</span>
              )}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>数量：</span>
            <Stepper value={qty} min={product.moq} onChange={setQty} />
            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
              最小起订量 {product.moq}{product.unit}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={product.stockStatus === 'OUT_OF_STOCK'}
            >
              🛒 加入购物车
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={handleBuyNow}
              disabled={product.stockStatus === 'OUT_OF_STOCK'}
            >
              立即购买
            </button>
          </div>

          {product.stockStatus === 'OUT_OF_STOCK' && (
            <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
              🔔 到货提醒
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Specs / Prices / Stock */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="tabs">
          <button className={`tab-item ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>规格参数</button>
          <button className={`tab-item ${activeTab === 'prices' ? 'active' : ''}`} onClick={() => setActiveTab('prices')}>阶梯价格</button>
          <button className={`tab-item ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>库存分布</button>
        </div>

        {activeTab === 'specs' && (
          <table className="data-table">
            <tbody>
              {Object.entries(product.specs).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ width: 200, fontWeight: 600, color: '#8c8c8c' }}>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'prices' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>数量区间</th>
                <th>A级价格</th>
                <th>B级价格</th>
                <th>C级价格</th>
                <th>D级价格</th>
              </tr>
            </thead>
            <tbody>
              {product.priceLevels.map((pl, i) => (
                <tr key={i} style={{
                  background: (qty >= pl.minQty && (pl.maxQty === null || qty <= pl.maxQty)) ? '#fff3e8' : undefined,
                }}>
                  <td>
                    {pl.minQty} - {pl.maxQty === null ? '以上' : pl.maxQty} {product.unit}
                    {(qty >= pl.minQty && (pl.maxQty === null || qty <= pl.maxQty)) && (
                      <span className="badge badge-primary" style={{ marginLeft: 8 }}>当前档</span>
                    )}
                  </td>
                  <td style={{ color: dealerLevel === 'A' ? '#ff6600' : undefined, fontWeight: dealerLevel === 'A' ? 700 : undefined }}>
                    ¥{pl.priceA.toLocaleString()}
                  </td>
                  <td style={{ color: dealerLevel === 'B' ? '#ff6600' : undefined, fontWeight: dealerLevel === 'B' ? 700 : undefined }}>
                    ¥{pl.priceB.toLocaleString()}
                  </td>
                  <td style={{ color: dealerLevel === 'C' ? '#ff6600' : undefined, fontWeight: dealerLevel === 'C' ? 700 : undefined }}>
                    ¥{pl.priceC.toLocaleString()}
                  </td>
                  <td style={{ color: dealerLevel === 'D' ? '#ff6600' : undefined, fontWeight: dealerLevel === 'D' ? 700 : undefined }}>
                    ¥{pl.priceD.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'stock' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>仓库名称</th>
                <th>可用库存</th>
                <th>距离(km)</th>
                <th>预计发货(天)</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {product.stockDetail.map((sd) => (
                <tr key={sd.warehouseId}>
                  <td>{sd.warehouseName}</td>
                  <td style={{ fontWeight: 600 }}>{sd.availableQty > 0 ? sd.availableQty.toLocaleString() : '0'}</td>
                  <td>{sd.distance}</td>
                  <td>{sd.estimatedShipDays}</td>
                  <td>
                    {sd.availableQty > 0 ? (
                      <span className="badge badge-success">可发货</span>
                    ) : (
                      <span className="badge badge-error">暂无库存</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Substitutes */}
      {product.substitutes.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <span className="card-title">🔄 替代件推荐</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>商品信息</th>
                <th>A级价格</th>
                <th>库存</th>
                <th>价差</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {product.substitutes.map((sub) => (
                <tr key={sub.productId}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{sub.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{sub.materialCode}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>¥{sub.priceA.toLocaleString()}</td>
                  <td>{sub.stockStatus === 'IN_STOCK' ? <span className="badge badge-success">现货</span> : <span className="badge badge-warning">预售</span>}</td>
                  <td style={{ color: sub.priceDiff < 0 ? '#52c41a' : '#ff4d4f' }}>
                    {sub.priceDiff > 0 ? '+' : ''}{sub.priceDiff}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/product/${sub.productId}`)}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>买了又买</h3>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
