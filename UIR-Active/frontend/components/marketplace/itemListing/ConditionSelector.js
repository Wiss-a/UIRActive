// components/marketplace/ConditionSelector.js
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const conditions = [
  { id: '1', value: 'New', description: 'Brand new, unused, or with original tags' },
  { id: '2', value: 'Like New', description: 'Unused with no signs of wear' },
  { id: '3', value: 'Excellent', description: 'Used minimally, no significant flaws' },
  { id: '4', value: 'Good', description: 'Used but well maintained, minor wear' },
  { id: '5', value: 'Fair', description: 'Visible wear and tear, all flaws shown in photos' }
];

const ConditionSelector = ({ selectedCondition, onConditionSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Condition</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.conditionList}
      >
        {conditions.map((condition) => (
          <TouchableOpacity
            key={condition.id}
            style={[
              styles.conditionButton,
              selectedCondition === condition.value && styles.selectedCondition
            ]}
            onPress={() => onConditionSelect(condition.value)}
          >
            <Text 
              style={[
                styles.conditionButtonText,
                selectedCondition === condition.value && styles.selectedConditionText
              ]}
            >
              {condition.value}
            </Text>
            {selectedCondition === condition.value && (
              <Ionicons name="checkmark-circle" size={18} color="#002286" style={styles.checkmark} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Show description of selected condition */}
      {selectedCondition && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {conditions.find(c => c.value === selectedCondition)?.description}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  conditionList: {
    paddingBottom: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EFF2F5',
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCondition: {
    backgroundColor: '#E1EBFF',
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedConditionText: {
    color: '#002286',
    fontWeight: '600',
  },
  checkmark: {
    marginLeft: 5,
  },
  descriptionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ConditionSelector;