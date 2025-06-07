import { Users, MessageSquare, Trophy, Building2, ShoppingBag, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Type pour les statistiques
type StatItem = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
};

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function Dashboard() {
  // État initial des statistiques
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Total Users', value: '', icon: Users, color: 'bg-blue-500', loading: true },
    { label: 'Student Events', value: '', icon: MessageSquare, color: 'bg-green-500', loading: true },
    { label: 'Admin Events', value: '', icon: Trophy, color: 'bg-purple-500', loading: true },
    { label: 'Total Bookings', value: '', icon: Building2, color: 'bg-yellow-500', loading: true },
    { label: 'Marketplace Items', value: '', icon: ShoppingBag, color: 'bg-pink-500', loading: true },
    { label: 'Today\'s Transactions', value: '', icon: Receipt, color: 'bg-indigo-500', loading: true }
  ]);

  // État pour les données des graphiques
  const [bookingStatusData, setBookingStatusData] = useState<{name: string, value: number}[]>([]);
  const [transactionStatusData, setTransactionStatusData] = useState<{name: string, value: number}[]>([]);

  // Charger toutes les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les statistiques principales
        const userCount = await fetch('http://localhost:8082/api/users/count').then(res => res.json());
        const studentEvents = await fetch('http://localhost:8082/api/events/count/student').then(res => res.json());
        const adminEvents = await fetch('http://localhost:8082/api/events/count/admin').then(res => res.json());
        const bookingsCount = await fetch('http://localhost:8082/api/reservations/count').then(res => res.json());
        const marketplaceCount = await fetch('http://localhost:8082/api/marketplace/count').then(res => res.json());
        const todayTransactions = await fetch('http://localhost:8082/api/transactions/count/today').then(res => res.json());

        setStats([
          { label: 'Total Users', value: userCount, icon: Users, color: 'bg-blue-500' },
          { label: 'Student Events', value: studentEvents, icon: MessageSquare, color: 'bg-green-500' },
          { label: 'Admin Events', value: adminEvents, icon: Trophy, color: 'bg-purple-500' },
          { label: 'Total Bookings', value: bookingsCount, icon: Building2, color: 'bg-yellow-500' },
          { label: 'Marketplace Items', value: marketplaceCount, icon: ShoppingBag, color: 'bg-pink-500' },
          { label: 'Today\'s Transactions', value: todayTransactions, icon: Receipt, color: 'bg-indigo-500' }
        ]);

        // Récupérer les données pour les graphiques
        const approvedBookings = await fetch('http://localhost:8082/api/reservations/count/approved').then(res => res.json());
        const completedBookings = await fetch('http://localhost:8082/api/reservations/count/completed').then(res => res.json());
        const rejectedBookings = await fetch('http://localhost:8082/api/reservations/count/rejected').then(res => res.json());

        setBookingStatusData([
          { name: 'Approved', value: approvedBookings },
          { name: 'Completed', value: completedBookings },
          { name: 'Rejected', value: rejectedBookings }
        ]);

        const completedTransactions = await fetch('http://localhost:8082/api/transactions/count/today/completed').then(res => res.json());
        const pendingTransactions = await fetch('http://localhost:8082/api/transactions/count/today/pending').then(res => res.json());
        const failedTransactions = await fetch('http://localhost:8082/api/transactions/count/today/failed').then(res => res.json());

        setTransactionStatusData([
          { name: 'Completed', value: completedTransactions },
          { name: 'Pending', value: pendingTransactions },
          { name: 'Failed', value: failedTransactions }
        ]);

      } catch (error) {
        console.error('Error fetching data:', error);
        // Gérer les erreurs (peut-être afficher un message à l'utilisateur)
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Section des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4"
          >
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              {stat.loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Section inférieure avec graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des statuts de réservation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h2>
          <div className="h-80">
            {bookingStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* Graphique des statuts de transaction */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Transactions by Status</h2>
          <div className="h-80">
            {transactionStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transactionStatusData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Count">
                    {transactionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}