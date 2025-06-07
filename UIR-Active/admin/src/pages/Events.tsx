import { useState, useEffect } from 'react';
import { Trophy, PlusCircle, Calendar, MapPin, User, Pencil, Trash2, X, Upload } from 'lucide-react';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  contact: {
    name: string;
    info: string;
  };
  maxParticipants?: number;
  image?: string;
  imageFile?: File | null;
}

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    contact: {
      name: '',
      info: ''
    },
    maxParticipants: undefined,
    image: '',
    imageFile: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/events/admin', {
          withCredentials: true
        });
        
        const formattedEvents = response.data.map((event: any) => {
          // Utilisez event.event_date ou event.eventDate selon ce que retourne réellement l'API
          const eventDate = event.event_date || event.eventDate;
          const contactEmail = event.contact_email || event.contactEmail;
          const maxParticipants = event.max_participants || event.maxParticipants;
          
          return {
            id: event.ids?.toString() || event.id?.toString() || Math.random().toString(36).substring(2, 9),
            title: event.title || '',
            description: event.description || '',
            date: eventDate?.split('T')[0] || '',
            time: eventDate ? new Date(eventDate).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '',
            location: event.location || '',
            contact: {
              name: contactEmail ? 'Contact' : '',
              info: contactEmail || ''
            },
            maxParticipants: maxParticipants,
            image: event.image_url || event.imageUrl
          };
        });
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      alert('Veuillez remplir les champs obligatoires (Titre, Date, Lieu)');
      return;
    } 
  
    try {
      // Format the date consistently with seconds
      const timePart = formData.time || '12:00';
      const eventDateTime = `${formData.date}T${timePart}:00`;
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('eventDate', eventDateTime);
      formDataToSend.append('location', formData.location || '');
      formDataToSend.append('contactEmail', formData.contact?.info || '');
      formDataToSend.append('maxParticipants', (formData.maxParticipants || 0).toString());
      
      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      } else if (formData.image) {
        formDataToSend.append('imageUrl', formData.image);
      }
  
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      };
  
      if (editingEvent) {
        // Convert string ID to number for the backend
        const eventId = parseInt(editingEvent.id) || 0;
        await axios.put(
          `http://localhost:8082/api/events/${eventId}`,
          formDataToSend,
          config
        );
      } else {
        await axios.post(
          'http://localhost:8082/api/events',
          formDataToSend,
          config
        );
      }
  
      // Refresh the events list
      const refreshResponse = await axios.get('http://localhost:8082/api/events/admin', {
        withCredentials: true
      });
      
      // Update state with formatted events
      const formattedEvents = refreshResponse.data.map((event: any) => {
        const eventDate = event.event_date || event.eventDate;
        return {
          id: event.ids?.toString() || event.id?.toString() || '',
          title: event.title || '',
          description: event.description || '',
          date: eventDate?.split('T')[0] || '',
          time: eventDate ? new Date(eventDate).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
          location: event.location || '',
          contact: {
            name: event.contact_email ? 'Contact' : '',
            info: event.contact_email || ''
          },
          maxParticipants: event.max_participants || event.maxParticipants,
          image: event.image_url || event.imageUrl
        };
      });
      
      setEvents(formattedEvents);
      setShowCreateModal(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('Vous devez être connecté en tant qu\'admin');
        } else {
          alert(`Erreur: ${error.response?.data?.message || error.message}`);
        }
      } else {
        alert('Une erreur inconnue est survenue');
      }
    }
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setFormData(event);
    setShowCreateModal(true);
  };

  const handleDeleteClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;

    try {
      await axios.delete(`http://localhost:8082/api/events/${selectedEventId}`);
      setEvents(events.filter(event => event.id !== selectedEventId));
      setShowDeleteModal(false);
      setSelectedEventId(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Une erreur est survenue lors de la suppression de l\'événement');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        imageFile: e.target.files[0],
        image: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Événements</h1>
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              description: '',
              date: '',
              time: '',
              location: '',
              contact: {
                name: '',
                info: ''
              },
              maxParticipants: undefined,
              image: '',
              imageFile: null
            });
            setShowCreateModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#f5763b] text-white rounded-lg hover:bg-[#f5763b]/90 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Publier un Événement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(event)}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                {event.maxParticipants && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Max participants: {event.maxParticipants}</span>
                  </div>
                )}
                {event.contact.info && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>Contact: {event.contact.info}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingEvent ? 'Modifier l\'événement' : 'Publier un nouvel événement'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre*
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Titre de l'événement"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Description détaillée de l'événement"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lieu*
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Lieu de l'événement"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={formData.contact?.info}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact!, info: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Email pour contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre maximum de participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                    placeholder="Laissez vide pour illimité"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image de l'événement
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex-1">
                      <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <Upload className="h-5 w-5 mr-2" />
                        <span>Télécharger une image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </label>
                    <span className="text-sm text-gray-500">ou</span>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value, imageFile: null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#f5763b] focus:border-[#f5763b]"
                        placeholder="URL de l'image"
                      />
                    </div>
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="h-32 object-contain rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#f5763b] rounded-md hover:bg-[#f5763b]/90"
                >
                  {editingEvent ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};