'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data based on the backend model
const mockOrders = [
  { id: 'ORD-1001', date: '2026-06-25', total: 45000, status: 'VALIDATED' },
  { id: 'ORD-1002', date: '2026-06-26', total: 2100, status: 'PROCESSING' },
  { id: 'ORD-1003', date: '2026-06-27', total: 1500, status: 'CANCELLED' },
  { id: 'ORD-1004', date: '2026-06-28', total: 28500, status: 'CREATED' },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    CREATED: 'bg-surface border-surface-border text-content-strong',
    PROCESSING: 'bg-status-info text-white border-status-info',
    VALIDATED: 'bg-status-success text-white border-status-success',
    CANCELLED: 'bg-status-danger text-white border-status-danger',
  };
  
  const labels: Record<string, string> = {
    CREATED: 'Creado',
    PROCESSING: 'Procesando',
    VALIDATED: 'Enviado',
    CANCELLED: 'Cancelado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Package size={28} />
        </div>
        <h1 className="text-3xl font-black text-content-strong">Historial de Pedidos</h1>
      </div>

      <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-surface-border text-sm text-content-muted uppercase tracking-wider">
                <th className="p-4 font-semibold">ID Pedido</th>
                <th className="p-4 font-semibold">Fecha</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {mockOrders.map((order, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={order.id} 
                  className="hover:bg-surface-muted/50 transition-colors"
                >
                  <td className="p-4 font-medium text-content-strong">{order.id}</td>
                  <td className="p-4 text-content">{order.date}</td>
                  <td className="p-4 font-bold text-content-strong">${order.total.toLocaleString('es-MX')}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-right">
                    <button className="text-primary hover:text-primary-hover font-medium text-sm transition-colors">
                      Ver Detalles
                    </button>
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
