import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import SectionHeader from '../SectionHeader';
import CategoryItem from './CategoryItem';

const CategoriesSection = ({ categories, onCategoryPress, onSeeAllPress }) => {
  return (
    <View style={styles.categoriesSection}>
      <SectionHeader 
        title="Categories" 
        onSeeAllPress={onSeeAllPress}
      />
      <FlatList
        horizontal
        data={categories}
        renderItem={({ item }) => (
          <CategoryItem item={item} onPress={onCategoryPress} />
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesSection: {
    paddingTop: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
});

export default CategoriesSection;