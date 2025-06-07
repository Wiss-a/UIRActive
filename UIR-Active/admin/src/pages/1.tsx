import { Users, MessageSquare, Trophy, Building2, ShoppingBag, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';

// Type pour les statistiques
type StatItem = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
};

export function Dashboard() {
  // État initial des statistiques
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Total Users', value: '', icon: Users, color: 'bg-blue-500', loading: true },
    { label: 'Total Posts', value: '', icon: MessageSquare, color: 'bg-green-500', loading: true },
    { label: 'Upcoming Events', value: '', icon: Trophy, color: 'bg-purple-500', loading: true },
    { label: 'Venue Bookings', value: '', icon: Building2, color: 'bg-yellow-500', loading: true },
    { label: 'Marketplace Items', value: '', icon: ShoppingBag, color: 'bg-pink-500', loading: true },
    { label: 'Today\'s Transactions', value: '', icon: Receipt, color: 'bg-indigo-500', loading: true }
  ]);

  // État pour les activités récentes
  const [recentActivities, setRecentActivities] = useState<Array<{
    title: string;
    time: string;
  }> | null>(null);

  // Simuler le chargement des données (à remplacer par vos appels API)
  useEffect(() => {
    const fetchData = async () => {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ici vous ferez vos appels API réels
      // Exemple :
      // const statsData = await fetch('/api/stats').then(res => res.json());
      
      // Pour l'exemple, nous utilisons des données simulées
      /*setStats([
        { label: 'Total Users', value: '2,345', icon: Users, color: 'bg-blue-500' },
        { label: 'Active Posts', value: '156', icon: MessageSquare, color: 'bg-green-500' },
        { label: 'Upcoming Events', value: '8', icon: Trophy, color: 'bg-purple-500' },
        { label: 'Venue Bookings', value: '42', icon: Building2, color: 'bg-yellow-500' },
        { label: 'Marketplace Items', value: '89', icon: ShoppingBag, color: 'bg-pink-500' },
        { label: 'Today\'s Transactions', value: '12', icon: Receipt, color: 'bg-indigo-500' }
      ]);*/

      /*setRecentActivities([
        { title: 'New user registration', time: '2 minutes ago' },
        { title: 'Event created: Football Tournament', time: '15 minutes ago' },
        { title: 'Venue booking confirmed', time: '1 hour ago' }
      ]);*/
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

      {/* Section inférieure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          {recentActivities === null ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 py-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-[#171C2F] text-white rounded-lg hover:bg-[#f5763b]/90">
              Create Event
            </button>
            <button className="p-4 bg-[#171C2F] text-white rounded-lg hover:bg-[#f5763b]/90">
              Manage Users
            </button>
            <button className="p-4 bg-[#171C2F] text-white rounded-lg hover:bg-[#f5763b]/90">
              View Reports
            </button>
            <button className="p-4 bg-[#171C2F] text-white rounded-lg hover:bg-[#f5763b]/90">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}