import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useApp } from '../../store/AppContext';
import { getPrice, getDealerLevel } from '../../store/CartContext';
import Stepper from '../../components/Stepper';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { CartItem } from '../../types';

export default function CartPage() {
  const {
    items, selectedItems, selectedCount, selectedPrice, totalCount, totalPrice,
    updateQuantity, removeFromCart, toggleSelect, toggleSelectAll,
    replaceItem, syncStatus, mergeOrderGroups, recommendations, freightFillerProducts,
  } = useCart();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [showMergePanel, setShowMergePanel] = useState(false);
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('');

  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const dealerLevel = getDealerLevel();
  const FREE_SHIPPING = 500;

  const freightFee = selectedPrice >= FREE_SHIPPING ? 0 : 20;
  const discountAmount = selectedPrice >= 2000 ? Math.floor(selectedPrice * 0.02) : 0;
  const payAmount = selectedPrice + freightFee - discountAmount;
  const diffToFree = Math.max(0, FREE_SHIPPING - selectedPrice);

  // Status summary: how many items need attention
  const problemItems = items.filter(i => i.itemStatus !== 'NORMAL');
  const discontinuedCount = items.filter(i => i.itemStatus === 'DISCONTINUED').length;
  const replacedCount = items.filter(i => i.itemStatus === 'REPLACED').length;
  const oosCount = items.filter(i => i.itemStatus === 'OUT_OF_STOCK').length;

  const handleMergeOrder = () => {
    if (selectedCount === 0) {
      showToast('warning', '请先选择要合并下单的商品');
      return;
    }
    setShowMergePanel(true);
  };

  const handleSyncStatus = () => {
    syncStatus();
    showToast('success', '商品状态已同步更新');
  };

  const handleReplaceAll = () => {
    let count = 0;
    for (const item of items) {
      if (item.itemStatus === 'REPLACED' && item.replacementProduct) {
        replaceItem(item.cartItemId, item.replacementProduct);
        count++;
      }
    }
    if (count > 0) {
      showToast('success', `已替换 ${count} 件商品为新型号`);
    }
  };

  // Appointment date options (3-30 days ahead)
  const today = new Date();
  const apptDates: { value: string; label: string }[] = [];
  for (let i = 3; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const val = d.toISOString().split('T')[0];
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    apptDates.push({ value: val, label: `${val} ${dayNames[d.getDay()]}` });
  }

  const apptTimeSlots = [
    { value: 'morning', label: '🌅 上午 09:00-12:00' },
    { value: 'afternoon', label: '☀️ 下午 13:00-17:00' },
    { value: 'evening', label: '🌆 傍晚 17:00-20:00' },
  ];

  const handleCheckout = () => {
    if (selectedCount === 0) {
      showToast('warning', '请先选择要结算的商品');
      return;
    }
    if (showAppointment) {
      if (!appointmentDate || !appointmentTimeSlot) {
        showToast('warning', '请选择预计送达日期和时间段');
        return;
      }
      showToast('success', `预约单已提交，预计 ${appointmentDate} ${apptTimeSlots.find(s => s.value === appointmentTimeSlot)?.label} 送达`);
      navigate(`/checkout?type=appointment&date=${appointmentDate}&slot=${appointmentTimeSlot}`);
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <h2 className="page-title">🛒 购物车</h2>
        </div>
        <EmptyState icon="🛒" text="购物车是空的" actionText="去逛逛" onAction={() => navigate('/')} />
      </div>
    );
  }

  const hasProblemItems = problemItems.length > 0;

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="page-title">
          🛒 购物车
          <span style={{ fontSize: 14, fontWeight: 400, color: '#8c8c8c', marginLeft: 12 }}>
            {items.length} 种商品，共 {totalCount} 件
          </span>
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleSyncStatus} title="同步商品状态">
            🔄 刷新状态
          </button>
        </div>
      </div>

      {/* ===== Status Warning Banner ===== */}
      {hasProblemItems && (
        <div style={{
          background: '#fff2f0', border: '1px solid #ffa39e', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <strong style={{ color: '#ff4d4f' }}>⚠️ {problemItems.length} 件商品状态异常：</strong>
            {discontinuedCount > 0 && <span style={{ marginLeft: 8 }}>❌ {discontinuedCount}件已淘汰</span>}
            {replacedCount > 0 && <span style={{ marginLeft: 8 }}>🔄 {replacedCount}件已更新型号</span>}
            {oosCount > 0 && <span style={{ marginLeft: 8 }}>📦 {oosCount}件暂缺货</span>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {replacedCount > 0 && (
              <button className="btn btn-primary btn-sm" onClick={handleReplaceAll}>
                一键替换新型号
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleSyncStatus}>
              忽略
            </button>
          </div>
        </div>
      )}

      <div className="two-col">
        {/* ===== Left: Cart items ===== */}
        <div>
          {/* Free shipping banner + freight filler */}
          {diffToFree > 0 && selectedCount > 0 && (
            <div style={{
              background: '#fffbe6', border: '1px solid #fad14a', borderRadius: 8,
              padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: freightFillerProducts.length > 0 ? 12 : 0 }}>
                <span>🚚 再买 <strong style={{ color: '#ff6600' }}>¥{diffToFree.toLocaleString()}</strong> 即可免运费（¥{FREE_SHIPPING}包邮）</span>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>去凑单</button>
              </div>
              {freightFillerProducts.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>💡 智能凑单推荐（差价最小）：</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {freightFillerProducts.map(p => {
                      const fp = p.priceLevels[0][`price${dealerLevel}` as keyof typeof p.priceLevels[0]] as number;
                      return (
                        <div key={p.productId}
                          onClick={() => navigate(`/product/${p.productId}`)}
                          style={{
                            flex: 1, background: '#fff', borderRadius: 6, padding: 8,
                            cursor: 'pointer', border: '1px solid #f0f0f0',
                            textAlign: 'center',
                          }}>
                          <div style={{ fontSize: 20, marginBottom: 4 }}>📦</div>
                          <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name.slice(0, 12)}...
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#ff4d4f' }}>¥{fp}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                style={{ width: 16, height: 16, accentColor: '#ff6600' }} />
              全选
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* One-click merge order */}
              {selectedCount > 0 && (
                <button className="btn btn-outline btn-sm" onClick={handleMergeOrder}>
                  🏭 按基地合并下单{mergeOrderGroups.length > 1 ? `（${mergeOrderGroups.length}仓）` : ''}
                </button>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="card" style={{ padding: '0 16px' }}>
            {items.map((item) => (
              <CartItemRow
                key={item.cartItemId}
                item={item}
                dealerLevel={dealerLevel}
                onUpdateQty={(qty) => updateQuantity(item.cartItemId, qty)}
                onRemove={() => { removeFromCart(item.cartItemId); showToast('success', '已移除商品'); }}
                onToggleSelect={() => toggleSelect(item.cartItemId)}
                onViewDetail={() => navigate(`/product/${item.product.productId}`)}
                onReplace={() => {
                  if (item.replacementProduct) {
                    replaceItem(item.cartItemId, item.replacementProduct);
                    showToast('success', '已替换为新型号');
                  }
                }}
              />
            ))}
          </div>

          {/* ===== Smart Recommendations ===== */}
          {recommendations.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                🧠 智能推荐 · 基于经销商历史采购数据
              </h3>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>{rec.label}</strong>
                      <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
                        📊 {rec.frequency}次历史订单
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#ff6600' }}>{rec.reason}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                    {rec.products.map(p => {
                      const rp = p.priceLevels[0][`price${dealerLevel}` as keyof typeof p.priceLevels[0]] as number;
                      return (
                        <div key={p.productId} style={{
                          minWidth: 180, background: '#fafafa', borderRadius: 6, padding: 10,
                          cursor: 'pointer', border: '1px solid #f0f0f0',
                        }} onClick={() => navigate(`/product/${p.productId}`)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 24 }}>📦</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: 11, color: '#8c8c8c' }}>{p.materialCode}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#ff4d4f' }}>¥{rp}</span>
                            <span className={`badge ${p.stockStatus === 'IN_STOCK' ? 'badge-success' : 'badge-warning'}`}>
                              {p.stockStatus === 'IN_STOCK' ? '现货' : '预售'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Right: Summary ===== */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 112 }}>
            <div className="card-header">
              <span className="card-title">结算摘要</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: '#8c8c8c' }}>已选商品</span>
                <span>{selectedItems.filter(i => i.itemStatus !== 'DISCONTINUED').length} 种，共 {selectedCount} 件</span>
              </div>
              {selectedItems.filter(i => i.itemStatus === 'DISCONTINUED').length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: '#ff4d4f' }}>❌ 含淘汰商品</span>
                  <span style={{ color: '#ff4d4f' }}>{selectedItems.filter(i => i.itemStatus === 'DISCONTINUED').length} 种（未计入）</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: '#8c8c8c' }}>商品总额</span>
                <span>¥{selectedPrice.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#52c41a' }}>优惠减免</span>
                  <span style={{ color: '#52c41a' }}>-¥{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: '#8c8c8c' }}>运费</span>
                <span>
                  {freightFee === 0 ? (
                    <span style={{ color: '#52c41a' }}>免运费</span>
                  ) : `¥${freightFee}`}
                </span>
              </div>

              {/* Merge order preview */}
              {mergeOrderGroups.length >= 1 && selectedCount > 0 && (
                <div style={{
                  background: '#f6ffed', borderRadius: 6, padding: 10, marginBottom: 8,
                  border: '1px solid #b7eb8f',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#52c41a', marginBottom: 6 }}>
                    🏭 按基地仓分组 · 同基地合并物流费
                  </div>
                  {mergeOrderGroups.map((g, i) => {
                    const baseColor = g.warehouseId === 'wh_wx' ? '#ff6600' : g.warehouseId === 'wh_tj' ? '#1677ff' : g.warehouseId === 'wh_gz' ? '#52c41a' : '#faad14';
                    return (
                    <div key={g.warehouseId} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                      <span>
                        <span style={{
                          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                          background: baseColor, marginRight: 6,
                        }} />
                        子单{i + 1}：{g.warehouseName}
                      </span>
                      <span>
                        {g.itemCount}种 · ¥{g.totalPrice.toLocaleString()} · 运费
                        {g.freightFee === 0 ? <span style={{ color: '#52c41a' }}>免</span> : <span>¥{g.freightFee}</span>}
                      </span>
                    </div>
                  );})}
                  {mergeOrderGroups.length > 1 && (
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4, borderTop: '1px dashed #d9f7be', paddingTop: 6 }}>
                      合并总运费：¥{mergeOrderGroups.reduce((s, g) => s + g.freightFee, 0)}
                      <span style={{ color: '#52c41a', marginLeft: 8 }}>
                        （比单独下单节省 ¥{Math.max(0, mergeOrderGroups.length * 15 - mergeOrderGroups.reduce((s, g) => s + g.freightFee, 0))}）
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, color: '#8c8c8c' }}>应付总额</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#ff6600' }}>
                  ¥{payAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Order type toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                onClick={() => setShowAppointment(false)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: `2px solid ${!showAppointment ? '#ff6600' : '#f0f0f0'}`,
                  background: !showAppointment ? '#fff3e8' : '#fff',
                  color: !showAppointment ? '#ff6600' : '#8c8c8c', cursor: 'pointer',
                }}
              >
                📦 正常下单
              </button>
              <button
                onClick={() => setShowAppointment(true)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: `2px solid ${showAppointment ? '#ff6600' : '#f0f0f0'}`,
                  background: showAppointment ? '#fff3e8' : '#fff',
                  color: showAppointment ? '#ff6600' : '#8c8c8c', cursor: 'pointer',
                }}
              >
                📅 预约下单
              </button>
            </div>

            {/* Appointment date/time pickers */}
            {showAppointment && (
              <div style={{ marginBottom: 12 }}>
                <div className="form-group" style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>预计送达日期</label>
                  <select className="form-select" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)}>
                    <option value="">请选择日期</option>
                    {apptDates.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>送达时间段</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {apptTimeSlots.map(slot => (
                      <button
                        key={slot.value}
                        onClick={() => setAppointmentTimeSlot(slot.value)}
                        style={{
                          flex: 1, padding: '6px 4px', borderRadius: 4, fontSize: 11,
                          border: `1px solid ${appointmentTimeSlot === slot.value ? '#ff6600' : '#f0f0f0'}`,
                          background: appointmentTimeSlot === slot.value ? '#fff3e8' : '#fff',
                          cursor: 'pointer', whiteSpace: 'nowrap',
                        }}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg btn-block"
              disabled={selectedCount === 0}
              onClick={handleCheckout}
            >
              {showAppointment ? '📅 提交预约单' : '去结算'} ({selectedCount} 件)
            </button>

            {/* Merge order button */}
            {selectedCount > 0 && (
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: 8 }}
                onClick={handleMergeOrder}
              >
                🏭 按基地合并下单{mergeOrderGroups.length > 1 ? ` · 自动拆${mergeOrderGroups.length}单` : ' · 同基地免邮合并'}
              </button>
            )}

            {diffToFree > 0 && selectedCount > 0 && (
              <div style={{ fontSize: 12, color: '#faad14', marginTop: 8, textAlign: 'center' }}>
                还差 ¥{diffToFree.toLocaleString()} 免运费
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Merge Order Modal ===== */}
      <Modal
        open={showMergePanel}
        title={mergeOrderGroups.length > 1 ? '🏭 按基地仓拆分合并下单' : '🏭 基地仓下单确认'}
        onClose={() => setShowMergePanel(false)}
        width={680}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowMergePanel(false)}>取消</button>
            <button className="btn btn-primary" onClick={() => {
              setShowMergePanel(false);
              navigate('/checkout');
            }}>
              {mergeOrderGroups.length > 1
                ? `确认拆${mergeOrderGroups.length}单合并下单`
                : '确认下单'}
            </button>
          </>
        }
      >
        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 16 }}>
          {mergeOrderGroups.length > 1
            ? `系统已按雅迪基地仓自动拆分为 ${mergeOrderGroups.length} 个子订单，同基地商品合并物流费。`
            : '所有选中商品由同一基地仓发货，物流费已自动合并。'}
        </div>

        {/* Base warehouse summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(mergeOrderGroups.length, 2)}, 1fr)`, gap: 12, marginBottom: 16 }}>
          {mergeOrderGroups.map((g, idx) => {
            const baseColors: Record<string, string> = { wh_wx: '#fff3e8', wh_tj: '#e8f4ff', wh_gz: '#f0fff0', wh_cq: '#fffbe6' };
            const borderColors: Record<string, string> = { wh_wx: '#ffd591', wh_tj: '#91caff', wh_gz: '#b7eb8f', wh_cq: '#ffe58f' };
            const textColors: Record<string, string> = { wh_wx: '#ff6600', wh_tj: '#1677ff', wh_gz: '#52c41a', wh_cq: '#faad14' };
            return (
            <div key={g.warehouseId} style={{
              background: baseColors[g.warehouseId] || '#fafafa',
              borderRadius: 8, padding: 14,
              border: `2px solid ${borderColors[g.warehouseId] || '#f0f0f0'}`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: textColors[g.warehouseId] || '#ff6600', marginBottom: 6 }}>
                📦 子单 {idx + 1} · {g.warehouseName}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', display: 'flex', justifyContent: 'space-between' }}>
                <span>{g.itemCount} 种 · {g.items.reduce((s, i) => s + i.quantity, 0)} 件</span>
                <span>预计 {g.estimatedShipDays} 天发货</span>
              </div>
            </div>
          );})}
        </div>

        {mergeOrderGroups.map((g, idx) => (
          <div key={g.warehouseId} style={{
            background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 12,
            border: '1px solid #f0f0f0',
          }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ textAlign: 'left', padding: '4px 0', color: '#8c8c8c', width: '40%' }}>商品</th>
                  <th style={{ textAlign: 'center', padding: '4px 0', color: '#8c8c8c', width: '20%' }}>基地</th>
                  <th style={{ textAlign: 'center', padding: '4px 0', color: '#8c8c8c', width: '15%' }}>数量</th>
                  <th style={{ textAlign: 'right', padding: '4px 0', color: '#8c8c8c', width: '25%' }}>金额</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map(item => (
                  <tr key={item.cartItemId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '6px 0', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </td>
                    <td style={{ textAlign: 'center', padding: '6px 0' }}>
                      <span style={{ fontSize: 11, color: '#ff6600', background: '#fff3e8', padding: '1px 6px', borderRadius: 3 }}>
                        {item.product.baseWarehouseName}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '6px 0' }}>×{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0', fontWeight: 500 }}>
                      ¥{(getPrice(item.product, item.quantity) * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #e8e8e8', fontSize: 13 }}>
              <span style={{ color: '#8c8c8c' }}>
                {g.itemCount} 种 · 商品金额 ¥{g.totalPrice.toLocaleString()}
              </span>
              <span>
                同基地运费：
                {g.freightFee === 0
                  ? <span style={{ color: '#52c41a', fontWeight: 600 }}>免运费（满¥500）</span>
                  : <span style={{ color: '#ff6600', fontWeight: 600 }}>¥{g.freightFee}</span>}
              </span>
            </div>
          </div>
        ))}
        <div style={{
          textAlign: 'right', fontSize: 16, fontWeight: 700, paddingTop: 12,
          borderTop: '2px solid #e8e8e8', display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 400 }}>
            {mergeOrderGroups.length > 1 ? `${mergeOrderGroups.length} 单合并 · 物流费按基地独立计算` : '单基地发货 · 物流费已合并'}
          </span>
          <span>
            合计：<span style={{ color: '#ff6600' }}>
              ¥{(mergeOrderGroups.reduce((s, g) => s + g.totalPrice + g.freightFee, 0)).toLocaleString()}
            </span>
          </span>
        </div>
      </Modal>

    </div>
  );
}

/* ===== Cart Item Row ===== */
function CartItemRow({
  item, dealerLevel, onUpdateQty, onRemove, onToggleSelect, onViewDetail, onReplace,
}: {
  item: CartItem;
  dealerLevel: string;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
  onToggleSelect: () => void;
  onViewDetail: () => void;
  onReplace: () => void;
}) {
  const price = getPrice(item.product, item.quantity);
  const subtotal = price * item.quantity;
  const isDisabled = item.itemStatus === 'DISCONTINUED';
  const isReplaced = item.itemStatus === 'REPLACED';
  const isOOS = item.itemStatus === 'OUT_OF_STOCK';

  return (
    <div className="cart-item-row" style={{
      opacity: isDisabled ? 0.4 : 1,
      background: isReplaced ? '#fffbe6' : isOOS ? '#fff7e6' : 'transparent',
      margin: '0 -16px',
      padding: '16px',
      borderRadius: isReplaced || isOOS ? 4 : 0,
    }}>
      <div className="cart-item-select">
        <input type="checkbox" checked={item.selected} onChange={onToggleSelect} disabled={isDisabled} />
      </div>
      <div className="cart-item-img" onClick={!isDisabled ? onViewDetail : undefined} style={{ cursor: isDisabled ? 'default' : 'pointer' }}>
        📦
      </div>
      <div className="cart-item-info">
        <div className="cart-item-name" style={{ cursor: isDisabled ? 'default' : 'pointer', color: isDisabled ? '#bfbfbf' : undefined }}
          onClick={!isDisabled ? onViewDetail : undefined}>
          {item.product.name}
        </div>
        <div className="cart-item-code">{item.product.materialCode}</div>
        <div style={{ fontSize: 11, color: '#ff6600', marginTop: 2 }}>
          🏭 {item.product.baseWarehouseName}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
          {/* Lifecycle status badges */}
          {isDisabled && <span className="badge badge-default">❌ 已淘汰</span>}
          {isReplaced && (
            <>
              <span className="badge badge-warning">🔄 已更新型号</span>
              {item.replacementProduct && (
                <button className="btn btn-primary btn-sm" onClick={onReplace} style={{ fontSize: 11, padding: '2px 8px' }}>
                  替换为：{item.replacementProduct.name.slice(0, 15)}...
                </button>
              )}
            </>
          )}
          {isOOS && <span className="badge badge-error">📦 缺货</span>}

          {/* Stock status */}
          {!isDisabled && !isReplaced && !isOOS && (
            item.product.stockStatus === 'IN_STOCK' ? (
              <span className="badge badge-success">现货</span>
            ) : item.product.stockStatus === 'PRE_ORDER' ? (
              <span className="badge badge-warning">预售</span>
            ) : null
          )}
        </div>
        {/* Status message */}
        {item.statusMessage && (
          <div style={{ fontSize: 11, color: isReplaced ? '#faad14' : '#ff4d4f', marginTop: 4 }}>
            {item.statusMessage}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'center', fontWeight: 500, color: isDisabled ? '#bfbfbf' : undefined }}>
        {isDisabled ? '-' : `¥${price.toLocaleString()}`}
        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{dealerLevel}级价</div>
      </div>
      <div>
        <Stepper value={item.quantity} min={item.product.moq} onChange={onUpdateQty} />
        {item.quantity < item.product.moq && (
          <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>低于最小起订量</div>
        )}
      </div>
      <div style={{ textAlign: 'center', fontWeight: 600, color: isDisabled ? '#bfbfbf' : '#ff4d4f' }}>
        {isDisabled ? '-' : `¥${subtotal.toLocaleString()}`}
      </div>
      <div className="cart-item-actions" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={onRemove} title="删除">🗑️</button>
        {isReplaced && item.replacementProduct && (
          <button className="btn btn-outline btn-sm" onClick={onReplace} title="替换" style={{ fontSize: 10, padding: '2px 6px' }}>
            🔄
          </button>
        )}
      </div>
    </div>
  );
}
