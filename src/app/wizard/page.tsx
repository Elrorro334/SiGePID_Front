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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Brain size={20} />
          <span className="font-bold">Asistente Inteligente SiGePID</span>
        </div>
        <h1 className="text-4xl font-black text-content-strong mb-4">Descubre tu producto ideal</h1>
        <p className="text-content-muted text-lg mb-2">
          Deja que nuestra Inteligencia Artificial analice tus preferencias y encuentre el producto perfecto para ti en segundos.
        </p>
        <p className="text-xs text-content-muted/70 flex items-center justify-center gap-1">
          <Sparkles size={12} />
          Impulsado por el Modelo RodWiz1.0. Puede cometer errores, verifica las recomendaciones.
        </p>
      </div>

      <div className="bg-surface border border-surface-border p-8 md:p-12 rounded-3xl shadow-xl min-h-[400px] flex flex-col relative overflow-hidden">

        {/* Progress bar */}
        {!results && !loading && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex gap-2 mb-8 mt-2">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${i === step ? 'bg-primary/10 text-primary' : i < step ? 'bg-status-success/10 text-status-success' : 'text-content-muted'}`}>
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${i === step ? 'bg-primary text-white' : i < step ? 'bg-status-success text-white' : 'bg-surface-muted'}`}>{i < step ? '✓' : i + 1}</span>
                  {label}
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
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <Brain size={64} className="text-primary animate-pulse relative z-10" />
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-ping" />
              </div>
              <h2 className="text-2xl font-bold text-content-strong text-center">Analizando el catálogo...</h2>
              <p className="text-content-muted text-center max-w-sm">
                Evaluando nodos en nuestro árbol de decisión de Machine Learning.
              </p>
            </motion.div>

          ) : results ? (
            /* Result */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-8">
                <Sparkles size={40} className="text-status-warning mx-auto mb-4" />
                <h2 className="text-3xl font-black text-content-strong">{results.length > 1 ? '¡Matches Encontrados!' : '¡Match Encontrado!'}</h2>
                <p className="text-content-muted mt-1">
                  Basado en: {hasPreferences && profile ? (
                    <>
                      <span className="font-medium text-content">{profile.preferredCategories?.join(', ')}</span> ·{' '}
                      <span className="font-medium text-content">{profile.ageRange}</span> ·{' '}
                      <span className="font-medium text-content">{answers[0]}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-content">{answers[0]}</span> ·{' '}
                      <span className="font-medium text-content">{answers[1]}</span> ·{' '}
                      <span className="font-medium text-content">{answers[2]}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Product Cards Grid */}
              <div className={`w-full ${
                matchedProducts?.length === 1
                  ? 'flex justify-center'
                  : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              }`}>
                {matchedProducts?.length === 1 ? (
                  <div className="w-full max-w-sm">
                    <ProductCard product={matchedProducts[0]} />
                  </div>
                ) : (
                  matchedProducts?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
                {matchedProducts?.length === 0 && (
                  <div className="col-span-full text-center p-8 bg-surface-muted rounded-2xl border border-surface-border w-full">
                    <p className="text-content-muted">Lo sentimos, no encontramos productos en stock para estas recomendaciones.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 text-center">
                <Button variant="ghost" onClick={resetWizard}>
                  <RefreshCcw size={16} className="mr-2" /> Intentar con otras preferencias
                </Button>
              </div>
            </motion.div>

          ) : loadingOptions ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            /* Questions */
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-bold text-content-strong mb-2">
                {step === 0 && '¿Qué categoría de producto buscas?'}
                {step === 1 && '¿Cuál es tu rango de edad?'}
                {step === 2 && '¿Cuál es el uso previsto?'}
              </h2>
              <p className="text-content-muted mb-6 text-sm">
                Paso {step + 1} de 3 — Selecciona una opción para continuar
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentOptions.map(opt => (
                  <motion.button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border-2 border-surface-border text-left hover:border-primary hover:bg-primary/5 transition-all text-content-strong font-medium group"
                  >
                    <span className="group-hover:text-primary transition-colors">{opt}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
