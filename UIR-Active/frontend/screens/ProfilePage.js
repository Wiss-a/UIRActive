import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../api/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = () => {
    const navigation = useNavigation();
    
    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phonenumber: '',
        password: ''
    });
    const [userEmail, setUserEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Récupérer l'email utilisateur stocké
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
            console.error('Erreur lors du chargement des données:', err);
            setError('Erreur lors du chargement des données utilisateur');
        } finally {
            setLoading(false);
        }
    };

    const loadUser = async (email) => {
        try {
            console.log('🔄 Loading user data for email:', email);
            const userData = await userService.getUserByEmail(email);
            
            setUser({
                firstname: userData.firstname || '',
                lastname: userData.lastname || '',
                email: userData.email || '',
                phonenumber:userData.phonenumber || '',
                password: '' // Ne jamais pré-remplir le mot de passe
            });
            
            console.log('✅ User data loaded successfully');
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
                setError(err.message || 'Erreur lors du chargement du profil');
            }
        }
    };

    const handleInputChange = (name, value) => {
        // Effacer les messages d'erreur et de succès quand l'utilisateur modifie les champs
        if (error) setError('');
        if (success) setSuccess('');
        
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        // Validation des champs obligatoires
        if (!user.firstname.trim()) {
            setError('Le prénom est obligatoire');
            return false;
        }
        
        if (!user.lastname.trim()) {
            setError('Le nom est obligatoire');
            return false;
        }
        
        if (!user.email.trim()) {
            setError('L\'email est obligatoire');
            return false;
        }
        if (!user.phonenumber.trim()) {
            setError('Le Numero de telephone est obligatoire');
            return false;
        }
        
        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email.trim())) {
            setError('Veuillez entrer un email valide');
            return false;
        }
        
        // Validation du mot de passe (s'il est fourni)
        if (user.password.trim() && user.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            
            const updateData = {
                firstname: user.firstname.trim(),
                lastname: user.lastname.trim(),
                phonenumber: user.phonenumber.trim(),
                email: user.email.trim()

            };

            // Ajouter le mot de passe seulement s'il est fourni
            if (user.password.trim()) {
                updateData.password = user.password.trim();
            }

            console.log('🔄 Updating user profile with data:', updateData);
            
            const updatedUser = await userService.updateUserByEmail(userEmail, updateData);
            
            // Mettre à jour l'email stocké si il a changé
            if (updateData.email !== userEmail) {
                await AsyncStorage.setItem('userEmail', updateData.email);
                setUserEmail(updateData.email);
            }
            
            // Effacer le champ mot de passe après mise à jour réussie
            setUser(prev => ({ ...prev, password: '' }));
            setSuccess('Profil mis à jour avec succès !');
            
            Alert.alert('Succès', 'Profil mis à jour avec succès !');
            
            console.log('✅ Profile updated successfully');
        } catch (err) {
            console.error('❌ Error updating profile:', err);
            
            if (err.message.includes('Session expirée')) {
                Alert.alert('Session expirée', 'Veuillez vous reconnecter.', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Login')
                }
              ]);

            } else {
                setError('Erreur lors de la mise à jour du profil');
                Alert.alert('Erreur', 'Erreur lors de la mise à jour du profil');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Modifier le profil</Text>
                
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {success ? (
                    <View style={styles.successContainer}>
                        <Text style={styles.successText}>{success}</Text>
                    </View>
                ) : null}

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Prénom *</Text>
                    <TextInput
                        style={styles.input}
                        value={user.firstname}
                        onChangeText={(value) => handleInputChange('firstname', value)}
                        placeholder="Entrez votre prénom"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nom *</Text>
                    <TextInput
                        style={styles.input}
                        value={user.lastname}
                        onChangeText={(value) => handleInputChange('lastname', value)}
                        placeholder="Entrez votre nom"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        value={user.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="Entrez votre email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Numero de Telephone *</Text>
                    <TextInput
                        style={styles.input}
                        value={user.phonenumber}
                        onChangeText={(value) => handleInputChange('phonenumber', value)}
                        placeholder="Entrez votre Numero de telephone"
                        keyboardType="numeric"
                        autoCapitalize="none"
                    />
                </View>


                

                <TouchableOpacity 
                    style={[styles.updateButton, saving && styles.disabledButton]} 
                    onPress={handleSubmit}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.updateButtonText}>Mettre à jour</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        backgroundColor: '#ffebee',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        borderLeft: 3,
        borderLeftColor: '#f44336',
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
    },
    successContainer: {
        backgroundColor: '#e8f5e8',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        borderLeft: 3,
        borderLeftColor: '#4caf50',
    },
    successText: {
        color: '#2e7d32',
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    updateButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfilePage;