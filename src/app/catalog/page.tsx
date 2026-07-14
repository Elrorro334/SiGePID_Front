'use client';

import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import { catalogApi, ProductResponse } from '@/lib/api';
import { Loader2, AlertCircle, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filtered, setFiltered] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [error, setError] = useState(false);

  useEffect(() => {
    catalogApi.getAllProducts()
      .then(res => {
        setProducts(res.data);
        setFiltered(res.data);
      })
      .catch(() => {
        setError(true);
        toast.error('No se pudo cargar el catálogo. ¿Está corriendo el backend?');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtrar al cambiar búsqueda o categoría
  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.categoryName === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, selectedCategory, products]);

  // Obtener categorías únicas
  const categories = ['Todas', ...Array.from(
    new Set(products.map(p => p.categoryName).filter(Boolean) as string[])
  )];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-status-danger/10 border border-status-danger/20 p-8 rounded-2xl flex flex-col items-center gap-4">
          <AlertCircle size={40} className="text-status-danger" />
          <h2 className="text-xl font-bold text-content-strong">Error al cargar el catálogo</h2>
          <p className="text-content-muted">Verifica que el backend esté en ejecución y la conexión a internet sea estable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-content-strong">Catálogo de Productos</h1>
        <p className="text-content-muted mt-2">
          {filtered.length} de {products.length} productos disponibles.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-10 pr-4 py-2.5 border border-surface-border rounded-lg bg-surface text-content-strong placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        {/* Category filter */}
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-surface-border rounded-lg bg-surface text-content-strong focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-content-muted">
          <p className="text-lg">No se encontraron productos con ese criterio.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>}>
      <CatalogContent />
    </Suspense>
  );
}
