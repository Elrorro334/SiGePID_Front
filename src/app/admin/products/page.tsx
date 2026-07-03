'use client';

import React, { useEffect, useState } from 'react';
import { catalogApi, categoriesApi, ProductResponse, ProductRequest, CategoryResponse } from '@/lib/api';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    stock: 0,
    categoryId: '',
    active: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        catalogApi.getAllProducts(),
        categoriesApi.getAllCategories()
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product?: ProductResponse) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        active: product.active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        stock: 0,
        categoryId: categories.length > 0 ? categories[0].id : '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await catalogApi.updateProduct(editingProduct.id, formData);
      } else {
        await catalogApi.createProduct(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product", error);
      alert("Error al guardar el producto");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await catalogApi.deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error("Error deleting product", error);
        alert("Error al eliminar el producto.");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-content-strong">Gestión de Productos</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-dark text-primary-content px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="bg-surface rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-surface-border">
                <th className="p-4 text-sm font-semibold text-content-strong">SKU</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Nombre</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Categoría</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Precio</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Stock</th>
                <th className="p-4 text-sm font-semibold text-content-strong">Estado</th>
                <th className="p-4 text-sm font-semibold text-content-strong text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-content-muted">Cargando...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-content-muted">No hay productos registrados</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-surface-border hover:bg-surface-muted/20 transition-colors">
                    <td className="p-4 text-sm text-content-muted">{product.sku}</td>
                    <td className="p-4 text-sm font-medium text-content-strong">{product.name}</td>
                    <td className="p-4 text-sm text-content-muted">{product.categoryName || 'N/A'}</td>
                    <td className="p-4 text-sm text-content-strong">${product.price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-content-muted">{product.stock}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.active ? 'bg-status-success/20 text-status-success' : 'bg-status-danger/20 text-status-danger'}`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface rounded-xl shadow-2xl w-full max-w-2xl border border-surface-border my-8"
            >
              <div className="flex justify-between items-center p-6 border-b border-surface-border sticky top-0 bg-surface z-10 rounded-t-xl">
                <h3 className="text-xl font-semibold text-content-strong">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={handleCloseModal} className="text-content-muted hover:text-content-strong transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-content mb-1">Nombre</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-content mb-1">Descripción</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-content mb-1">SKU</label>
                    <input 
                      type="text" 
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-content mb-1">Categoría</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    >
                      <option value="" disabled>Seleccione una categoría</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-content mb-1">Precio ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-content mb-1">Stock Inicial</label>
                    <input 
                      type="number" 
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      className="w-full p-3 rounded-lg bg-background border border-surface-border text-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center mt-2">
                    <input 
                      type="checkbox"
                      id="active-status"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="w-4 h-4 text-primary bg-background border-surface-border rounded focus:ring-primary/50"
                    />
                    <label htmlFor="active-status" className="ml-2 text-sm font-medium text-content">
                      Producto Activo (Visible en tienda)
                    </label>
                  </div>
                </div>
                
                <div className="pt-6 flex justify-end space-x-3 border-t border-surface-border mt-6">
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
