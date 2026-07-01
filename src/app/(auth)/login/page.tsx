'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await authApi.login({ username, password });
      login(data.token, {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      toast.success(`¡Bienvenido, ${data.username}!`);
      router.push('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        toast.error('Credenciales incorrectas. Intenta de nuevo.');
      } else {
        toast.error('No se pudo conectar con el servidor.');
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
            <LogIn size={28} />
          </div>
          <h1 className="text-2xl font-bold text-content-strong">Bienvenido de nuevo</h1>
          <p className="text-content-muted text-center mt-1">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Usuario"
            placeholder="rodrigo"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
            Iniciar Sesión
          </Button>
        </form>

        <p className="text-center text-sm text-content-muted mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
