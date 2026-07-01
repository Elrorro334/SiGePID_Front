'use client';

import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersApi, OrderResponse } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: React.ElementType }> = {
  CREATED:    { label: 'Creado',      className: 'bg-surface border-surface-border text-content-strong', Icon: Clock },
  PROCESSING: { label: 'Procesando',  className: 'bg-status-info text-white border-status-info',         Icon: Loader2 },
  VALIDATED:  { label: 'Enviado',     className: 'bg-status-success text-white border-status-success',   Icon: CheckCircle },
  CANCELLED:  { label: 'Cancelado',   className: 'bg-status-danger text-white border-status-danger',     Icon: XCircle },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-surface border-surface-border text-content', Icon: Package };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${cfg.className}`}>
      <cfg.Icon size={12} />
      {cfg.label}
    </span>
  );
};

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    ordersApi.getOrdersByUserId(String(user.id))
      .then(res => setOrders(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isAuthenticated, user, router]);

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
          <h2 className="text-xl font-bold text-content-strong">Error al cargar pedidos</h2>
          <p className="text-content-muted">No se pudo conectar con el servidor de pedidos.</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-surface p-12 rounded-2xl border border-surface-border">
          <Package size={48} className="text-content-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-content-strong mb-4">Sin pedidos aún</h2>
          <p className="text-content-muted mb-8">Aún no has realizado ningún pedido.</p>
          <Link href="/catalog">
            <Button>Explorar el catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Package size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-content-strong">Historial de Pedidos</h1>
          <p className="text-content-muted text-sm mt-0.5">{orders.length} pedido(s) encontrado(s)</p>
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-surface-border text-sm text-content-muted uppercase tracking-wider">
                <th className="p-4 font-semibold">ID Pedido</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Artículos</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {orders.map((order, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  key={order.id}
                  className="hover:bg-surface-muted/50 transition-colors"
                >
                  <td className="p-4 font-medium text-content-strong">ORD-{order.id}</td>
                  <td className="p-4 text-content">
                    {new Date(order.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-content">{order.items?.length ?? 0} ítem(s)</td>
                  <td className="p-4 font-bold text-content-strong">
                    ${order.totalAmount?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
