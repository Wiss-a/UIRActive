// components/marketplace/CategorySelector.js
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const CategorySelector = ({ categories, selectedCategory, onCategorySelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  const handleCategorySelect = (category) => {
    onCategorySelect(category);
    closeModal();
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={openModal}
        activeOpacity={0.7}
      >
        {selectedCategory ? (
          <View style={styles.selectedCategory}>
            <View style={styles.iconContainer}>
              <Ionicons name={selectedCategory.icon} size={22} color="#3366FF" />
            </View>
            <Text style={styles.selectedCategoryText}>{selectedCategory.title}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Select a category</Text>
        )}
        <Ionicons name="chevron-down" size={20} color="#888" />
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: modalTranslateY }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHandleBar} />
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={closeModal}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.categoryItem,
                    selectedCategory && selectedCategory.id === item.id && styles.categoryItemSelected
                  ]} 
                  onPress={() => handleCategorySelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name={item.icon} size={22} color="#3366FF" />
                  </View>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory && selectedCategory.id === item.id && styles.categoryTextSelected
                  ]}>
                    {item.title}
                  </Text>
                  {selectedCategory && selectedCategory.id === item.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#3366FF" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    letterSpacing: 0.3,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  placeholderText: {
    color: '#AAA',
    fontSize: 16,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCategoryText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  modalHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    letterSpacing: 0.3,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryItemSelected: {
    backgroundColor: '#F8FAFF',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryTextSelected: {
    color: '#222',
    fontWeight: '500',
  },
});

export default CategorySelector;