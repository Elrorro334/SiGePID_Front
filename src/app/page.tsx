'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Box, ShieldCheck, Zap, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import { wizardApi, WizardResponse } from '@/lib/api';

// Mapa de rango de edad en base a username/perfil para la demo
// En producción, esto vendría del perfil completo del usuario
const DEFAULT_RANGO_EDAD = 'Adultos Jóvenes (18-35)';
const DEFAULT_USO = 'Uso Personal';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<WizardResponse[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Solicitar recomendaciones personalizadas para las 5 categorías
    // usando el perfil básico del usuario autenticado
    setLoadingRecs(true);
    const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes'];

    Promise.allSettled(
      categories.map(cat =>
        wizardApi.predict({
          categoria: cat,
          rangoEdad: DEFAULT_RANGO_EDAD,
          usoPrevisto: DEFAULT_USO,
        })
      )
    )
      .then(results => {
        const recs = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as PromiseFulfilledResult<{ data: WizardResponse }>).value.data);
        // Deduplicar por producto recomendado y mostrar máx. 4
        const unique = Array.from(
          new Map(recs.map(r => [r.productoRecomendado, r])).values()
        ).slice(0, 4);
        setRecommendations(unique);
      })
      .finally(() => setLoadingRecs(false));
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-surface-muted py-20 px-4 sm:px-6 lg:px-8">

        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-surface-border text-primary font-medium shadow-sm mb-4"
          >
            <Sparkles size={18} />
            <span>Descubre nuestro Asistente Inteligente</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-content-strong tracking-tight"
          >
            La forma más{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              inteligente
            </span>{' '}
            de comprar.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-content-muted max-w-3xl mx-auto leading-relaxed"
          >
            Utilizamos árboles de decisión y análisis en tiempo real para recomendarte exactamente lo
            que necesitas, cuando lo necesitas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/catalog" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg gap-2 shadow-xl shadow-primary/20">
                Explorar Catálogo <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/wizard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-lg bg-surface/50 backdrop-blur-sm">
                Usar Asistente <Sparkles size={20} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          SECCIÓN PERSONALIZADA — Solo visible si está autenticado
      ====================================================== */}
      {isAuthenticated && (
        <section className="py-16 bg-surface border-t border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Brain size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-content-strong">
                    Recomendado para ti, {user?.username} 👋
                  </h2>
                  <p className="text-content-muted text-sm mt-0.5">
                    Selección personalizada por nuestro motor ML en cada categoría
                  </p>
                </div>
              </div>
              <Link href="/wizard" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Sparkles size={14} className="mr-1.5" /> Personalizar más
                </Button>
              </Link>
            </div>

            {loadingRecs ? (
              <div className="flex justify-center items-center h-48">
                <div className="flex flex-col items-center gap-3 text-content-muted">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <span className="text-sm">Calculando recomendaciones personalizadas...</span>
                </div>
              </div>
            ) : recommendations.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={rec.productoRecomendado}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ProductCard
                      product={{
                        id: `rec-${i}`,
                        name: rec.productoRecomendado,
                        description: rec.descripcion,
                        price: rec.precioPromedio,
                        stock: rec.stockPromedio,
                        categoryName: rec.categoriaPredominante,
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-8 text-content-muted">
                <p>No se pudieron cargar las recomendaciones. ¿Está el backend corriendo?</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-surface relative z-10 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              whileHover={{ y: -10 }}
              className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-surface-muted border border-surface-border"
            >
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Box size={32} />
              </div>
              <h3 className="text-xl font-bold text-content-strong">Inventario en Tiempo Real</h3>
              <p className="text-content-muted">
                Sistema sincronizado para garantizar que siempre recibas lo que compras sin demoras.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-surface-muted border border-surface-border"
            >
              <div className="p-4 bg-secondary/10 rounded-full text-secondary">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-content-strong">Recomendaciones Ágiles</h3>
              <p className="text-content-muted">
                Nuestro motor ML en memoria te sugiere productos basados en tu perfil y necesidades.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-surface-muted border border-surface-border"
            >
              <div className="p-4 bg-status-success/10 rounded-full text-status-success">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-content-strong">Seguridad de Nivel B2B</h3>
              <p className="text-content-muted">
                Transacciones protegidas con encriptación JWT y tolerancia a fallos garantizada.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
