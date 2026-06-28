'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

  const handleCheckout = () => {
    // Implement API call to order-service
    alert("Procesando pago simulado...");
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-surface p-12 rounded-2xl border border-surface-border">
          <h2 className="text-2xl font-bold text-content-strong mb-4">Tu carrito está vacío</h2>
          <p className="text-content-muted mb-8">Aún no has agregado ningún producto a tu carrito de compras.</p>
          <Link href="/catalog">
            <Button>Explorar el catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-content-strong mb-8">Resumen de Compra</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-surface-border">
              <div className="w-20 h-20 bg-surface-muted rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-content-strong">{item.name}</h3>
                <div className="text-primary font-bold">${item.price.toLocaleString('es-MX')}</div>
              </div>
              
              <div className="flex items-center gap-3 bg-surface-muted rounded-lg p-1">
                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:text-primary"><Minus size={16}/></button>
                <span className="w-6 text-center font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:text-primary"><Plus size={16}/></button>
              </div>
              
              <button onClick={() => removeItem(item.productId)} className="p-2 text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-surface-muted p-6 rounded-2xl border border-surface-border sticky top-28">
            <h2 className="text-xl font-bold text-content-strong mb-6">Total a pagar</h2>
            
            <div className="space-y-4 mb-6 text-content">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-status-success">Gratis</span>
              </div>
              <div className="border-t border-surface-border pt-4 flex justify-between font-bold text-lg text-content-strong">
                <span>Total</span>
                <span>${getTotalPrice().toLocaleString('es-MX')}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout}>
              <CreditCard className="mr-2" size={20} /> Pagar Ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
