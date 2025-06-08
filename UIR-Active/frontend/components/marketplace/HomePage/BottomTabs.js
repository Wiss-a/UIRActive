import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomTabs = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'marketplace', label: 'Sports Market', icon: 'basketball-outline', activeIcon: 'basketball' },
    { id: 'saved', label: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
    { id: 'profile', label: 'Your Profile', icon: 'person-outline', activeIcon: 'person' }
  ];

  return (
    <View style={styles.bottomTabs}>
      {tabs.map(tab => (
        <TouchableOpacity 
          key={tab.id}
          style={[styles.tabItem, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Ionicons 
            name={activeTab === tab.id ? tab.activeIcon : tab.icon} 
            size={24} 
            color={activeTab === tab.id ? '#002286' : '#666'} 
          />
          <Text style={activeTab === tab.id ? styles.activeTabText : styles.tabText}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E4E6EB',
    backgroundColor: '#FFF',
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#002286',
    backgroundColor: '#F0F7FF',
  },
  tabText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    fontSize: 10,
    color: '#002286',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BottomTabs;