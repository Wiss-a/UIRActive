import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import SectionHeader from '../SectionHeader';
import ItemCard from './ItemCard';

const ItemsSection = ({ title, items, onItemPress, onSeeAllPress }) => {
  return (
    <View style={styles.section}>
      <SectionHeader 
        title={title} 
        onSeeAllPress={onSeeAllPress}
      />
      <FlatList
        horizontal
        data={items}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={onItemPress} />
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.itemsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingTop: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  itemsList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});

export default ItemsSection;