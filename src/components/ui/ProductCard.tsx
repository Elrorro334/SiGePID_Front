'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

import Link from 'next/link';
import { ImageWithLoader } from './ImageWithLoader';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryName?: string | null;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  
  const inCart = cartItems.find(item => item.productId === product.id);
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
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
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col bg-surface rounded-2xl overflow-hidden border border-surface-border shadow-sm hover:shadow-xl transition-all duration-300 relative"
    >
      <Link href={`/catalog/${product.id}`} className="absolute inset-0 z-0"></Link>
      
      {/* Product Image */}
      <div className="relative aspect-square bg-surface-muted overflow-hidden z-10 pointer-events-none">
        {product.imageUrl ? (
          <ImageWithLoader 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-content-muted font-medium bg-gradient-to-br from-surface-muted to-surface-border">
            {product.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!inStock ? (
            <span className="bg-status-danger text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Agotado
            </span>
          ) : lowStock ? (
            <span className="bg-status-warning text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              ¡Solo {product.stock}!
            </span>
          ) : (
            <span className="bg-status-success text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Disponible
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3">
           <span className="bg-surface/90 backdrop-blur-sm text-content-strong text-xs font-semibold px-2 py-1 rounded-md shadow-sm border border-surface-border">
             {product.categoryName ?? '—'}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 pointer-events-none z-10 relative">
        <h3 className="text-lg font-bold text-content-strong line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-content-muted line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-surface-border/50 pointer-events-auto relative z-20">
          <div>
            <span className="text-xs text-content font-medium uppercase tracking-wider">Precio</span>
            <div className="text-xl font-black text-content-strong">
              ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <Button 
            variant={inCart ? 'secondary' : 'primary'} 
            size="sm" 
            className="flex-shrink-0 whitespace-nowrap !rounded-lg"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            {inCart ? (
              <><Check size={16} className="mr-1.5" /> {inCart.quantity} en carrito</>
            ) : (
              <><ShoppingCart size={16} className="sm:mr-1.5" /> <span className="hidden sm:inline">Agregar</span></>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
