import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useApp } from '../../store/AppContext';

export default function PreferencePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  const [prefs, setPrefs] = useState(user.preferences);

  const handleSave = () => {
    updateUser({ preferences: prefs });
    showToast('success', '偏好设置已保存');
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>个人中心</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>操作偏好设置</span>
      </div>

      <div className="page-header">
        <h2 className="page-title">⚙️ 操作偏好设置</h2>
      </div>

      {/* Default Shipping */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">默认配送方式</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'EXPRESS' as const, label: '快递配送' },
            { id: 'SELF_PICKUP' as const, label: '门店自提' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={`filter-tag ${prefs.defaultShipping === opt.id ? 'active' : ''}`}
              onClick={() => setPrefs({ ...prefs, defaultShipping: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Default Invoice */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">默认发票信息</span>
        </div>
        <select
          className="form-select"
          value={prefs.defaultInvoiceId || ''}
          onChange={(e) => setPrefs({ ...prefs, defaultInvoiceId: e.target.value || undefined })}
          style={{ maxWidth: 400 }}
        >
          <option value="">不默认选择</option>
          {user.invoiceInfo.map((inv) => (
            <option key={inv.invoiceId} value={inv.invoiceId}>
              {inv.title} ({inv.invoiceType === 'VAT_SPECIAL' ? '专票' : '普票'})
            </option>
          ))}
        </select>
      </div>

      {/* Order Reminders */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">订单提醒方式</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['站内信', '短信', '微信'].map((method) => (
            <button
              key={method}
              className={`filter-tag ${prefs.orderReminders.includes(method) ? 'active' : ''}`}
              onClick={() => {
                const next = prefs.orderReminders.includes(method)
                  ? prefs.orderReminders.filter((m) => m !== method)
                  : [...prefs.orderReminders, method];
                setPrefs({ ...prefs, orderReminders: next });
              }}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* List Density */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">商品列表密度</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'COMPACT' as const, label: '紧凑' },
            { id: 'COMFORT' as const, label: '舒适' },
            { id: 'SPACIOUS' as const, label: '宽松' },
          ].map((opt) => (
            <button
              key={opt.id}
              className={`filter-tag ${prefs.listDensity === opt.id ? 'active' : ''}`}
              onClick={() => setPrefs({ ...prefs, listDensity: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search History */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">搜索历史保留</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`filter-tag ${prefs.keepSearchHistory ? 'active' : ''}`}
            onClick={() => setPrefs({ ...prefs, keepSearchHistory: true })}
          >
            开启
          </button>
          <button
            className={`filter-tag ${!prefs.keepSearchHistory ? 'active' : ''}`}
            onClick={() => setPrefs({ ...prefs, keepSearchHistory: false })}
          >
            关闭
          </button>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          保存设置
        </button>
      </div>
    </div>
  );
}
