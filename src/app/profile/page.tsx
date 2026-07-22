'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi, AuthProfileResponse, wizardApi, WizardOptions } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { User, Mail, Shield, LogOut, Edit2, Check, X, Star, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [profile, setProfile] = useState<AuthProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState('');
  const [options, setOptions] = useState<WizardOptions | null>(null);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  useEffect(() => {
    wizardApi.getOptions().then(res => setOptions(res.data)).catch(() => { });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await authApi.getProfile();
        setProfile(data);
        setNewEmail(data.email);
        setPreferredCategories(data.preferredCategories || []);
        setAgeRange(data.ageRange || '');
      } catch (err: any) {
        console.error("Profile load error:", err);
        if (err?.response?.status === 401 || err?.response?.status === 403 || err?.response?.status === 500) {
          setError('Tu sesión no es válida o ha expirado. Por favor vuelve a iniciar sesión.');
          logout();
        } else {
          setError('No se pudo cargar el perfil');
        }
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

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === profile?.email) {
      setIsEditingEmail(false);
      return;
    }

    setIsUpdating(true);
    try {
      const { data } = await authApi.updateEmail(newEmail);
      setProfile(data);
      setIsEditingEmail(false);
      toast.success('Correo actualizado exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar el correo');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePreferences = async () => {
    if (preferredCategories.length === 0 || !ageRange) {
      toast.error('Selecciona al menos una categoría y tu rango de edad');
      return;
    }

    setIsUpdatingPreferences(true);
    try {
      const { data } = await authApi.updatePreferences({ preferredCategories, ageRange });
      setProfile(data);
      setIsEditingPreferences(false);
      toast.success('Preferencias actualizadas exitosamente');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar las preferencias');
    } finally {
      setIsUpdatingPreferences(false);
    }
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
      <div className="container mx-auto px-4 py-12 text-center max-w-md">
        <div className="bg-surface border border-surface-border rounded-2xl p-8 shadow-sm">
          <p className="text-status-danger font-semibold mb-6">{error || 'Perfil no encontrado'}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>Volver al inicio</Button>
            <Button onClick={() => { logout(); router.push('/login'); }}>Iniciar sesión</Button>
          </div>
        </div>
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
          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-surface-border">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm text-content-muted">Correo Electrónico</p>
                {isEditingEmail ? (
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-surface border border-surface-border rounded px-2 py-1 mt-1 text-content-strong focus:outline-none focus:border-primary"
                    disabled={isUpdating}
                  />
                ) : (
                  <p className="font-medium text-content-strong">{profile.email}</p>
                )}
              </div>
            </div>
            <div>
              {isEditingEmail ? (
                <div className="flex items-center space-x-2">
                  <button onClick={handleUpdateEmail} disabled={isUpdating} className="p-2 bg-status-success text-white rounded hover:bg-green-600 transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setIsEditingEmail(false); setNewEmail(profile.email); }} disabled={isUpdating} className="p-2 bg-surface-muted text-content-strong rounded hover:bg-surface-border transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditingEmail(true)} className="p-2 bg-surface-muted text-content-strong rounded hover:bg-surface-border transition-colors">
                  <Edit2 size={16} />
                </button>
              )}
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

          {/* Preferences Section */}
          <div className="flex items-start justify-between p-4 rounded-xl bg-background border border-surface-border">
            <div className="flex items-start space-x-4 w-full">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
                <Star size={24} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-content-strong">Preferencias (Recomendaciones ML)</p>
                  {isEditingPreferences ? (
                    <div className="flex items-center space-x-2">
                      <button onClick={handleUpdatePreferences} disabled={isUpdatingPreferences} className="p-2 bg-status-success text-white rounded hover:bg-green-600 transition-colors">
                        <Check size={16} />
                      </button>
                      <button onClick={() => { setIsEditingPreferences(false); setPreferredCategories(profile?.preferredCategories || []); setAgeRange(profile?.ageRange || ''); }} disabled={isUpdatingPreferences} className="p-2 bg-surface-muted text-content-strong rounded hover:bg-surface-border transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setIsEditingPreferences(true)} className="p-2 bg-surface-muted text-content-strong rounded hover:bg-surface-border transition-colors">
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>

                {isEditingPreferences && options ? (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-content-strong">Categorías Preferidas</label>
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
                      <label className="block text-sm font-medium text-content-strong">Rango de Edad</label>
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
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {profile?.preferredCategories && profile.preferredCategories.length > 0 && profile.ageRange ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {profile.preferredCategories.map(cat => (
                            <span key={cat} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">{cat}</span>
                          ))}
                        </div>
                        <p className="text-sm text-content-muted mt-2">Edad: {profile.ageRange}</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 p-3 mt-2 bg-status-warning/10 rounded-lg border border-status-warning/30">
                        <AlertTriangle size={16} className="text-status-warning" />
                        <span className="text-sm text-content-strong">Configura tus preferencias para obtener recomendaciones personalizadas.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
