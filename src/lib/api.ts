import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://sigepidback-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error("Error parsing auth state", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// ============================================================
// AUTH
// ============================================================
export interface LoginRequest { username: string; password: string; }
export interface RegisterRequest { username: string; email: string; password: string; role?: string; preferredCategories?: string[]; ageRange?: string; }
export interface AuthResponse { token: string; username: string; email: string; role: string; userId: number; }
export interface AuthProfileResponse { id: number; username: string; email: string; role: string; preferredCategories: string[] | null; ageRange: string | null; }
export interface UserPreferencesRequest { preferredCategories: string[]; ageRange: string; }

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', { ...data, role: data.role ?? 'USER' }),
  getProfile: () =>
    api.get<AuthProfileResponse>('/auth/profile'),
  updateEmail: (newEmail: string) => api.put<AuthProfileResponse>('/auth/profile/email', { newEmail }),
  updatePreferences: (data: UserPreferencesRequest) =>
    api.put<AuthProfileResponse>('/auth/profile/preferences', data),
};

// ============================================================
// CATALOG — CATEGORIES
// ============================================================
export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export const categoriesApi = {
  getAllCategories: () =>
    api.get<CategoryResponse[]>('/catalog/categories'),
  getCategoryById: (id: string) =>
    api.get<CategoryResponse>(`/catalog/categories/${id}`),
  createCategory: (data: CategoryRequest) =>
    api.post<CategoryResponse>('/catalog/categories', data),
  updateCategory: (id: string, data: CategoryRequest) =>
    api.put<CategoryResponse>(`/catalog/categories/${id}`, data),
  deleteCategory: (id: string) =>
    api.delete<void>(`/catalog/categories/${id}`),
};

// ============================================================
// CATALOG — PRODUCTS
// ============================================================
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string | null;
  active: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  active: boolean;
}

export const catalogApi = {
  getAllProducts: () =>
    api.get<ProductResponse[]>('/catalog/products'),
  getProductById: (id: string) =>
    api.get<ProductResponse>(`/catalog/products/${id}`),
  getLowStockProducts: (threshold = 10) =>
    api.get<ProductResponse[]>(`/catalog/products/low-stock?threshold=${threshold}`),
  createProduct: (data: ProductRequest) =>
    api.post<ProductResponse>('/catalog/products', data),
  updateProduct: (id: string, data: ProductRequest) =>
    api.put<ProductResponse>(`/catalog/products/${id}`, data),
  deleteProduct: (id: string) =>
    api.delete<void>(`/catalog/products/${id}`),
};

// ============================================================
// WIZARD ML
// ============================================================
export interface WizardRequest {
  categoria: string;
  rangoEdad: string;
  usoPrevisto: string;
}

export interface WizardResponse {
  productoRecomendado: string;
  descripcion: string;
  precioPromedio: number;
  precioMin: number;
  precioMax: number;
  stockPromedio: number;
  categoriaPredominante: string;
  confianza: number;
}

export interface PersonalizedWizardResponse {
  ageRange: string;
  preferredCategories: string[];
  recommendations: WizardResponse[];
}

export interface WizardOptions {
  categorias: string[];
  rangosEdad: string[];
  usosPrevisto: string[];
}

export const wizardApi = {
  predict: (data: WizardRequest) =>
    api.post<WizardResponse>('/catalog/wizard', data),
  predictPersonalized: (usoPrevisto: string) =>
    api.get<PersonalizedWizardResponse>(`/catalog/wizard/personalized?usoPrevisto=${encodeURIComponent(usoPrevisto)}`),
  getOptions: () =>
    api.get<WizardOptions>('/catalog/wizard/options'),
};

// ============================================================
// ORDERS
// ============================================================
export interface OrderItemRequest { productId: string; productName: string; quantity: number; unitPrice: number; }
export interface OrderRequest { userId: string; userEmail: string; shippingAddress: string; items: OrderItemRequest[]; }

export interface OrderItemResponse { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number; }
export interface OrderResponse {
  id: number;
  userId: string;
  items: OrderItemResponse[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const ordersApi = {
  createOrder: (data: OrderRequest) =>
    api.post<OrderResponse>('/orders', data),
  getOrderById: (id: number) =>
    api.get<OrderResponse>(`/orders/${id}`),
  getOrdersByUserId: (userId: string) =>
    api.get<OrderResponse[]>(`/orders/user/${userId}`),
  getOrdersByStatus: (status: string) =>
    api.get<OrderResponse[]>(`/orders/status/${status}`),
  cancelOrder: (id: number) =>
    api.put<void>(`/orders/${id}/cancel`),
};

// ============================================================
// NOTIFICATIONS
// ============================================================
export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotificationsByUserId: (userId: string) =>
    api.get<NotificationResponse[]>(`/notifications/user/${userId}`),
  markAsRead: (id: string) =>
    api.put<void>(`/notifications/${id}/read`),
};
