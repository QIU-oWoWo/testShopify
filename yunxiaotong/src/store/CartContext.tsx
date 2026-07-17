import React, { createContext, useContext, useReducer, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, ProductVO, MergeOrderGroup } from '../types';
import { mockProducts, historyCombos } from '../mock';

/* ===== State ===== */
interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: ProductVO; quantity: number }
  | { type: 'REMOVE_ITEM'; cartItemId: string }
  | { type: 'UPDATE_QUANTITY'; cartItemId: string; quantity: number }
  | { type: 'TOGGLE_SELECT'; cartItemId: string }
  | { type: 'TOGGLE_SELECT_ALL' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; items: CartItem[] }
  | { type: 'REPLACE_ITEM'; cartItemId: string; newProduct: ProductVO }
  | { type: 'SYNC_STATUS' };

function getItemStatus(product: ProductVO): CartItem['itemStatus'] {
  if (product.lifecycleStatus === 'DISCONTINUED') return 'DISCONTINUED';
  if (product.lifecycleStatus === 'REPLACED') return 'REPLACED';
  if (product.stockStatus === 'OUT_OF_STOCK') return 'OUT_OF_STOCK';
  return 'NORMAL';
}

function getStatusMessage(product: ProductVO): string | undefined {
  if (product.lifecycleStatus === 'DISCONTINUED') return '该商品已停产淘汰，请移除';
  if (product.lifecycleStatus === 'REPLACED') return `该商品已被替换为：${product.replacedByProductName || '新型号'}`;
  if (product.stockStatus === 'OUT_OF_STOCK') return '暂无库存，可选择替代件或到货提醒';
  return undefined;
}

function syncProductStatus(item: CartItem): CartItem {
  const currentProduct = mockProducts.find(p => p.productId === item.product.productId);
  if (!currentProduct) {
    return { ...item, itemStatus: 'DISCONTINUED' as const, statusMessage: '该商品已下架' };
  }
  return {
    ...item,
    product: currentProduct,
    itemStatus: getItemStatus(currentProduct),
    statusMessage: getStatusMessage(currentProduct),
    replacementProduct: currentProduct.replacedByProductId
      ? mockProducts.find(p => p.productId === currentProduct.replacedByProductId)
      : undefined,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIdx = state.items.findIndex(
        (item) => item.product.productId === action.product.productId
      );
      if (existingIdx >= 0) {
        const newItems = [...state.items];
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + action.quantity,
        };
        return { ...state, items: newItems };
      }
      const newItem: CartItem = {
        cartItemId: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        product: action.product,
        quantity: action.quantity,
        vinChecked: 'UNCHECKED',
        selected: true,
        itemStatus: getItemStatus(action.product),
        statusMessage: getStatusMessage(action.product),
        replacementProduct: action.product.replacedByProductId
          ? mockProducts.find(p => p.productId === action.product.replacedByProductId)
          : undefined,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.cartItemId !== action.cartItemId) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.cartItemId === action.cartItemId
            ? { ...i, quantity: Math.max(i.product.moq, action.quantity) }
            : i
        ),
      };
    case 'TOGGLE_SELECT':
      return {
        ...state,
        items: state.items.map(i =>
          i.cartItemId === action.cartItemId ? { ...i, selected: !i.selected } : i
        ),
      };
    case 'TOGGLE_SELECT_ALL': {
      const allSelected = state.items.every(i => i.selected);
      return { ...state, items: state.items.map(i => ({ ...i, selected: !allSelected })) };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'LOAD_CART':
      return { ...state, items: action.items.map(syncProductStatus) };
    case 'REPLACE_ITEM':
      return {
        ...state,
        items: state.items.map(i =>
          i.cartItemId === action.cartItemId
            ? {
                ...i,
                product: action.newProduct,
                itemStatus: 'NORMAL' as const,
                statusMessage: undefined,
                replacementProduct: undefined,
              }
            : i
        ),
      };
    case 'SYNC_STATUS':
      return { ...state, items: state.items.map(syncProductStatus) };
    default:
      return state;
  }
}

/* ===== Context ===== */
interface CartContextValue {
  items: CartItem[];
  selectedItems: CartItem[];
  totalCount: number;
  totalPrice: number;
  selectedCount: number;
  selectedPrice: number;
  addToCart: (product: ProductVO, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  toggleSelect: (cartItemId: string) => void;
  toggleSelectAll: () => void;
  clearCart: () => void;
  replaceItem: (cartItemId: string, newProduct: ProductVO) => void;
  syncStatus: () => void;
  mergeOrderGroups: MergeOrderGroup[];
  recommendations: RecommendedCombo[];
  freightFillerProducts: ProductVO[];
}

export interface RecommendedCombo {
  label: string;
  frequency: number;
  products: ProductVO[];
  reason: string;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'yunxiaotong_cart';

function getInitialState(): CartState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { items: parsed.map(syncProductStatus) };
    }
  } catch {}
  return { items: [] };
}

function getDealerLevel(): 'A' | 'B' | 'C' | 'D' {
  try {
    const saved = localStorage.getItem('yunxiaotong_user');
    if (saved) return JSON.parse(saved).dealerLevel || 'A';
  } catch {}
  return 'A';
}

export function getPrice(product: ProductVO, quantity: number): number {
  const dealerLevel = getDealerLevel();
  const level = product.priceLevels.find(
    (pl) => quantity >= pl.minQty && (pl.maxQty === null || quantity <= pl.maxQty)
  );
  const lastLevel = product.priceLevels[product.priceLevels.length - 1];
  const key = `price${dealerLevel}` as keyof typeof lastLevel;
  if (!level) return lastLevel[key] as number;
  return (level as any)[key] as number;
}

export { getDealerLevel };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Sync status on mount
  useEffect(() => {
    dispatch({ type: 'SYNC_STATUS' });
  }, []);

  const selectedItems = state.items.filter(i => i.selected);
  const cartProductIds = new Set(state.items.map(i => i.product.productId));
  const dealerLevel = getDealerLevel();

  /* ===== Smart Recommendations ===== */
  const recommendations: RecommendedCombo[] = useMemo(() => {
    const cartIds = new Set(state.items.map(i => i.product.productId));
    const recs: RecommendedCombo[] = [];

    for (const combo of historyCombos) {
      const inCart = combo.productIds.filter(id => cartIds.has(id));
      const missing = combo.productIds.filter(id => !cartIds.has(id));
      // Recommend if at least 2 items from the combo are in cart and there are missing items
      if (inCart.length >= 1 && missing.length > 0) {
        const missingProducts = missing
          .map(id => mockProducts.find(p => p.productId === id))
          .filter(Boolean) as ProductVO[];
        if (missingProducts.length > 0) {
          recs.push({
            label: combo.label,
            frequency: combo.frequency,
            products: missingProducts,
            reason: inCart.length >= 2
              ? `经销商高频组合（${combo.frequency}次），您已选购其中 ${inCart.length} 件`
              : `常与购物车商品搭配购买（${combo.frequency}次历史订单）`,
          });
        }
      }
    }
    return recs.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
  }, [state.items]);

  /* ===== Freight filler products ===== */
  const freightFillerProducts: ProductVO[] = useMemo(() => {
    const selectedPrice = selectedItems.reduce(
      (sum, i) => sum + getPrice(i.product, i.quantity) * i.quantity, 0
    );
    const FREE_SHIPPING = 500;
    const gap = FREE_SHIPPING - selectedPrice;
    if (gap <= 0) return [];

    // Find products close to the gap price, not already in cart
    return mockProducts
      .filter(p => !cartProductIds.has(p.productId) && p.stockStatus === 'IN_STOCK')
      .filter(p => {
        const price = p.priceLevels[0][`price${dealerLevel}` as keyof typeof p.priceLevels[0]] as number;
        return price >= gap * 0.5 && price <= gap * 1.5;
      })
      .sort((a, b) => {
        const pa = a.priceLevels[0][`price${dealerLevel}` as keyof typeof a.priceLevels[0]] as number;
        const pb = b.priceLevels[0][`price${dealerLevel}` as keyof typeof b.priceLevels[0]] as number;
        return Math.abs(pa - gap) - Math.abs(pb - gap);
      })
      .slice(0, 3);
  }, [selectedItems, cartProductIds, dealerLevel]);

  /* ===== Merge Order Groups (by base warehouse) ===== */
  const mergeOrderGroups: MergeOrderGroup[] = useMemo(() => {
    if (selectedItems.length === 0) return [];

    // Group selected items by their best base warehouse
    const groups: Map<string, { warehouseName: string; baseName: string; items: CartItem[]; shipDays: number }> = new Map();

    for (const item of selectedItems) {
      // Skip discontinued items
      if (item.itemStatus === 'DISCONTINUED') continue;

      // Find the warehouse with sufficient stock that is closest (prefer same base)
      const validStocks = item.product.stockDetail
        .filter(s => s.availableQty >= item.quantity)
        .sort((a, b) => a.distance - b.distance);

      const bestWarehouse = validStocks[0] || item.product.stockDetail[0];
      const key = bestWarehouse?.warehouseId || item.product.baseWarehouse;

      if (!groups.has(key)) {
        groups.set(key, {
          warehouseName: bestWarehouse?.warehouseName || `雅迪${item.product.baseWarehouseName}中心仓`,
          baseName: bestWarehouse?.baseName || item.product.baseWarehouseName,
          items: [],
          shipDays: bestWarehouse?.estimatedShipDays || 3,
        });
      }
      groups.get(key)!.items.push(item);
    }

    return Array.from(groups.entries()).map(([warehouseId, g]) => {
      const itemTotal = g.items.reduce((sum, i) => sum + getPrice(i.product, i.quantity) * i.quantity, 0);
      return {
        warehouseId,
        warehouseName: g.warehouseName,
        items: g.items,
        itemCount: g.items.length,
        totalPrice: itemTotal,
        freightFee: itemTotal >= 500 ? 0 : 15,
        estimatedShipDays: g.shipDays,
      };
    });
  }, [selectedItems]);

  const value: CartContextValue = {
    items: state.items,
    selectedItems,
    totalCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: state.items.reduce((sum, i) => sum + getPrice(i.product, i.quantity) * i.quantity, 0),
    selectedCount: selectedItems.reduce((sum, i) => sum + i.quantity, 0),
    selectedPrice: selectedItems.reduce((sum, i) => sum + getPrice(i.product, i.quantity) * i.quantity, 0),
    addToCart: (product, quantity) => dispatch({ type: 'ADD_ITEM', product, quantity }),
    removeFromCart: (cartItemId) => dispatch({ type: 'REMOVE_ITEM', cartItemId }),
    updateQuantity: (cartItemId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', cartItemId, quantity }),
    toggleSelect: (cartItemId) => dispatch({ type: 'TOGGLE_SELECT', cartItemId }),
    toggleSelectAll: () => dispatch({ type: 'TOGGLE_SELECT_ALL' }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    replaceItem: (cartItemId, newProduct) => dispatch({ type: 'REPLACE_ITEM', cartItemId, newProduct }),
    syncStatus: () => dispatch({ type: 'SYNC_STATUS' }),
    mergeOrderGroups,
    recommendations,
    freightFillerProducts,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
