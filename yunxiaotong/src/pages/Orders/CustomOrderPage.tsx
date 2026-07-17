import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import Modal from '../../components/Modal';
import { vehicles, brands } from '../../mock';

export default function CustomOrderPage() {
  const { showToast } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Vehicle info
    vinCode: '',
    vehicleBrand: '雅迪',
    vehicleSeries: '',
    vehicleModel: '',
    vehicleYear: '2024',

    // Part requirements
    partCategory: '',
    partName: '',
    partDescription: '',
    expectedBrand: '',
    quantity: 1,
    unit: '个',

    // Reference (optional)
    referenceImage: '',
    referenceMaterialCode: '',
    referenceUrl: '',

    // Urgency
    urgency: 'NORMAL' as 'URGENT' | 'NORMAL' | 'LOW',

    // Shipping preference
    shippingMethod: 'EXPRESS' as 'EXPRESS' | 'SELF_PICKUP',
    addressId: user?.addresses.find(a => a.isDefault)?.addressId || '',

    // Additional notes
    remark: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedAddress = user?.addresses.find(a => a.addressId === form.addressId);

  const handleSubmit = () => {
    // Validation
    if (!form.partName.trim()) {
      showToast('warning', '请输入配件名称/需求描述');
      return;
    }
    if (!form.vehicleModel.trim()) {
      showToast('warning', '请选择或输入适配车型');
      return;
    }
    if (form.quantity < 1) {
      showToast('warning', '数量至少为1');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    showToast('success', '定制订单已提交！OMS运营将在1个工作日内与您联系确认');
    setSubmitting(false);
    setShowConfirm(false);
    navigate('/orders');
  };

  const updateForm = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const urgencyLabels: Record<string, { label: string; color: string }> = {
    URGENT: { label: '🔴 紧急', color: '#ff4d4f' },
    NORMAL: { label: '🟡 普通', color: '#faad14' },
    LOW: { label: '🟢 不急', color: '#52c41a' },
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>订单中心</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>定制订单</span>
      </div>

      <div className="page-header">
        <h2 className="page-title">🔧 定制配件订单</h2>
        <p className="page-subtitle">
          非标配件 / 特殊需求 / 未在商品库中的配件，请在此提交定制需求，OMS运营将人工对接处理
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Main form */}
        <div>
          {/* Vehicle Info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🏍️ 适配车型信息</span>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>请尽可能准确填写，以便精准匹配</span>
            </div>

            <div className="form-group">
              <label className="form-label">VIN码（17位车架号）</label>
              <input
                className="form-input"
                placeholder="输入VIN码自动解析车型（选填）"
                maxLength={17}
                value={form.vinCode}
                onChange={(e) => updateForm('vinCode', e.target.value.toUpperCase())}
              />
              {form.vinCode.length === 17 && (
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 4 }}>
                  ✅ 已识别：雅迪 冠能系列 冠能Q7 (2024款)
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>品牌</label>
                <select className="form-select" value={form.vehicleBrand}
                  onChange={(e) => updateForm('vehicleBrand', e.target.value)}>
                  <option value="雅迪">雅迪</option>
                  <option value="其他">其他品牌</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>车系</label>
                <select className="form-select" value={form.vehicleSeries}
                  onChange={(e) => updateForm('vehicleSeries', e.target.value)}>
                  <option value="">请选择车系</option>
                  <option value="冠能系列">冠能系列</option>
                  <option value="DE系列">DE系列</option>
                  <option value="VFLY系列">VFLY系列</option>
                  <option value="换电系列">换电系列</option>
                  <option value="电自系列">电自系列</option>
                  <option value="其他">其他（请在备注中说明）</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>车型</label>
                <input className="form-input" placeholder="如：冠能Q7、DE8"
                  value={form.vehicleModel}
                  onChange={(e) => updateForm('vehicleModel', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">年份</label>
                <select className="form-select" value={form.vehicleYear}
                  onChange={(e) => updateForm('vehicleYear', e.target.value)}>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="other">更早</option>
                </select>
              </div>
            </div>
          </div>

          {/* Part Requirements */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🔩 配件需求</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">配件品类</label>
                <select className="form-select" value={form.partCategory}
                  onChange={(e) => updateForm('partCategory', e.target.value)}>
                  <option value="">请选择（选填）</option>
                  <option value="电池">电池</option>
                  <option value="配件">配件</option>
                  <option value="轮胎">轮胎</option>
                  <option value="润滑油">润滑油</option>
                  <option value="附件">附件</option>
                  <option value="工具设备">工具设备</option>
                  <option value="外观件">外观件（外壳/面板/灯具）</option>
                  <option value="电子件">电子件（仪表/控制器/传感器）</option>
                  <option value="结构件">结构件（车架/减震/支架）</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">期望品牌</label>
                <select className="form-select" value={form.expectedBrand}
                  onChange={(e) => updateForm('expectedBrand', e.target.value)}>
                  <option value="">不限品牌</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="其他">其他品牌</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span>配件名称 / 需求描述</label>
              <input className="form-input" placeholder="如：冠能Q7前大灯总成（带日行灯版本）"
                value={form.partName}
                onChange={(e) => updateForm('partName', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">详细描述</label>
              <textarea className="form-textarea" rows={3} placeholder="请补充配件规格、尺寸、材质、颜色等详细信息..."
                value={form.partDescription}
                onChange={(e) => updateForm('partDescription', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><span className="required">*</span>数量</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="form-input" type="number" min={1} style={{ width: 100 }}
                    value={form.quantity}
                    onChange={(e) => updateForm('quantity', Math.max(1, parseInt(e.target.value) || 1))} />
                  <select className="form-select" style={{ width: 100 }}
                    value={form.unit}
                    onChange={(e) => updateForm('unit', e.target.value)}>
                    <option value="个">个</option>
                    <option value="套">套</option>
                    <option value="条">条</option>
                    <option value="瓶">瓶</option>
                    <option value="组">组</option>
                    <option value="箱">箱</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">紧急程度</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(Object.entries(urgencyLabels) as [string, { label: string; color: string }][]).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      className={`filter-tag ${form.urgency === key ? 'active' : ''}`}
                      onClick={() => updateForm('urgency', key)}
                      style={form.urgency === key ? { background: val.color, borderColor: val.color } : {}}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reference Info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📎 参考信息（选填）</span>
            </div>
            <div className="form-group">
              <label className="form-label">已知物料编码</label>
              <input className="form-input" placeholder="如您知道相近配件的物料编码，请填写"
                value={form.referenceMaterialCode}
                onChange={(e) => updateForm('referenceMaterialCode', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">参考链接/图片</label>
              <input className="form-input" placeholder="可粘贴参考图片链接或商品链接"
                value={form.referenceUrl}
                onChange={(e) => updateForm('referenceUrl', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">上传参考图片</label>
              <div style={{
                border: '1px dashed #d9d9d9', borderRadius: 8, padding: 24,
                textAlign: 'center', color: '#8c8c8c', fontSize: 13,
                cursor: 'pointer',
              }}>
                📷 点击或拖拽上传配件参考图片（最多5张）
              </div>
            </div>
          </div>

          {/* Remark */}
          <div className="card">
            <div className="form-group">
              <label className="form-label">补充备注</label>
              <textarea className="form-textarea" rows={3} maxLength={500}
                placeholder="其他需要说明的信息..."
                value={form.remark}
                onChange={(e) => updateForm('remark', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Shipping Info */}
          <div className="card" style={{ position: 'sticky', top: 112 }}>
            <div className="card-header">
              <span className="card-title">📋 收货与提交</span>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">收货地址</label>
              <select className="form-select" value={form.addressId}
                onChange={(e) => updateForm('addressId', e.target.value)}>
                {user?.addresses.map(addr => (
                  <option key={addr.addressId} value={addr.addressId}>
                    {addr.name} - {addr.province}{addr.city}{addr.district} {addr.detail}
                    {addr.isDefault ? ' [默认]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Shipping method */}
            <div className="form-group">
              <label className="form-label">配送方式</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={`filter-tag ${form.shippingMethod === 'EXPRESS' ? 'active' : ''}`}
                  onClick={() => updateForm('shippingMethod', 'EXPRESS')}>
                  🚚 快递配送
                </button>
                <button className={`filter-tag ${form.shippingMethod === 'SELF_PICKUP' ? 'active' : ''}`}
                  onClick={() => updateForm('shippingMethod', 'SELF_PICKUP')}>
                  🏪 门店自提
                </button>
              </div>
            </div>

            {/* Summary */}
            <div style={{
              background: '#fff3e8', borderRadius: 8, padding: 16, marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>订单类型</div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>
                <span className="badge badge-warning" style={{ fontSize: 13 }}>🔧 定制单</span>
                {form.urgency === 'URGENT' && <span className="badge badge-error" style={{ marginLeft: 8, fontSize: 13 }}>紧急</span>}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>处理说明</div>
              <div style={{ fontSize: 13, color: '#8c8c8c', lineHeight: 1.6 }}>
                提交后OMS运营将在<strong>1个工作日内</strong>与您联系确认配件信息、价格及交期。
                {form.urgency === 'URGENT' && <span style={{ color: '#ff4d4f' }}>紧急订单将优先处理。</span>}
              </div>
            </div>

            {/* Selected info preview */}
            {form.partName && (
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>需求摘要</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>🏍️ {form.vehicleBrand} {form.vehicleSeries} {form.vehicleModel} ({form.vehicleYear})</div>
                  <div>🔩 {form.partName}</div>
                  <div>📦 {form.quantity}{form.unit} · {urgencyLabels[form.urgency]?.label}</div>
                  {form.expectedBrand && <div>🏷️ 期望品牌：{form.expectedBrand}</div>}
                  {selectedAddress && (
                    <div>📍 {selectedAddress.province}{selectedAddress.city} {selectedAddress.name}</div>
                  )}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '⏳ 提交中...' : '📤 提交定制需求'}
            </button>

            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8, textAlign: 'center' }}>
              提交后可在订单中心查看处理进度
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <Modal
        open={showConfirm}
        title="确认提交定制订单"
        onClose={() => setShowConfirm(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowConfirm(false)} disabled={submitting}>
              返回修改
            </button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
              {submitting ? '提交中...' : '✅ 确认提交'}
            </button>
          </>
        }
        width={520}
      >
        <div style={{ fontSize: 14 }}>
          <p style={{ marginBottom: 12, fontWeight: 600 }}>
            请确认以下定制需求信息：
          </p>
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, fontSize: 13, lineHeight: 2 }}>
            <div>🏍️ <strong>车型：</strong>{form.vehicleBrand} {form.vehicleSeries} {form.vehicleModel} ({form.vehicleYear})</div>
            {form.vinCode && <div>🔢 <strong>VIN：</strong>{form.vinCode}</div>}
            <div>🔩 <strong>配件：</strong>{form.partName}</div>
            {form.partDescription && <div>📝 <strong>描述：</strong>{form.partDescription}</div>}
            {form.partCategory && <div>📂 <strong>品类：</strong>{form.partCategory}</div>}
            {form.expectedBrand && <div>🏷️ <strong>品牌：</strong>{form.expectedBrand}</div>}
            <div>📦 <strong>数量：</strong>{form.quantity}{form.unit}</div>
            <div>⏱️ <strong>紧急度：</strong>{urgencyLabels[form.urgency]?.label}</div>
            <div>📍 <strong>地址：</strong>{selectedAddress?.province}{selectedAddress?.city}{selectedAddress?.district} {selectedAddress?.detail}</div>
            <div>🚚 <strong>配送：</strong>{form.shippingMethod === 'EXPRESS' ? '快递配送' : '自提'}</div>
          </div>
          <div style={{
            marginTop: 12, padding: 12, background: '#fffbe6', borderRadius: 8,
            fontSize: 13, color: '#8c8c8c',
          }}>
            💡 提交后OMS运营将在<strong>1个工作日内</strong>联系您确认价格、库存及交期。
            此订单为<strong>定制单</strong>，非标准商品流程。
          </div>
        </div>
      </Modal>
    </div>
  );
}
