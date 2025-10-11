import { Product } from '../models/Product.js';
import { Inventory } from '../models/Inventory.js';

export const InventoryController = {
  // Get inventory stats
  getInventoryStats: async (req, res) => {
    try {
      const stats = await Inventory.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get products with inventory information
  getProductsWithInventory: async (req, res) => {
    try {
      const { search, category, status } = req.query;
      const filters = {
        search,
        category,
        stockStatus: status
      };

      const products = await Inventory.getProductsWithInventory(filters);

      res.json({
        success: true,
        data: {
          products
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update product stock
  updateStock: async (req, res) => {
    try {
      const { id } = req.params; // This will be the product_id (e.g., PRD-006)
      const { quantityToAdd, reorderPoint } = req.body;

      // Find product by product_id
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Inventory.updateStock(id, parseInt(quantityToAdd) || 0, reorderPoint);

      // Get updated inventory data
      const updatedInventory = await Inventory.findByProductId(id);

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          ...product,
          ...updatedInventory
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};