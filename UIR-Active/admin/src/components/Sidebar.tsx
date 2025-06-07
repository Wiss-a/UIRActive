import { NavLink } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Trophy,
  Building2,
  ShoppingBag,
  Receipt,
  Search,
  LayoutDashboard,
  CalendarDays
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/student-posts', icon: MessageSquare, label: 'Student Posts' },
  { path: '/events', icon: Trophy, label: 'Events' },
  { path: '/venues', icon: Building2, label: 'Sports Venues' },
  { path: '/venue-booking', icon: CalendarDays, label: 'Venue Booking' },
  { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { path: '/transactions', icon: Receipt, label: 'Transactions' },
  { path: '/lost-found', icon: Search, label: 'Lost & Found' }
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[#171C2F] text-white">
    <div className="flex justify-center p-3 mb-2 bg-gradient-to-b from-white/10 to-transparent rounded-b-lg">
      <img 
        src="images/logo2.png"
        alt="Your Logo"
        className="h-28 w-auto 
          drop-shadow-[0_4px_8px_rgba(255,255,255,0.2)]  // Ombre claire
          hover:drop-shadow-[0_6px_12px_rgba(255,255,255,0.3)] // Effet au survol
          transition-all duration-200 // Animation douce
        " 
      />
    </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm ${
                isActive
                  ? 'bg-[#f5763b] text-white'
                  : 'text-gray-300 hover:bg-[#FFA586]/10 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}