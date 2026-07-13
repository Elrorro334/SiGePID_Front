'use client';

import React, { useEffect, useState } from 'react';
import { catalogApi, ProductResponse } from '@/lib/api';
import { Loader2, ShoppingCart, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ImageWithLoader } from '@/components/ui/ImageWithLoader';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const router = useRouter();

  useEffect(() => {
    catalogApi.getProductById(id)
      .then(res => setProduct(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="bg-status-danger/10 border border-status-danger/20 p-8 rounded-2xl flex flex-col items-center gap-4">
          <AlertCircle size={40} className="text-status-danger" />
          <h2 className="text-xl font-bold text-content-strong">Producto no encontrado</h2>
          <p className="text-content-muted">El producto que buscas no existe o fue eliminado.</p>
          <Button variant="outline" onClick={() => router.push('/catalog')}>Volver al catálogo</Button>
        </div>
      </div>
    );
  }

  const inCart = cartItems.find(item => item.productId === product.id);
  const inStock = product.stock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      maxStock: product.stock,
      imageUrl: product.imageUrl,
    });
    toast.success(`${product.name} agregado al carrito`, {
      icon: '🛒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/catalog" className="inline-flex items-center text-content-muted hover:text-primary transition-colors mb-8">
        <ArrowLeft size={16} className="mr-2" />
        Volver al catálogo
      </Link>

      <div className="bg-surface rounded-3xl border border-surface-border shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-surface-muted aspect-square flex items-center justify-center relative">
          {product.imageUrl ? (
            <ImageWithLoader 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-content-muted">{product.name.substring(0, 2).toUpperCase()}</span>
          )}
          
          <div className="absolute top-4 left-4 flex gap-2">
            {!inStock ? (
              <span className="bg-status-danger text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">Agotado</span>
            ) : product.stock <= 5 ? (
              <span className="bg-status-warning text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">Últimas {product.stock}</span>
            ) : (
              <span className="bg-status-success text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">Disponible</span>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="mb-2">
            <span className="bg-surface-muted text-content-strong text-sm font-semibold px-3 py-1 rounded-md shadow-sm border border-surface-border">
              {product.categoryName ?? 'Sin categoría'}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-content-strong mt-4 mb-2">{product.name}</h1>
          <p className="text-content-muted text-sm mb-6 uppercase tracking-wider">SKU: {product.sku}</p>
          
          <div className="text-3xl font-black text-primary mb-6">
            ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>

          <div className="prose prose-sm prose-invert text-content mb-8 flex-1">
            <h3 className="text-lg font-bold text-content-strong mb-2">Descripción</h3>
            <p>{product.description}</p>
          </div>

          <div className="flex gap-4 mt-auto pt-8 border-t border-surface-border">
            <Button 
              size="lg" 
              className="flex-1 text-lg"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={20} className="mr-2" />
              Agregar al carrito
            </Button>

            {inCart && (
              <div className="flex items-center justify-center bg-surface-muted text-content-strong font-bold px-6 rounded-xl border border-surface-border">
                <Check size={20} className="mr-2 text-primary" />
                {inCart.quantity} en carrito
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
