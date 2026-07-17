import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockOmsOrders, OMS_ORDER_STATUS_MAP, PACKAGE_STATUS_MAP, STOCK_STATUS_OMS_MAP, getOperationLogs, getLinkedExceptions } from '../../mock/omsData';
import FlowTracker from '../../components/FlowTracker';
import CollapsibleSection from '../../components/CollapsibleSection';
import LogisticsTimeline from '../../components/LogisticsTimeline';
import EmptyState from '../../components/EmptyState';

export default function OmsOrderDetailPage() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();

  const order = mockOmsOrders.find(o => o.orderNo === orderNo);

  if (!order) {
    return (
      <div className="container">
        <EmptyState icon="🔍" text="订单未找到" actionText="返回订单列表" onAction={() => navigate('/orders')} />
      </div>
    );
  }

  const statusInfo = OMS_ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#6B7280' };
  const linkedExceptions = getLinkedExceptions(order.orderNo);
  const operationLogs = getOperationLogs(order.orderNo);

  // Aggregate stats
  const totalQty = order.packages?.reduce((s, p) => s + p.lineItems.reduce((ss, li) => ss + li.quantity, 0), 0) || 0;
  const shortagePkgs = order.packages?.filter(p => p.status === 'WAITING_RESTOCK').length || 0;
  const shippedPkgs = order.packages?.filter(p => ['SHIPPED', 'DELIVERED', 'COMPLETED'].includes(p.status)).length || 0;
  const pickingPkgs = order.packages?.filter(p => p.status === 'PICKING' || p.status === 'PENDING').length || 0;
  const shortageCount = order.packages?.reduce((s, p) => s + p.lineItems.filter(li => li.stockStatus !== 'IN_STOCK').length, 0) || 0;

  // All line items flattened (for product detail table)
  const allLineItems = order.packages?.flatMap((p, pkgIdx) =>
    p.lineItems.map(li => ({ ...li, packageLabel: `包裹${pkgIdx + 1}`, packageType: p.packageType }))
  ) || [];

  const urgencyMap: Record<string, { label: string; color: string }> = {
    NORMAL: { label: '普通', color: '#6B7280' },
    URGENT: { label: '特急', color: '#DC2626' },
    CRITICAL: { label: '紧急', color: '#DC2626' },
  };
  const bizTypeMap: Record<string, string> = {
    REGULAR: '常规订单', APPOINTMENT: '预约单', CUSTOM: '定制单', REQUISITION: '调拨单',
  };

  return (
    <div className="container">
      {/* ===== Breadcrumb ===== */}
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/orders')}>订单管理</span>
        <span>{'>'}</span>
        <span style={{ color: '#1f1f1f', fontWeight: 500 }}>详情 {order.orderNo}</span>
        <button
          onClick={() => navigate('/orders')}
          style={{
            marginLeft: 'auto', background: 'none', border: '1px solid #d9d9d9',
            borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 12,
            color: '#595959', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← 返回
        </button>
      </div>

      {/* ===== Module 1: Header Status Card ===== */}
      <div style={{
        background: '#fff', borderRadius: 8, padding: 20, marginBottom: 16,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
      }}>
        {/* Row 1: Order No + Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>订单 {order.orderNo}</span>

          {/* Status tag (large) */}
          <span style={{
            fontSize: 14, fontWeight: 600, padding: '2px 12px', borderRadius: 4,
            background: statusInfo.color + '18', color: statusInfo.color,
            border: `1px solid ${statusInfo.color}40`,
          }}>
            {statusInfo.label}
          </span>

          {/* Shortage policy */}
          {order.shortagePolicy && (
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 4,
              background: order.shortagePolicy === 'SPLIT' ? '#EEF2FF' : '#F3F4F6',
              color: order.shortagePolicy === 'SPLIT' ? '#4F46E5' : '#6B7280',
              border: `1px solid ${order.shortagePolicy === 'SPLIT' ? '#C7D2FE' : '#E5E7EB'}`,
            }}>
              {order.shortagePolicy === 'SPLIT' ? 'SPLIT 拆分发货' : 'HOLD 整单挂起'}
            </span>
          )}

          {/* Exception count */}
          {linkedExceptions.length > 0 && (
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 4,
              background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA',
            }}>
              {linkedExceptions.length}个异常
            </span>
          )}

          {/* Shipping method */}
          <span style={{
            fontSize: 12, padding: '2px 10px', borderRadius: 4,
            background: order.shippingMethod === 'WITH_VEHICLE' ? '#F3E8FF' : '#EFF6FF',
            color: order.shippingMethod === 'WITH_VEHICLE' ? '#7E22CE' : '#2563EB',
          }}>
            {order.shippingMethod === 'WITH_VEHICLE' ? '🚗 随车' : '📦 非随'}
          </span>
        </div>

        {/* Row 2: Dealer + Time + Urgency */}
        <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span>经销商：<strong style={{ color: '#1f1f1f' }}>{order.dealerName}</strong></span>
          <span>下单：{order.createTime}</span>
          <span style={{
            padding: '1px 8px', borderRadius: 3, fontSize: 11, fontWeight: 600,
            background: (urgencyMap[order.urgencyLevel]?.color || '#6B7280') + '18',
            color: urgencyMap[order.urgencyLevel]?.color || '#6B7280',
          }}>
            {urgencyMap[order.urgencyLevel]?.label || order.urgencyLevel}
          </span>
        </div>

        {/* Row 3: Flow Tracker */}
        <FlowTracker order={order} />

        {/* Exception/Termination hint */}
        {['EXCEPTION_HOLD', 'RETURN_PROCESSING'].includes(order.status) && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: '#FEF2F2', borderRadius: 6, border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
            ⚠️ 订单履约已中断，当前处于异常状态
          </div>
        )}
        {['ORDER_TERMINATED', 'CANCELLED'].includes(order.status) && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: '#F3F4F6', borderRadius: 6, border: '1px solid #E5E7EB', fontSize: 13, color: '#6B7280' }}>
            ⏹️ 此订单已终止，不再继续履约
          </div>
        )}
      </div>

      {/* ===== Module 2: Package List ===== */}
      {order.packages && order.packages.length > 0 && (
        <CollapsibleSection
          title="包裹列表"
          icon="📦"
          defaultExpanded
          badge={
            <div style={{ display: 'flex', gap: 6 }}>
              {shippedPkgs > 0 && <span className="badge badge-primary">已发货×{shippedPkgs}</span>}
              {pickingPkgs > 0 && <span className="badge badge-primary">拣货中×{pickingPkgs}</span>}
              {shortagePkgs > 0 && <span className="badge badge-warning">待补货×{shortagePkgs}</span>}
            </div>
          }
          summary={`共 ${order.packages.length} 个包裹 · ${totalQty} 件`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {order.packages.map((pkg, idx) => {
              const pkgStatus = PACKAGE_STATUS_MAP[pkg.status] || { label: pkg.status, color: '#6B7280' };
              const isDelivered = pkg.status === 'DELIVERED' || pkg.status === 'COMPLETED';
              const pkgTotalQty = pkg.lineItems.reduce((s, li) => s + li.quantity, 0);

              return (
                <div key={pkg.packageId} style={{
                  border: `2px solid ${isDelivered ? '#05966940' : pkgStatus.color + '30'}`,
                  borderRadius: 8, overflow: 'hidden',
                  background: isDelivered ? '#f0fdf4' : '#fff',
                }}>
                  {/* Package header bar */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0',
                    flexWrap: 'wrap', gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        包裹{idx + 1}
                        {pkg.packageType === 'SUPPLEMENT' && (
                          <span style={{
                            fontSize: 11, marginLeft: 6, padding: '1px 6px', borderRadius: 3,
                            background: '#fff7e6', color: '#d97706',
                          }}>补发</span>
                        )}
                      </span>
                      <span style={{
                        fontSize: 12, padding: '1px 8px', borderRadius: 3,
                        background: pkgStatus.color + '18', color: pkgStatus.color,
                        fontWeight: 500,
                      }}>
                        {pkgStatus.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#8c8c8c', flexWrap: 'wrap' }}>
                      {pkg.shipTime && (
                        <span>{pkg.status === 'SHIPPED' || isDelivered ? '发货' : '预计发货'}：{pkg.shipTime}</span>
                      )}
                      {pkg.estimatedArrival && (
                        <span style={{ color: isDelivered ? '#059669' : undefined }}>
                          到货：{pkg.estimatedArrival}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {pkg.logisticsCompany && (
                        <span style={{ fontSize: 12, color: '#595959' }}>
                          🚚 {pkg.logisticsCompany} · {pkg.trackingNo}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{pkgTotalQty}件</span>
                    </div>
                  </div>

                  {/* Line items table */}
                  <div style={{ padding: '0 16px' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#8c8c8c', fontWeight: 500, width: 100 }}>SKU</th>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#8c8c8c', fontWeight: 500 }}>商品名称</th>
                          <th style={{ textAlign: 'center', padding: '8px 0', color: '#8c8c8c', fontWeight: 500, width: 60 }}>数量</th>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#8c8c8c', fontWeight: 500, width: 80 }}>库存</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pkg.lineItems.map(li => {
                          const stockInfo = STOCK_STATUS_OMS_MAP[li.stockStatus] || { label: li.stockStatus, color: '#6B7280' };
                          return (
                            <tr key={li.lineItemId} style={{
                              borderBottom: '1px solid #f5f5f5',
                              background: li.stockStatus !== 'IN_STOCK' ? '#fffbeb' : undefined,
                            }}>
                              <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 12 }}>{li.skuCode}</td>
                              <td style={{ padding: '8px 0' }}>{li.skuName}</td>
                              <td style={{ padding: '8px 0', textAlign: 'center' }}>{li.quantity}</td>
                              <td style={{ padding: '8px 0' }}>
                                <span style={{
                                  fontSize: 11, padding: '1px 6px', borderRadius: 3,
                                  background: stockInfo.color + '18', color: stockInfo.color,
                                }}>
                                  {stockInfo.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Logistics tracking (if shipped) */}
                  {pkg.trackingNodes && pkg.trackingNodes.length > 0 && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ff6600', marginBottom: 12 }}>
                        🚚 物流轨迹
                      </div>
                      <LogisticsTimeline nodes={pkg.trackingNodes} />
                    </div>
                  )}

                  {/* No tracking yet fallback */}
                  {pkg.status === 'SHIPPED' && (!pkg.trackingNodes || pkg.trackingNodes.length === 0) && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: 16, fontSize: 13, color: '#8c8c8c' }}>
                      🚚 运输中 · 预计 {pkg.estimatedArrival || '--'} 送达
                    </div>
                  )}

                  {/* Supplier logistics (if waiting restock) */}
                  {pkg.supplierStatus && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#d97706', marginBottom: 8 }}>
                        📤 供应商物流
                      </div>
                      <div style={{
                        display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12,
                        fontSize: 12, background: '#fff7e6', padding: '10px 14px', borderRadius: 6,
                      }}>
                        <span style={{
                          fontWeight: 600, padding: '1px 8px', borderRadius: 3,
                          background: pkg.supplierStatus === 'ARRIVED_AT_BASE' ? '#dcfce7' : pkg.supplierStatus === 'SHIPPED' ? '#fff7e6' : '#fef2f2',
                          color: pkg.supplierStatus === 'ARRIVED_AT_BASE' ? '#16a34a' : pkg.supplierStatus === 'SHIPPED' ? '#d97706' : '#dc2626',
                        }}>
                          {pkg.supplierStatus === 'PENDING' ? '缺件，待供应商发货至基地' :
                           pkg.supplierStatus === 'SHIPPED' ? '供应商已发货（在途至基地）' :
                           '供应商已到货，基地待发'}
                        </span>
                        {pkg.supplierLogisticsCompany && (
                          <span>{pkg.supplierLogisticsCompany} · {pkg.supplierTrackingNo}</span>
                        )}
                        {pkg.supplierShipTime && <span>发 {pkg.supplierShipTime}</span>}
                        {pkg.supplierEstimatedArrival && <span>到基地 {pkg.supplierEstimatedArrival}</span>}
                      </div>
                      {pkg.supplierTrackingNodes && pkg.supplierTrackingNodes.length > 0 && (
                        <LogisticsTimeline nodes={pkg.supplierTrackingNodes} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* ===== Two-column: Product Details (left) + Info Sidebar (right) ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        {/* Left Column */}
        <div>
          {/* Product Detail Table */}
          <div style={{
            background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px', borderBottom: '1px solid #f0f0f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🛒</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>商品明细</span>
                {shortageCount > 0 && (
                  <span className="badge badge-error" style={{ marginLeft: 8 }}>缺 {shortageCount} 件</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                共 {order.skuCount || allLineItems.length} 种 · {totalQty} 件
              </span>
            </div>

            {/* VIN codes */}
            {order.vinCodes && order.vinCodes.length > 0 && (
              <div style={{ padding: '10px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>关联车架号：</span>
                {order.vinCodes.map((vin, i) => (
                  <span key={i} style={{
                    fontFamily: 'monospace', fontSize: 11, padding: '2px 8px',
                    background: '#f3e8ff', color: '#7e22ce', borderRadius: 3,
                  }}>
                    {vin}
                  </span>
                ))}
              </div>
            )}

            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: '#8c8c8c', whiteSpace: 'nowrap', width: 110 }}>SKU编码</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: '#8c8c8c', minWidth: 180 }}>商品名称</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 80 }}>单价</th>
                    <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 60 }}>数量</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 80 }}>库存状态</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500, color: '#8c8c8c', width: 80 }}>所属包裹</th>
                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: '#8c8c8c', width: 170 }}>供应商</th>
                  </tr>
                </thead>
                <tbody>
                  {allLineItems.map(li => {
                    const stockInfo = STOCK_STATUS_OMS_MAP[li.stockStatus] || { label: li.stockStatus, color: '#6B7280' };
                    return (
                      <tr key={li.lineItemId} style={{
                        borderBottom: '1px solid #f5f5f5',
                        background: li.stockStatus !== 'IN_STOCK' ? '#fffbeb' : undefined,
                      }}>
                        <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: 12 }}>{li.skuCode}</td>
                        <td style={{ padding: '10px 16px' }}>{li.skuName}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>¥{li.unitPrice.toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>{li.quantity}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 3,
                            background: stockInfo.color + '18', color: stockInfo.color,
                            whiteSpace: 'nowrap',
                          }}>
                            {stockInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            fontSize: 11, padding: '1px 6px', borderRadius: 3,
                            background: li.packageType === 'SUPPLEMENT' ? '#fff7e6' : '#eff6ff',
                            color: li.packageType === 'SUPPLEMENT' ? '#d97706' : '#2563eb',
                            whiteSpace: 'nowrap',
                          }}>
                            {li.packageLabel}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {li.supplierInfo ? (
                            <div style={{ fontSize: 11, color: '#d97706' }}>
                              <div>🏭 {li.supplierInfo.supplierName}</div>
                              <div>预计 {li.supplierInfo.expectedArrivalDate} 到</div>
                              {li.supplierInfo.trackingNumber && (
                                <div style={{ color: '#8c8c8c' }}>📦 {li.supplierInfo.trackingNumber}</div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#bfbfbf', fontSize: 12 }}>-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total row */}
            <div style={{
              padding: '12px 20px', borderTop: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 12,
              background: '#fafafa',
            }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>合计：{totalQty} 件</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#ff6600' }}>
                ¥{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Supplier Collaboration (conditional) */}
          {shortageCount > 0 && (
            <CollapsibleSection
              title="供应商协同"
              icon="📤"
              defaultExpanded={false}
              summary={`${shortageCount} 个行项涉及外部采购`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {allLineItems.filter(li => li.stockStatus !== 'IN_STOCK').map(li => {
                  const stockInfo = STOCK_STATUS_OMS_MAP[li.stockStatus] || { label: li.stockStatus, color: '#6B7280' };
                  return (
                    <div key={li.lineItemId} style={{
                      border: '1px solid #f0f0f0', borderRadius: 8, padding: 14,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{li.skuName}</span>
                        <span style={{
                          fontSize: 11, padding: '1px 6px', borderRadius: 3,
                          background: stockInfo.color + '18', color: stockInfo.color,
                        }}>
                          {stockInfo.label}
                        </span>
                        <span style={{
                          fontSize: 11, padding: '1px 6px', borderRadius: 3,
                          background: '#eff6ff', color: '#2563eb',
                        }}>
                          {li.packageLabel}
                        </span>
                      </div>
                      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', background: '#fafafa', borderRadius: 6 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 10px', textAlign: 'left', color: '#8c8c8c', fontWeight: 500 }}>供应商</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left', color: '#8c8c8c', fontWeight: 500 }}>预计到货</th>
                            <th style={{ padding: '6px 10px', textAlign: 'left', color: '#8c8c8c', fontWeight: 500 }}>运单号</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '6px 10px' }}>{li.supplierInfo?.supplierName || '待确认'}</td>
                            <td style={{ padding: '6px 10px', color: '#d97706' }}>{li.supplierInfo?.expectedArrivalDate || '待确认'}</td>
                            <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>
                              {li.supplierInfo?.trackingNumber || <span style={{ color: '#bfbfbf' }}>暂无</span>}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Right Column: Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Order Info Card */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📋 订单信息</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>订单号</span>
                <span style={{ fontWeight: 500 }}>{order.orderNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>时效等级</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 3,
                  background: (urgencyMap[order.urgencyLevel]?.color || '#6B7280') + '18',
                  color: urgencyMap[order.urgencyLevel]?.color || '#6B7280',
                }}>
                  {urgencyMap[order.urgencyLevel]?.label || order.urgencyLevel}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>基地来源</span>
                <span style={{ color: '#ff6600' }}>{order.baseSource}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8c8c8c' }}>缺件策略</span>
                <span>
                  {order.shortagePolicy ? (
                    <span style={{
                      fontSize: 11, padding: '1px 6px', borderRadius: 3,
                      background: order.shortagePolicy === 'SPLIT' ? '#EEF2FF' : '#F3F4F6',
                      color: order.shortagePolicy === 'SPLIT' ? '#4F46E5' : '#6B7280',
                    }}>
                      {order.shortagePolicy === 'SPLIT' ? '拆分发货' : '整单挂起'}
                    </span>
                  ) : '-'}
                </span>
              </div>
              {order.linkedPlanNo && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8c8c8c' }}>关联计划单</span>
                  <span style={{ color: '#4F46E5' }}>{order.linkedPlanNo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Info Card */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📍 收货信息</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div><span style={{ color: '#8c8c8c' }}>收货人：</span>{order.receiverName}</div>
              <div><span style={{ color: '#8c8c8c' }}>电话：</span>{order.receiverPhone}</div>
              <div>
                <span style={{ color: '#8c8c8c' }}>地址：</span>
                {order.receiverProvince}{order.receiverCity}{order.receiverDistrict} {order.receiverAddress}
              </div>
            </div>
          </div>

          {/* Linked Exceptions Card */}
          {linkedExceptions.length > 0 && (
            <div style={{
              background: '#fff', borderRadius: 8, border: '3px solid #E11D48', padding: 16,
              borderWidth: '0 0 0 3px',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠️</span> 关联异常 ({linkedExceptions.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {linkedExceptions.map(ex => (
                  <div key={ex.exceptionNo} style={{
                    padding: 10, background: '#fafafa', borderRadius: 6, cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 11, padding: '1px 6px', borderRadius: 3,
                        background: '#fff2f0', color: '#E11D48',
                      }}>
                        {ex.exceptionType}
                      </span>
                      <span style={{
                        fontSize: 11, padding: '1px 6px', borderRadius: 3,
                        background: ex.status === '处理中' ? '#fff7e6' : '#f0fff0',
                        color: ex.status === '处理中' ? '#D97706' : '#16A34A',
                      }}>
                        {ex.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#595959' }}>
                      {ex.description.length > 25 ? ex.description.slice(0, 25) + '...' : ex.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operation Logs Card */}
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📝 操作日志</div>
            <div style={{ position: 'relative', paddingLeft: 16 }}>
              <div style={{
                position: 'absolute', left: 6, top: 4, bottom: 4, width: 2, background: '#f0f0f0',
              }} />
              {operationLogs.map((log, i) => {
                const isFirst = i === 0;
                const isError = log.action.includes('异常') || log.action.includes('缺件');
                const isDone = log.action.includes('签收') || log.action.includes('完成');
                const dotColor = isError ? '#DC2626' : isDone ? '#16A34A' : '#ff6600';
                return (
                  <div key={i} style={{ position: 'relative', paddingBottom: i < operationLogs.length - 1 ? 16 : 0 }}>
                    <div style={{
                      position: 'absolute', left: -10, top: 4,
                      width: 8, height: 8, borderRadius: '50%', background: dotColor,
                    }} />
                    <div style={{ fontSize: 13 }}>{log.action}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                      {log.operator}（{log.role}）· {log.time}
                    </div>
                    {log.remark && (
                      <div style={{ fontSize: 11, color: '#bfbfbf', fontStyle: 'italic', marginTop: 2 }}>
                        {log.remark}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
