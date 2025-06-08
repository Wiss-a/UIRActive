import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VenueDetailsScreen = ({ route, navigation }) => {
  const { venue } = route.params;
  const isActive = venue.isActive !== false;

  const handleReservation = () => {
    if (isActive) {
      // Navigation vers l'écran de réservation ou logique de réservation
      navigation.navigate('Reservation', { venue });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Image du lieu */}
      {venue.imageUrl ? (
        <Image 
          source={{ uri: venue.imageUrl }} 
          style={styles.headerImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.headerImage, styles.noImage]}>
          <Ionicons name="image-outline" size={60} color="#999" />
        </View>
      )}

      {/* Badge de statut */}
      <View style={[
        styles.statusBadge,
        { backgroundColor: isActive ? '#4CAF50' : '#F44336' }
      ]}>
        <Text style={styles.statusText}>
          {isActive ? 'Disponible' : 'Indisponible'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Nom du lieu */}
        <Text style={styles.title}>{venue.venueName}</Text>
        
        {/* Métadonnées */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={20} color="#4172E1" />
            <Text style={styles.metaText}>{venue.location}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={20} color="#4172E1" />
            <Text style={styles.metaText}>
              {venue.openingTime?.substring(0, 5) || '08:00'} - {venue.closingTime?.substring(0, 5) || '20:00'}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={20} color="#4172E1" />
            <Text style={styles.metaText}>Capacité: {venue.capacity}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{venue.description}</Text>
        </View>

        {/* Équipements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipements</Text>
          {venue.equipments?.length > 0 ? (
            venue.equipments.map((equipment, index) => (
              <Text key={index} style={styles.equipment}>• {equipment}</Text>
            ))
          ) : (
            <><Text style={styles.equipment}>• Terrain principal</Text><Text style={styles.equipment}>• Vestiaires</Text><Text style={styles.equipment}>• Douches</Text></>
          )}
        </View>

        {/* Bouton de réservation */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.reserveButton,
              !isActive && styles.disabledButton
            ]}
            onPress={handleReservation}
            disabled={!isActive}
            activeOpacity={isActive ? 0.7 : 1}
          >
            <Text style={styles.reserveButtonText}>
              {isActive ? 'Réserver maintenant' : 'Lieu indisponible'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  noImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  metaContainer: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4172E1',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  equipment: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
    color: '#444',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 20,
  },
  reserveButton: {
    backgroundColor: '#4172E1',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default VenueDetailsScreen;