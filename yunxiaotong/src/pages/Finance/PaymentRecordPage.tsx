import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { mockPaymentRecords } from '../../mock';

export default function PaymentRecordPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/reconciliation')}>对账财务</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>回款记录</span>
      </div>

      <div className="page-header">
        <h2 className="page-title">回款记录</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>回款日期</th>
              <th>回款金额</th>
              <th>回款方式</th>
              <th>关联对账单</th>
              <th>核销状态</th>
            </tr>
          </thead>
          <tbody>
            {mockPaymentRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td style={{ fontWeight: 600 }}>¥{record.amount.toLocaleString()}</td>
                <td>{record.method}</td>
                <td>
                  <span
                    style={{ color: '#ff6600', cursor: 'pointer' }}
                    onClick={() => navigate(`/reconciliation/${record.reconciliationNo}`)}
                  >
                    {record.reconciliationNo}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    record.status === '已核销' ? 'badge-success' :
                    record.status === '部分核销' ? 'badge-warning' :
                    'badge-default'
                  }`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
