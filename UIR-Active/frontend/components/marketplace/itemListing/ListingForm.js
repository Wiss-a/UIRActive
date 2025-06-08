// components/marketplace/ListingForm.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListingForm = ({ 
  title, 
  setTitle, 
  price, 
  setPrice, 
  description, 
  setDescription,
  size,
  setSize,
  quantity,
  setQuantity
}) => {
  const [showSizeField, setShowSizeField] = useState(!!size);

  const handleToggleSizeField = () => {
    setShowSizeField(!showSizeField);
    if (showSizeField) {
      setSize(''); // Clear size when hiding field
    }
  };

  return (
    <View style={styles.container}>
      {/* Title field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What are you selling?"
          placeholderTextColor="#999"
          maxLength={100}
        />
      </View>

      {/* Price field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Price</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currencySymbol}>DH</Text>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Quantity field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={quantity.toString()}
          onChangeText={(text) => setQuantity(parseInt(text) || 1)}
          placeholder="1"
          placeholderTextColor="#999"
          keyboardType="number-pad"
        />
      </View>

      {/* Size field (optional) */}
      <View style={styles.optionalFieldContainer}>
        <View style={styles.optionalFieldHeader}>
          <Text style={styles.label}>Size</Text>
          <TouchableOpacity onPress={handleToggleSizeField}>
            {showSizeField ? (
              <Ionicons name="remove-circle-outline" size={24} color="#FF3B30" />
            ) : (
              <Ionicons name="add-circle-outline" size={24} color="#002286" />
            )}
          </TouchableOpacity>
        </View>
        
        {showSizeField && (
          <TextInput
            style={styles.input}
            value={size}
            onChangeText={setSize}
            placeholder="Enter size (S, M, L, 10, etc.)"
            placeholderTextColor="#999"
          />
        )}
      </View>

      {/* Description field */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your item, include details about condition, features, etc."
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: {
    minHeight: 120,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingLeft: 12,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  optionalFieldContainer: {
    marginBottom: 16,
  },
  optionalFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default ListingForm;