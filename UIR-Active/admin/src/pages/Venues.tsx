import { useState, useEffect } from 'react';
import { Building2, PlusCircle, Pencil, Trash2, X, Clock, Upload } from 'lucide-react';
import axios from 'axios';

interface Venue {
  id: number;
  venueName: string;
  type: string;
  description: string;
  capacity: number;
  isActive: boolean;
  openingTime: string;
  closingTime: string;
  imageUrl?: string;
  imagePath?: string;
  location: string;
  reservations?: any[]; // Add this line to handle the nested data
}

export function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<number | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState<Partial<Venue>>({
    venueName: '',
    type: '',
    description: '',
    capacity: 0,
    isActive: true,
    openingTime: '08:00',
    closingTime: '20:00',
    imageUrl: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useImageUrl, setUseImageUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const venueTypes = [
    { value: 'gym', label: 'Gymnase' },
    { value: 'field', label: 'Terrain' },
    { value: 'court', label: 'Court' },
    { value: 'pool', label: 'Piscine' },
    { value: 'track', label: 'Piste' },
    { value: 'hall', label: 'Salle polyvalente' },
    { value: 'stadium', label: 'Stade' },
    { value: 'other', label: 'Autre' }
  ];

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await axios.get('http://localhost:8082/api/venues');
    console.log("Full API response:", response); // Debug the structure
    console.log("Response data:", response.data); // Check if it's an array

    // If data is nested (e.g., response.data.venues)
    const venuesData = Array.isArray(response.data) 
      ? response.data 
      : response.data.venues || []; // Fallback if not an array

    const formattedVenues = venuesData.map((venue: Venue) => ({
      ...venue,
      openingTime: venue.openingTime?.substring(0, 5) || "08:00", // Handle missing time
      closingTime: venue.closingTime?.substring(0, 5) || "20:00",
    }));

    setVenues(formattedVenues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    setError('Failed to load venues. Please try again.');
    setVenues([]);
  } finally {
    setIsLoading(false);
  }
};

  const handleCreateOrUpdate = async () => {
    if (!formData.venueName || !formData.type || !formData.location) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('venueName', formData.venueName || '');
    formDataToSend.append('type', formData.type || '');
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('location', formData.location || '');
    formDataToSend.append('capacity', String(formData.capacity || 0));
    formDataToSend.append('openingTime', formData.openingTime + ':00');
    formDataToSend.append('closingTime', formData.closingTime + ':00');
    formDataToSend.append('isActive', String(formData.isActive || true));
    
    if (useImageUrl && formData.imageUrl) {
      formDataToSend.append('imageUrl', formData.imageUrl);
    } else if (!useImageUrl && imageFile) {
      formDataToSend.append('imageFile', imageFile);
    }

    try {
      if (editingVenue) {
        await axios.put(`http://localhost:8082/api/venues/${editingVenue.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('http://localhost:8082/api/venues', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      await fetchVenues();
      setShowModal(false);
      setEditingVenue(null);
      resetForm();
    } catch (error) {
      console.error('Error saving venue:', error);
      setError('Échec de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      ...venue,
      openingTime: venue.openingTime.substring(0, 5),
      closingTime: venue.closingTime.substring(0, 5)
    });
    
    if (venue.imageUrl) {
      setImagePreview(venue.imageUrl);
      setUseImageUrl(true);
    } else if (venue.imagePath) {
      setImagePreview(`http://localhost:8082/api/images/${venue.imagePath}`);
      setUseImageUrl(false);
    } else {
      setImagePreview(null);
    }
    
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUseImageUrl(false);
      setFormData({...formData, imageUrl: ''});
    }
  };

  const resetForm = () => {
    setFormData({
      venueName: '',
      type: '',
      description: '',
      capacity: 0,
      isActive: true,
      openingTime: '08:00',
      closingTime: '20:00',
      imageUrl: '',
      location: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setUseImageUrl(true);
    setError(null);
  };

  const toggleAvailability = async (venueId: number) => {
  try {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      // Send as URL parameters instead of request body
      await axios.patch(`http://localhost:8082/api/venues/${venueId}/status?isActive=${!venue.isActive}`);
      await fetchVenues();
    }
  } catch (error) {
    console.error('Error toggling availability:', error);
    setError('Échec de la mise à jour du statut. Veuillez réessayer.');
  }
};

  const handleDeleteClick = (venueId: number) => {
    setSelectedVenueId(venueId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedVenueId) {
      setIsLoading(true);
      try {
        await axios.delete(`http://localhost:8082/api/venues/${selectedVenueId}`);
        await fetchVenues();
        setShowDeleteModal(false);
        setSelectedVenueId(null);
      } catch (error) {
        console.error('Error deleting venue:', error);
        setError('Échec de la suppression. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getImageUrl = (venue: Venue) => {
    if (venue.imageUrl) return venue.imageUrl;
    if (venue.imagePath) return `/api/images/${venue.imagePath}`;
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Installations Sportives</h1>
        </div>
        <button
          onClick={() => {
            setEditingVenue(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#f5763b] text-white rounded-lg hover:bg-[#f5763b]/90 transition-colors"
          disabled={isLoading}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Ajouter une Installation
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading && venues.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f5763b]"></div>
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune installation sportive trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={getImageUrl(venue)}
                alt={venue.venueName}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{venue.venueName}</h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 mt-1">
                      {venueTypes.find(t => t.value === venue.type)?.label || venue.type}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(venue)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                      disabled={isLoading}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(venue.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{venue.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{venue.openingTime.substring(0, 5)} - {venue.closingTime.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Capacité: {venue.capacity} personnes</span>
                    <button
                      onClick={() => toggleAvailability(venue.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        venue.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                      disabled={isLoading}
                    >
                      {venue.isActive ? 'Disponible' : 'Indisponible'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingVenue ? 'Modifier l\'installation' : 'Ajouter une installation'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVenue(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                disabled={isLoading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom*
                  </label>
                  <input
                    type="text"
                    value={formData.venueName || ''}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Nom de l'installation"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type*
                  </label>
                  <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                  required
                  disabled={isLoading}
                >
                  <option value="">Sélectionnez un type</option>
                  {venueTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Description de l'installation"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation*
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Emplacement de l'installation"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure d'ouverture*
                    </label>
                    <input
                      type="time"
                      value={formData.openingTime || '08:00'}
                      onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de fermeture*
                    </label>
                    <input
                      type="time"
                      value={formData.closingTime || '20:00'}
                      onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacité*
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacity || 0}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Nombre de personnes"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <div className="flex items-center space-x-4 mb-2">
                    <button
                      type="button"
                      onClick={() => setUseImageUrl(true)}
                      className={`px-3 py-1 rounded-md text-sm ${useImageUrl ? 'bg-[#f5763b] text-white' : 'bg-gray-200 text-gray-700'}`}
                      disabled={isLoading}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseImageUrl(false)}
                      className={`px-3 py-1 rounded-md text-sm ${!useImageUrl ? 'bg-[#f5763b] text-white' : 'bg-gray-200 text-gray-700'}`}
                      disabled={isLoading}
                    >
                      Upload
                    </button>
                  </div>

                  {useImageUrl ? (
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                      placeholder="URL de l'image"
                      disabled={isLoading}
                    />
                  ) : (
                    <div>
                      <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                        <Upload className="h-5 w-5 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-600">
                          {imageFile ? imageFile.name : 'Choisir un fichier'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isLoading}
                        />
                      </label>
                    </div>
                  )}

                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-full object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-[#f5763b] focus:ring-[#f5763b] border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Installation disponible
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingVenue(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#f5763b] rounded-md hover:bg-[#f5763b]/90 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {editingVenue ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer cette installation ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}