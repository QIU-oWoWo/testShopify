import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import { mockProducts } from '../../mock';
import { ProductFilter } from '../../types';

const PAGE_SIZE = 20;

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category') || 'all';
  const [filter, setFilter] = useState<ProductFilter>({});
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    let list = [...mockProducts];

    // Category filter
    if (categoryFilter !== 'all') {
      const catMap: Record<string, string> = {
        battery: '电池',
        parts: '配件',
        tire: '轮胎',
        oil: '润滑油',
        accessory: '附件',
        tool: '工具设备',
      };
      const catName = catMap[categoryFilter];
      if (catName) {
        list = list.filter((p) => p.categoryPath[0] === catName);
      }
    }

    // Brand filter
    if (filter.brand && filter.brand.length > 0) {
      list = list.filter((p) => filter.brand!.includes(p.brand));
    }

    // Stock filter
    if (filter.stockStatus && filter.stockStatus !== 'ALL') {
      list = list.filter((p) => p.stockStatus === filter.stockStatus);
    }

    // Sort
    switch (filter.sortBy) {
      case 'PRICE_ASC':
        list.sort((a, b) => a.priceLevels[0].priceA - b.priceLevels[0].priceA);
        break;
      case 'PRICE_DESC':
        list.sort((a, b) => b.priceLevels[0].priceA - a.priceLevels[0].priceA);
        break;
      case 'NEWEST':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return list;
  }, [categoryFilter, filter]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categoryNames: Record<string, string> = {
    all: '全部商品',
    battery: '电池',
    parts: '配件',
    tire: '轮胎',
    oil: '润滑油',
    accessory: '附件',
    tool: '工具设备',
  };

  return (
    <div className="container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div>
          <h1>欢迎来到云销通</h1>
          <p>雅迪官方配件采购平台 · 正品保障 · 快速发货</p>
        </div>
        <div className="hero-icon">🛵</div>
      </div>

      {/* Page header */}
      <div className="page-header">
        <h2 className="page-title">{categoryNames[categoryFilter] || '全部商品'}</h2>
        <p className="page-subtitle">
          共 {filteredProducts.length} 件商品
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar filter={filter} onChange={(f) => { setFilter(f); setPage(1); }} />

      {/* Product Grid */}
      {pagedProducts.length > 0 ? (
        <>
          <div className="product-grid">
            {pagedProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
          <Pagination current={page} total={filteredProducts.length} onChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon="🔍"
          text="没有找到符合条件的商品"
          actionText="重置筛选"
          onAction={() => setFilter({})}
        />
      )}
    </div>
  );
}
