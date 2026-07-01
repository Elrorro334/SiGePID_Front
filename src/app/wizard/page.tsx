'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, RefreshCcw, ShoppingCart, TrendingUp, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { wizardApi, WizardResponse, WizardOptions } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

const STEP_LABELS = ['Categoría', 'Rango de Edad', 'Uso Previsto'];

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [result, setResult] = useState<WizardResponse | null>(null);
  const [options, setOptions] = useState<WizardOptions>({
    categorias: [],
    rangosEdad: [],
    usosPrevisto: [],
  });
  const [answers, setAnswers] = useState<string[]>([]);
  const addItem = useCartStore(state => state.addItem);

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
  }, []);

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
        const { data } = await wizardApi.predict({
          categoria: newAnswers[0],
          rangoEdad: newAnswers[1],
          usoPrevisto: newAnswers[2],
        });
        setResult(data);
      } catch {
        toast.error('No se pudo conectar con el motor ML. ¿Está corriendo el backend?');
        resetWizard();
      } finally {
        setLoading(false);
      }
    }
  };

  const resetWizard = () => {
    setStep(0);
    setResult(null);
    setAnswers([]);
  };

  const handleAddToCart = () => {
    if (!result) return;
    addItem({
      productId: `wizard-${result.productoRecomendado.toLowerCase().replace(/\s+/g, '-')}`,
      name: result.productoRecomendado,
      price: result.precioPromedio,
      quantity: 1,
    });
    toast.success(`${result.productoRecomendado} agregado al carrito`, {
      icon: '🛒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
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
        <p className="text-content-muted text-lg">
          Nuestro motor de árbol de decisión analiza tus respuestas para darte la mejor recomendación del catálogo.
        </p>
      </div>

      <div className="bg-surface border border-surface-border p-8 md:p-12 rounded-3xl shadow-xl min-h-[400px] flex flex-col relative overflow-hidden">

        {/* Progress bar */}
        {!result && !loading && (
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

          ) : result ? (
            /* Result */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-8">
                <Sparkles size={40} className="text-status-warning mx-auto mb-4" />
                <h2 className="text-3xl font-black text-content-strong">¡Match Encontrado!</h2>
                <p className="text-content-muted mt-1">
                  Basado en: <span className="font-medium text-content">{answers[0]}</span> ·{' '}
                  <span className="font-medium text-content">{answers[1]}</span> ·{' '}
                  <span className="font-medium text-content">{answers[2]}</span>
                </p>
              </div>

              {/* Product Card */}
              <div className="max-w-sm mx-auto w-full bg-surface-muted border border-surface-border rounded-2xl overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                  <Package size={64} className="text-primary/30" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-black text-content-strong">{result.productoRecomendado}</h3>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      {Math.round(result.confianza * 100)}% Match
                    </span>
                  </div>
                  <p className="text-content-muted text-sm mb-4">{result.descripcion}</p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-surface rounded-lg p-3 border border-surface-border">
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1">
                        <Tag size={12} /> Precio promedio
                      </div>
                      <div className="font-bold text-content-strong text-base">
                        ${result.precioPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-content-muted mt-0.5">
                        ${result.precioMin.toLocaleString('es-MX', { minimumFractionDigits: 0 })} – ${result.precioMax.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div className="bg-surface rounded-lg p-3 border border-surface-border">
                      <div className="flex items-center gap-1.5 text-content-muted text-xs mb-1">
                        <TrendingUp size={12} /> Stock estimado
                      </div>
                      <div className="font-bold text-content-strong text-base">
                        ~{result.stockPromedio} uds.
                      </div>
                      <div className="text-xs text-status-success mt-0.5 font-medium">Disponible</div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleAddToCart}>
                    <ShoppingCart size={16} className="mr-2" /> Agregar al carrito
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center">
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
