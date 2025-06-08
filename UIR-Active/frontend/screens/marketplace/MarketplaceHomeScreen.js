// screens/marketplace/MarketplaceHomeScreen.js
import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';

// Import components
import {
  Header,
  SearchBar,
  CategoriesSection,
  ItemsSection
} from '../../components/marketplace/HomePage';

// Import data
import { categories, trendingItems, featuredSections } from '../../data/marketplaceData';

const MarketplaceHomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Event handlers
  const handleSearchChange = (text) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    // Navigate to or show filter options
    console.log('Filter pressed');
    // Future implementation: navigation.navigate('FilterOptions');
  };

  const handleCategoryPress = (category) => {
    // Navigate to category screen
    console.log('Category pressed:', category.title);
    // Future implementation: navigation.navigate('CategoryItems', { category });
  };

  const handleItemPress = (item) => {
    // Navigate to item details screen
    console.log('Item pressed:', item.title);
    navigation.navigate('ItemDetail', { item });
  };

  const handleSeeAllCategories = () => {
    // Navigate to all categories screen
    console.log('See all categories pressed');
    // Future implementation: navigation.navigate('AllCategories');
  };

  const handleSeeAllTrending = () => {
    // Navigate to all trending items screen
    console.log('See all trending items pressed');
    // Future implementation: navigation.navigate('AllTrendingItems');
  };

  const handleSeeAllSection = (section) => {
    // Navigate to specific section screen
    console.log('See all pressed for section:', section.title);
    // Future implementation: navigation.navigate('SectionItems', { section });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with location and sell button */}
      <Header />
      
      {/* Search bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        onFilterPress={handleFilterPress}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories section */}
        <CategoriesSection 
          categories={categories}
          onCategoryPress={handleCategoryPress}
          onSeeAllPress={handleSeeAllCategories}
        />
        
        {/* Trending near you section */}
        <ItemsSection
          title="Trending"
          items={trendingItems}
          onItemPress={handleItemPress}
          onSeeAllPress={handleSeeAllTrending}
        />
        
        {/* Featured sections */}
        {featuredSections.map(section => (
          <ItemsSection
            key={section.id}
            title={section.title}
            items={section.items}
            onItemPress={handleItemPress}
            onSeeAllPress={() => handleSeeAllSection(section)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
});

export default MarketplaceHomeScreen;