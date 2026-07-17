import React from 'react';

const statusMap: Record<string, { label: string; className: string }> = {
  CREATED: { label: '已创建', className: 'badge-default' },
  WAIT_PAY: { label: '待付款', className: 'badge-warning' },
  PAID: { label: '已付款', className: 'badge-primary' },
  CONFIRMED: { label: '已确认', className: 'badge-primary' },
  PICKING: { label: '拣货中', className: 'badge-primary' },
  SHIPPED: { label: '已发货', className: 'badge-primary' },
  IN_TRANSIT: { label: '运输中', className: 'badge-primary' },
  DELIVERED: { label: '已派送', className: 'badge-success' },
  SIGNED: { label: '已签收', className: 'badge-success' },
  COMPLETED: { label: '已完成', className: 'badge-success' },
  CANCELLED: { label: '已取消', className: 'badge-default' },
  AFTER_SALE_PROCESSING: { label: '售后中', className: 'badge-warning' },
  EXCEPTION: { label: '异常', className: 'badge-error' },
  PENDING: { label: '待确认', className: 'badge-warning' },
  CONFIRMED_RECON: { label: '已确认', className: 'badge-success' },
  DISPUTED: { label: '争议中', className: 'badge-error' },
  SETTLED: { label: '已结算', className: 'badge-success' },
  // After-sale statuses
  SUBMITTED: { label: '已提交', className: 'badge-warning' },
  REVIEWING: { label: '审核中', className: 'badge-warning' },
  APPROVED: { label: '已通过', className: 'badge-success' },
  RETURN_WAITING: { label: '待退货', className: 'badge-warning' },
  RETURNING: { label: '退货中', className: 'badge-primary' },
  INSPECTING: { label: '验货中', className: 'badge-warning' },
  REFUNDING: { label: '退款中', className: 'badge-primary' },
  REJECTED: { label: '已拒绝', className: 'badge-error' },
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const config = statusMap[status] || { label: status, className: 'badge-default' };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
