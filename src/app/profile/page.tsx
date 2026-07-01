'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi, AuthProfileResponse } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<AuthProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await authApi.getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">{error || 'Perfil no encontrado'}</p>
        <Button onClick={() => router.push('/')}>Volver al inicio</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-primary/10 p-8 flex flex-col items-center justify-center border-b border-surface-border">
          <div className="bg-primary text-primary-foreground w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold mb-4">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-content-strong">{profile.username}</h1>
          <p className="text-content-muted mt-1 text-lg">Perfil de Usuario</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-background border border-surface-border">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-content-muted">ID de Usuario</p>
              <p className="font-medium text-content-strong">{profile.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-background border border-surface-border">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm text-content-muted">Correo Electrónico</p>
              <p className="font-medium text-content-strong">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-background border border-surface-border">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-sm text-content-muted">Rol</p>
              <p className="font-medium text-content-strong capitalize">{profile.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0 flex justify-end">
          <Button variant="outline" onClick={handleLogout} className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900">
            <LogOut size={18} className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
