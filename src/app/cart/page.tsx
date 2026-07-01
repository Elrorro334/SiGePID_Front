'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para completar tu compra.');
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    try {
      await ordersApi.createOrder({
        userId: String(user.id),
        userEmail: user.email,
        shippingAddress: "Dirección principal",
        items: items.map(item => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });
      clearCart();
      toast.success('¡Pedido creado con éxito!', { icon: '🎉' });
      router.push('/orders');
    } catch {
      toast.error('Error al procesar el pedido. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-surface p-12 rounded-2xl border border-surface-border">
          <ShoppingBag size={48} className="text-content-muted mx-auto mb-4" />
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
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-surface-border">
              <div className="w-16 h-16 bg-surface-muted rounded-lg flex-shrink-0 flex items-center justify-center text-content-muted font-bold text-lg overflow-hidden border border-surface-border">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  item.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-content-strong truncate">{item.name}</h3>
                <div className="text-primary font-bold text-sm">
                  ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-surface-muted rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1.5 hover:text-primary hover:bg-surface rounded-md transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-7 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1.5 hover:text-primary hover:bg-surface rounded-md transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="text-right min-w-[80px]">
                <div className="font-bold text-content-strong text-sm">
                  ${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-surface-muted p-6 rounded-2xl border border-surface-border sticky top-28">
            <h2 className="text-xl font-bold text-content-strong mb-6">Total a pagar</h2>

            <div className="space-y-3 mb-6 text-content text-sm">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between">
                  <span className="text-content-muted truncate max-w-[180px]">{item.name} ×{item.quantity}</span>
                  <span>${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-content-muted">
                <span>Envío</span>
                <span className="text-status-success font-medium">Gratis</span>
              </div>
              <div className="border-t border-surface-border pt-4 flex justify-between font-bold text-lg text-content-strong">
                <span>Total</span>
                <span>${getTotalPrice().toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout} isLoading={isProcessing}>
              <CreditCard className="mr-2" size={20} />
              {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
            </Button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-status-warning mt-3">
                Necesitas <Link href="/login" className="underline font-medium">iniciar sesión</Link> para pagar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
