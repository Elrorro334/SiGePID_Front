'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    login('fake-jwt-token-12345', { id: 1, username, email: `${username}@test.com`, role: 'USER' });
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
      <div className="bg-surface border border-surface-border p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-content-strong mb-2 text-center">Bienvenido de nuevo</h1>
        <p className="text-content-muted text-center mb-6">Ingresa tus credenciales para continuar</p>
        
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
          <Button type="submit" className="w-full mt-2">Iniciar Sesión</Button>
        </form>

        <p className="text-center text-sm text-content-muted mt-6">
          ¿No tienes cuenta? <Link href="/register" className="text-primary font-medium hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
