import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { mockOrders, orderStatusTabs } from '../../mock';
import { OrderStatus } from '../../types';

const PAGE_SIZE = 10;

const actionButtons: Record<string, { text: string; action: string; className: string }[]> = {
  WAIT_PAY: [
    { text: '去付款', action: 'pay', className: 'btn-primary' },
    { text: '取消订单', action: 'cancel', className: 'btn-ghost' },
  ],
  PAID: [
    { text: '催发货', action: 'urge', className: 'btn-outline' },
    { text: '修改地址', action: 'editAddr', className: 'btn-ghost' },
    { text: '取消订单', action: 'cancel', className: 'btn-ghost' },
  ],
  CONFIRMED: [
    { text: '催发货', action: 'urge', className: 'btn-outline' },
    { text: '修改地址', action: 'editAddr', className: 'btn-ghost' },
  ],
  PICKING: [
    { text: '查看进度', action: 'progress', className: 'btn-outline' },
  ],
  SHIPPED: [
    { text: '查看物流', action: 'logistics', className: 'btn-outline' },
  ],
  IN_TRANSIT: [
    { text: '查看物流', action: 'logistics', className: 'btn-outline' },
    { text: '确认收货', action: 'confirm', className: 'btn-primary' },
  ],
  DELIVERED: [
    { text: '确认收货', action: 'confirm', className: 'btn-primary' },
    { text: '申请售后', action: 'afterSale', className: 'btn-ghost' },
  ],
  SIGNED: [
    { text: '再次购买', action: 'rebuy', className: 'btn-outline' },
    { text: '申请售后', action: 'afterSale', className: 'btn-ghost' },
    { text: '评价', action: 'review', className: 'btn-ghost' },
  ],
  COMPLETED: [
    { text: '再次购买', action: 'rebuy', className: 'btn-outline' },
    { text: '申请售后', action: 'afterSale', className: 'btn-ghost' },
    { text: '评价', action: 'review', className: 'btn-ghost' },
  ],
  AFTER_SALE_PROCESSING: [
    { text: '查看售后进度', action: 'afterSaleDetail', className: 'btn-outline' },
  ],
  CANCELLED: [
    { text: '重新下单', action: 'rebuy', className: 'btn-outline' },
  ],
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const { status: routeStatus } = useParams<{ status?: string }>();
  const [activeTab, setActiveTab] = useState(routeStatus || 'ALL');
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return mockOrders;

    const tabConfig = orderStatusTabs.find((t) => t.key === activeTab);
    if (tabConfig?.statusIncludes) {
      return mockOrders.filter((o) => tabConfig.statusIncludes!.includes(o.status));
    }
    return mockOrders.filter((o) => o.status === activeTab);
  }, [activeTab]);

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">订单中心</h2>
      </div>

      {/* Status Tabs */}
      <div className="tabs">
        {orderStatusTabs.map((tab) => {
          const count = (tab.key === 'ALL'
            ? mockOrders.length
            : tab.statusIncludes
              ? mockOrders.filter((o) => tab.statusIncludes!.includes(o.status)).length
              : mockOrders.filter((o) => o.status === tab.key).length
          );
          return (
            <button
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
            >
              {tab.label}
              {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Order Table */}
      {filteredOrders.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>商品信息</th>
                <th>订单金额</th>
                <th>订单状态</th>
                <th>物流进度</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>
                    <div style={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate(`/orders/detail/${order.orderId}`)}>
                      {order.orderNo}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                      {order.createTime}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 4, background: '#fafafa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                      }}>
                        📦
                      </div>
                      <div>
                        <div style={{ fontSize: 13 }}>
                          {order.items[0]?.product.name.slice(0, 20)}...
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          共 {order.items.length} 种商品
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    ¥{order.payAmount.toLocaleString()}
                    <div style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 400 }}>
                      {order.paymentMethod === 'ONLINE' ? '在线支付' : order.paymentMethod === 'MONTHLY' ? '月结' : '货到付款'}
                    </div>
                  </td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>
                    {order.logistics && order.logistics.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 13 }}>{order.logistics[0].description.slice(0, 15)}...</div>
                        <div style={{ fontSize: 11, color: '#8c8c8c' }}>{order.logistics[0].time}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#bfbfbf' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(actionButtons[order.status] || []).map((btn) => (
                        <button
                          key={btn.action}
                          className={`btn ${btn.className} btn-sm`}
                          onClick={() => {
                            if (btn.action === 'logistics' || btn.action === 'confirm' || btn.action === 'afterSale' || btn.action === 'rebuy') {
                              navigate(`/orders/detail/${order.orderId}`);
                            }
                          }}
                        >
                          {btn.text}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon="📋" text="暂无订单" actionText="去逛逛" onAction={() => navigate('/')} />
      )}
      <Pagination current={page} total={filteredOrders.length} pageSize={PAGE_SIZE} onChange={setPage} />
    </div>
  );
}
