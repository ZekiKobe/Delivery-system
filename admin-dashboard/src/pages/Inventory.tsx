import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import * as businessService from '../services/businessService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { formatDate } from '../lib/utils';

interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  lastRestocked: string;
  cost: number;
  supplier?: string;
}

interface StockAlert {
  _id: string;
  product: {
    name: string;
  };
  type: 'low_stock' | 'out_of_stock' | 'expired';
  message: string;
  createdAt: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [alertsOnly, setAlertsOnly] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stock adjustment modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    operation: 'set' as 'set' | 'add' | 'subtract',
    reason: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchAlerts();
  }, [currentPage, searchTerm, alertsOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(alertsOnly && { alertsOnly: true }),
      };

      const response = await businessService.getInventory(params);
      setInventory(response.data.inventory);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await businessService.getInventoryAlerts();
      setAlerts(response.data.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const handleStockAdjustment = async () => {
    if (!adjustingItem) return;

    try {
      await businessService.updateStock(adjustingItem.product._id, stockAdjustment);
      setShowStockModal(false);
      setAdjustingItem(null);
      setStockAdjustment({ quantity: 0, operation: 'set', reason: '' });
      fetchInventory();
    } catch (err) {
      console.error('Failed to update stock:', err);
      setError('Failed to update stock. Please try again.');
    }
  };

  const openStockModal = (item: InventoryItem) => {
    setAdjustingItem(item);
    setStockAdjustment({
      quantity: item.currentStock,
      operation: 'set',
      reason: ''
    });
    setShowStockModal(true);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.isOutOfStock) return { text: 'Out of Stock', variant: 'danger' as const };
    if (item.isLowStock) return { text: 'Low Stock', variant: 'warning' as const };
    return { text: 'In Stock', variant: 'success' as const };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track stock levels and manage inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Stock Alerts ({alerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert._id} className="text-sm text-yellow-700">
                <span className="font-medium">{alert.product.name}:</span> {alert.message}
              </div>
            ))}
            {alerts.length > 3 && (
              <p className="text-sm text-yellow-600">
                +{alerts.length - 3} more alerts
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div></div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={alertsOnly}
                onChange={(e) => setAlertsOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show alerts only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Levels
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Restocked
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map((item) => {
              const status = getStockStatus(item);
              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={item.product.images[0]}
                            alt={item.product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">N/A</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {item.currentStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      Min: {item.minStockLevel} / Max: {item.maxStockLevel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={status.variant}>
                      {status.text}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastRestocked ? formatDate(item.lastRestocked) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => openStockModal(item)}
                        size="sm"
                        variant="outline"
                      >
                        Adjust Stock
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {showStockModal && adjustingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{adjustingItem.product.name}</h3>
                  <p className="text-sm text-gray-500">Current stock: {adjustingItem.currentStock}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation
                  </label>
                  <select
                    value={stockAdjustment.operation}
                    onChange={(e) => setStockAdjustment(prev => ({
                      ...prev,
                      operation: e.target.value as 'set' | 'add' | 'subtract'
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="set">Set to</option>
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={stockAdjustment.quantity}
                    onChange={(e) => setStockAdjustment(prev => ({
                      ...prev,
                      quantity: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={stockAdjustment.reason}
                    onChange={(e) => setStockAdjustment(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reason for adjustment..."
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {stockAdjustment.operation === 'set' && (
                      <>New stock level: <strong>{stockAdjustment.quantity}</strong></>
                    )}
                    {stockAdjustment.operation === 'add' && (
                      <>New stock level: <strong>{adjustingItem.currentStock + stockAdjustment.quantity}</strong></>
                    )}
                    {stockAdjustment.operation === 'subtract' && (
                      <>New stock level: <strong>{Math.max(0, adjustingItem.currentStock - stockAdjustment.quantity)}</strong></>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => {
                    setShowStockModal(false);
                    setAdjustingItem(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button onClick={handleStockAdjustment}>
                  Update Stock
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
