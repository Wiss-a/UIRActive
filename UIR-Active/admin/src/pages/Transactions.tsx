import { useState, useEffect } from 'react';
import { Download, Search, Eye, Calendar, FileText, X } from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: number;
  item: {
    id: number;
    title: string;
  };
  buyer: {
    id: number;
    firstName: string;
    lastName: string;
  };
  seller: {
    id: number;
    firstName: string;
    lastName: string;
  };
  transactionDate: string;
  quantity: number;
  status: 'completed' | 'pending' | 'failed';
  price: number;
}

const API_BASE_URL = 'http://localhost:8082/api';

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/transactions`);
      setTransactions(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch transactions');
      setLoading(false);
      console.error(err);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      `${transaction.buyer.firstName} ${transaction.buyer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${transaction.seller.firstName} ${transaction.seller.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.item.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const transactionDate = new Date(transaction.transactionDate);
    const isAfterStart = !startDate || transactionDate >= new Date(startDate);
    const isBeforeEnd = !endDate || transactionDate <= new Date(endDate);

    return matchesSearch && isAfterStart && isBeforeEnd;
  });

  const handleExportCSV = () => {
    const headers = ["Date", "Buyer", "Seller", "Item", "Price (MAD)", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => [
        new Date(t.transactionDate).toLocaleDateString(),
        `${t.buyer.firstName} ${t.buyer.lastName}`,
        `${t.seller.firstName} ${t.seller.lastName}`,
        t.item.title,
        t.price,
        t.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <FileText className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5763b]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5763b]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-[#f5763b] text-white rounded-lg hover:bg-[#f5763b]/90 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by buyer, seller, or item..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5763b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.transactionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.buyer.firstName} {transaction.buyer.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.seller.firstName} {transaction.seller.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#f5763b]">{transaction.price} MAD</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="text-[#f5763b] hover:text-[#d45d28]"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTransaction.transactionDate)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Buyer</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTransaction.buyer.firstName} {selectedTransaction.buyer.lastName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Seller</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTransaction.seller.firstName} {selectedTransaction.seller.lastName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Item</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.item.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.quantity}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Price</h3>
                      <p className="mt-1 text-lg font-bold text-[#f5763b]">{selectedTransaction.price} MAD</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedTransaction.status}
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