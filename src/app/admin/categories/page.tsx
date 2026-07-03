'use client';

import React, { useEffect, useState } from 'react';
import { categoriesApi, CategoryResponse, CategoryRequest } from '@/lib/api';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  
  const [formData, setFormData] = useState<CategoryRequest>({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAllCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: CategoryResponse) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, formData);
      } else {
        await categoriesApi.createCategory(formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category", error);
      alert("Error al guardar la categoría");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      try {
        await categoriesApi.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
        alert("Error al eliminar. Verifica que no tenga productos asociados.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-content-strong">Gestión de Categorías</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-dark text-primary-content px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-surface-border">
                <th className="p-4 text-sm font-semibold text-content-strong">ID</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Nombre</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Descripción</th>
                <th className="p-4 text-sm font-semibold text-content-strong text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-content-muted">Cargando...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-content-muted">No hay categorías registradas</td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-surface-border hover:bg-surface-muted/20 transition-colors">
                    <td className="p-4 text-sm text-content-muted">{category.id}</td>
                    <td className="p-4 text-sm font-medium text-content-strong">{category.name}</td>
                    <td className="p-4 text-sm text-content-muted">{category.description}</td>
                    <td className="p-4 flex justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(category)}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-border"
            >
              <div className="flex justify-between items-center p-6 border-b border-surface-border">
                <h3 className="text-xl font-semibold text-content-strong">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button onClick={handleCloseModal} className="text-content-muted hover:text-content-strong transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-content mb-1">Nombre</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="Ej. Laptops"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-content mb-1">Descripción</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                    placeholder="Breve descripción..."
                  />
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-content font-medium hover:bg-surface-muted rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-primary-content font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Check size={18} />
                    <span>Guardar</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
