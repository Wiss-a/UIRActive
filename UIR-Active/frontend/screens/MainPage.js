import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DrawerHeader from '../components/DrawerHeader';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const AddAnnouncementModal = ({ 
  visible, 
  onClose, 
  announcementText, 
  setAnnouncementText, 
  selectedImages, 
  setSelectedImages, 
  onSubmit 
}) => {
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>New Announcement</Text>
          <TouchableOpacity onPress={onSubmit} disabled={!announcementText.trim()}>
            <Text style={[styles.modalPost, !announcementText.trim() && styles.modalPostDisabled]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <TextInput
            placeholder="Share your sports moment..."
            value={announcementText}
            onChangeText={setAnnouncementText}
            multiline
            style={styles.textInput}
            textAlignVertical="top"
          />

          {selectedImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedImagesContainer}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.selectedImageContainer}>
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
            <Ionicons name="camera" size={24} color="#4A90E2" />
            <Text style={styles.imagePickerText}>Add Photos</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const MainPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upvotedItems, setUpvotedItems] = useState(new Set());

  // Fetch events from the backend and convert them to announcements
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Use the student events endpoint since it's publicly accessible
      const response = await axios.get('http://192.168.1.108:8082/api/events/student', {
        withCredentials: true
      });
      
      const formattedAnnouncements = response.data.map((event) => {
        // Handle different possible field names from backend
        const eventDate = event.event_date || event.eventDate;
        const contactEmail = event.contact_email || event.contactEmail;
        const maxParticipants = event.max_participants || event.maxParticipants;
        const eventId = event.ids || event.id;
        const imageUrl = event.image_url || event.imageUrl;
        
        // Format the event as an announcement
        let announcementText = `🏆 ${event.title} ${event.description || ''}`;
        
        if (eventDate) {
          const date = new Date(eventDate);
          const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const formattedTime = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          announcementText += `\n\n📅 Date: ${formattedDate}`;
          announcementText += `\n🕐 Time: ${formattedTime}`;
        }
        
        if (event.location) {
          announcementText += `\n📍 Location: ${event.location}`;
        }
        
        if (maxParticipants && maxParticipants > 0) {
          announcementText += `\n👥 Max Participants: ${maxParticipants}`;
        }
        
        if (contactEmail) {
          announcementText += `\n📧 Contact: ${contactEmail}`;
        }

        // Calculate time ago from creation/event date
        const timeAgo = getTimeAgo(eventDate ? new Date(eventDate) : new Date());

        return {
          id: eventId ? eventId.toString() : Math.random().toString(36).substring(2, 9),
          user: 'Event Organizer',
          avatar: '🎯',
          text: announcementText,
          time: timeAgo,
          images: imageUrl ? [imageUrl] : [],
          likes: Math.floor(Math.random() * 50), // Random likes for demo
          upvotes: Math.floor(Math.random() * 30), // Add upvotes field
          comments: Math.floor(Math.random() * 20), // Random comments for demo
          isEvent: true,
        };
      });
      
      // Sort by date (newest first)
      const sortedAnnouncements = formattedAnnouncements.sort((a, b) => {
        // You might want to sort by actual creation date if available
        return b.id - a.id; // Simple ID-based sorting for now
      });
      
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      Alert.alert('Error', 'Failed to fetch events. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Fixed handleUpvote function
  const handleUpvote = (id) => {
    if (upvotedItems.has(id)) return; // Already upvoted

    const updatedAnnouncements = announcements.map(item => {
      if (item.id === id) {
        return { ...item, upvotes: (item.upvotes || 0) + 1 };
      }
      return item;
    });
    setAnnouncements(updatedAnnouncements);
    setUpvotedItems(new Set([...upvotedItems, id]));
  };

  // Fixed handleLikes function
  const handleLikes = (id) => {
    if (upvotedItems.has(id)) return; // Already liked

    const updatedAnnouncements = announcements.map(item => {
      if (item.id === id) {
        return { ...item, likes: (item.likes || 0) + 1 };
      }
      return item;
    });
    setAnnouncements(updatedAnnouncements);
    setUpvotedItems(new Set([...upvotedItems, id]));
  };

  const handleSubmit = () => {
    if (!announcementText.trim()) {
      Alert.alert('Error', 'Please enter some text for your announcement');
      return;
    }

    const newAnnouncement = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'Y',
      text: announcementText,
      time: 'Just now',
      images: selectedImages,
      likes: 0,
      upvotes: 0,
      comments: 0,
      isEvent: false,
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setAnnouncementText('');
    setSelectedImages([]);
    setAddModalVisible(false);
  };

  const HomeContent = () => {
    const renderAnnouncement = ({ item }) => (
      <View style={[styles.announcementCard, item.isEvent && styles.eventCard]}>
        <View style={styles.announcementHeader}>
          <View style={[styles.userAvatar, item.isEvent && styles.eventAvatar]}>
            <Text style={styles.avatarText}>{item.avatar}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.user}
              {item.isEvent && (
                <Text style={styles.eventBadge}> • Event</Text>
              )}
            </Text>
            <Text style={styles.timeStamp}>{item.time}</Text>
          </View>
        </View>

        <Text style={styles.announcementText}>{item.text}</Text>

        {item.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            {item.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.announcementImage} />
            ))}
          </ScrollView>
        )}

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleLikes(item.id)}>
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleUpvote(item.id)}>
            <Ionicons name="arrow-up-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.upvotes || 0}</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#666" />
          </TouchableOpacity> */}
        </View>
      </View>
    );

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={announcements}
          renderItem={renderAnnouncement}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.announcementsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No events available</Text>
              <Text style={styles.emptySubtext}>Events will appear here once they are created</Text>
            </View>
          }
        />
      </View>
    );
  };

  const ProfileContent = () => (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>U</Text>
        </View>
        <Text style={styles.profileName}>Your Profile</Text>
        <Text style={styles.profileDescription}>Manage your sports profile and settings</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <DrawerHeader/>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'home' && <HomeContent />}
        {activeTab === 'profile' && <ProfileContent />}
      </View>

      {/* Floating Add Button */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity> */}

      {/* Add Announcement Modal */}
      <AddAnnouncementModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        announcementText={announcementText}
        setAnnouncementText={setAnnouncementText}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  welcomeCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  announcementsList: {
    paddingBottom: 100,
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f5763b',
    backgroundColor: '#fefefe',
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventAvatar: {
    backgroundColor: '#f5763b',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventBadge: {
    fontSize: 14,
    color: '#f5763b',
    fontWeight: 'normal',
  },
  timeStamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  announcementText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
  },
  announcementImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  profileDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalPost: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalPostDisabled: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  selectedImagesContainer: {
    marginBottom: 16,
  },
  selectedImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default MainPage;