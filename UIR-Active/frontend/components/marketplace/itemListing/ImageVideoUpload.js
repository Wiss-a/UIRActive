// components/marketplace/ImageVideoUpload.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ImageVideoUpload = ({ media, setMedia, maxFiles = 5 }) => {
  const [uploading, setUploading] = useState(false);

  // Request permissions and handle media selection
  const handleSelectMedia = async (mediaType) => {
    try {
      // Request permissions
      let permissionResult;
      
      if (mediaType === 'image') {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      } else {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      }
      
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'We need permission to access your media library');
        return;
      }

      setUploading(true);

      // Launch media selector
      const options = {
        mediaTypes: mediaType === 'image' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxFiles - media.length
      };

      // Get media
      let result;
      if (mediaType === 'image') {
        result = await ImagePicker.launchImageLibraryAsync(options);
      } else {
        result = await ImagePicker.launchCameraAsync(options);
      }

      if (!result.canceled && result.assets) {
        // Add the new media to state
        const newMedia = [...media];
        
        // Add the new assets
        result.assets.forEach(asset => {
          const mediaItem = {
            uri: asset.uri,
            type: asset.type || (asset.uri.endsWith('.mp4') ? 'video' : 'image'),
            name: asset.fileName || `media-${Date.now()}`
          };
          newMedia.push(mediaItem);
        });
        
        // Only keep up to maxFiles
        if (newMedia.length > maxFiles) {
          Alert.alert('Maximum files', `You can only upload a maximum of ${maxFiles} files`);
          setMedia(newMedia.slice(0, maxFiles));
        } else {
          setMedia(newMedia);
        }
      }
    } catch (error) {
      console.error('Error selecting media:', error);
      Alert.alert('Error', 'There was an error selecting your media');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (index) => {
    const updatedMedia = [...media];
    updatedMedia.splice(index, 1);
    setMedia(updatedMedia);
  };

  // Render preview of media item
  const renderMediaItem = ({ item, index }) => {
    const isVideo = item.type === 'video';
    
    return (
      <View style={styles.mediaItem}>
        <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
        
        {isVideo && (
          <View style={styles.videoIndicator}>
            <Ionicons name="videocam" size={20} color="#FFF" />
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveMedia(index)}
        >
          <Ionicons name="close-circle" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos & Videos</Text>
      <Text style={styles.subtitle}>Add up to {maxFiles} photos or videos</Text>
      
      <View style={styles.mediaContainer}>
        {/* Media previews */}
        {media.length > 0 && (
          <FlatList
            data={media}
            renderItem={renderMediaItem}
            keyExtractor={(item, index) => `media-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaList}
          />
        )}
        
        {/* Add media buttons */}
        {media.length < maxFiles && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleSelectMedia('image')}
              disabled={uploading}
            >
              <Ionicons name="images-outline" size={24} color="#002286" />
              <Text style={styles.buttonText}>Photos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleSelectMedia('video')}
              disabled={uploading}
            >
              <Ionicons name="videocam-outline" size={24} color="#002286" />
              <Text style={styles.buttonText}>Videos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {uploading && (
        <Text style={styles.uploadingText}>Uploading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mediaContainer: {
    minHeight: 120,
  },
  mediaList: {
    paddingVertical: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EFF2F5',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    padding: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF2F5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  buttonText: {
    marginLeft: 8,
    color: '#002286',
    fontWeight: '500',
  },
  uploadingText: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ImageVideoUpload;