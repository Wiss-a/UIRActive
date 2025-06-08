import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CategoryItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.categoryButton} onPress={() => onPress(item)}>
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon} size={24} color="#002286" />
      </View>
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
});

export default CategoryItem;