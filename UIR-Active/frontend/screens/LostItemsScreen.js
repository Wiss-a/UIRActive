// screens/LostItemsScreen.js
import React, { useState, useEffect } from 'react';
import {View,  Text,  StyleSheet,  ScrollView,  TouchableOpacity,  Modal,  TextInput, Image, Alert, RefreshControl, FlatList,Linking} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../api/userService';
const API_BASE_URL = 'http://192.168.1.108:8082'; 
const getImageUri = (item) => {
  // If imageUrl exists (full URL), use it directly
  if (item.imageUrl) {
    return item.imageUrl;
  }
  
  // If imagePath exists (filename only), construct the full URL
  if (item.imagePath) {
    // The imagePath contains just the filename, so we need to construct the full path
    return `${API_BASE_URL}/uploads/lost-items/${item.imagePath}`;
  }
  
  return null;
};

const LostItemsScreen = ({ navigation }) => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form state for adding new lost item
  const [newItem, setNewItem] = useState({
    title: '',
    location: '',
    description: '',
    contactInfo: '',
    imageFile: null
  });

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchLostItems();
    }
  }, [userEmail]);

  const loadUserData = async () => {
    try {
      setAuthLoading(true);
      
      // Get stored user email and token
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const token = await AsyncStorage.getItem('jwtToken');
      
      if (!storedEmail || !token) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
        return;
      }
      
      setUserEmail(storedEmail);
      await loadUser(storedEmail);
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      Alert.alert('Erreur', 'Erreur lors du chargement des données utilisateur', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadUser = async (email) => {
    try {
      console.log('🔄 Loading user data for lost items, email:', email);
      const userData = await userService.getUserByEmail(email);
      setUser(userData);
      console.log('✅ User data loaded successfully for lost items');
    } catch (err) {
      console.error('Erreur loadUser:', err);
      if (err.message.includes('Session expirée')) {
        await AsyncStorage.clear();
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les données utilisateur', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    }
  };

  const fetchLostItems = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch('http://192.168.1.108:8082/api/lost-items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLostItems(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        // Token expired
        await AsyncStorage.clear();
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
      } else {
        console.error('Failed to fetch lost items:', response.status);
        setLostItems([]);
        Alert.alert('Error', 'Failed to fetch lost items');
      }
    } catch (error) {
      console.error('Network error:', error);
      setLostItems([]);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLostItems();
    setRefreshing(false);
  };

// Fixed handleAddItem function - the issue is with FormData structure
const handleAddItem = async () => {
  try {
    // Validate required fields
    if (!newItem.title.trim() || !newItem.location.trim() || !newItem.description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Location, Description)');
      return;
    }

    if (!userEmail) {
      Alert.alert('Error', 'User email not found. Please login again.');
      return;
    }

    setLoading(true);

    // Get token for authentication
    const token = await AsyncStorage.getItem('jwtToken');
    
    if (!token) {
      Alert.alert('Session expired', 'Please login again.');
      navigation.navigate('Login');
      return;
    }

    // If there's an image, use the multipart endpoint
    if (newItem.imageFile) {
      console.log('📤 Preparing FormData for image upload...');
      console.log('Image file details:', {
        uri: newItem.imageFile.uri,
        type: newItem.imageFile.type,
        fileName: newItem.imageFile.fileName
      });

      const formData = new FormData();
      formData.append('email', userEmail);
      formData.append('title', newItem.title.trim());
      formData.append('location', newItem.location.trim());
      formData.append('description', newItem.description.trim());
      
      if (newItem.contactInfo.trim()) {
        formData.append('contactInfo', newItem.contactInfo.trim());
      }

      // Fix the image file structure for React Native
      formData.append('imageFile', {
        uri: newItem.imageFile.uri,
        type: newItem.imageFile.mimeType || newItem.imageFile.type || 'image/jpeg',
        name: newItem.imageFile.fileName || newItem.imageFile.filename || 'image.jpg'
      });

      console.log('📤 Sending multipart request...');

      const response = await fetch(`${API_BASE_URL}/api/lost-items/with-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // IMPORTANT: Do NOT set Content-Type header for FormData
          // React Native will set it automatically with the correct boundary
        },
        body: formData,
      });

      console.log('📡 Multipart response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Lost item with image created successfully:', result);

    } else {
      // No image - use JSON endpoint (this is working fine)
      const itemData = {
        email: userEmail,
        title: newItem.title.trim(),
        location: newItem.location.trim(),
        description: newItem.description.trim(),
        contactInfo: newItem.contactInfo.trim() || null
      };

      console.log('📤 Sending JSON request:', itemData);

      const response = await fetch(`${API_BASE_URL}/api/lost-items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Lost item created successfully:', result);
    }

    // Success
    Alert.alert('Success', 'Lost item reported successfully!');
    resetForm();
    setShowAddModal(false);
    await fetchLostItems(); // Refresh the list

  } catch (error) {
    console.error('❌ Error creating lost item:', error);
    
    if (error.message.includes('401')) {
      Alert.alert('Session expired', 'Please login again.');
      await AsyncStorage.clear();
      navigation.navigate('Login');
    } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      // This suggests a FormData issue - try without image first
      Alert.alert(
        'Upload Error', 
        'There was an issue uploading the image. Would you like to submit without the image?',
        [
          {
            text: 'Submit without image',
            onPress: async () => {
              // Temporarily remove image and try again
              const tempImage = newItem.imageFile;
              setNewItem({ ...newItem, imageFile: null });
              await handleAddItem();
              setNewItem({ ...newItem, imageFile: tempImage }); // Restore image
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      Alert.alert('Error', `Failed to create lost item: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};




  // Function to get user's lost items
  const fetchUserLostItems = async (userEmail) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await fetch(`http://192.168.1.108:8082/api/lost-items/user/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } else if (response.status === 401) {
        await AsyncStorage.clear();
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.');
        return [];
      } else {
        console.error('Failed to fetch user lost items:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Network error:', error);
      return [];
    }
  };

  const handleImagePicker = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600,
      });

      if (!result.canceled && result.assets[0]) {
        setNewItem({ ...newItem, imageFile: result.assets[0] });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const resetForm = () => {
    setNewItem({
      title: '',
      location: '',
      description: '',
      contactInfo: '',
      imageFile: null
    });
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      
      if (!token) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
        return;
      }

      const response = await fetch(
        `http://192.168.1.108:8082/api/lost-items/${itemId}/status?status=${newStatus}`,
        { 
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        Alert.alert('Success', 'Status updated successfully!');
        fetchLostItems();
        setShowDetailsModal(false);
      } else if (response.status === 401) {
        await AsyncStorage.clear();
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Vérification de l'authentification...</Text>
      </View>
    );
  }

  const filteredItems = Array.isArray(lostItems) ? lostItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return '#ff6b6b';
      case 'found': return '#51cf66';
      case 'returned': return '#339af0';
      default: return '#868e96';
    }
  };

  const renderLostItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => {
        setSelectedItem(item);
        setShowDetailsModal(true);
      }}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.itemInfo}>
        <Icon name="location-on" size={16} color="#666" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      
      <Text style={styles.descriptionText} numberOfLines={2}>
        {item.description}
      </Text>
      
      {getImageUri(item) && (
  <Image 
    source={{ uri: getImageUri(item) }} 
    style={styles.itemImage} 
    onError={(error) => {
      console.log('Image load error:', error.nativeEvent.error);
    }}
  />
)}
      
      <View style={styles.itemFooter}>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {/* <TouchableOpacity
          style={styles.contactButton}
          onPress={() => Alert.alert('Contact Info', item.contactInfo || 'No contact info provided')}
        >
          <Icon name="contact-phone" size={16} color="#007AFF" />
          <Text style={styles.contactText}>Contact</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
  style={styles.contactButton}
  onPress={() => {
  let contact = item.contactInfo;

  if (!contact) {
    Alert.alert('Contact Info', 'No contact info provided');
    return;
  }

  // Normalize and check if it starts with 06 or 07
  const localPhoneRegex = /^(06|07)\d{8}$/;

  if (localPhoneRegex.test(contact)) {
    // Convert 06XXXXXXXX → +2126XXXXXXXX
    contact = contact.replace(/^0/, '+212');
  }

  const internationalPhoneRegex = /^\+212[67]\d{8}$/;

  if (internationalPhoneRegex.test(contact)) {
    const whatsappUrl = `https://wa.me/${contact.replace(/\D/g, '')}`;
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed or URL not supported');
        }
      })
      .catch(() => Alert.alert('Error', 'Could not open WhatsApp'));
  } else {
    Alert.alert('Contact Info', contact);
  }
}}

>
  <Icon name="contact-phone" size={16} color="#007AFF" />
  <Text style={styles.contactText}>Contact</Text>
</TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lost Items</Text>
        {/* {user && (
          <Text style={styles.userInfo}>
            {user.firstname} {user.lastname}
          </Text>
        )} */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          disabled={!userEmail}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lost items..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'reported', 'found', 'returned'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilter
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterText,
                filterStatus === status && styles.activeFilterText
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lost Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderLostItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Lost Item</Text>
            <TouchableOpacity 
              onPress={handleAddItem} 
              disabled={!userEmail || loading}
            >
              <Text style={[
                styles.submitText, 
                (!userEmail || loading) && styles.disabledText
              ]}>
                {loading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newItem.title}
                onChangeText={(text) => setNewItem({ ...newItem, title: text })}
                placeholder="What did you lose?"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={newItem.location}
                onChangeText={(text) => setNewItem({ ...newItem, location: text })}
                placeholder="Where did you lose it?"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newItem.description}
                onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                placeholder="Describe the item in detail..."
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Information</Text>
              <TextInput
                style={styles.input}
                value={newItem.contactInfo}
                onChangeText={(text) => setNewItem({ ...newItem, contactInfo: text })}
                placeholder="How can people reach you?"
                keyboardType="numeric"

              />
            </View>

            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
              <Icon name="add-a-photo" size={24} color="#007AFF" />
              <Text style={styles.imageButtonText}>
                {newItem.imageFile ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>

            {newItem.imageFile && (
              <Image source={{ uri: newItem.imageFile.uri }} style={styles.previewImage} />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Item Details</Text>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.detailTitle}>{selectedItem.title}</Text>
              
              <View style={styles.detailRow}>
                <Icon name="location-on" size={20} color="#666" />
                <Text style={styles.detailLocation}>{selectedItem.location}</Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedItem.status), alignSelf: 'flex-start' }]}>
                <Text style={styles.statusText}>{selectedItem.status.toUpperCase()}</Text>
              </View>

              {/* {selectedItem.imageUrl && (
                <Image source={{ uri: selectedItem.imageUrl }} style={styles.detailImage} />
              )} */}
              {getImageUri(selectedItem) && (
  <Image 
    source={{ uri: getImageUri(selectedItem) }} 
    style={styles.detailImage} 
    onError={(error) => {
      console.log('Detail image load error:', error.nativeEvent.error);
    }}
  />
)}

              <Text style={styles.detailDescription}>{selectedItem.description}</Text>

              <View style={styles.detailRow}>
                <Icon name="access-time" size={16} color="#666" />
                <Text style={styles.detailDate}>
                  Reported on {new Date(selectedItem.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {selectedItem.contactInfo && (
                <View style={styles.contactSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <Text style={styles.contactInfo}>{selectedItem.contactInfo}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.foundButton]}
                  onPress={() => handleStatusUpdate(selectedItem.id, 'found')}
                >
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Mark as Found</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.returnedButton]}
                  onPress={() => handleStatusUpdate(selectedItem.id, 'returned')}
                >
                  <Icon name="assignment-return" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Mark as Returned</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    position: 'absolute',
    left: 20,
    bottom: 5,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16
  },
  filterContainer: {
    flexDirection: 'row'
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10
  },
  activeFilter: {
    backgroundColor: '#007AFF'
  },
  filterText: {
    color: '#666',
    fontSize: 14
  },
  activeFilterText: {
    color: '#fff'
  },
  disabledText: {
    color: '#A0A0A0'
  },
  list: {
    flex: 1,
    paddingHorizontal: 20
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  locationText: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14
  },
  descriptionText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateText: {
    color: '#999',
    fontSize: 12
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  contactText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16
  },
  submitText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalContent: {
    flex: 1,
    padding: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    marginBottom: 20
  },
  imageButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  detailLocation: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginVertical: 16
  },
  detailDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16
  },
  detailDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8
  },
  contactSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  contactInfo: {
    fontSize: 14,
    color: '#666'
  },
  actionButtons: {
    marginTop: 20
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  foundButton: {
    backgroundColor: '#51cf66'
  },
  returnedButton: {
    backgroundColor: '#339af0'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  }
});

export default LostItemsScreen;