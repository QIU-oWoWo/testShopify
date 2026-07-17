import React from 'react';
import { ProductFilter, StockStatus } from '../types';
import { brands } from '../mock';

interface Props {
  filter: ProductFilter;
  onChange: (filter: ProductFilter) => void;
}

const stockOptions: { label: string; value: StockStatus | 'ALL' }[] = [
  { label: '全部', value: 'ALL' },
  { label: '有货', value: 'IN_STOCK' },
  { label: '预售', value: 'PRE_ORDER' },
  { label: '缺货', value: 'OUT_OF_STOCK' },
];

const sortOptions: { label: string; value: ProductFilter['sortBy'] }[] = [
  { label: '综合', value: 'DEFAULT' },
  { label: '销量', value: 'SALES' },
  { label: '价格升序', value: 'PRICE_ASC' },
  { label: '价格降序', value: 'PRICE_DESC' },
  { label: '新品优先', value: 'NEWEST' },
];

export default function FilterBar({ filter, onChange }: Props) {
  const toggleBrand = (brand: string) => {
    const current = filter.brand || [];
    const next = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onChange({ ...filter, brand: next.length > 0 ? next : undefined });
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">品牌:</span>
        {brands.map((brand) => (
          <button
            key={brand}
            className={`filter-tag ${filter.brand?.includes(brand) ? 'active' : ''}`}
            onClick={() => toggleBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </div>

      <span className="filter-divider" />

      <div className="filter-group">
        <span className="filter-label">库存:</span>
        {stockOptions.map((opt) => (
          <button
            key={opt.value}
            className={`filter-tag ${
              (filter.stockStatus || 'ALL') === opt.value ? 'active' : ''
            }`}
            onClick={() =>
              onChange({ ...filter, stockStatus: opt.value })
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <span className="filter-divider" />

      <div className="filter-group">
        <span className="filter-label">排序:</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            className={`filter-tag ${
              (filter.sortBy || 'DEFAULT') === opt.value ? 'active' : ''
            }`}
            onClick={() => onChange({ ...filter, sortBy: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
