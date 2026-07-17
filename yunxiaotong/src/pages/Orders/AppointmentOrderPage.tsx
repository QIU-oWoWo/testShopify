import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { useCart } from '../../store/CartContext';
import { getPrice } from '../../store/CartContext';
import Modal from '../../components/Modal';

export default function AppointmentOrderPage() {
  const { showToast } = useApp();
  const { user } = useAuth();
  const { selectedItems, selectedPrice } = useCart();
  const navigate = useNavigate();

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [remark, setRemark] = useState('');
  const [addressId, setAddressId] = useState(user?.addresses.find(a => a.isDefault)?.addressId || '');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Generate available dates (next 7-30 days)
  const today = new Date();
  const dates: { value: string; label: string }[] = [];
  for (let i = 7; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const val = d.toISOString().split('T')[0];
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    dates.push({ value: val, label: `${val} ${dayNames[d.getDay()]}` });
  }

  const timeSlots = [
    { value: 'morning', label: '🌅 上午 09:00-12:00' },
    { value: 'afternoon', label: '☀️ 下午 13:00-17:00' },
    { value: 'evening', label: '🌆 傍晚 17:00-20:00' },
  ];

  const selectedAddr = user?.addresses.find(a => a.addressId === addressId);

  const handleSubmit = () => {
    if (!deliveryDate) { showToast('warning', '请选择预计送达日期'); return; }
    if (!deliveryTimeSlot) { showToast('warning', '请选择送达时间段'); return; }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    showToast('success', '预约订单已提交！预计按您选择的时间送达');
    setSubmitting(false);
    setShowConfirm(false);
    navigate('/orders');
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>订单中心</span>
        {' > '}<span style={{ color: '#1f1f1f' }}>预约订单</span>
      </div>

      <div className="page-header">
        <h2 className="page-title">📅 预约配送订单</h2>
        <p className="page-subtitle">选择期望的送达时间，我们将按时为您配送</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div>
          {/* Delivery Time Selection */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📅 选择预计送达日期</span>
            </div>
            <p style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 12 }}>
              预约订单支持选择7-30天内的送达日期，我们将根据库存和物流提前备货
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, maxHeight: 240, overflow: 'auto' }}>
              {dates.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDeliveryDate(d.value)}
                  style={{
                    padding: '10px 12px', borderRadius: 6, border: `2px solid ${deliveryDate === d.value ? '#ff6600' : '#f0f0f0'}`,
                    background: deliveryDate === d.value ? '#fff3e8' : '#fff',
                    cursor: 'pointer', textAlign: 'center', fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: deliveryDate === d.value ? 700 : 400 }}>{d.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⏰ 选择送达时间段</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {timeSlots.map(slot => (
                <button
                  key={slot.value}
                  onClick={() => setDeliveryTimeSlot(slot.value)}
                  style={{
                    flex: 1, padding: '16px 12px', borderRadius: 8,
                    border: `2px solid ${deliveryTimeSlot === slot.value ? '#ff6600' : '#f0f0f0'}`,
                    background: deliveryTimeSlot === slot.value ? '#fff3e8' : '#fff',
                    cursor: 'pointer', textAlign: 'center', fontSize: 14,
                    transition: 'all 0.15s',
                  }}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remark */}
          <div className="card">
            <div className="form-group">
              <label className="form-label">📝 预约备注</label>
              <textarea className="form-textarea" rows={3} maxLength={200}
                placeholder="如：请在送达前1小时电话联系；需要防水包装等..."
                value={remark} onChange={e => setRemark(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 112 }}>
            <div className="card-header">
              <span className="card-title">📋 预约摘要</span>
            </div>

            <div className="form-group">
              <label className="form-label">收货地址</label>
              <select className="form-select" value={addressId} onChange={e => setAddressId(e.target.value)}>
                {user?.addresses.map(addr => (
                  <option key={addr.addressId} value={addr.addressId}>
                    {addr.name} - {addr.province}{addr.city}{addr.district} {addr.detail}
                    {addr.isDefault ? ' [默认]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart items summary */}
            {selectedItems.length > 0 && (
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                  🛒 购物车商品（{selectedItems.length}种）
                </div>
                {selectedItems.slice(0, 5).map(item => (
                  <div key={item.cartItemId} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>
                      {item.product.name.slice(0, 20)}...
                    </span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
                {selectedItems.length > 5 && (
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>...还有 {selectedItems.length - 5} 种</div>
                )}
                <div style={{ borderTop: '1px solid #e8e8e8', paddingTop: 8, marginTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>预估金额</span>
                  <span style={{ color: '#ff6600' }}>¥{selectedPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            {deliveryDate && deliveryTimeSlot && (
              <div style={{ background: '#fff3e8', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ff6600', marginBottom: 4 }}>
                  📅 预约配送信息
                </div>
                <div style={{ fontSize: 13 }}>
                  <div>📅 日期：<strong>{deliveryDate}</strong></div>
                  <div>⏰ 时段：<strong>{timeSlots.find(s => s.value === deliveryTimeSlot)?.label}</strong></div>
                  {selectedAddr && <div style={{ marginTop: 4 }}>📍 {selectedAddr.province}{selectedAddr.city} {selectedAddr.name}</div>}
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-lg btn-block" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ 提交中...' : '📅 提交预约订单'}
            </button>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8, textAlign: 'center' }}>
              也支持空购物车提交，备注中说明需求即可
            </div>
          </div>
        </div>
      </div>

      <Modal open={showConfirm} title="确认预约订单" onClose={() => setShowConfirm(false)}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowConfirm(false)} disabled={submitting}>返回修改</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? '提交中...' : '✅ 确认预约'}
          </button>
        </>} width={500}>
        <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, fontSize: 13, lineHeight: 2 }}>
          <div>📅 <strong>送达日期：</strong>{deliveryDate}</div>
          <div>⏰ <strong>时间段：</strong>{timeSlots.find(s => s.value === deliveryTimeSlot)?.label}</div>
          <div>📍 <strong>地址：</strong>{selectedAddr?.province}{selectedAddr?.city}{selectedAddr?.district} {selectedAddr?.detail}</div>
          <div>📦 <strong>购物车商品：</strong>{selectedItems.length > 0 ? `${selectedItems.length} 种` : '无（备注说明需求）'}</div>
          {remark && <div>📝 <strong>备注：</strong>{remark}</div>}
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#fffbe6', borderRadius: 8, fontSize: 13, color: '#8c8c8c' }}>
          💡 预约订单提交后将进入排期，OMS系统会提前备货并在您选择的日期按时配送。
        </div>
      </Modal>
    </div>
  );
}
