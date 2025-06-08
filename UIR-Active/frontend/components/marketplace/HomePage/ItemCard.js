import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ItemCard = ({ item, onPress }) => {
  // Handle both single string and array of images
  const imageSource = Array.isArray(item.image) 
    ? { uri: item.image[0] } // Use first image if it's an array
    : { uri: item.image };   // Use as is if it's a string

  return (
    <TouchableOpacity style={styles.itemCard} onPress={() => onPress(item)}>
      <Image source={imageSource} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.sellerInfo}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <Text style={styles.itemDistance}>{item.distance}</Text>
        </View>
        {item.seller && (
          <View style={styles.sellerInfo}>
            <Ionicons name="person-outline" size={12} color="#666" />
            <Text style={styles.sellerName}>{item.seller}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    width: 160,
    marginHorizontal: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E6EB',
  },
  itemImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  itemDetails: {
    padding: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#009854', 
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemDistance: {
    fontSize: 12,
    color: '#65676B',
    marginLeft: 4,
  },
  sellerName: {
    fontSize: 12,
    color: '#65676B',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default ItemCard;