import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import axios from 'axios';

interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  category: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    firstName: string;
    lastName: string;
  };
  status: string;
  imageUrl: string;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const API_BASE_URL = 'http://localhost:8082/api';

export function Marketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredItems(items.filter(item => item.category.id === selectedCategory));
    } else {
      setFilteredItems(items);
    }
  }, [selectedCategory, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/marketplace`);
      setItems(response.data);
      setFilteredItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch items');
      setLoading(false);
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleDeleteClick = (itemId: number) => {
    setSelectedItemId(itemId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedItemId) {
      try {
        await axios.delete(`${API_BASE_URL}/marketplace/${selectedItemId}`);
        fetchItems(); // Refresh the list
        setShowDeleteModal(false);
        setSelectedItemId(null);
      } catch (err) {
        setError('Failed to delete item');
        console.error(err);
      }
    }
  };

  const toggleStatus = async (itemId: number, newStatus: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/marketplace/${itemId}/status`, null, {
        params: { status: newStatus }
      });
      fetchItems(); // Refresh the list
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Items</h1>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mt-1">
                    {item.category.name}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <span>Posted by: {item.seller.firstName} {item.seller.lastName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#f5763b]">{item.price} MAD</span>
                    <span className="ml-2 text-gray-500">Qty: {item.quantity}</span>
                  </div>
                  <div className="flex space-x-2">
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => toggleStatus(item.id, 'approved')}
                          className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(item.id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      item.status === 'sold' ? 'bg-gray-100 text-gray-800' : 
                      item.status === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}