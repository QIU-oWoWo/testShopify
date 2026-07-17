import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    dealerName: '',
    contactName: '',
    phone: '',
    email: '',
    password: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      showToast('warning', '请先同意服务协议');
      return;
    }
    if (!form.dealerName || !form.contactName || !form.phone || !form.password) {
      showToast('warning', '请填写必填字段');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    showToast('success', '入驻申请已提交，请等待审核');
    setLoading(false);
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff3e8 0%, #fff 50%, #fff3e8 100%)',
    }}>
      <div style={{
        width: 480,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        padding: 40,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: '#ff6600',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 12,
          }}>
            🛵
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ff6600' }}>经销商入驻</h1>
          <p style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4 }}>
            填写以下信息申请开通云销通采购账号
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><span className="required">*</span>经销商名称</label>
              <input className="form-input" placeholder="营业执照全称" value={form.dealerName}
                onChange={(e) => setForm({ ...form, dealerName: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label"><span className="required">*</span>联系人姓名</label>
              <input className="form-input" placeholder="门店负责人" value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><span className="required">*</span>手机号</label>
              <input className="form-input" type="tel" placeholder="用于登录和接收通知" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input className="form-input" type="email" placeholder="用于接收对账单和发票" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><span className="required">*</span>登录密码</label>
            <input className="form-input" type="password" placeholder="设置登录密码（6-20位）" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 16 }}>
            <input type="checkbox" checked={form.agreeTerms}
              onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
              style={{ accentColor: '#ff6600' }} />
            我已阅读并同意《云销通服务协议》和《隐私政策》
          </label>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}
            style={{ height: 48, fontSize: 16 }}>
            {loading ? '提交中...' : '提交入驻申请'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: '#8c8c8c' }}>
            已有账号？{' '}
            <Link to="/login" style={{ color: '#ff6600' }}>返回登录</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
