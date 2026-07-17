import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockOrders } from '../../mock';
import { omsOrderDetailMap, omsOperationLogs } from '../../mock/omsOrders';
import { OMS_ORDER_STATUS_MAP, PACKAGE_STATUS_MAP, STOCK_STATUS_OMS_MAP, mockOmsOrders } from '../../mock/omsData';
import FlowTracker from '../../components/FlowTracker';
import CollapsibleSection from '../../components/CollapsibleSection';
import LogisticsTimeline from '../../components/LogisticsTimeline';
import Modal from '../../components/Modal';
import { useApp } from '../../store/AppContext';
import EmptyState from '../../components/EmptyState';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showToast } = useApp();

  // Load dealer order for basic info
  const dealerOrder = mockOrders.find((o) => o.orderId === orderId || o.orderNo === orderId);
  // Load OMS detail data
  const order = omsOrderDetailMap[orderId || ''] || omsOrderDetailMap[dealerOrder?.orderId || ''];

  // After-sale state
  const [afterSaleModal, setAfterSaleModal] = useState(false);
  const [afterSaleType, setAfterSaleType] = useState<'REFUND_ONLY' | 'RETURN_REFUND' | 'EXCHANGE'>('REFUND_ONLY');
  const [afterSaleReason, setAfterSaleReason] = useState('');
  const [afterSaleDesc, setAfterSaleDesc] = useState('');

  if (!dealerOrder) {
    return (
      <div className="container">
        <EmptyState icon="🔍" text="订单未找到" actionText="返回订单列表" onAction={() => navigate('/orders')} />
      </div>
    );
  }

  // If no OMS data yet, try the OMS mock orders
  if (!order) {
    // Fallback: try matching via OMS standalone mock orders
    const omsOrder = mockOmsOrders.find((o: any) => o.orderNo === orderId);
    if (omsOrder) {
      return <OmsDetailView order={omsOrder} operationLogs={[]} navigate={navigate} showToast={showToast} />;
    }
    return (
      <div className="container">
        <EmptyState icon="🔍" text="该订单暂无详细履约数据" actionText="返回订单列表" onAction={() => navigate('/orders')} />
      </div>
    );
  }

  const operationLogs = omsOperationLogs[orderId || ''] || [];

  const handleAfterSaleSubmit = () => {
    if (!afterSaleReason) {
      showToast('warning', '请选择售后原因');
      return;
    }
    showToast('success', '售后申请已提交，请等待审核');
    setAfterSaleModal(false);
    setAfterSaleDesc('');
    setAfterSaleReason('');
  };

  return (
    <div className="container">
      <OmsDetailView
        order={order}
        operationLogs={operationLogs}
        navigate={navigate}
        showToast={showToast}
        dealerOrder={dealerOrder}
        afterSaleModal={afterSaleModal}
        setAfterSaleModal={setAfterSaleModal}
        afterSaleType={afterSaleType}
        setAfterSaleType={setAfterSaleType}
        afterSaleReason={afterSaleReason}
        setAfterSaleReason={setAfterSaleReason}
        afterSaleDesc={afterSaleDesc}
        setAfterSaleDesc={setAfterSaleDesc}
        handleAfterSaleSubmit={handleAfterSaleSubmit}
      />
    </div>
  );
}

/* ===== Main OMS Detail View Component ===== */
function OmsDetailView({
  order, operationLogs, navigate, showToast,
  dealerOrder, afterSaleModal, setAfterSaleModal,
  afterSaleType, setAfterSaleType, afterSaleReason, setAfterSaleReason,
  afterSaleDesc, setAfterSaleDesc, handleAfterSaleSubmit,
}: any) {
  const statusInfo = OMS_ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#6B7280' };

  // Aggregate stats
  const totalQty = order.packages?.reduce((s: number, p: any) => s + p.lineItems.reduce((ss: number, li: any) => ss + li.quantity, 0), 0) || 0;
  const shortagePkgs = order.packages?.filter((p: any) => p.status === 'WAITING_RESTOCK').length || 0;
  const shippedPkgs = order.packages?.filter((p: any) => ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(p.status)).length || 0;
  const shortageCount = order.packages?.reduce((s: number, p: any) => s + p.lineItems.filter((li: any) => li.stockStatus !== 'IN_STOCK').length, 0) || 0;

  const allLineItems = order.packages?.flatMap((p: any, pkgIdx: number) =>
    p.lineItems.map((li: any) => ({ ...li, packageLabel: `包裹${pkgIdx + 1}`, packageType: p.packageType }))
  ) || [];

  const urgencyMap: Record<string, { label: string; color: string }> = {
    NORMAL: { label: '普通', color: '#6B7280' },
    URGENT: { label: '特急', color: '#DC2626' },
    CRITICAL: { label: '紧急', color: '#DC2626' },
  };

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>订单中心</span>
        <span>{'>'}</span>
        <span style={{ color: '#1f1f1f', fontWeight: 500 }}>详情 {order.orderNo}</span>
        <button onClick={() => navigate('/orders')}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#595959' }}>
          ← 返回
        </button>
      </div>

      {/* ===== Module 1: Header Status Card ===== */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
        {/* Row 1: Order No + Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>订单 {order.orderNo}</span>
          <span style={{ fontSize: 14, fontWeight: 600, padding: '2px 12px', borderRadius: 4, background: statusInfo.color + '18', color: statusInfo.color, border: `1px solid ${statusInfo.color}40` }}>
            {statusInfo.label}
          </span>
          {order.shortagePolicy && (
            <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 4, background: order.shortagePolicy === 'SPLIT' ? '#EEF2FF' : '#F3F4F6', color: order.shortagePolicy === 'SPLIT' ? '#4F46E5' : '#6B7280', border: `1px solid ${order.shortagePolicy === 'SPLIT' ? '#C7D2FE' : '#E5E7EB'}` }}>
              {order.shortagePolicy === 'SPLIT' ? 'SPLIT 拆分发货' : 'HOLD 整单挂起'}
            </span>
          )}
          <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 4, background: '#EFF6FF', color: '#2563EB' }}>📦 非随</span>
        </div>

        {/* Row 2: Dealer + Time */}
        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span>经销商：<strong style={{ color: '#1f1f1f' }}>{order.dealerName}</strong></span>
          <span>下单：{order.createTime}</span>
          <span style={{ padding: '1px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600, background: (urgencyMap[order.urgencyLevel]?.color || '#6B7280') + '18', color: urgencyMap[order.urgencyLevel]?.color }}>
            {urgencyMap[order.urgencyLevel]?.label}
          </span>
          {dealerOrder?.payTime && <span>付款：{dealerOrder.payTime}</span>}
          {dealerOrder && (
            <span style={{ padding: '1px 8px', borderRadius: 3, fontSize: 11, background: '#fff3e8', color: '#ff6600' }}>
              💵 {dealerOrder.paymentMethod === 'ONLINE' ? '在线支付' : dealerOrder.paymentMethod === 'MONTHLY' ? '月结' : '货到付款'}
            </span>
          )}
        </div>

        {/* Row 3: Flow Tracker */}
        <FlowTracker order={order} />

        {/* Action buttons for dealer */}
        {dealerOrder && (
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            {dealerOrder.status === 'WAIT_PAY' && (
              <button className="btn btn-primary" onClick={() => showToast('success', '支付成功')}>
                💳 去付款 ¥{dealerOrder.payAmount.toLocaleString()}
              </button>
            )}
            {dealerOrder.status === 'IN_TRANSIT' && (
              <button className="btn btn-primary" onClick={() => showToast('success', '已确认收货')}>
                ✅ 确认收货
              </button>
            )}
            {(dealerOrder.status === 'SIGNED' || dealerOrder.status === 'COMPLETED') && (
              <button className="btn btn-outline" onClick={() => navigate('/cart')}>
                🔄 再次购买
              </button>
            )}
            {!['WAIT_PAY', 'CANCELLED'].includes(dealerOrder.status) && (
              <button className="btn btn-ghost btn-sm" onClick={() => setAfterSaleModal?.(true)}>
                🔄 申请售后
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== Module 2: Package List ===== */}
      {order.packages && order.packages.length > 0 && (
        <CollapsibleSection
          title="包裹列表" icon="📦" defaultExpanded
          badge={
            <div style={{ display: 'flex', gap: 6 }}>
              {shippedPkgs > 0 && <span className="badge badge-primary">已发货×{shippedPkgs}</span>}
              {shortagePkgs > 0 && <span className="badge badge-warning">待补货×{shortagePkgs}</span>}
            </div>
          }
          summary={`共 ${order.packages.length} 个包裹 · ${totalQty} 件`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {order.packages.map((pkg: any, idx: number) => {
              const pkgStatus = PACKAGE_STATUS_MAP[pkg.status] || { label: pkg.status, color: '#6B7280' };
              const isDelivered = pkg.status === 'DELIVERED' || pkg.status === 'COMPLETED';
              const pkgTotalQty = pkg.lineItems.reduce((s: number, li: any) => s + li.quantity, 0);
              return (
                <div key={pkg.packageId} style={{ border: `2px solid ${isDelivered ? '#05966940' : pkgStatus.color + '30'}`, borderRadius: 8, overflow: 'hidden', background: isDelivered ? '#f0fdf4' : '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        包裹{idx + 1}
                        {pkg.packageType === 'SUPPLEMENT' && <span style={{ fontSize: 11, marginLeft: 6, padding: '1px 6px', borderRadius: 3, background: '#fff7e6', color: '#d97706' }}>补发</span>}
                      </span>
                      <span style={{ fontSize: 12, padding: '1px 8px', borderRadius: 3, background: pkgStatus.color + '18', color: pkgStatus.color, fontWeight: 500 }}>{pkgStatus.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#8c8c8c', flexWrap: 'wrap' }}>
                      {pkg.shipTime && <span>{(pkg.status === 'SHIPPED' || isDelivered) ? '发货' : '预计发货'}：{pkg.shipTime}</span>}
                      {pkg.estimatedArrival && <span style={{ color: isDelivered ? '#059669' : undefined }}>到货：{pkg.estimatedArrival}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {pkg.logisticsCompany && <span style={{ fontSize: 12, color: '#595959' }}>🚚 {pkg.logisticsCompany} · {pkg.trackingNo}</span>}
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{pkgTotalQty}件</span>
                    </div>
                  </div>
                  <div style={{ padding: '0 16px' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <thead><tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <th style={{ textAlign: 'left', padding: '8px 0', color: '#8c8c8c', fontWeight: 500, width: 100 }}>SKU</th>
                        <th style={{ textAlign: 'left', padding: '8px 0', color: '#8c8c8c', fontWeight: 500 }}>商品名称</th>
                        <th style={{ textAlign: 'center', padding: '8px 0', color: '#8c8c8c', fontWeight: 500, width: 60 }}>数量</th>
                        <th style={{ textAlign: 'left', padding: '8px 0', color: '#8c8c8c', fontWeight: 500, width: 80 }}>库存</th>
                      </tr></thead>
                      <tbody>
                        {pkg.lineItems.map((li: any) => {
                          const stockInfo = STOCK_STATUS_OMS_MAP[li.stockStatus] || { label: li.stockStatus, color: '#6B7280' };
                          return (
                            <tr key={li.lineItemId} style={{ borderBottom: '1px solid #f5f5f5', background: li.stockStatus !== 'IN_STOCK' ? '#fffbeb' : undefined }}>
                              <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>{li.skuCode}</td>
                              <td style={{ padding: '8px 0' }}>{li.skuName}</td>
                              <td style={{ padding: '8px 0', textAlign: 'center' }}>{li.quantity}</td>
                              <td style={{ padding: '8px 0' }}>
                                <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: stockInfo.color + '18', color: stockInfo.color }}>{stockInfo.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {pkg.trackingNodes && pkg.trackingNodes.length > 0 && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ff6600', marginBottom: 12 }}>🚚 物流轨迹</div>
                      <LogisticsTimeline nodes={pkg.trackingNodes} />
                    </div>
                  )}
                  {pkg.supplierStatus && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#d97706', marginBottom: 8 }}>📤 供应商物流</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12, fontSize: 12, background: '#fff7e6', padding: '10px 14px', borderRadius: 6 }}>
                        <span style={{ fontWeight: 600, padding: '1px 8px', borderRadius: 3, background: pkg.supplierStatus === 'PENDING' ? '#fef2f2' : pkg.supplierStatus === 'SHIPPED' ? '#fff7e6' : '#dcfce7', color: pkg.supplierStatus === 'PENDING' ? '#dc2626' : pkg.supplierStatus === 'SHIPPED' ? '#d97706' : '#16a34a' }}>
                          {pkg.supplierStatus === 'PENDING' ? '待供应商发货' : pkg.supplierStatus === 'SHIPPED' ? '供应商已发货' : '已到基地'}
                        </span>
                        {pkg.supplierEstimatedArrival && <span>到基地 {pkg.supplierEstimatedArrival}</span>}
                      </div>
                      {pkg.supplierTrackingNodes?.length > 0 && <LogisticsTimeline nodes={pkg.supplierTrackingNodes} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* ===== Two-column: Product Details + Sidebar ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div>
          {/* Product Detail Table */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🛒</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>商品明细</span>
                {shortageCount > 0 && <span className="badge badge-error" style={{ marginLeft: 8 }}>缺 {shortageCount} 件</span>}
              </div>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>共 {order.skuCount || allLineItems.length} 种 · {totalQty} 件</span>
            </div>
            {order.vinCodes?.length > 0 && (
              <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>关联车架号：</span>
                {order.vinCodes.map((vin: string, i: number) => (
                  <span key={i} style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', background: '#f3e8ff', color: '#7e22ce', borderRadius: 3 }}>{vin}</span>
                ))}
              </div>
            )}
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: '#8c8c8c', whiteSpace: 'nowrap', width: 110 }}>SKU编码</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: '#8c8c8c', minWidth: 180 }}>商品名称</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 80 }}>单价</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 60 }}>数量</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 80 }}>库存状态</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 80 }}>包裹</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: '#8c8c8c', width: 170 }}>供应商</th>
                </tr></thead>
                <tbody>
                  {allLineItems.map((li: any) => {
                    const stockInfo = STOCK_STATUS_OMS_MAP[li.stockStatus] || { label: li.stockStatus, color: '#6B7280' };
                    return (
                      <tr key={li.lineItemId} style={{ borderBottom: '1px solid #f5f5f5', background: li.stockStatus !== 'IN_STOCK' ? '#fffbeb' : undefined }}>
                        <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12 }}>{li.skuCode}</td>
                        <td style={{ padding: '10px 16px' }}>{li.skuName}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>¥{li.unitPrice.toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{li.quantity}</td>
                        <td style={{ padding: '10px 8px' }}><span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: stockInfo.color + '18', color: stockInfo.color }}>{stockInfo.label}</span></td>
                        <td style={{ padding: '10px 8px' }}><span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: li.packageType === 'SUPPLEMENT' ? '#fff7e6' : '#eff6ff', color: li.packageType === 'SUPPLEMENT' ? '#d97706' : '#2563eb' }}>{li.packageLabel}</span></td>
                        <td style={{ padding: '10px 16px' }}>
                          {li.supplierInfo ? (
                            <div style={{ fontSize: 11, color: '#d97706' }}>
                              <div>🏭 {li.supplierInfo.supplierName}</div>
                              <div>预计 {li.supplierInfo.expectedArrivalDate} 到</div>
                            </div>
                          ) : <span style={{ color: '#bfbfbf', fontSize: 12 }}>-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 12, background: '#fafafa' }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>合计：{totalQty} 件</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#ff6600' }}>¥{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Supplier Collaboration */}
          {shortageCount > 0 && (
            <CollapsibleSection title="供应商协同" icon="📤" defaultExpanded={false} summary={`${shortageCount} 个行项涉及外部采购`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {allLineItems.filter((li: any) => li.stockStatus !== 'IN_STOCK').map((li: any) => {
                  const stockInfo = STOCK_STATUS_OMS_MAP[li.stockStatus] || { label: li.stockStatus, color: '#6B7280' };
                  return (
                    <div key={li.lineItemId} style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{li.skuName}</span>
                        <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: stockInfo.color + '18', color: stockInfo.color }}>{stockInfo.label}</span>
                        <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: '#eff6ff', color: '#2563eb' }}>{li.packageLabel}</span>
                      </div>
                      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', background: '#fafafa', borderRadius: 6 }}>
                        <thead><tr>
                          <th style={{ padding: '6px 10px', textAlign: 'left', color: '#8c8c8c', fontWeight: 500 }}>供应商</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left', color: '#8c8c8c', fontWeight: 500 }}>预计到货</th>
                        </tr></thead>
                        <tbody><tr>
                          <td style={{ padding: '6px 10px' }}>{li.supplierInfo?.supplierName || '待确认'}</td>
                          <td style={{ padding: '6px 10px', color: '#d97706' }}>{li.supplierInfo?.expectedArrivalDate || '待确认'}</td>
                        </tr></tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📋 订单信息</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8c8c8c' }}>订单号</span><span style={{ fontWeight: 500 }}>{order.orderNo}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8c8c8c' }}>时效等级</span><span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 3, background: (urgencyMap[order.urgencyLevel]?.color || '#6B7280') + '18', color: urgencyMap[order.urgencyLevel]?.color }}>{urgencyMap[order.urgencyLevel]?.label}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8c8c8c' }}>基地来源</span><span style={{ color: '#ff6600' }}>{order.baseSource}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8c8c8c' }}>缺件策略</span><span>{order.shortagePolicy ? <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: order.shortagePolicy === 'SPLIT' ? '#EEF2FF' : '#F3F4F6', color: order.shortagePolicy === 'SPLIT' ? '#4F46E5' : '#6B7280' }}>{order.shortagePolicy === 'SPLIT' ? '拆分发货' : '整单挂起'}</span> : '-'}</span></div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📍 收货信息</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div><span style={{ color: '#8c8c8c' }}>收货人：</span>{order.receiverName}</div>
              <div><span style={{ color: '#8c8c8c' }}>电话：</span>{order.receiverPhone}</div>
              <div><span style={{ color: '#8c8c8c' }}>地址：</span>{order.receiverProvince}{order.receiverCity}{order.receiverDistrict} {order.receiverAddress}</div>
            </div>
          </div>

          {operationLogs.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📝 操作日志</div>
              <div style={{ position: 'relative', paddingLeft: 16 }}>
                <div style={{ position: 'absolute', left: 6, top: 4, bottom: 4, width: 2, background: '#f0f0f0' }} />
                {operationLogs.map((log: any, i: number) => {
                  const isError = log.action.includes('异常');
                  const isDone = log.action.includes('签收') || log.action.includes('完成');
                  return (
                    <div key={i} style={{ position: 'relative', paddingBottom: i < operationLogs.length - 1 ? 16 : 0 }}>
                      <div style={{ position: 'absolute', left: -10, top: 4, width: 8, height: 8, borderRadius: '50%', background: isError ? '#DC2626' : isDone ? '#16A34A' : '#ff6600' }} />
                      <div style={{ fontSize: 13 }}>{log.action}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{log.operator}（{log.role}）· {log.time}</div>
                      {log.remark && <div style={{ fontSize: 11, color: '#bfbfbf', fontStyle: 'italic', marginTop: 2 }}>{log.remark}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* After-sale Modal */}
      {setAfterSaleModal && (
        <Modal open={afterSaleModal} title="售后服务申请" onClose={() => setAfterSaleModal(false)}
          footer={<><button className="btn btn-ghost" onClick={() => setAfterSaleModal(false)}>取消</button><button className="btn btn-primary" onClick={handleAfterSaleSubmit}>提交申请</button></>}
          width={600}>
          <div className="form-group">
            <label className="form-label"><span className="required">*</span>售后类型</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['REFUND_ONLY', 'RETURN_REFUND', 'EXCHANGE'] as const).map(opt => (
                <button key={opt} onClick={() => setAfterSaleType(opt)} className={`filter-tag ${afterSaleType === opt ? 'active' : ''}`}>
                  {opt === 'REFUND_ONLY' ? '仅退款' : opt === 'RETURN_REFUND' ? '退货退款' : '换货'}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><span className="required">*</span>售后原因</label>
            <select className="form-select" value={afterSaleReason} onChange={(e) => setAfterSaleReason(e.target.value)}>
              <option value="">请选择原因</option>
              <option value="QUALITY_ISSUE">质量问题</option><option value="WRONG_ITEM">发错货</option>
              <option value="SHORTAGE">少发</option><option value="DAMAGED">破损</option><option value="OTHER">其他</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">问题描述</label>
            <textarea className="form-textarea" rows={4} maxLength={500} placeholder="请描述您遇到的问题..." value={afterSaleDesc} onChange={(e) => setAfterSaleDesc(e.target.value)} />
          </div>
        </Modal>
      )}
    </>
  );
}
