// components/marketplace/ImageGallery.js
import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ImageGallery = ({ images }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // Normalize image to always be an array
  const imageArray = Array.isArray(images) ? images : [images];
  
  // Handle image scroll
  const handleImageScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(slideIndex);
  };

  // Navigate to specific image
  const scrollToImage = (index) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({
        offset: index * width,
        animated: true
      });
    }
  };

  return (
    <View style={styles.imageGalleryContainer}>
      <FlatList
        ref={flatListRef}
        data={imageArray}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleImageScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item: imageUri }) => (
          <View style={styles.imageSlide}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.itemImage} 
              resizeMode="cover"
            />
          </View>
        )}
      />
      
      {/* Image Pagination Indicators */}
      {imageArray.length > 0 && (
        <View style={styles.paginationContainer}>
          <View style={styles.paginationCounter}>
            <Text style={styles.paginationText}>
              {activeImageIndex + 1}/{imageArray.length}
            </Text>
          </View>
          
          <View style={styles.dotsContainer}>
            {imageArray.map((_, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.paginationDot,
                  activeImageIndex === index && styles.paginationDotActive
                ]}
                onPress={() => scrollToImage(index)}
              />
            ))}
          </View>
        </View>
      )}
      
      {/* Left arrow for navigation */}
      {activeImageIndex > 0 && (
        <TouchableOpacity 
          style={[styles.navigationArrow, styles.leftArrow]}
          onPress={() => scrollToImage(activeImageIndex - 1)}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {/* Right arrow for navigation */}
      {activeImageIndex < imageArray.length - 1 && (
        <TouchableOpacity 
          style={[styles.navigationArrow, styles.rightArrow]}
          onPress={() => scrollToImage(activeImageIndex + 1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageGalleryContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  imageSlide: {
    width,
    height: 400,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  paginationCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 8,
    borderRadius: 4,
  },
  navigationArrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
});

export default ImageGallery;