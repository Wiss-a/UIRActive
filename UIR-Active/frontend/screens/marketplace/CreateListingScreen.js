// screens/marketplace/CreateListingScreen.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import CategorySelector from '../../components/marketplace/itemListing/CategorySelector';
import ConditionSelector from '../../components/marketplace/itemListing/ConditionSelector';
import ImageVideoUpload from '../../components/marketplace/itemListing/ImageVideoUpload';
import ListingForm from '../../components/marketplace/itemListing/ListingForm';
import SuccessPopup from '../../components/marketplace/itemListing/SuccessPopup';

// Import categories
import { categories } from '../../data/marketplaceData';

const CreateListingScreen = ({ navigation }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [condition, setCondition] = useState('');
  const [media, setMedia] = useState([]);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Success popup state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  // Handle back button press
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  // Handle condition selection
  const handleConditionSelect = (selectedCondition) => {
    setCondition(selectedCondition);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (!price.trim()) {
      alert('Please enter a price');
      return;
    }
    
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    
    if (!condition) {
      alert('Please select a condition');
      return;
    }
    
    if (media.length === 0) {
      alert('Please upload at least one photo');
      return;
    }
    
    // Here you would normally send the data to your backend
    console.log('Submitting listing:', {
      title,
      price,
      description,
      category: selectedCategory,
      condition,
      media,
      size,
      quantity
    });
    
    // Show success popup
    setShowSuccessPopup(true);
  };
  
  // Handle view listings press
  const handleViewListings = () => {
    setShowSuccessPopup(false);
    navigation.navigate('MarketplaceHome'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={styles.placeholder} />
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Media upload */}
            <ImageVideoUpload 
              media={media} 
              setMedia={setMedia} 
              maxFiles={5}
            />
            
            {/* Listing form */}
            <ListingForm 
              title={title}
              setTitle={setTitle}
              price={price}
              setPrice={setPrice}
              description={description}
              setDescription={setDescription}
              size={size}
              setSize={setSize}
              quantity={quantity}
              setQuantity={setQuantity}
            />
            
            {/* Category selector */}
            <CategorySelector 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
            
            {/* Condition selector */}
            <ConditionSelector 
              selectedCondition={condition}
              onConditionSelect={handleConditionSelect}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Post Listing</Text>
        </TouchableOpacity>
      </View>
      
      {/* Success popup */}
      <SuccessPopup 
        visible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        onViewListing={handleViewListings}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24, // To balance the header
  },
  formContainer: {
    padding: 16,
  },
  footer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateListingScreen;