import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../api/userService';

const ReservationScreen = ({ route, navigation }) => {
  const { venue } = route.params;
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Set default end time to 1 hour after start time
    const defaultEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    setEndTime(defaultEndTime);
  }, [startTime]);

  const loadUserData = async () => {
    try {
      setAuthLoading(true);
      
      // Récupérer l'email utilisateur et le token stockés
      const storedEmail = await AsyncStorage.getItem('userEmail');
      const token = await AsyncStorage.getItem('jwtToken');
      
      if (!storedEmail || !token) {
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
        return;
      }
      
      setUserEmail(storedEmail);
      await loadUser(storedEmail);
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      Alert.alert('Erreur', 'Erreur lors du chargement des données utilisateur', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadUser = async (email) => {
    try {
      console.log('🔄 Loading user data for reservation, email:', email);
      const userData = await userService.getUserByEmail(email);
      setUser(userData);
      console.log('✅ User data loaded successfully for reservation');
    } catch (err) {
      console.error('Erreur loadUser:', err);
      if (err.message.includes('Session expirée')) {
        await AsyncStorage.clear();
        Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les données utilisateur', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      }
    }
  };

  const handleReservation = async () => {
    if (!user) {
        Alert.alert('Erreur', 'Données utilisateur non disponibles');
        return;
    }

    if (startTime >= endTime) {
        Alert.alert('Erreur', "L'heure de fin doit être après l'heure de début");
        return;
    }

    // Vérifier que la date n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        Alert.alert('Erreur', 'Vous ne pouvez pas réserver pour une date passée');
        return;
    }

    setIsLoading(true);

    try {
        // Récupérer le token pour l'authentification
        const token = await AsyncStorage.getItem('jwtToken');
        
        if (!token) {
            Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login')
                }
            ]);
            return;
        }

        const reservationData = {
            email: user.email,
            venueId: venue.id,
            reservationDate: date.toISOString().split('T')[0], // Format YYYY-MM-DD
            startTime: startTime.toTimeString().substring(0, 5), // Format HH:MM
            endTime: endTime.toTimeString().substring(0, 5), // Format HH:MM
        };

        console.log('🔄 Creating reservation with data:', reservationData);

        const response = await axios.post(
            'http://192.168.1.108:8082/api/reservations', 
            reservationData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200 || response.status === 201) {
            console.log('✅ Reservation created successfully');
            Alert.alert(
                'Succès', 
                'Votre réservation a été enregistrée avec le statut "En attente"',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    } catch (error) {
        console.error('❌ Reservation error:', error);
        let errorMessage = "Une erreur est survenue lors de la réservation";
        
        if (error.response) {
            if (error.response.status === 401) {
                // Token expiré ou invalide
                await AsyncStorage.clear();
                Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login')
                    }
                ]);
                return;
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        Alert.alert('Erreur', errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Vérification de l'authentification...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Réserver {venue.venueName}</Text>
        {user && (
          <Text style={styles.userInfo}>
            Réservation pour: {user.firstname} {user.lastname}
          </Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date de réservation</Text>
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date.toLocaleDateString('fr-FR')}</Text>
          <Ionicons name="calendar" size={20} color="#4172E1" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()} // Empêcher la sélection de dates passées
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeGroup}>
          <Text style={styles.label}>Heure de début</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text>{startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
            <Ionicons name="time" size={20} color="#4172E1" />
          </TouchableOpacity>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowStartTimePicker(false);
                if (selectedTime) {
                  setStartTime(selectedTime);
                }
              }}
            />
          )}
        </View>

        <View style={styles.timeGroup}>
          <Text style={styles.label}>Heure de fin</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text>{endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
            <Ionicons name="time" size={20} color="#4172E1" />
          </TouchableOpacity>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowEndTimePicker(false);
                if (selectedTime) {
                  setEndTime(selectedTime);
                }
              }}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || !user) && styles.disabledButton]}
        onPress={handleReservation}
        disabled={isLoading || !user}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Envoi en cours...' : 'Confirmer la réservation'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4172E1',
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  formGroup: {
    marginBottom: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeGroup: {
    width: '48%',
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    color: '#555',
  },
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4172E1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ReservationScreen;