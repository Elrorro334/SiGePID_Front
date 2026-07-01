'use client';

import React, { useEffect, useState } from 'react';
import { ordersApi, OrderResponse } from '@/lib/api';
import { Loader2, ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  CREATED:    { label: 'Creado',      className: 'bg-surface border-surface-border text-content-strong', Icon: Clock },
  PROCESSING: { label: 'Procesando',  className: 'bg-status-info text-white border-status-info',         Icon: Loader2 },
  VALIDATED:  { label: 'Enviado',     className: 'bg-status-success text-white border-status-success',   Icon: CheckCircle },
  CANCELLED:  { label: 'Cancelado',   className: 'bg-status-danger text-white border-status-danger',     Icon: XCircle },
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // El ID en la ruta es un string, pero el backend espera Long, api espera number.
    ordersApi.getOrderById(Number(params.id))
      .then(res => setOrder(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-status-danger/10 border border-status-danger/20 p-8 rounded-2xl flex flex-col items-center gap-4">
          <AlertCircle size={40} className="text-status-danger" />
          <h2 className="text-xl font-bold text-content-strong">Pedido no encontrado</h2>
          <p className="text-content-muted">El pedido que buscas no existe o no tienes permiso para verlo.</p>
          <Link href="/orders" className="text-primary hover:underline mt-4">
            Volver a mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-surface border-surface-border', Icon: Package };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/orders" className="inline-flex items-center text-content-muted hover:text-primary transition-colors mb-8">
        <ArrowLeft size={16} className="mr-2" />
        Volver a mis pedidos
      </Link>

      <div className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-surface-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-content-strong mb-1">Pedido ORD-{order.id}</h1>
            <p className="text-content-muted text-sm">
              Realizado el {new Date(order.createdAt).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${statusCfg.className}`}>
            <statusCfg.Icon size={18} />
            <span className="font-bold">{statusCfg.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-lg font-bold text-content-strong mb-6">Artículos en el pedido</h2>
          
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-surface-muted p-4 rounded-xl border border-surface-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface rounded-lg flex items-center justify-center text-content-muted font-bold">
                    {item.productName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-content-strong">{item.productName}</h3>
                    <p className="text-content-muted text-sm">
                      ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="font-bold text-content-strong">
                  ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-surface-border flex justify-end">
            <div className="w-full sm:w-1/2 md:w-1/3">
              <div className="flex justify-between text-content-muted mb-2">
                <span>Subtotal</span>
                <span>${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-content-muted mb-4">
                <span>Envío</span>
                <span className="text-status-success font-medium">Gratis</span>
              </div>
              <div className="flex justify-between text-xl font-black text-content-strong pt-4 border-t border-surface-border">
                <span>Total</span>
                <span>${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
