import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useApp } from '../../store/AppContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('13888888888');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      showToast('warning', '请输入手机号和密码');
      return;
    }
    setLoading(true);
    try {
      await login(phone, password);
      showToast('success', '登录成功，欢迎回来！');
      navigate('/');
    } catch {
      showToast('error', '登录失败，请重试');
    } finally {
      setLoading(false);
    }
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
        width: 420,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        padding: 40,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, background: '#ff6600',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, marginBottom: 12,
          }}>
            🛵
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ff6600' }}>云销通</h1>
          <p style={{ fontSize: 14, color: '#8c8c8c', marginTop: 4 }}>雅迪配件采购平台 · 经销商登录</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">手机号</label>
            <input
              className="form-input"
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ height: 44, fontSize: 15 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="form-input"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: 44, fontSize: 15 }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
            style={{ height: 48, fontSize: 16, marginTop: 16 }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 13, color: '#8c8c8c' }}>
            还没有账号？{' '}
            <Link to="/register" style={{ color: '#ff6600' }}>申请入驻</Link>
          </span>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 24, padding: 12, background: '#fafafa', borderRadius: 8,
          fontSize: 12, color: '#8c8c8c', textAlign: 'center',
        }}>
          💡 演示账号：13888888888 / 任意密码
        </div>
      </div>
    </div>
  );
}
