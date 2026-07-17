import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { mockOrders } from '../../mock';

// Mock after-sale data
const mockAfterSale: {
  afterSaleId: string; orderId: string; orderNo: string;
  type: 'REFUND_ONLY' | 'RETURN_REFUND' | 'EXCHANGE';
  reason: string; description: string; refundAmount: number;
  status: string; createTime: string; updateTime: string;
  product: { name: string; materialCode: string; unitPrice: number; quantity: number };
} = {
  afterSaleId: 'as001',
  orderId: 'ord004',
  orderNo: 'YD202407130004',
  type: 'REFUND_ONLY',
  reason: 'QUALITY_ISSUE',
  description: '大灯总成安装后发现透镜有瑕疵，光线不均匀',
  refundAmount: 148,
  status: 'REFUNDING' as const,
  createTime: '2026-07-13 16:00:00',
  updateTime: '2026-07-14 10:00:00',
  product: {
    name: '雅迪原厂 LED大灯总成 冠能系列 远近一体透镜',
    materialCode: 'WL20240020',
    unitPrice: 148,
    quantity: 1,
  },
};

const timeline = [
  { time: '07-14 10:00', status: '退款中', desc: '财务已发起退款，预计3个工作日内到账' },
  { time: '07-14 09:00', status: '已通过', desc: '售后申请审核通过' },
  { time: '07-13 16:30', status: '审核中', desc: 'OMS运营已接收售后申请，正在审核' },
  { time: '07-13 16:00', status: '已提交', desc: '经销商提交售后申请' },
];

const typeLabels: Record<string, string> = {
  REFUND_ONLY: '仅退款',
  RETURN_REFUND: '退货退款',
  EXCHANGE: '换货',
};
const reasonLabels: Record<string, string> = {
  QUALITY_ISSUE: '质量问题',
  WRONG_ITEM: '发错货',
  SHORTAGE: '少发',
  DAMAGED: '破损',
  OTHER: '其他',
};

export default function AfterSalePage() {
  const { afterSaleId } = useParams<{ afterSaleId: string }>();
  const navigate = useNavigate();

  // Use mock data
  const as = mockAfterSale;
  const order = mockOrders.find((o) => o.orderId === as.orderId);

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>订单中心</span>
        {' > '}
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${as.orderId}`)}>{as.orderNo}</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>售后详情</span>
      </div>

      {/* Header */}
      <div style={{
        background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>售后单号：AS{afterSaleId?.toUpperCase()}</h2>
            <StatusBadge status={as.status} />
          </div>
          <div style={{ fontSize: 13, color: '#8c8c8c' }}>
            申请时间：{as.createTime} | 关联订单：{as.orderNo}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 售后信息</span>
        </div>
        <div className="order-info-grid">
          <div className="order-info-item">
            <span className="order-info-label">售后类型</span>
            <span className="order-info-value">{typeLabels[as.type]}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">售后原因</span>
            <span className="order-info-value">{reasonLabels[as.reason]}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">问题描述</span>
            <span className="order-info-value">{as.description}</span>
          </div>
          <div className="order-info-item">
            <span className="order-info-label">退款金额</span>
            <span className="order-info-value" style={{ fontWeight: 700, color: '#ff6600' }}>
              {as.type !== 'EXCHANGE' ? `¥${as.refundAmount?.toLocaleString()}` : '不涉及退款'}
            </span>
          </div>
        </div>
      </div>

      {/* Product */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📦 售后商品</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>商品信息</th>
              <th>单价 × 数量</th>
              <th>小计</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 4, background: '#fafafa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>📦</div>
                  <div>
                    <div style={{ fontSize: 13 }}>{as.product.name}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>{as.product.materialCode}</div>
                  </div>
                </div>
              </td>
              <td>¥{as.product.unitPrice} × {as.product.quantity}</td>
              <td style={{ fontWeight: 600 }}>¥{as.refundAmount?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📊 售后进度</span>
        </div>
        <div className="timeline">
          {timeline.map((node, i) => (
            <div
              key={i}
              className={`timeline-item ${i === 0 ? 'active' : ''}`}
            >
              <div className="timeline-dot" />
              <div className="timeline-time">{node.time}</div>
              <div className="timeline-desc">{node.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
