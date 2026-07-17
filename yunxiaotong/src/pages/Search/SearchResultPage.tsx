import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import { mockProducts } from '../../mock';

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query) return { products: [], vehicles: [], articles: [] };
    const q = query.toLowerCase();
    const products = mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.materialCode.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryPath.some((c) => c.includes(q))
    );
    return { products, vehicles: [], articles: [] };
  }, [query]);

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">搜索结果</h2>
        <p className="page-subtitle">
          "{query}" 共找到 {results.products.length} 件商品
        </p>
      </div>

      {results.products.length > 0 ? (
        <div className="product-grid">
          {results.products.map((p) => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          text={`未找到与 "${query}" 相关的商品`}
          actionText="返回首页"
          onAction={() => navigate('/')}
        />
      )}
    </div>
  );
}
