import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { mockReconciliations } from '../../mock';

export default function ReconciliationListPage() {
  const navigate = useNavigate();

  const totalAmount = mockReconciliations.reduce((s, r) => s + r.totalAmount, 0);
  const pendingAmount = mockReconciliations
    .filter((r) => r.status === 'PENDING' || r.status === 'DISPUTED')
    .reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">对账 & 财务</h2>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-label">累计对账金额</div>
          <div className="stat-card-value orange">¥{totalAmount.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">待确认/争议金额</div>
          <div className="stat-card-value" style={{ color: '#faad14' }}>¥{pendingAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* Reconciliation List */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>账单周期</th>
              <th>总金额</th>
              <th>已核销金额</th>
              <th>差异金额</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {mockReconciliations.map((rec) => (
              <tr key={rec.reconciliationId}>
                <td>
                  <span style={{ fontWeight: 500 }}>
                    {rec.periodStart} 至 {rec.periodEnd}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>¥{rec.totalAmount.toLocaleString()}</td>
                <td>¥{rec.verifiedAmount.toLocaleString()}</td>
                <td style={{ color: rec.diffAmount > 0 ? '#ff4d4f' : '#52c41a' }}>
                  ¥{rec.diffAmount.toLocaleString()}
                </td>
                <td><StatusBadge status={rec.status} /></td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/reconciliation/${rec.reconciliationId}`)}
                  >
                    查看详情
                  </button>
                  {rec.status === 'PENDING' && (
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
                      确认对账
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
