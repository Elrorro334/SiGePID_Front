'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Box, ShieldCheck, Heart, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import { wizardApi, catalogApi, WizardResponse, ProductResponse } from '@/lib/api';

// Helper to generate a stable pseudo-random seed from the username
const getSeedFromUser = (username: string) => {
  if (!username) return 0;
  return username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const RANGOS_EDAD = ['Niños (0-12)', 'Adolescentes (13-17)', 'Adultos Jóvenes (18-35)', 'Adultos (36-55)', 'Adultos Mayores (55+)'];
const USOS_PREVISTO = ['Regalo', 'Uso Personal', 'Trabajo', 'Entretenimiento'];
const CATEGORIAS_BASE = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes'];

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<ProductResponse[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isMounted) return;

    setLoadingRecs(true);
    
    // Generar un perfil único para el usuario basado en su nombre
    const seed = getSeedFromUser(user?.username || 'default');
    const userRangoEdad = RANGOS_EDAD[seed % RANGOS_EDAD.length];
    const userUsoPrevisto = USOS_PREVISTO[seed % USOS_PREVISTO.length];

    const fetchRecommendationsAndMatch = async () => {
      try {
        // 1. Obtener predicciones del motor ML
        const results = await Promise.allSettled(
          CATEGORIAS_BASE.map(cat =>
            wizardApi.predict({
              categoria: cat,
              rangoEdad: userRangoEdad,
              usoPrevisto: userUsoPrevisto,
            })
          )
        );
        
        const predictedNames = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as PromiseFulfilledResult<{ data: WizardResponse }>).value.data.productoRecomendado.toLowerCase());

        // 2. Obtener productos reales del catálogo para tener imágenes e IDs verdaderos
        const { data: allProducts } = await catalogApi.getAllProducts();
        
        // 3. Emparejar predicciones con productos reales
        const matchedProducts: ProductResponse[] = [];
        const seenIds = new Set<string>();

        for (const predictedName of predictedNames) {
          const match = allProducts.find(p => p.name.toLowerCase().includes(predictedName) && !seenIds.has(p.id));
          if (match) {
            matchedProducts.push(match);
            seenIds.add(match.id);
          }
        }
        
        // Limitar a máximo 4 recomendaciones
        setRecommendations(matchedProducts.slice(0, 4));
      } catch (error) {
        console.error("Error cargando recomendaciones", error);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendationsAndMatch();
  }, [isAuthenticated, isMounted, user?.username]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-surface-muted py-24 px-4 sm:px-6 lg:px-8">
        
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.4, 0.3] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[100px]" 
          />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-surface-border text-primary font-medium shadow-sm mb-4 hover:shadow-md transition-shadow cursor-default">
              <Sparkles size={18} className="animate-pulse" />
              <span>Descubre tu estilo perfecto</span>
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-content-strong tracking-tight">
            Comprar nunca fue tan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary relative inline-block">
              fácil e intuitivo
              <motion.span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
            .
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-content-muted max-w-3xl mx-auto leading-relaxed">
            Te conocemos mejor que nadie. Nuestro asistente aprende de tus gustos para ofrecerte una experiencia de compra diseñada especialmente para ti.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/catalog" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg gap-2 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform duration-300">
                Ver todo el catálogo <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/wizard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-lg bg-surface/50 backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300">
                Ayúdame a elegir <Sparkles size={20} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ======================================================
          SECCIÓN PERSONALIZADA — Solo visible si está autenticado
      ====================================================== */}
      {isMounted && isAuthenticated && (
        <section className="py-20 bg-surface border-t border-surface-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner">
                  <Heart size={28} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-content-strong">
                    Especialmente para ti, {user?.username} 👋
                  </h2>
                  <p className="text-content-muted text-base mt-1">
                    Nuestro motor de IA ha seleccionado estos productos basándose en tu perfil único.
                  </p>
                </div>
              </div>
              <Link href="/wizard">
                <Button variant="outline" size="md" className="hover:border-primary hover:text-primary transition-colors">
                  <Sparkles size={16} className="mr-2" /> Descubrir más
                </Button>
              </Link>
            </motion.div>

            {loadingRecs ? (
              <div className="flex justify-center items-center h-48">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 text-content-muted"
                >
                  <Loader2 size={36} className="animate-spin text-primary" />
                  <span className="text-base font-medium">Buscando tus favoritos...</span>
                </motion.div>
              </div>
            ) : recommendations.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {recommendations.map((rec, i) => (
                  <motion.div key={rec.id} variants={itemVariants}>
                    <ProductCard product={rec} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 text-content-muted bg-surface-muted rounded-2xl border border-surface-border">
                <p className="text-lg">Pronto tendremos nuevas sorpresas para ti.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-surface relative z-10 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="flex flex-col items-center space-y-5 p-8 rounded-3xl bg-surface-muted/50 border border-surface-border shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <Box size={36} />
              </div>
              <h3 className="text-xl font-bold text-content-strong">Envíos Rápidos y Seguros</h3>
              <p className="text-content-muted leading-relaxed">
                Tu compra lista al instante. Garantizamos que los productos que ves están siempre disponibles para ti.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="flex flex-col items-center space-y-5 p-8 rounded-3xl bg-surface-muted/50 border border-surface-border shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary">
                <Brain size={36} />
              </div>
              <h3 className="text-xl font-bold text-content-strong">Asesoría Inteligente</h3>
              <p className="text-content-muted leading-relaxed">
                ¿No sabes qué elegir? Nuestro asistente virtual te guiará paso a paso hasta encontrar tu producto ideal.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="flex flex-col items-center space-y-5 p-8 rounded-3xl bg-surface-muted/50 border border-surface-border shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="p-4 bg-status-success/10 rounded-2xl text-status-success">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-xl font-bold text-content-strong">Compra 100% Protegida</h3>
              <p className="text-content-muted leading-relaxed">
                Tu tranquilidad es nuestra prioridad. Todas tus compras y datos personales están protegidos con la mejor seguridad.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
