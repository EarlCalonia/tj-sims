const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Product API functions
export const productAPI = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All Categories' && value !== 'All Brand' && value !== 'All Status') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: productData, // FormData will set the correct Content-Type
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: productData, // FormData will set the correct Content-Type
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/products/categories`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get brands
  getBrands: async () => {
    const response = await fetch(`${API_BASE_URL}/products/brands`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },
};

// Sales API functions
export const salesAPI = {
  // Create a new sale
  createSale: async (saleData) => {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get all sales with optional filters
  getSales: async (filters = {}) => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/sales${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      credentials: 'include'
    });
    const result = await handleResponse(response);

    // Backend returns { success: true, data: { sales: [], pagination: {} } }
    // Extract the sales array from the response
    return result.data?.sales || [];
  },

  // Get sales statistics
  getSalesStats: async (dateFrom, dateTo) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/sales/stats${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get sale by ID
  getSaleById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get sale items
  getSaleItems: async (saleId) => {
    const response = await fetch(`${API_BASE_URL}/sales/${saleId}/items`, {
      credentials: 'include'
    });
    const result = await handleResponse(response);

    // Backend returns { success: true, data: items[] }
    // Extract the items array from the response
    return result.data || [];
  },

  // Update sale
  updateSale: async (id, saleData) => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Delete sale
  deleteSale: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return handleResponse(response);
  },
};

// Inventory API functions
export const inventoryAPI = {
  // Get products with inventory information
  getProductsWithInventory: async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/products`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/stats`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Update product stock
  updateStock: async (productId, quantity, reorderPoint = null) => {
    const response = await fetch(`${API_BASE_URL}/inventory/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity, reorderPoint }),
      credentials: 'include'
    });
    return handleResponse(response);
  },
};

// Health check
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error('Backend server is not running. Please start the backend server first.');
  }
};
