import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Topbar({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/admin/logout', {
        method: 'POST',
        credentials: 'include' // Important for session cookies
      });

      if (response.ok) {
        // Clear frontend state
        localStorage.removeItem('admin');
        onLogout();
        navigate('/login'); // Redirect to login page
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <img 
          src="/images/Logo-UIR.png" 
          alt="UIR Logo" 
          className="h-8 w-auto"  
        />
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Admin User</span>
            <button 
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}