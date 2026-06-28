'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';

const mockRecommendation = {
  id: '1',
  name: 'MacBook Pro 16"',
  description: 'Basado en tus requerimientos de alto rendimiento y portabilidad, esta es la mejor opción (Match 98%).',
  price: 45000,
  stock: 5,
  category: { id: 'c1', name: 'Electrónicos' }
};

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleNext = () => {
    if (step === 2) {
      setLoading(true);
      // Simulate ML Backend delay
      setTimeout(() => {
        setLoading(false);
        setResult(mockRecommendation);
      }, 2500);
    } else {
      setStep(s => s + 1);
    }
  };

  const resetWizard = () => {
    setStep(0);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <Brain size={20} />
          <span className="font-bold">Asistente Inteligente SiGePID</span>
        </div>
        <h1 className="text-4xl font-black text-content-strong mb-4">Descubre tu producto ideal</h1>
        <p className="text-content-muted text-lg">Nuestro motor de ML analizará tus respuestas para darte la mejor recomendación del catálogo.</p>
      </div>

      <div className="bg-surface border border-surface-border p-8 md:p-12 rounded-3xl shadow-xl min-h-[400px] flex flex-col relative overflow-hidden">
        
        {/* Progress bar */}
        {!result && !loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-surface-muted">
            <motion.div 
              className="h-full bg-primary" 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
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
              <p className="text-content-muted text-center max-w-sm">Evaluando miles de nodos en nuestro árbol de decisión de Machine Learning.</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-8">
                <Sparkles size={40} className="text-status-warning mx-auto mb-4" />
                <h2 className="text-3xl font-black text-content-strong">¡Match Encontrado!</h2>
                <p className="text-content-muted">Esta es la recomendación óptima para tu perfil.</p>
              </div>
              <div className="max-w-sm mx-auto w-full">
                <ProductCard product={result} />
              </div>
              <div className="mt-8 text-center">
                <Button variant="ghost" onClick={resetWizard}>
                  <RefreshCcw size={16} className="mr-2" /> Intentar de nuevo
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {step === 0 && (
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-content-strong mb-6">¿Para qué necesitas el producto principalmente?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Trabajo / Productividad', 'Gaming y Entretenimiento', 'Diseño y Creatividad', 'Uso casual'].map(opt => (
                      <button key={opt} onClick={handleNext} className="p-4 rounded-xl border-2 border-surface-border text-left hover:border-primary hover:bg-primary/5 transition-all text-content-strong font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {step === 1 && (
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-content-strong mb-6">¿Cuál es tu rango de presupuesto ideal?</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {['Menos de $5,000 MXN', '$5,000 - $15,000 MXN', '$15,000 - $30,000 MXN', 'Sin límite (Quiero lo mejor)'].map(opt => (
                      <button key={opt} onClick={handleNext} className="p-4 rounded-xl border-2 border-surface-border text-left hover:border-primary hover:bg-primary/5 transition-all text-content-strong font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-content-strong mb-6">¿Qué característica valoras más?</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {['Potencia / Rendimiento bruto', 'Durabilidad y Garantía', 'Portabilidad y Diseño', 'Relación Calidad-Precio'].map(opt => (
                      <button key={opt} onClick={handleNext} className="p-4 rounded-xl border-2 border-surface-border text-left hover:border-primary hover:bg-primary/5 transition-all text-content-strong font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
