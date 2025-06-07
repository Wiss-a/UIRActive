import { useState, useEffect } from 'react';
import { CalendarDays, Check, X, Clock, Filter, History, User, MapPin, Search } from 'lucide-react';
import axios from 'axios';

interface User {
  idU: number;
  firstname: string;
  lastname: string;
  email?: string;
}

interface Venue {
  id: number;
  venueName: string; // Changed from venueName to name to match backend DTO
  location?: string;
  type?: string;
}

interface Booking {
  id: number;
  user: User;
  venue: Venue;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
}

export function VenueBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'history'>('requests');
  const [filters, setFilters] = useState({
    venue: '',
    student: '',
    status: '',
    period: ''
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:8082/api/reservations', {
          timeout: 10000, // 10 second timeout
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Raw API response:', response.data);
        
        const data = response.data.map((reservation: any) => {
          // Handle both old and new response structures
          const user = reservation.user || {};
          const venue = reservation.venue || {};
          
          return {
            id: reservation.id || 0,
            user: {
              idU: user.idU || 0,
              firstname: user.firstname || 'Inconnu',
              lastname: user.lastname || 'Inconnu',
              email: user.email || ''
            },
            venue: {
              id: venue.id || 0,
              venueName: venue.venueName || 'Lieu inconnu', // Handle both field names
              location: venue.location || '',
              type: venue.type || ''
            },
            reservationDate: reservation.reservationDate || new Date().toISOString().split('T')[0],
            startTime: reservation.startTime || '00:00:00',
            endTime: reservation.endTime || '00:00:00',
            status: (reservation.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected' | 'completed',
            rejectionReason: reservation.rejectionReason || ''
          };
        });
        
        console.log('Processed bookings:', data);
        setBookings(data);
        
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        
        let errorMessage = 'Échec du chargement des réservations. ';
        
        if (err.code === 'ECONNABORTED') {
          errorMessage += 'Délai d\'attente dépassé.';
        } else if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          switch (status) {
            case 500:
              errorMessage += 'Erreur serveur interne. Vérifiez les logs du serveur.';
              break;
            case 404:
              errorMessage += 'Endpoint non trouvé.';
              break;
            case 403:
              errorMessage += 'Accès non autorisé.';
              break;
            default:
              errorMessage += `Erreur ${status}: ${err.response.data?.message || 'Erreur inconnue'}`;
          }
        } else if (err.request) {
          // Network error
          errorMessage += 'Impossible de connecter au serveur. Vérifiez que le serveur est démarré sur le port 8082.';
        } else {
          errorMessage += err.message || 'Erreur inconnue';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const historyBookings = bookings.filter(b => b.status !== 'pending');

  const filteredBookings = activeTab === 'requests' 
    ? (showPendingOnly ? pendingBookings : bookings.filter(b => b.status === 'pending'))
    : historyBookings.filter(booking => {
        const venueName = booking.venue?.venueName?.toLowerCase() || '';
        const firstname = booking.user?.firstname?.toLowerCase() || '';
        const lastname = booking.user?.lastname?.toLowerCase() || '';
        const userId = booking.user?.idU?.toString() || '';

        return (
          (filters.venue === '' || venueName.includes(filters.venue.toLowerCase())) &&
          (filters.student === '' || 
            firstname.includes(filters.student.toLowerCase()) || 
            lastname.includes(filters.student.toLowerCase()) ||
            userId.includes(filters.student)) &&
          (filters.status === '' || booking.status === filters.status) &&
          (filters.period === '' || (
            filters.period === 'current-month' && 
            new Date(booking.reservationDate).getMonth() === new Date().getMonth()
          ))
        );
      });

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(`http://localhost:8082/api/reservations/${id}/status?status=approved`);
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: 'approved' as const } : booking
      ));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Échec de la validation de la réservation';
      setError(errorMsg);
      console.error('Approve error:', err);
    }
  };

  const handleReject = async () => {
    if (selectedBookingId) {
      try {
        // Note: The rejection reason might need to be sent differently
        // Check your backend API to see if it accepts the reason in the request body
        await axios.patch(
          `http://localhost:8082/api/reservations/${selectedBookingId}/status?status=rejected`,
          rejectionReason ? { rejectionReason } : {}
        );
        
        setBookings(bookings.map(booking => 
          booking.id === selectedBookingId 
            ? { ...booking, status: 'rejected' as const, rejectionReason } 
            : booking
        ));
        setShowRejectionModal(false);
        setSelectedBookingId(null);
        setRejectionReason('');
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Échec du rejet de la réservation';
        setError(errorMsg);
        console.error('Reject error:', err);
      }
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedBookingId(id);
    setShowRejectionModal(true);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters({
      venue: '',
      student: '',
      status: '',
      period: ''
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Handle both "HH:mm:ss" and "HH:mm" formats
      return timeString.length > 5 ? timeString.substring(0, 5) : timeString;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations de Lieux</h1>
        </div>
        {/* Refresh button for debugging */}
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Actualiser
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-3">
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-800 hover:text-red-600 underline"
                >
                  Masquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'requests' ? 'text-[#f5763b] border-b-2 border-[#f5763b]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Clock className="h-4 w-4 mr-2" />
          Demandes en Attente ({pendingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === 'history' ? 'text-[#f5763b] border-b-2 border-[#f5763b]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <History className="h-4 w-4 mr-2" />
          Historique des Réservations ({historyBookings.length})
        </button>
      </div>

      {/* Filters for History */}
      {activeTab === 'history' && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </h3>
            <button 
              onClick={resetFilters}
              className="text-sm text-[#f5763b] hover:underline"
            >
              Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input
                type="text"
                value={filters.venue}
                onChange={(e) => handleFilterChange('venue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                placeholder="Filtrer par lieu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
              <input
                type="text"
                value={filters.student}
                onChange={(e) => handleFilterChange('student', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                placeholder="Nom ou ID étudiant"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
              >
                <option value="">Tous les statuts</option>
                <option value="approved">Accepté</option>
                <option value="rejected">Refusé</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
              >
                <option value="">Toutes périodes</option>
                <option value="current-month">Mois en cours</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Show Pending Only Toggle for Requests */}
      {activeTab === 'requests' && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowPendingOnly(!showPendingOnly)}
            className={`flex items-center px-4 py-2 rounded-lg ${showPendingOnly ? 'bg-[#f5763b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Search className="h-4 w-4 mr-2" />
            {showPendingOnly ? 'Voir toutes les demandes' : 'Voir les demandes en attente uniquement'}
          </button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lieu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créneau horaire
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f5763b]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user.firstname} {booking.user.lastname}
                          </div>
                          <div className="text-sm text-gray-500">ID: {booking.user.idU}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="text-sm text-gray-900">{booking.venue.venueName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.reservationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status === 'pending' ? 'En attente' :
                         booking.status === 'approved' ? 'Accepté' :
                         booking.status === 'rejected' ? 'Refusé' : 'Terminé'}
                      </span>
                      {booking.rejectionReason && (
                        <div className="text-xs text-gray-500 mt-1">{booking.rejectionReason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {booking.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approuver"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRejectClick(booking.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Rejeter"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {activeTab === 'requests' ? 'Aucune demande de réservation trouvée' : 'Aucune réservation dans l\'historique'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Raison du refus
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Veuillez indiquer la raison du refus de cette réservation (optionnel)
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b] mb-4"
              placeholder="Ex: Le lieu est déjà réservé pour cette période..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedBookingId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-white bg-[#B51829] rounded-md hover:bg-[#B51829]/90"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}