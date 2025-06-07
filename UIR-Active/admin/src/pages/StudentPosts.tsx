import { useState, useEffect } from 'react';
import { MessageSquare, Search, Eye, Trash2, Calendar, User } from 'lucide-react';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  content: string;
  type: 'Activity';
  author: string;
  date: string;
  images?: string[];
  sportType?: string;
}

export function StudentPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'author'>('date');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8082/api/events/student', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const formattedPosts = response.data.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          content: event.description,
          type: 'Activity' as const,
          author: `${event.creator.firstName} ${event.creator.lastName}`,
          date: event.eventDate,
          images: event.imageUrl ? [event.imageUrl] : undefined,
          sportType: event.sportType || 'Sport' // Valeur par défaut si sportType n'est pas défini
        }));
        
        setPosts(formattedPosts);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des événements sportifs');
        console.error('Error fetching student events:', err);
        setLoading(false);
      }
    };

    fetchStudentEvents();
  }, []);

  const filteredAndSortedPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.sportType && post.sportType.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.author.localeCompare(b.author);
    });

  const handleDeleteClick = (postId: string) => {
    setSelectedPostId(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedPostId) {
      try {
        await axios.delete(`http://localhost:8082/api/events/${selectedPostId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPosts(posts.filter(post => post.id !== selectedPostId));
        setShowDeleteModal(false);
        setSelectedPostId(null);
        setError(null); // Réinitialiser les erreurs précédentes
      } catch (err) {
        setError('Erreur lors de la suppression de l\'événement');
        console.error('Error deleting event:', err);
        setShowDeleteModal(false);
      }
    }
  };

  const handleViewClick = (post: Post) => {
    setSelectedPost(post);
    setShowViewModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFA586]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Événements Sportifs Étudiants</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FFA586] focus:border-[#FFA586] w-64"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'author')}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-[#FFA586] focus:border-[#FFA586]"
          >
            <option value="date">Trier par date</option>
            <option value="author">Trier par auteur</option>
          </select>
        </div>
      </div>

      {filteredAndSortedPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Aucun événement sportif trouvé</p>
          <p className="text-sm text-gray-400 mt-2">Les événements créés par les étudiants apparaîtront ici</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {post.images && post.images.length > 0 && (
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {post.type}
                    </span>
                    {post.sportType && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {post.sportType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(post)}
                      className="text-gray-600 hover:bg-gray-100 p-1 rounded-full"
                      aria-label="Voir détails"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post.id)}
                      className="text-red-600 hover:bg-red-100 p-1 rounded-full"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedPost.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedPost.type}
                  </span>
                  {selectedPost.sportType && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {selectedPost.sportType}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(selectedPost.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fermer"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            {selectedPost.images && selectedPost.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={selectedPost.images[0]}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{selectedPost.content}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Publié par {selectedPost.author}</span>
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
              Êtes-vous sûr de vouloir supprimer cet événement sportif ? Cette action est irréversible.
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
}