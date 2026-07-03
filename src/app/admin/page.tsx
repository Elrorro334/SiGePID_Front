'use client';

import React, { useEffect, useState } from 'react';
import { catalogApi, categoriesApi } from '@/lib/api';
import { Package, Tags, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes, lowStockRes] = await Promise.all([
          catalogApi.getAllProducts(),
          categoriesApi.getAllCategories(),
          catalogApi.getLowStockProducts(10)
        ]);

        setStats({
          products: prodRes.data.length,
          categories: catRes.data.length,
          lowStock: lowStockRes.data.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse text-content-muted">Cargando métricas...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-content-strong mb-8">Resumen de Catálogo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-border flex items-center space-x-4">
          <div className="p-4 bg-primary-light/20 rounded-full text-primary">
            <Package size={32} />
          </div>
          <div>
            <p className="text-sm text-content-muted">Total Productos</p>
            <p className="text-3xl font-bold text-content-strong">{stats.products}</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-border flex items-center space-x-4">
          <div className="p-4 bg-accent/20 rounded-full text-accent">
            <Tags size={32} />
          </div>
          <div>
            <p className="text-sm text-content-muted">Total Categorías</p>
            <p className="text-3xl font-bold text-content-strong">{stats.categories}</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-border flex items-center space-x-4">
          <div className="p-4 bg-status-danger/20 rounded-full text-status-danger">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-sm text-content-muted">Bajo Inventario</p>
            <p className="text-3xl font-bold text-content-strong">{stats.lowStock}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
