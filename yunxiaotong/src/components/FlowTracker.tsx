import React from 'react';
import { FLOW_NODES, STATUS_TO_FLOW, OMS_ORDER_STATUS_MAP } from '../mock/omsData';
import { OmsOrderVO } from '../types';

interface Props {
  order: OmsOrderVO;
}

export default function FlowTracker({ order }: Props) {
  const activeIdx = STATUS_TO_FLOW[order.status];
  const statusInfo = OMS_ORDER_STATUS_MAP[order.status];

  // Don't show for terminated/cancelled/exception states
  if (activeIdx === undefined || activeIdx < 0) {
    // Show termination message
    const isTerminated = ['ORDER_TERMINATED', 'CANCELLED'].includes(order.status);
    const isException = ['EXCEPTION_HOLD', 'RETURN_PROCESSING'].includes(order.status);
    return (
      <div style={{
        marginTop: 12, padding: '10px 16px', borderRadius: 6,
        background: isTerminated ? '#f5f5f5' : '#fff2f0',
        border: `1px solid ${isTerminated ? '#d9d9d9' : '#ffa39e'}`,
        fontSize: 13, color: isTerminated ? '#8c8c8c' : '#ff4d4f',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span>{isTerminated ? '⏹️' : '⚠️'}</span>
        <span>
          {isTerminated ? '此订单已终止，不再继续履约' : '订单履约已中断，当前处于异常状态'}
        </span>
      </div>
    );
  }

  // Flow summary text for each node
  const getSummary = (nodeIdx: number): string => {
    const pkgCount = order.packages?.length || 0;
    const shortagePkgs = order.packages?.filter(p => p.status === 'WAITING_RESTOCK').length || 0;
    const shippedPkgs = order.packages?.filter(p => p.status === 'SHIPPED' || p.status === 'DELIVERED' || p.status === 'COMPLETED').length || 0;
    const totalQty = order.packages?.reduce((s, p) => s + p.lineItems.reduce((ss, li) => ss + li.quantity, 0), 0) || 0;

    const summaries: Record<number, string> = {
      0: order.createTime.slice(0, 16),
      1: order.createTime.slice(0, 16),
      2: pkgCount > 1 ? `拆为${pkgCount}包裹` : '整单发出',
      3: activeIdx === 3 && shortagePkgs > 0
        ? `${shortagePkgs}包裹缺件等待`
        : activeIdx > 3 ? '拣货已完成' : `${shippedPkgs}/${pkgCount}包裹拣货中`,
      4: activeIdx === 4 && shortagePkgs > 0
        ? `${shortagePkgs}包裹缺件等待`
        : activeIdx > 4 ? '已发出' : `${pkgCount - shortagePkgs}包裹待发货`,
      5: activeIdx > 5 ? '运输已完成'
        : activeIdx === 5 ? `${shippedPkgs}/${pkgCount}包裹运输中` : '',
      6: activeIdx >= 6 ? `${shippedPkgs}/${pkgCount}包裹已签收` : '',
    };
    return summaries[nodeIdx] || '';
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Flow nodes */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {FLOW_NODES.map((node, i) => {
          const isCompleted = i < activeIdx;
          const isActive = i === activeIdx;
          const isFuture = i > activeIdx;

          return (
            <div key={node.key} style={{ flex: 1, position: 'relative', minWidth: 0 }}>
              {/* Connector line */}
              {i < FLOW_NODES.length - 1 && (
                <div style={{
                  position: 'absolute', top: 14, left: '50%', width: '100%', height: 2,
                  background: i < activeIdx ? '#ff6600' : '#e8e8e8',
                  zIndex: 0,
                }} />
              )}

              {/* Dot */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: isActive ? 28 : 24, height: isActive ? 28 : 24,
                  borderRadius: '50%',
                  background: isCompleted || isActive ? '#ff6600' : '#fff',
                  border: isFuture ? '2px solid #e8e8e8' : '2px solid #ff6600',
                  boxShadow: isActive ? '0 0 0 6px rgba(255,102,0,0.10)' : undefined,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>
                  {isCompleted && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                  {isActive && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />}
                </div>
              </div>

              {/* Label */}
              <div style={{
                textAlign: 'center', marginTop: 8,
                fontSize: isActive ? 13 : 12,
                fontWeight: isActive ? 600 : 400,
                color: isFuture ? '#bfbfbf' : isActive ? '#1a1a1a' : '#595959',
              }}>
                {node.label}
              </div>

              {/* Summary */}
              <div style={{
                textAlign: 'center', marginTop: 2,
                fontSize: 11,
                color: isFuture ? '#bfbfbf' : '#8c8c8c',
                minHeight: 16,
              }}>
                {getSummary(i)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shortage warning bar */}
      {[3, 4].includes(activeIdx) && order.packages?.some(p => p.status === 'WAITING_RESTOCK') && (
        <div style={{
          marginTop: 16, background: '#fff7e6', border: '1px solid #ffd591',
          borderRadius: 6, padding: '10px 16px',
        }}>
          {order.packages.filter(p => p.status === 'WAITING_RESTOCK').map(pkg => {
            const shortageItems = pkg.lineItems.filter(li => li.stockStatus !== 'IN_STOCK');
            return shortageItems.map(li => (
              <div key={li.lineItemId} style={{ fontSize: 12, color: '#d46b08', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span>
                <span>{li.skuName.slice(0, 25)}...</span>
                <span style={{
                  background: li.stockStatus === 'OUT_OF_STOCK' ? '#fff2f0' : '#fffbe6',
                  color: li.stockStatus === 'OUT_OF_STOCK' ? '#ff4d4f' : '#d46b08',
                  padding: '1px 6px', borderRadius: 3, fontSize: 11,
                }}>
                  {li.stockStatus === 'OUT_OF_STOCK' ? '缺货' : '采购中'}
                </span>
                {li.supplierInfo && (
                  <span>供应商补货预计 {li.supplierInfo.expectedArrivalDate}</span>
                )}
              </div>
            ));
          })}
        </div>
      )}
    </div>
  );
}
