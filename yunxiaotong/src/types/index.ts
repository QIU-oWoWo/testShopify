/* ===== Enums ===== */
export type StockStatus = 'IN_STOCK' | 'PRE_ORDER' | 'OUT_OF_STOCK';
export type LifecycleStatus = 'ACTIVE' | 'DISCONTINUED' | 'REPLACED';
export type OrderStatus = 'CREATED' | 'WAIT_PAY' | 'PAID' | 'CONFIRMED' | 'PICKING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'SIGNED' | 'COMPLETED' | 'CANCELLED' | 'AFTER_SALE_PROCESSING' | 'EXCEPTION';
export type AfterSaleType = 'REFUND_ONLY' | 'RETURN_REFUND' | 'EXCHANGE';
export type AfterSaleStatus = 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'RETURN_WAITING' | 'RETURNING' | 'INSPECTING' | 'REFUNDING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type AfterSaleReason = 'QUALITY_ISSUE' | 'WRONG_ITEM' | 'SHORTAGE' | 'DAMAGED' | 'OTHER';
export type OrderType = 'NORMAL' | 'APPOINTMENT' | 'CUSTOM' | 'CALL400';
export type ShippingMethod = 'EXPRESS' | 'SELF_PICKUP';
export type DealerLevel = 'A' | 'B' | 'C' | 'D';
export type PaymentMethod = 'ONLINE' | 'MONTHLY' | 'COD';
export type ReconciliationStatus = 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'SETTLED';
export type InvoiceType = 'VAT_NORMAL' | 'VAT_SPECIAL';
export type MessageType = 'ORDER_STATUS' | 'AFTER_SALE' | 'PROMOTION' | 'SYSTEM' | 'CUSTOMER_SERVICE' | 'RECONCILIATION';

/* ===== Common VOs ===== */
export interface PriceLevel {
  minQty: number;
  maxQty: number | null;
  priceA: number;
  priceB: number;
  priceC: number;
  priceD: number;
}

export interface VehicleModel {
  brand: string;
  series: string;
  year: string;
  model: string;
}

export interface StockDetail {
  warehouseId: string;
  warehouseName: string;
  baseName: string;
  availableQty: number;
  distance: number;
  estimatedShipDays: number;
}

export interface BaseWarehouse {
  warehouseId: string;
  name: string;
  shortName: string;
  region: string;
  address: string;
  color: string;
}

/* ===== OMS-style Order Detail Types ===== */

export type OmsOrderStatus = 'PENDING_REVIEW' | 'ORDER_TERMINATED' | 'CANCELLED' | 'SCHEDULING' | 'PICKING' | 'READY_TO_SHIP' | 'PARTIALLY_SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'EXCEPTION_HOLD' | 'RETURN_PROCESSING';

export type PackageStatus = 'PENDING' | 'PICKING' | 'READY' | 'WAITING_RESTOCK' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED';

export interface SubstituteProduct {
  productId: string;
  materialCode: string;
  name: string;
  mainImage: string;
  priceA: number;
  priceB: number;
  priceC: number;
  priceD: number;
  stockStatus: StockStatus;
  priceDiff: number;
}

/* ===== ProductVO ===== */
export interface ProductVO {
  productId: string;
  materialCode: string;
  name: string;
  brand: string;
  categoryPath: string[];
  baseWarehouse: string;
  baseWarehouseName: string;
  mainImage: string;
  images: string[];
  videoUrl?: string;
  specs: Record<string, string>;
  priceLevels: PriceLevel[];
  stockStatus: StockStatus;
  stockDetail: StockDetail[];
  vehicleModels: VehicleModel[];
  substitutes: SubstituteProduct[];
  moq: number;
  unit: string;
  weight?: number;
  origin?: string;
  isNew?: boolean;
  isPromotion?: boolean;
  lifecycleStatus?: LifecycleStatus;
  replacedByProductId?: string;
  replacedByProductName?: string;
}

/* ===== CartVO ===== */
export interface CartItem {
  cartItemId: string;
  product: ProductVO;
  quantity: number;
  vinChecked: 'PASSED' | 'UNCHECKED' | 'FAILED';
  vinCode?: string;
  selected: boolean;
  hasSubstitute?: boolean;
  itemStatus: 'NORMAL' | 'DISCONTINUED' | 'REPLACED' | 'OUT_OF_STOCK';
  statusMessage?: string;
  replacementProduct?: ProductVO;
}

export interface MergeOrderGroup {
  warehouseId: string;
  warehouseName: string;
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  freightFee: number;
  estimatedShipDays: number;
}

export interface HistoryCombo {
  productIds: string[];
  frequency: number;
  label: string;
}

export interface Recommendation {
  type: 'REPLENISH' | 'FREIGHT' | 'SUBSTITUTE' | 'MODEL_COMPLETE';
  products: ProductVO[];
  message: string;
}

export interface VinCheckResult {
  vinCode: string;
  model: string;
  matchedCount: number;
  unmatchedCount: number;
}

export interface CartVO {
  cartId: string;
  items: CartItem[];
  totalPrice: number;
  discountAmount: number;
  freightFee: number;
  payAmount: number;
  freeShippingThreshold: number;
  recommendations: Recommendation[];
  vinCheckResults: VinCheckResult[];
}

/* ===== OrderVO ===== */
export interface AddressVO {
  addressId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  storeCode?: string;
  isDefault: boolean;
  label?: string;
}

export interface InvoiceVO {
  invoiceId: string;
  title: string;
  taxNumber: string;
  bankAccount?: string;
  bankName?: string;
  address?: string;
  phone?: string;
  invoiceType: InvoiceType;
  receiveMethod: 'EMAIL' | 'MAIL';
  email?: string;
  mailAddress?: AddressVO;
}

export interface AfterSaleVO {
  afterSaleId: string;
  orderId: string;
  type: AfterSaleType;
  reason: AfterSaleReason;
  description: string;
  evidences: string[];
  refundAmount?: number;
  status: AfterSaleStatus;
  returnTrackingNo?: string;
  createTime: string;
  updateTime: string;
}

export interface OrderItem {
  orderItemId: string;
  product: ProductVO;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  afterSaleStatus: string | null;
  afterSaleId?: string;
}

export interface LogisticsNode {
  time: string;
  status: string;
  description: string;
  location: string;
}

export interface OrderVO {
  orderId: string;
  orderNo: string;
  orderType: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  payAmount: number;
  freightFee: number;
  discountAmount: number;
  address: AddressVO;
  shippingMethod: ShippingMethod;
  logisticsCompany?: string;
  trackingNo?: string;
  estimatedShipTime?: string;
  estimatedDeliveryTime?: string;
  invoiceInfo?: InvoiceVO;
  remark?: string;
  createTime: string;
  payTime?: string;
  logistics?: LogisticsNode[];
  paymentMethod: PaymentMethod;
}

/* ===== ReconciliationVO ===== */
export interface ReconOrderDetail {
  orderNo: string;
  amount: number;
  date: string;
  status: string;
}

export interface ReconciliationVO {
  reconciliationId: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  verifiedAmount: number;
  diffAmount: number;
  status: ReconciliationStatus;
  orderDetails: ReconOrderDetail[];
  confirmTime?: string;
}

/* ===== MessageVO ===== */
export interface MessageVO {
  messageId: string;
  type: MessageType;
  title: string;
  content: string;
  isRead: boolean;
  createTime: string;
  linkUrl?: string;
  orderNo?: string;
}

/* ===== UserVO ===== */
export interface PreferenceVO {
  defaultShipping: ShippingMethod;
  defaultInvoiceId?: string;
  orderReminders: string[];
  listDensity: 'COMPACT' | 'COMFORT' | 'SPACIOUS';
  keepSearchHistory: boolean;
}

export interface UserVO {
  userId: string;
  dealerName: string;
  contactName: string;
  phone: string;
  email?: string;
  dealerLevel: DealerLevel;
  creditLimit?: number;
  availableCredit?: number;
  addresses: AddressVO[];
  invoiceInfo: InvoiceVO[];
  preferences: PreferenceVO;
}

/* ===== Filter ===== */
export interface ProductFilter {
  brand?: string[];
  priceRange?: [number, number];
  stockStatus?: StockStatus | 'ALL';
  vehicleModels?: string[];
  sortBy?: 'DEFAULT' | 'SALES' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST';
  categoryId?: string;
}

/* ===== OMS-style Order Detail Types ===== */

export interface SupplierInfoVO {
  supplierName: string;
  expectedArrivalDate: string;
  trackingNumber?: string;
}

export interface OmsLineItem {
  lineItemId: string;
  skuCode: string;
  skuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shortageQty: number;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'PURCHASING';
  supplierInfo?: SupplierInfoVO;
  belongsToPackageId?: string;
}

export interface OmsPackage {
  packageId: string;
  packageType: 'ORIGINAL' | 'SUPPLEMENT';
  status: PackageStatus;
  lineItems: OmsLineItem[];
  trackingNo?: string;
  logisticsCompany?: string;
  shipTime?: string;
  estimatedArrival?: string;
  shippingMethod: string;
  trackingNodes: LogisticsNode[];
  supplierStatus?: 'PENDING' | 'SHIPPED' | 'ARRIVED_AT_BASE';
  supplierTrackingNo?: string;
  supplierLogisticsCompany?: string;
  supplierShipTime?: string;
  supplierEstimatedArrival?: string;
  supplierTrackingNodes: LogisticsNode[];
}

export interface FlowNodeConfig {
  key: string;
  label: string;
}

export interface OperationLogVO {
  time: string;
  operator: string;
  role: string;
  action: string;
  remark?: string;
}

export interface ExceptionBriefVO {
  exceptionNo: string;
  orderNo: string;
  exceptionType: string;
  description: string;
  status: string;
  priority: string;
}

export interface OmsOrderVO {
  orderNo: string;
  dealerId: string;
  dealerName: string;
  bizType: string;
  urgencyLevel: 'NORMAL' | 'URGENT' | 'CRITICAL';
  status: OmsOrderStatus;
  vinCodes: string[];
  baseSource: string;
  shortageFlag: boolean;
  shortagePolicy?: 'SPLIT' | 'HOLD';
  packages: OmsPackage[];
  skuCount: number;
  totalAmount: number;
  createTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverProvince: string;
  receiverCity: string;
  receiverDistrict: string;
  receiverAddress: string;
  items: OmsLineItem[];
  shippingMethod: string;
  linkedPlanNo?: string;
}
