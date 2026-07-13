'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, RefreshCcw, ShoppingCart, TrendingUp, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { wizardApi, catalogApi, authApi, WizardResponse, WizardOptions, AuthProfileResponse, ProductResponse } from '@/lib/api';
import { ProductCard } from '@/components/ui/ProductCard';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

const STEP_LABELS = ['Categoría', 'Rango de Edad', 'Uso Previsto'];

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [results, setResults] = useState<WizardResponse[] | null>(null);
  const [matchedProducts, setMatchedProducts] = useState<ProductResponse[] | null>(null);
  const [profile, setProfile] = useState<AuthProfileResponse | null>(null);
  const [hasPreferences, setHasPreferences] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const [options, setOptions] = useState<WizardOptions>({
    categorias: [],
    rangosEdad: [],
    usosPrevisto: [],
  });
  const [answers, setAnswers] = useState<string[]>([]);

  // Cargar opciones dinámicas desde el backend
  useEffect(() => {
    wizardApi.getOptions()
      .then(res => setOptions(res.data))
      .catch(() => {
        // Fallback con las opciones estáticas si el backend no está disponible
        setOptions({
          categorias: ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes'],
          rangosEdad: ['Niños (0-12)', 'Adolescentes (13-17)', 'Adultos Jóvenes (18-35)', 'Adultos (36-55)', 'Adultos Mayores (55+)'],
          usosPrevisto: ['Regalo', 'Uso Personal', 'Trabajo', 'Entretenimiento'],
        });
      })
      .finally(() => setLoadingOptions(false));

    if (isAuthenticated) {
      authApi.getProfile()
        .then(res => {
          setProfile(res.data);
          if (res.data.preferredCategories && res.data.preferredCategories.length > 0 && res.data.ageRange) {
            setHasPreferences(true);
            setStep(2);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const currentOptions = [
    options.categorias,
    options.rangosEdad,
    options.usosPrevisto,
  ][step] ?? [];

  const handleSelect = async (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (step < 2) {
      setStep(s => s + 1);
    } else {
      // Último paso: llamar al backend
      setLoading(true);
      try {
        let mlResults: WizardResponse[] = [];
        if (hasPreferences) {
          const { data } = await wizardApi.predictPersonalized(value);
          mlResults = data.recommendations;
        } else {
          const { data } = await wizardApi.predict({
            categoria: newAnswers[0],
            rangoEdad: newAnswers[1],
            usoPrevisto: value,
          });
          mlResults = [data];
        }
        setResults(mlResults);

        // Map ML results to real catalog products
        const catalogRes = await catalogApi.getAllProducts();
        const catalog = catalogRes.data;
        const matches = mlResults.map(rec => {
          return catalog.find(p => p.name.toLowerCase().includes(rec.productoRecomendado.toLowerCase()));
        }).filter(Boolean) as ProductResponse[];
        
        setMatchedProducts(matches);
      } catch {
        toast.error('No se pudo conectar con el motor ML. ¿Está corriendo el backend?');
        resetWizard();
      } finally {
        setLoading(false);
      }
    }
  };

  const resetWizard = () => {
    setStep(hasPreferences ? 2 : 0);
    setResults(null);
    setMatchedProducts(null);
    setAnswers([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Ambient Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/20 px-5 py-2 rounded-full mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(var(--primary),0.2)]"
          >
            <Brain size={20} className="text-primary animate-pulse" />
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Asistente Inteligente SiGePID</span>
          </motion.div>
          <h1 className="text-5xl font-black text-content-strong mb-4 tracking-tight">Descubre tu producto ideal</h1>
          <p className="text-content-muted text-lg mb-2 max-w-2xl mx-auto">
            Deja que nuestra Inteligencia Artificial analice tus preferencias y encuentre el producto perfecto para ti en segundos.
          </p>
          <p className="text-xs text-content-muted/70 flex items-center justify-center gap-1 mt-4">
            <Sparkles size={12} className="text-status-warning" />
            Impulsado por el Modelo RodWiz1.0. Puede cometer errores, verifica las recomendaciones.
          </p>
        </motion.div>

        <motion.div 
          layout
          className="bg-white/80 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl min-h-[450px] flex flex-col relative overflow-hidden"
        >
          {/* Progress bar */}
          {!results && !loading && (
            <>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-surface-muted/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
              <div className="flex justify-between md:justify-center md:gap-8 mb-10 mt-2">
                {STEP_LABELS.map((label, i) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <motion.div 
                      layout
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                        i === step 
                          ? 'bg-gradient-to-tr from-primary to-secondary text-white scale-110 shadow-primary/30' 
                          : i < step 
                            ? 'bg-status-success text-white' 
                            : 'bg-surface-muted text-content-muted'
                      }`}
                    >
                      {i < step ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span> : i + 1}
                    </motion.div>
                    <span className={`text-xs font-semibold hidden sm:block transition-colors ${
                      i === step ? 'text-primary' : i < step ? 'text-status-success' : 'text-content-muted'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          <AnimatePresence mode="wait">
            {/* Loading */}
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary border-l-secondary"
                  />
                  <Brain size={48} className="text-primary relative z-10 animate-pulse" />
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-ping" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Analizando catálogo...</h2>
                  <p className="text-content-muted font-medium">Evaluando miles de opciones con IA.</p>
                </div>
              </motion.div>

            ) : results ? (
              /* Result */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="flex-1 flex flex-col"
              >
                <div className="text-center mb-10">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-block bg-status-warning/20 p-4 rounded-full mb-4"
                  >
                    <Sparkles size={40} className="text-status-warning" />
                  </motion.div>
                  <h2 className="text-4xl font-black text-content-strong tracking-tight">{results.length > 1 ? '¡Matches Encontrados!' : '¡Match Encontrado!'}</h2>
                  <p className="text-content-muted mt-2 text-lg">
                    Basado en: {hasPreferences && profile ? (
                      <>
                        <span className="font-bold text-primary">{profile.preferredCategories?.join(', ')}</span> ·{' '}
                        <span className="font-bold text-primary">{profile.ageRange}</span> ·{' '}
                        <span className="font-bold text-primary">{answers[0]}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-primary">{answers[0]}</span> ·{' '}
                        <span className="font-bold text-primary">{answers[1]}</span> ·{' '}
                        <span className="font-bold text-primary">{answers[2]}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Product Cards Grid */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`w-full ${
                  matchedProducts?.length === 1
                    ? 'flex justify-center'
                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                }`}>
                  {matchedProducts?.length === 1 ? (
                    <motion.div variants={itemVariants} className="w-full max-w-sm">
                      <ProductCard product={matchedProducts[0]} />
                    </motion.div>
                  ) : (
                    matchedProducts?.map((product) => (
                      <motion.div variants={itemVariants} key={product.id}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))
                  )}
                  {matchedProducts?.length === 0 && (
                    <motion.div variants={itemVariants} className="col-span-full text-center p-12 bg-surface-muted/50 rounded-3xl border border-surface-border w-full">
                      <p className="text-content-muted text-lg font-medium">Lo sentimos, no encontramos productos en stock para estas preferencias.</p>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-12 text-center"
                >
                  <Button variant="outline" size="lg" onClick={resetWizard} className="hover:bg-primary/5 border-2">
                    <RefreshCcw size={18} className="mr-2" /> Intentar con otras preferencias
                  </Button>
                </motion.div>
              </motion.div>

            ) : loadingOptions ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full" 
                />
              </div>
            ) : (
              /* Questions */
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex-1 flex flex-col justify-center"
              >
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-black text-content-strong mb-3 tracking-tight">
                    {step === 0 && '¿Qué categoría te interesa?'}
                    {step === 1 && '¿Para quién es el producto?'}
                    {step === 2 && '¿Qué uso le darás?'}
                  </h2>
                  <p className="text-content-muted font-medium">
                    Paso {step + 1} de 3 — Elige la opción que mejor te describa
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                  {currentOptions.map((opt, i) => (
                    <motion.button
                      key={opt}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                      onClick={() => handleSelect(opt)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative p-5 rounded-2xl bg-white border-2 border-surface-border text-left hover:border-primary shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 text-lg font-bold text-content-strong group-hover:text-primary transition-colors">{opt}</span>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          →
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
