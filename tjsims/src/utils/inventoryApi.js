const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Inventory API functions
export const inventoryAPI = {
  // Get inventory statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/stats`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Get products with inventory information
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/inventory/products?${params}`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Update product stock
  updateStock: async (productId, data) => {
    const response = await fetch(`${API_BASE_URL}/inventory/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  // Bulk stock in for multiple products
  bulkStockIn: async (data) => {
    const response = await fetch(`${API_BASE_URL}/inventory/bulk-stock-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  }
};