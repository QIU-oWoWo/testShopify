import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { mockReconciliations } from '../../mock';

export default function ReconciliationDetailPage() {
  const { reconId } = useParams<{ reconId: string }>();
  const navigate = useNavigate();
  const rec = mockReconciliations.find((r) => r.reconciliationId === reconId);

  if (!rec) {
    return (
      <div className="container">
        <EmptyState icon="🔍" text="未找到该对账单" actionText="返回列表" onAction={() => navigate('/reconciliation')} />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/reconciliation')}>对账财务</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>账单详情</span>
      </div>

      {/* Header */}
      <div className="card" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>
              {rec.periodStart} 至 {rec.periodEnd} 对账单
            </h2>
            <StatusBadge status={rec.status} />
          </div>
          {rec.confirmTime && (
            <div style={{ fontSize: 13, color: '#8c8c8c' }}>确认时间：{rec.confirmTime}</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-label">账单总金额</div>
          <div className="stat-card-value orange">¥{rec.totalAmount.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">已核销金额</div>
          <div className="stat-card-value green">¥{rec.verifiedAmount.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">差异金额</div>
          <div className="stat-card-value" style={{ color: rec.diffAmount > 0 ? '#ff4d4f' : '#52c41a' }}>
            ¥{rec.diffAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <span className="card-title">订单明细</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>日期</th>
              <th>金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {rec.orderDetails.map((detail, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, cursor: 'pointer' }}>{detail.orderNo}</td>
                <td>{detail.date}</td>
                <td style={{ fontWeight: 600 }}>¥{detail.amount.toLocaleString()}</td>
                <td><StatusBadge status={detail.status === '已签收' ? 'SIGNED' : 'IN_TRANSIT'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diff feedback */}
      {rec.diffAmount > 0 && rec.status === 'PENDING' && (
        <div className="card" style={{ background: '#fffbe6', border: '1px solid #fad14a' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            ⚠️ 差异反馈
          </div>
          <p style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 12 }}>
            账单存在 ¥{rec.diffAmount.toLocaleString()} 的差异，如需申诉请提交差异反馈。
          </p>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="请描述差异原因并上传凭证..."
            style={{ marginBottom: 12 }}
          />
          <button className="btn btn-primary btn-sm">提交差异反馈</button>
        </div>
      )}
    </div>
  );
}
