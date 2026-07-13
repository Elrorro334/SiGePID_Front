'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi, wizardApi, WizardOptions } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState('');
  const [options, setOptions] = useState<WizardOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const router = useRouter();

  useEffect(() => {
    wizardApi.getOptions().then(res => setOptions(res.data)).catch(() => {});
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 1. Registrar usuario
      await authApi.register({ 
        username, 
        email, 
        password,
        ...(preferredCategories.length > 0 ? { preferredCategories } : {}),
        ...(ageRange ? { ageRange } : {})
      });
      
      // 2. Iniciar sesión automáticamente
      const { data } = await authApi.login({ username, password });
      login(data.token, {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      
      toast.success(`¡Cuenta creada con éxito, ${data.username}!`);
      router.push('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400 || status === 409) {
        toast.error('El usuario o correo ya está en uso. Intenta con otro.');
      } else {
        toast.error('Ocurrió un error al crear la cuenta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="bg-surface border border-surface-border p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-primary/10 rounded-full text-primary mb-3">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-content-strong">Crea tu cuenta</h1>
          <p className="text-content-muted text-center mt-1">Únete para recibir recomendaciones personalizadas</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Usuario"
            placeholder="rodrigo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="rodrigo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {options && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-content-strong">Categorías Preferidas (Opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {options.categorias.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setPreferredCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${preferredCategories.includes(cat) ? 'bg-primary text-white border-primary' : 'bg-surface-muted text-content-muted border-surface-border hover:border-primary'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-content-strong">Rango de Edad (Opcional)</label>
                <select
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full bg-surface border border-surface-border text-content-strong rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="">Seleccionar...</option>
                  {options.rangosEdad.map(rango => (
                    <option key={rango} value={rango}>{rango}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Crear Cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-content-muted mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
