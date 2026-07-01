'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, X, PackageOpen } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter } from 'next/navigation';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setMobileMenuOpen(false);
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-surface/80 backdrop-blur-md shadow-sm border-b border-surface-border' : 'bg-surface'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg text-primary-content">
              <PackageOpen size={24} />
            </div>
            <span className="text-2xl font-bold text-content-strong tracking-tight">SiGePID</span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-content-muted" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="block w-full pl-10 pr-3 py-2.5 border border-surface-border rounded-full bg-surface-muted text-content-strong placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Buscar productos, categorías..."
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/catalog" className="text-content font-medium hover:text-primary transition-colors">
              Catálogo
            </Link>
            
            {isMounted && isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/orders" className="text-content font-medium hover:text-primary transition-colors">
                  Mis Pedidos
                </Link>
                <div className="flex items-center space-x-2 cursor-pointer group" onClick={logout}>
                  <div className="bg-primary-light text-primary p-2 rounded-full group-hover:bg-primary group-hover:text-primary-content transition-colors">
                    <User size={20} />
                  </div>
                  <span className="text-sm font-medium text-content-strong group-hover:text-primary transition-colors">Salir</span>
                </div>
              </div>
            ) : isMounted ? (
              <Link href="/login" className="flex items-center space-x-2 group">
                <div className="bg-surface-muted text-content p-2 rounded-full group-hover:bg-primary group-hover:text-primary-content transition-colors">
                  <User size={20} />
                </div>
                <span className="text-sm font-medium text-content-strong group-hover:text-primary transition-colors">Ingresar</span>
              </Link>
            ) : null}

            {/* Cart Icon with Badge */}
            <Link href="/cart" className="relative p-2 text-content hover:text-primary transition-colors">
              <ShoppingCart size={24} />
              <AnimatePresence>
                {isMounted && totalItems > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-status-danger text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full"
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-content">
              <ShoppingCart size={24} />
              {isMounted && totalItems > 0 && (
                <div className="absolute -top-1 -right-1 bg-status-danger text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </div>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-content hover:text-primary"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-surface-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <div className="relative w-full mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-content-muted" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="block w-full pl-10 pr-3 py-3 border border-surface-border rounded-lg bg-surface-muted text-content-strong placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Buscar productos..."
                />
              </div>
              <div className="flex flex-col space-y-3 pt-2">
                <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-content-strong hover:bg-surface-muted hover:text-primary">Catálogo</Link>
                {isMounted && isAuthenticated ? (
                  <>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-content-strong hover:bg-surface-muted hover:text-primary">Mis Pedidos</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-status-danger hover:bg-surface-muted">Cerrar Sesión</button>
                  </>
                ) : isMounted ? (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary-light">Iniciar Sesión</Link>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
