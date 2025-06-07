import React, { useState, useEffect } from 'react';
import { Search, Eye, Check, Trash2, X, Clock, User, Mail, Phone } from 'lucide-react';
import axios from 'axios';

interface LostItem {
  id: number;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  contactInfo: string;
  status: string;
  imageUrl: string;
}

export function LostFound() {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);

  const API_BASE_URL = 'http://localhost:8082/api/lost-items';

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get(API_BASE_URL);
        setLostItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch lost items');
        setLoading(false);
        console.error(err);
      }
    };

    fetchLostItems();
  }, []);

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${itemId}/status?status=${newStatus}`);
      setLostItems(lostItems.map(item =>
        item.id === itemId ? response.data : item
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (window.confirm("Are you sure you want to remove this post?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${itemId}`);
        setLostItems(lostItems.filter(item => item.id !== itemId));
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5763b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5763b]"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="unclaimed">Unclaimed</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
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
                  <p className="text-gray-600">{item.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === 'claimed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4 mr-2" />
                <span>{formatDate(item.createdAt)}</span>
              </div>
              
              {item.contactInfo && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="h-4 w-4 mr-2" />
                  <span>{item.contactInfo}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  {item.status === 'unclaimed' ? (
                    <button
                      onClick={() => handleStatusChange(item.id, 'claimed')}
                      className="p-2 rounded-full hover:bg-green-50 text-green-600"
                      title="Mark as Claimed"
                    >
                      <Check size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(item.id, 'unclaimed')}
                      className="p-2 rounded-full hover:bg-yellow-50 text-yellow-600"
                      title="Mark as Unclaimed"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-red-600"
                    title="Delete Post"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedItem.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-2 space-y-2">
                    {selectedItem.contactInfo && (
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedItem.contactInfo}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedItem.status === 'claimed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}