import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../store/CartContext';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { getPrice } from '../../store/CartContext';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

export default function CheckoutPage() {
  const { selectedItems, selectedPrice, clearCart } = useCart();
  const { showToast } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState(user?.addresses[0]?.addressId || '');
  const [shippingMethod, setShippingMethod] = useState<'EXPRESS' | 'SELF_PICKUP'>('EXPRESS');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(user?.invoiceInfo[0]?.invoiceId || '');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedAddress = user?.addresses.find((a) => a.addressId === selectedAddressId);
  const selectedInvoice = user?.invoiceInfo.find((i) => i.invoiceId === selectedInvoiceId);

  const freightFee = selectedPrice >= 500 ? 0 : 20;
  const discountAmount = selectedPrice >= 2000 ? Math.floor(selectedPrice * 0.02) : 0;
  const payAmount = selectedPrice + freightFee - discountAmount;

  if (selectedItems.length === 0) {
    return (
      <div className="container">
        <EmptyState icon="📋" text="没有待结算的商品" actionText="去购物车" onAction={() => navigate('/cart')} />
      </div>
    );
  }

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    // Simulate order submission
    await new Promise((r) => setTimeout(r, 1500));
    showToast('success', '订单提交成功！');
    clearCart();
    setShowConfirm(false);
    setSubmitting(false);
    navigate('/orders');
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">结算下单</h2>
      </div>

      <div className="two-col">
        {/* Left: Main form */}
        <div>
          {/* Shipping Address */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📍 收货地址</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile/addresses')}>
                管理地址
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {user?.addresses.map((addr) => (
                <label
                  key={addr.addressId}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12,
                    border: `2px solid ${selectedAddressId === addr.addressId ? '#ff6600' : '#f0f0f0'}`,
                    borderRadius: 8, cursor: 'pointer',
                    background: selectedAddressId === addr.addressId ? '#fff3e8' : '#fff',
                  }}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.addressId}
                    onChange={() => setSelectedAddressId(addr.addressId)}
                    style={{ marginTop: 2, accentColor: '#ff6600' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {addr.name} {addr.phone}
                      {addr.isDefault && <span className="badge badge-primary" style={{ marginLeft: 8 }}>默认</span>}
                      {addr.label && <span className="tag" style={{ marginLeft: 4 }}>{addr.label}</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                      {addr.province}{addr.city}{addr.district} {addr.detail}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Shipping Method */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🚚 配送方式</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { id: 'EXPRESS' as const, label: '快递配送', desc: '预计1-3天送达' },
                { id: 'SELF_PICKUP' as const, label: '门店自提', desc: '到店自提取货' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setShippingMethod(opt.id)}
                  style={{
                    flex: 1, padding: 16, borderRadius: 8,
                    border: `2px solid ${shippingMethod === opt.id ? '#ff6600' : '#f0f0f0'}`,
                    background: shippingMethod === opt.id ? '#fff3e8' : '#fff',
                    textAlign: 'center', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
            {shippingMethod === 'EXPRESS' && (
              <div style={{ marginTop: 12, fontSize: 13, color: '#8c8c8c' }}>
                预计发货时间：下单后24小时内（工作日）
              </div>
            )}
          </div>

          {/* Invoice */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📄 发票信息</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile/invoices')}>
                管理发票
              </button>
            </div>
            {user?.invoiceInfo.map((inv) => (
              <label
                key={inv.invoiceId}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12,
                  border: `2px solid ${selectedInvoiceId === inv.invoiceId ? '#ff6600' : '#f0f0f0'}`,
                  borderRadius: 8, cursor: 'pointer', marginBottom: 8,
                  background: selectedInvoiceId === inv.invoiceId ? '#fff3e8' : '#fff',
                }}
              >
                <input
                  type="radio"
                  name="invoice"
                  checked={selectedInvoiceId === inv.invoiceId}
                  onChange={() => setSelectedInvoiceId(inv.invoiceId)}
                  style={{ marginTop: 2, accentColor: '#ff6600' }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {inv.title}
                    <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                      {inv.invoiceType === 'VAT_SPECIAL' ? '增值税专用发票' : '增值税普通发票'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                    税号：{inv.taxNumber} | 接收方式：{inv.receiveMethod === 'EMAIL' ? '电子发票' : '纸质发票'}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Remark */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📝 订单备注</span>
            </div>
            <textarea
              className="form-textarea"
              rows={3}
              maxLength={200}
              placeholder={'选填：如"请附合格证"、"加急发货"等'}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
              常用备注：<span style={{ cursor: 'pointer', color: '#ff6600', marginRight: 8 }} onClick={() => setRemark('请附合格证')}>请附合格证</span>
              <span style={{ cursor: 'pointer', color: '#ff6600' }} onClick={() => setRemark('加急发货')}>加急发货</span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 112 }}>
            <div className="card-header">
              <span className="card-title">商品清单</span>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>
                共 {selectedItems.length} 种 {selectedItems.reduce((s, i) => s + i.quantity, 0)} 件
              </span>
            </div>

            {selectedItems.map((item) => {
              const price = getPrice(item.product, item.quantity);
              return (
                <div key={item.cartItemId} style={{
                  display: 'flex', gap: 12, padding: '8px 0',
                  borderBottom: '1px solid #f5f5f5',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 4, background: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>
                    📦
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{item.product.materialCode}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13 }}>¥{price} × {item.quantity}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#ff4d4f' }}>
                      ¥{(price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: '#8c8c8c' }}>商品总额</span>
                <span>¥{selectedPrice.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: '#52c41a' }}>满减优惠</span>
                  <span style={{ color: '#52c41a' }}>-¥{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: '#8c8c8c' }}>运费</span>
                <span>{freightFee === 0 ? <span style={{ color: '#52c41a' }}>免运费</span> : `¥${freightFee}`}</span>
              </div>
              <div style={{ height: 1, background: '#f0f0f0', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>应付总额</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: '#ff6600' }}>
                  ¥{payAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handleSubmit}
              disabled={!selectedAddressId}
            >
              提交订单
            </button>

            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 12, textAlign: 'center' }}>
              提交订单即表示您同意《云销通服务协议》
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        open={showConfirm}
        title="确认订单"
        onClose={() => setShowConfirm(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowConfirm(false)} disabled={submitting}>
              返回修改
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmSubmit}
              disabled={submitting}
            >
              {submitting ? '提交中...' : `确认支付 ¥${payAmount.toLocaleString()}`}
            </button>
          </>
        }
      >
        <div style={{ fontSize: 14 }}>
          <p style={{ marginBottom: 8 }}>请确认以下信息：</p>
          <div style={{ background: '#fafafa', padding: 12, borderRadius: 8, fontSize: 13 }}>
            <p><strong>收货地址：</strong>{selectedAddress?.province}{selectedAddress?.city}{selectedAddress?.district} {selectedAddress?.detail}</p>
            <p><strong>收件人：</strong>{selectedAddress?.name} {selectedAddress?.phone}</p>
            <p><strong>配送方式：</strong>{shippingMethod === 'EXPRESS' ? '快递配送' : '门店自提'}</p>
            <p><strong>商品数量：</strong>{selectedItems.length} 种 {selectedItems.reduce((s, i) => s + i.quantity, 0)} 件</p>
            <p><strong>应付总额：</strong><span style={{ color: '#ff6600', fontWeight: 700, fontSize: 16 }}>¥{payAmount.toLocaleString()}</span></p>
          </div>
          {submitting && (
            <div style={{ textAlign: 'center', marginTop: 16, color: '#ff6600' }}>
              ⏳ 正在提交订单...
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
