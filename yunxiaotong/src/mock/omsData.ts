import { OmsOrderVO, OmsPackage, OmsLineItem, OperationLogVO, ExceptionBriefVO, FlowNodeConfig } from '../types';

/* ===== Flow Nodes ===== */
export const FLOW_NODES: FlowNodeConfig[] = [
  { key: 'order_placed', label: '下单' },
  { key: 'review', label: '审核中' },
  { key: 'scheduling', label: '排单中' },
  { key: 'picking', label: '拣货中' },
  { key: 'ready_to_ship', label: '待发货' },
  { key: 'in_transit', label: '运输中' },
  { key: 'delivered', label: '已签收/完成' },
];

export const STATUS_TO_FLOW: Record<string, number> = {
  PENDING_REVIEW: 0,
  SCHEDULING: 1,
  PICKING: 3,
  READY_TO_SHIP: 4,
  PARTIALLY_SHIPPED: 5,
  IN_TRANSIT: 5,
  DELIVERED: 6,
  COMPLETED: 6,
};

/* ===== Status Maps ===== */
export const OMS_ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: '待审核', color: '#6B7280' },
  ORDER_TERMINATED: { label: '订单已终止', color: '#DC2626' },
  CANCELLED: { label: '已取消', color: '#6B7280' },
  SCHEDULING: { label: '排单中', color: '#4F46E5' },
  PICKING: { label: '拣货中', color: '#4F46E5' },
  READY_TO_SHIP: { label: '待发货', color: '#4F46E5' },
  PARTIALLY_SHIPPED: { label: '部分发货', color: '#D97706' },
  IN_TRANSIT: { label: '运输中', color: '#4F46E5' },
  DELIVERED: { label: '已签收', color: '#059669' },
  COMPLETED: { label: '已完成', color: '#059669' },
  EXCEPTION_HOLD: { label: '异常挂起', color: '#DC2626' },
  RETURN_PROCESSING: { label: '退货处理中', color: '#D97706' },
};

export const PACKAGE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: '#6B7280' },
  PICKING: { label: '拣货中', color: '#4F46E5' },
  READY: { label: '待发货', color: '#4F46E5' },
  WAITING_RESTOCK: { label: '待补货', color: '#D97706' },
  SHIPPED: { label: '已发货', color: '#4F46E5' },
  DELIVERED: { label: '已签收', color: '#059669' },
  COMPLETED: { label: '已完成', color: '#059669' },
};

export const STOCK_STATUS_OMS_MAP: Record<string, { label: string; color: string }> = {
  IN_STOCK: { label: '有货', color: '#059669' },
  OUT_OF_STOCK: { label: '缺货', color: '#DC2626' },
  PURCHASING: { label: '采购中', color: '#D97706' },
};

/* ===== Mock OMS Order ===== */
export const mockOmsOrders: OmsOrderVO[] = [
  {
    orderNo: 'OMS202607160001',
    dealerId: 'DLR-001',
    dealerName: '杭州雅迪旗舰店',
    bizType: 'REGULAR',
    urgencyLevel: 'URGENT',
    status: 'PARTIALLY_SHIPPED',
    vinCodes: ['LSVAU2180N2012345', 'LSVAU2190N2015678'],
    baseSource: '华东基地（无锡）',
    shortageFlag: true,
    shortagePolicy: 'SPLIT',
    packages: [
      {
        packageId: 'pkg001',
        packageType: 'ORIGINAL',
        status: 'SHIPPED',
        lineItems: [
          { lineItemId: 'li001', skuCode: 'WL20240004', skuName: '正新真空轮胎 3.00-10 前后通用型', quantity: 10, unitPrice: 88, subtotal: 880, shortageQty: 0, stockStatus: 'IN_STOCK', belongsToPackageId: 'pkg001' },
          { lineItemId: 'li002', skuCode: 'WL20240018', skuName: '建大内胎 3.00-10 丁基胶 高气密性', quantity: 20, unitPrice: 18, subtotal: 360, shortageQty: 0, stockStatus: 'IN_STOCK', belongsToPackageId: 'pkg001' },
          { lineItemId: 'li003', skuCode: 'WL20240009', skuName: '壳牌全合成摩托车机油 10W-40 1L', quantity: 24, unitPrice: 38, subtotal: 912, shortageQty: 0, stockStatus: 'IN_STOCK', belongsToPackageId: 'pkg001' },
        ],
        trackingNo: 'SF123456789012',
        logisticsCompany: '顺丰速运',
        shipTime: '2026-07-16 09:00',
        estimatedArrival: '2026-07-18',
        shippingMethod: 'STANDALONE',
        trackingNodes: [
          { time: '07-18 10:00', status: '已签收', description: '已签收，签收人：本人', location: '杭州' },
          { time: '07-18 08:30', status: '派送中', description: '快递员正在派送，快递员：王师傅', location: '杭州西湖区' },
          { time: '07-18 06:00', status: '到达网点', description: '快件到达杭州西湖分部', location: '杭州西湖区' },
          { time: '07-17 22:00', status: '运输中', description: '快件离开南京转运中心', location: '南京转运中心' },
          { time: '07-17 15:00', status: '运输中', description: '快件到达南京转运中心', location: '南京转运中心' },
          { time: '07-16 18:00', status: '已发货', description: '快件离开华东分拣中心', location: '华东分拣中心（无锡）' },
          { time: '07-16 09:00', status: '已发货', description: '顺丰速运已揽收', location: '华东分拣中心（无锡）' },
        ],
        supplierStatus: undefined, supplierTrackingNo: undefined, supplierLogisticsCompany: undefined,
        supplierShipTime: undefined, supplierEstimatedArrival: undefined, supplierTrackingNodes: [],
      },
      {
        packageId: 'pkg002',
        packageType: 'SUPPLEMENT',
        status: 'WAITING_RESTOCK',
        lineItems: [
          { lineItemId: 'li004', skuCode: 'WL20240001', skuName: '雅迪原厂锂电池 48V20Ah 冠能系列专用', quantity: 3, unitPrice: 1280, subtotal: 3840, shortageQty: 3, stockStatus: 'OUT_OF_STOCK', belongsToPackageId: 'pkg002',
            supplierInfo: { supplierName: '东方新能源（浙江）有限公司', expectedArrivalDate: '2026-07-22', trackingNumber: 'YT8765432109' } },
        ],
        trackingNo: undefined,
        logisticsCompany: undefined,
        shipTime: undefined,
        estimatedArrival: undefined,
        shippingMethod: 'STANDALONE',
        trackingNodes: [],
        supplierStatus: 'SHIPPED',
        supplierTrackingNo: 'YT8765432109',
        supplierLogisticsCompany: '圆通速递',
        supplierShipTime: '2026-07-15',
        supplierEstimatedArrival: '2026-07-20',
        supplierTrackingNodes: [
          { time: '07-17 08:00', status: '运输中', description: '快件在运输途中，预计到达无锡基地', location: '在途中转' },
          { time: '07-15 14:00', status: '已发货', description: '圆通速递已揽收', location: '浙江长兴' },
        ],
      },
      {
        packageId: 'pkg003',
        packageType: 'SUPPLEMENT',
        status: 'WAITING_RESTOCK',
        lineItems: [
          { lineItemId: 'li005', skuCode: 'WL20240022', skuName: '雅迪智能仪表盘 LCD液晶 冠能系列专用', quantity: 2, unitPrice: 268, subtotal: 536, shortageQty: 2, stockStatus: 'PURCHASING', belongsToPackageId: 'pkg003',
            supplierInfo: { supplierName: '博世汽车部件（苏州）有限公司', expectedArrivalDate: '2026-07-25' } },
        ],
        trackingNo: undefined, logisticsCompany: undefined, shipTime: undefined, estimatedArrival: undefined,
        shippingMethod: 'STANDALONE', trackingNodes: [],
        supplierStatus: 'PENDING',
        supplierTrackingNo: undefined, supplierLogisticsCompany: undefined,
        supplierShipTime: undefined, supplierEstimatedArrival: '2026-07-25', supplierTrackingNodes: [],
      },
    ],
    skuCount: 5,
    totalAmount: 6528,
    createTime: '2026-07-15 14:30:00',
    receiverName: '张伟',
    receiverPhone: '13888888888',
    receiverProvince: '浙江省',
    receiverCity: '杭州市',
    receiverDistrict: '西湖区',
    receiverAddress: '文三路478号华星时代广场1楼雅迪旗舰店',
    items: [],
    shippingMethod: 'STANDALONE',
  },
  {
    orderNo: 'OMS202607170002',
    dealerId: 'DLR-001',
    dealerName: '杭州雅迪旗舰店',
    bizType: 'REGULAR',
    urgencyLevel: 'NORMAL',
    status: 'PICKING',
    vinCodes: [],
    baseSource: '华南基地（广州）',
    shortageFlag: false,
    shortagePolicy: 'HOLD',
    packages: [
      {
        packageId: 'pkg004',
        packageType: 'ORIGINAL',
        status: 'WAITING_RESTOCK',
        lineItems: [
          { lineItemId: 'li006', skuCode: 'WL20240006', skuName: 'NGK铱金火花塞 CR7HIX 高性能点火', quantity: 20, unitPrice: 30, subtotal: 600, shortageQty: 0, stockStatus: 'IN_STOCK', belongsToPackageId: 'pkg004' },
          { lineItemId: 'li007', skuCode: 'WL20240009', skuName: '壳牌全合成摩托车机油 10W-40 1L', quantity: 24, unitPrice: 38, subtotal: 912, shortageQty: 0, stockStatus: 'IN_STOCK', belongsToPackageId: 'pkg004' },
          { lineItemId: 'li008', skuCode: 'WL20240020', skuName: '雅迪原厂 LED大灯总成 冠能系列', quantity: 1, unitPrice: 148, subtotal: 148, shortageQty: 1, stockStatus: 'OUT_OF_STOCK', belongsToPackageId: 'pkg004',
            supplierInfo: { supplierName: '常州星宇车灯股份有限公司', expectedArrivalDate: '2026-07-21' } },
        ],
        trackingNo: undefined, logisticsCompany: undefined, shipTime: undefined, estimatedArrival: undefined,
        shippingMethod: 'STANDALONE', trackingNodes: [],
        supplierStatus: 'PENDING', supplierTrackingNo: undefined, supplierLogisticsCompany: undefined,
        supplierShipTime: undefined, supplierEstimatedArrival: '2026-07-21', supplierTrackingNodes: [],
      },
    ],
    skuCount: 3,
    totalAmount: 1660,
    createTime: '2026-07-17 10:00:00',
    receiverName: '张伟',
    receiverPhone: '13888888888',
    receiverProvince: '浙江省',
    receiverCity: '杭州市',
    receiverDistrict: '西湖区',
    receiverAddress: '文三路478号华星时代广场1楼雅迪旗舰店',
    items: [],
    shippingMethod: 'STANDALONE',
  },
];

/* ===== Operation Logs ===== */
export function getOperationLogs(orderNo: string): OperationLogVO[] {
  const logs: Record<string, OperationLogVO[]> = {
    'OMS202607160001': [
      { time: '2026-07-18 10:05', operator: '系统', role: '自动', action: '包裹1已签收，订单部分完成' },
      { time: '2026-07-17 15:00', operator: '李明', role: '仓库管理员', action: '包裹2缺件电池已联系供应商补货', remark: '供应商确认7月22日到货' },
      { time: '2026-07-16 18:00', operator: '王华', role: '拣货员', action: '包裹1完成拣货并发货', remark: '顺丰速运 SF123456789012' },
      { time: '2026-07-16 09:00', operator: '系统', role: '自动', action: '订单拆分为3个包裹（SPLIT策略）', remark: '有货商品优先发运，缺件商品待补货后补发' },
      { time: '2026-07-15 14:30', operator: '张伟', role: '经销商', action: '提交订单' },
    ],
    'OMS202607170002': [
      { time: '2026-07-17 11:00', operator: '系统', role: '自动', action: '订单审核通过，进入排单', remark: 'HOLD策略：等待所有商品到齐后统一发货' },
      { time: '2026-07-17 10:30', operator: '赵强', role: '审核员', action: '审核订单，标记LED大灯需外部采购' },
      { time: '2026-07-17 10:00', operator: '张伟', role: '经销商', action: '提交订单' },
    ],
  };
  return logs[orderNo] || [];
}

/* ===== Linked Exceptions ===== */
export function getLinkedExceptions(orderNo: string): ExceptionBriefVO[] {
  if (orderNo === 'OMS202607160001') {
    return [
      { exceptionNo: 'EXC20260717001', orderNo, exceptionType: '缺件异常', description: '包裹3：智能仪表盘供应商采购中，预计7月25日到货', status: '处理中', priority: 'P1' },
    ];
  }
  return [];
}
