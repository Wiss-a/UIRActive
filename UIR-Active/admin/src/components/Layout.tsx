import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Dashboard } from '../pages/Dashboard';
import { Users } from '../pages/Users';
import { StudentPosts } from '../pages/StudentPosts';
import { Events } from '../pages/Events';
import { Venues } from '../pages/Venues';
import { Marketplace } from '../pages/Marketplace';
import { Transactions } from '../pages/Transactions';
import { LostFound } from '../pages/LostFound';
import { VenueBooking } from '../pages/VenueBooking';

export function Layout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onLogout={onLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} /> 
            <Route path="/student-posts" element={<StudentPosts />} /> 
            <Route path="/events" element={<Events />} /> 
            <Route path="/venues" element={<Venues />} />
            <Route path="/venue-booking" element={<VenueBooking/>} />
            <Route path="/marketplace" element={<Marketplace />} /> 
            <Route path="/transactions" element={<Transactions />} /> 
            <Route path="/lost-found" element={<LostFound />} /> 
          </Routes>
        </main>
      </div>
    </div>
  );
}