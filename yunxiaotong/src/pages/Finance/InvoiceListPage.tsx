import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import { mockInvoiceList } from '../../mock';
import { mockOrders } from '../../mock';

export default function InvoiceListPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/reconciliation')}>对账财务</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>发票管理</span>
      </div>

      <div className="page-header">
        <h2 className="page-title">发票管理</h2>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-label">已开发票</div>
          <div className="stat-card-value">{mockInvoiceList.length}张</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">待开发票</div>
          <div className="stat-card-value orange">2张</div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>发票抬头</th>
              <th>税号</th>
              <th>发票类型</th>
              <th>接收方式</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {mockInvoiceList.map((inv) => (
              <tr key={inv.invoiceId}>
                <td style={{ fontWeight: 500 }}>{inv.title}</td>
                <td style={{ fontSize: 13 }}>{inv.taxNumber}</td>
                <td>
                  <span className="badge badge-primary">
                    {inv.invoiceType === 'VAT_SPECIAL' ? '增值税专用发票' : '增值税普通发票'}
                  </span>
                </td>
                <td>{inv.receiveMethod === 'EMAIL' ? `电子发票(${inv.email})` : '纸质发票'}</td>
                <td>
                  <button className="btn btn-outline btn-sm">预览</button>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}>下载</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Apply for invoice */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">📄 开票申请</span>
        </div>
        <p style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 12 }}>
          选择已完成的订单申请开票
        </p>
        <button className="btn btn-primary">选择订单申请开票</button>
      </div>
    </div>
  );
}
