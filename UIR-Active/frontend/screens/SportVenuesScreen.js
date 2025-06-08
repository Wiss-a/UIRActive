import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  TextInput,
  RefreshControl,
  Modal,
  ScrollView,
  Alert // Add this missing import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const SportVenuesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState(null);
  const [showReservations, setShowReservations] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [userReservations, setUserReservations] = useState([]);


  const API_URL = 'http://192.168.1.108:8082/api/venues';
  const RESERVATIONS_API_URL = 'http://192.168.1.108:8082/api/reservations';

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL);
      const data = response.data.map(venue => ({
        ...venue,
        // Convertir les champs time en format simplifié
        opening_time: venue.openingTime || '08:00:00',
        closing_time: venue.closingTime || '20:00:00',
        is_active: venue.isActive !== undefined ? venue.isActive : true
      }));
      setVenues(data);
      setFilteredVenues(data);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserReservations = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour voir vos réservations');
      return;
    }
    
    try {
      setLoadingReservations(true);
      const response = await axios.get(`${RESERVATIONS_API_URL}/user/${user.id}`);
      setUserReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Erreur', 'Impossible de charger vos réservations');
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleShowReservations = async () => {
    await fetchUserReservations();
    setShowReservations(true);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [searchQuery, activeFilter, typeFilter, venues]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVenues();
  };

  const filterVenues = () => {
    let filtered = [...venues];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(venue => 
        venue.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply active status filter
    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'active';
      filtered = filtered.filter(venue => venue.is_active === isActive);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(venue => venue.type === typeFilter);
    }
    
    setFilteredVenues(filtered);
  };

  const renderVenueItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.venueCard}
      onPress={() => navigation.navigate('VenueDetails', { venue: item })}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.venueImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.venueImage, styles.noImage]}>
          <Ionicons name="image-outline" size={40} color="#999" />
        </View>
      )}
      <View style={styles.venueInfo}>
        <Text style={styles.venueName}>{item.venueName}</Text>
        <Text style={styles.venueLocation}>{item.location}</Text>
        <View style={styles.venueMeta}>
          <Text style={styles.venueType}>{item.type}</Text>
          <Text style={styles.venueCapacity}>Capacity: {item.capacity}</Text>
        </View>
        <View style={styles.venueHours}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.hoursText}>
            {item.opening_time.substring(0, 5)} - {item.closing_time.substring(0, 5)}
          </Text>
        </View>
        {item.is_active ? (
          <Text style={styles.activeStatus}>Active</Text>
        ) : (
          <Text style={styles.inactiveStatus}>Inactive</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={40} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchVenues}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Image 
            source={require('../assets/logo2.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Lieux Sportifs</Text>
        </View>
        <TouchableOpacity 
          style={styles.reservationsButton}
          onPress={handleShowReservations}
        >
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={styles.reservationsButtonText}>Mes Réservations</Text>
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search venues..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Status:</Text>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={activeFilter === 'all' && styles.activeFilterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'active' && styles.activeFilter]}
          onPress={() => setActiveFilter('active')}
        >
          <Text style={activeFilter === 'active' && styles.activeFilterText}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, activeFilter === 'inactive' && styles.activeFilter]}
          onPress={() => setActiveFilter('inactive')}
        >
          <Text style={activeFilter === 'inactive' && styles.activeFilterText}>Inactive</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Type:</Text>
        <TouchableOpacity
          style={[styles.filterButton, typeFilter === 'all' && styles.activeFilter]}
          onPress={() => setTypeFilter('all')}
        >
          <Text style={typeFilter === 'all' && styles.activeFilterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, typeFilter === 'gym' && styles.activeFilter]}
          onPress={() => setTypeFilter('gym')}
        >
          <Text style={typeFilter === 'gym' && styles.activeFilterText}>Gym</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, typeFilter === 'pool' && styles.activeFilter]}
          onPress={() => setTypeFilter('pool')}
        >
          <Text style={typeFilter === 'pool' && styles.activeFilterText}>Pool</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, typeFilter === 'field' && styles.activeFilter]}
          onPress={() => setTypeFilter('field')}
        >
          <Text style={typeFilter === 'field' && styles.activeFilterText}>Field</Text>
        </TouchableOpacity>
      </View>
      
      {/* Venues List */}
      <FlatList
        data={filteredVenues}
        renderItem={renderVenueItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={50} color="#999" />
            <Text style={styles.emptyText}>No venues found</Text>
          </View>
        }
      />
      <Modal
        visible={showReservations}
        animationType="slide"
        onRequestClose={() => setShowReservations(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mes Réservations</Text>
            <TouchableOpacity onPress={() => setShowReservations(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {loadingReservations ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : userReservations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={50} color="#999" />
              <Text style={styles.emptyText}>Aucune réservation trouvée</Text>
            </View>
          ) : (
            <ScrollView style={styles.reservationsList}>
              {userReservations.map(reservation => (
                <View key={reservation.id} style={styles.reservationItem}>
                  <Text style={styles.reservationVenue}>{reservation.venue.venueName}</Text>
                  <Text style={styles.reservationDate}>
                    {new Date(reservation.reservationDate).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text style={styles.reservationTime}>
                    {reservation.startTime} - {reservation.endTime}
                  </Text>
                  <Text style={[
                    styles.reservationStatus,
                    reservation.status === 'approved' && styles.statusConfirmed,
                    reservation.status === 'pending' && styles.statusPending,
                    reservation.status === 'rejected' && styles.statusCancelled,
                    reservation.status === 'completed' && styles.statusCompleted
                  ]}>
                    {reservation.status === 'approved' ? 'Accepté' :
                    reservation.status === 'completed' ? 'Terminé' :
                    reservation.status === 'rejected' ? 'Refusé' :
                     reservation.status === 'pending' ? 'En attente' : 'Annulée'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginVertical: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterLabel: {
    marginRight: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#007bff',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    paddingBottom: 20,
  },
  venueCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  venueImage: {
    width: '100%',
    height: 150,
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    padding: 15,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  venueLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  venueMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  venueType: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  venueCapacity: {
    fontSize: 12,
    color: '#666',
  },
  venueHours: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  activeStatus: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inactiveStatus: {
    color: '#f44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  reservationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4172E1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reservationsButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reservationsList: {
    flex: 1,
  },
  reservationItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reservationVenue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reservationDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  reservationTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  reservationStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statusConfirmed: {
    color: '#4CAF50',
  },
  statusPending: {
    color: '#FFC107',
  },
  statusCancelled: {
    color: '#F44336',
  },
  statusCompleted: {
    color: 'black'
  },
  headerTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
logo: {
  width: 60,
  height: 60,
  marginRight: 6,
},
});

export default SportVenuesScreen;