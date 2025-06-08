// screens/marketplace/ItemDetailScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  Image
} from 'react-native';
import { Linking } from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import ImageGallery from '../../components/marketplace/HomePage/ImageGallery';

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [saved, setSaved] = useState(false);
  const scrollY = new Animated.Value(0);

  const handleSave = () => {
    setSaved(!saved);
    Alert.alert(
      saved ? 'Item Removed' : 'Item Saved',
      saved ? 'This item has been removed from your saved items.' : 'This item has been added to your saved items.'
    );
  };


// Replace the existing handleContact function with this updated version:
const handleContact = () => {
  // Get contact info from the item - adjust this based on your item structure
  let contact = item.contactInfo || item.sellerContact || item.phone;

  if (!contact) {
    Alert.alert('Contact Info', 'No contact info available for this seller');
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
    // If it's not a phone number, show it as regular contact info
    Alert.alert('Contact Info', contact);
  }
};
  // Dynamic header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark" />
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleSave}
          >
            <Ionicons 
              name={saved ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={saved ? '#3B82F6' : '#FFF'} 
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Back Button (always visible) */}
      <View style={styles.floatingBackButton}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Save Button (always visible) */}
      <View style={styles.floatingSaveButton}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
        >
          <Ionicons 
            name={saved ? 'bookmark' : 'bookmark-outline'} 
            size={22} 
            color={saved ? '#3B82F6' : '#333'} 
          />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery Component */}
        <ImageGallery images={item.image} />

        {/* Item Details Card */}
        <View style={styles.detailsCard}>
          {/* Price and Title */}
          <View style={styles.titleSection}>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.title}>{item.title}</Text>
            
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.locationText}>{item.distance}</Text>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerContainer}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={22} color="#FFF" />
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>{item.seller}</Text>
              <View style={styles.sellerStats}>
                <Text style={styles.sellerStat}>5.0</Text>
                <Ionicons name="star" size={14} color="#F59E0B" style={styles.statIcon} />
                <View style={styles.sellerStatDivider} />
                <Text style={styles.sellerStat}>15 sales</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Details */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="star-check" size={20} color="#DA6720" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Condition</Text>
                  <Text style={styles.detailValue}>{item.condition}</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="numeric" size={20} color="#DA6720" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                  <Text style={styles.detailValue}>{item.quantity}</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="tag-outline" size={20} color="#DA6720" />
                <View style={styles.detailItemText}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>Sports Equipment</Text>
                </View>
              </View>
              
              {item.size && item.size.trim() !== '' && (
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="shoe-sneaker" size={20} color="#DA6720" />
                  <View style={styles.detailItemText}>
                    <Text style={styles.detailLabel}>Size</Text>
                    <Text style={styles.detailValue}>{item.size}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          {/* Similar Items Section */}
{/* //          <View style={styles.sectionContainer}>
//            <View style={styles.sectionHeader}>
//              <Text style={styles.sectionTitle}>Similar Items</Text>
//              <TouchableOpacity>
//                <Text style={styles.seeAllText}>See All</Text>
//              </TouchableOpacity>
//            </View>
// */}
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarItemsContainer}
            > */}
              {/* Sample similar items */}
              {/* {[1, 2, 3].map(i => (
                <TouchableOpacity key={i} style={styles.similarItemCard}>
                  <View style={styles.similarItemImageContainer}>
                    <Image
                      source={{ uri: 'https://via.placeholder.com/150' }}
                      style={styles.similarItemImage}
                    />
                  </View>
                  <Text style={styles.similarItemPrice}>$79</Text>
                  <Text style={styles.similarItemTitle} numberOfLines={1}>
                    Nike Running Shoes
                  </Text>
                </TouchableOpacity>
              ))} */}
            {/* </ScrollView>
          </View> */}
          
          {/* Bottom spacing for the fixed button */}
          <View style={{ height: 80 }} />
        </View>
      </Animated.ScrollView>

      {/* Contact Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>Contact Seller</Text>
          <Ionicons name="chatbubble-ellipses" size={18} color="#FFF" style={styles.contactButtonIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 100,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 99,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingSaveButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 99,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsCard: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#FFF',
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  titleSection: {
    marginBottom: 20,
  },
  price: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#009854',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginBottom: 24,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  sellerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sellerStat: {
    fontSize: 13,
    color: '#64748B',
  },
  statIcon: {
    marginLeft: 4,
  },
  sellerStatDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItemText: {
    marginLeft: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  similarItemsContainer: {
    paddingTop: 6,
    paddingBottom: 10,
    paddingRight: 20,
  },
  similarItemCard: {
    width: 120,
    marginRight: 12,
  },
  similarItemImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 8,
  },
  similarItemImage: {
    width: '100%',
    height: '100%',
  },
  similarItemPrice: {
    fontSize: 15,
    color: '#009854',
    fontWeight: '600',
    marginBottom: 2,
  },
  similarItemTitle: {
    fontSize: 13,
    color: '#475569',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButtonIcon: {
    marginLeft: 8,
  },
});

export default ItemDetailScreen;