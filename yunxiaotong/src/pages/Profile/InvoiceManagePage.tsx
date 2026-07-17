import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

export default function InvoiceManagePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>个人中心</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>发票信息管理</span>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="page-title">📄 发票信息管理</h2>
        <button className="btn btn-primary btn-sm">+ 新增发票信息</button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {user.invoiceInfo.map((inv) => (
          <div key={inv.invoiceId} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {inv.title}
                  <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                    {inv.invoiceType === 'VAT_SPECIAL' ? '增值税专用发票' : '增值税普通发票'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                  税号：{inv.taxNumber}
                </div>
                {inv.invoiceType === 'VAT_SPECIAL' && (
                  <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                    <div>开户行：{inv.bankName} | 账号：{inv.bankAccount}</div>
                    <div>地址：{inv.address} | 电话：{inv.phone}</div>
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                  接收方式：{inv.receiveMethod === 'EMAIL' ? `电子发票 (${inv.email})` : '纸质发票'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm">编辑</button>
                <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4f' }}>删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
