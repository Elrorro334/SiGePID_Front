'use client';

import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ui/ProductCard';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch from the actual API:
    // api.get('/catalog/products').then(res => setProducts(res.data))
    
    // For now, since the user may not have the backend running during dev:
    setTimeout(() => {
      setProducts([
        { id: '1', name: 'MacBook Pro 16"', description: 'Laptop M3 Max 32GB RAM', price: 45000, stock: 5, category: { id: 'c1', name: 'Electrónicos' } },
        { id: '2', name: 'Monitor LG UltraWide', description: 'Monitor curvo 34 pulgadas', price: 8500, stock: 12, category: { id: 'c1', name: 'Electrónicos' } },
        { id: '3', name: 'Teclado Mecánico Keychron', description: 'Switches Brown Hot-swappable', price: 2100, stock: 0, category: { id: 'c2', name: 'Accesorios' } },
        { id: '4', name: 'Silla Ergonomica Herman Miller', description: 'Silla Aeron negra', price: 22000, stock: 2, category: { id: 'c3', name: 'Oficina' } },
        { id: '5', name: 'Mouse Logitech MX Master 3', description: 'Mouse inalámbrico profesional', price: 1800, stock: 20, category: { id: 'c2', name: 'Accesorios' } },
        { id: '6', name: 'Audífonos Sony WH-1000XM5', description: 'Cancelación de ruido activa', price: 6500, stock: 8, category: { id: 'c1', name: 'Electrónicos' } },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-content-strong">Catálogo de Productos</h1>
        <p className="text-content-muted mt-2">Encuentra los mejores artículos al mejor precio.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
