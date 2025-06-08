import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    Modal,
    ScrollView,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const MatchupsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [matchups, setMatchups] = useState([]);
    const [filteredMatchups, setFilteredMatchups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Fixed DateTime picker states
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date()); // Temporary date for Android

    const [newMatchup, setNewMatchup] = useState({
        title: '',
        description: '',
        sport: '',
        location: '',
        dateTime: '',
        maxParticipants: '',
        skillLevel: 'beginner'
    });

    // const API_URL = 'http://10.85.201.23:8082/api/matchups';
        const API_URL = 'http://192.168.1.108:8082/api/matchups';


    const fetchMatchups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_URL);
            const data = response.data.map(matchup => ({
                ...matchup,
                // Make sure eventDate is preserved
                dateTime: matchup.eventDate, // Optional: create alias for backward compatibility
                isFull: matchup.participants && matchup.participants.length >= matchup.maxParticipants,
                isParticipant: matchup.participants && matchup.participants.some(p => p.id === user?.id)
            }));
            setMatchups(data);
            setFilteredMatchups(data);
        } catch (err) {
            console.error('Error fetching matchups:', err);
            setError('Failed to load matchups. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchNotFullMatchups = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_URL}/not-full`);
            const data = response.data.map(matchup => ({
                ...matchup,
                // Make sure eventDate is preserved
                dateTime: matchup.eventDate, // Optional: create alias for backward compatibility
                isFull: false,
                isParticipant: matchup.participants && matchup.participants.some(p => p.id === user?.id)
            }));
            setMatchups(data);
            setFilteredMatchups(data);
        } catch (err) {
            console.error('Error fetching available matchups:', err);
            setError('Failed to load available matchups. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fixed cross-platform date picker handlers
    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (event.type === 'set' && selectedDate) {
            if (Platform.OS === 'android') {
                // For Android, update the actual date and show time picker
                const newDate = new Date(selectedDate);
                newDate.setHours(tempDate.getHours());
                newDate.setMinutes(tempDate.getMinutes());
                setSelectedDate(newDate);
                setTempDate(newDate);

                // Show time picker after date selection on Android
                setTimeout(() => {
                    setShowTimePicker(true);
                }, 100);
            } else {
                // For iOS, update immediately
                const newDate = new Date(selectedDate);
                newDate.setHours(selectedDate.getHours());
                newDate.setMinutes(selectedDate.getMinutes());
                setSelectedDate(newDate);
            }
        } else if (event.type === 'dismissed') {
            // Handle dismissal for Android
            setShowDatePicker(false);
        }
    };

    const onTimeChange = (event, selectedTime) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (event.type === 'set' && selectedTime) {
            const newDate = new Date(selectedDate);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setSelectedDate(newDate);
            setTempDate(newDate);
        } else if (event.type === 'dismissed') {
            // Handle dismissal for Android
            setShowTimePicker(false);
        }
    };

    const showDatepicker = () => {
        setTempDate(new Date(selectedDate));
        setShowDatePicker(true);
    };

    const showTimepicker = () => {
        setTempDate(new Date(selectedDate));
        setShowTimePicker(true);
    };

   // In your createMatchup function, change this:
// In your createMatchup function, change this:
const createMatchup = async () => {
    if (!newMatchup.title || !newMatchup.sport || !newMatchup.location ||
        !newMatchup.maxParticipants) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
    }

    // Check if selected date is in the future
    if (selectedDate <= new Date()) {
        Alert.alert('Error', 'Please select a future date and time');
        return;
    }

    try {
        setLoadingAction(true);
        const matchupData = {
            title: newMatchup.title,
            description: newMatchup.description,
            sport: newMatchup.sport,
            location: newMatchup.location,
            maxParticipants: parseInt(newMatchup.maxParticipants),
            skillLevel: newMatchup.skillLevel,
            eventDate: selectedDate.toISOString(),
            creatorId: user?.id // Send only the ID instead of the full object
        };

        const response = await axios.post(API_URL, matchupData);
        Alert.alert('Success', 'Matchup created successfully!');
        setShowCreateModal(false);

        // Reset all form states
        setNewMatchup({
            title: '',
            description: '',
            sport: '',
            location: '',
            dateTime: '',
            maxParticipants: '',
            skillLevel: 'beginner'
        });
        setSelectedDate(new Date());
        setTempDate(new Date());
        setShowDatePicker(false);
        setShowTimePicker(false);

        fetchMatchups();
    } catch (error) {
        console.error('Error creating matchup:', error);
        Alert.alert('Error', 'Failed to create matchup. Please try again.');
    } finally {
        setLoadingAction(false);
    }
};
    // const joinMatchup = async (matchupId) => {
    //     if (!user) {
    //         Alert.alert('Error', 'You must be logged in to join a matchup');
    //         return;
    //     }

    //     try {
    //         setLoadingAction(true);
    //         const response = await axios.post(`${API_URL}/${matchupId}/participants/${user.id}`);
    //         Alert.alert('Success', 'You have joined the matchup!');
    //         fetchMatchups();
    //     } catch (error) {
    //         console.error('Error joining matchup:', error);
    //         Alert.alert('Error', 'Failed to join matchup. It might be full or you may already be a participant.');
    //     } finally {
    //         setLoadingAction(false);
    //     }
    // };
    const joinMatchup = async (matchupId) => {
    if (!user) {
        Alert.alert('Error', 'You must be logged in to join a matchup');
        return;
    }

    try {
        setLoadingAction(true);
        
        // Optimistic update - immediately update UI
        setMatchups(prevMatchups => 
            prevMatchups.map(matchup => {
                if (matchup.id === matchupId) {
                    const updatedParticipants = matchup.participants 
                        ? [...matchup.participants, { id: user.id, username: user.username }]
                        : [{ id: user.id, username: user.username }];
                    
                    return {
                        ...matchup,
                        participants: updatedParticipants,
                        isParticipant: true,
                        isFull: updatedParticipants.length >= matchup.maxParticipants
                    };
                }
                return matchup;
            })
        );
        
        // Update filtered matchups as well
        setFilteredMatchups(prevFiltered => 
            prevFiltered.map(matchup => {
                if (matchup.id === matchupId) {
                    const updatedParticipants = matchup.participants 
                        ? [...matchup.participants, { id: user.id, username: user.username }]
                        : [{ id: user.id, username: user.username }];
                    
                    return {
                        ...matchup,
                        participants: updatedParticipants,
                        isParticipant: true,
                        isFull: updatedParticipants.length >= matchup.maxParticipants
                    };
                }
                return matchup;
            })
        );
        
        // Make API call
        const response = await axios.post(`${API_URL}/${matchupId}/participants/${user.id}`);
        
        Alert.alert('Success', 'You have joined the matchup!');
        
        // Fetch fresh data to ensure consistency
        fetchMatchups();
        
    } catch (error) {
        console.error('Error joining matchup:', error);
        
        // Revert optimistic update on error
        setMatchups(prevMatchups => 
            prevMatchups.map(matchup => {
                if (matchup.id === matchupId) {
                    const revertedParticipants = matchup.participants 
                        ? matchup.participants.filter(p => p.id !== user.id)
                        : [];
                    
                    return {
                        ...matchup,
                        participants: revertedParticipants,
                        isParticipant: false,
                        isFull: revertedParticipants.length >= matchup.maxParticipants
                    };
                }
                return matchup;
            })
        );
        
        setFilteredMatchups(prevFiltered => 
            prevFiltered.map(matchup => {
                if (matchup.id === matchupId) {
                    const revertedParticipants = matchup.participants 
                        ? matchup.participants.filter(p => p.id !== user.id)
                        : [];
                    
                    return {
                        ...matchup,
                        participants: revertedParticipants,
                        isParticipant: false,
                        isFull: revertedParticipants.length >= matchup.maxParticipants
                    };
                }
                return matchup;
            })
        );
        
        Alert.alert('Error', 'Failed to join matchup. It might be full or you may already be a participant.');
    } finally {
        setLoadingAction(false);
    }
};

    const closeMatchup = async (matchupId) => {
        Alert.alert(
            'Close Matchup',
            'Are you sure you want to close this matchup? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoadingAction(true);
                            await axios.post(`${API_URL}/${matchupId}/close`);
                            Alert.alert('Success', 'Matchup closed successfully!');
                            fetchMatchups();
                        } catch (error) {
                            console.error('Error closing matchup:', error);
                            Alert.alert('Error', 'Failed to close matchup.');
                        } finally {
                            setLoadingAction(false);
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        fetchMatchups();
    }, []);

    useEffect(() => {
        filterMatchups();
    }, [searchQuery, activeFilter, matchups]);

    const onRefresh = () => {
        setRefreshing(true);
        if (activeFilter === 'available') {
            fetchNotFullMatchups();
        } else {
            fetchMatchups();
        }
    };

    const filterMatchups = () => {
        let filtered = [...matchups];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(matchup =>
                matchup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                matchup.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                matchup.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        if (activeFilter === 'available') {
            filtered = filtered.filter(matchup => !matchup.isFull && matchup.status !== 'closed');
        } else if (activeFilter === 'my-matchups') {
            filtered = filtered.filter(matchup => matchup.isParticipant);
        } else if (activeFilter === 'closed') {
            filtered = filtered.filter(matchup => matchup.status === 'closed');
        }

        setFilteredMatchups(filtered);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        if (filter === 'available') {
            fetchNotFullMatchups();
        } else {
            fetchMatchups();
        }
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSkillLevelColor = (level) => {
        switch(level) {
            case 'beginner': return '#4CAF50';
            case 'intermediate': return '#FF9800';
            case 'advanced': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const renderMatchupItem = ({ item }) => (
        <TouchableOpacity
            style={styles.matchupCard}
            onPress={() => navigation.navigate('MatchupDetails', { matchup: item })}
        >
            <View style={styles.matchupHeader}>
                <Text style={styles.matchupTitle}>{item.title}</Text>
                <View style={styles.statusContainer}>
                    {item.status === 'closed' ? (
                        <Text style={styles.closedStatus}>Fermé</Text>
                    ) : item.isFull ? (
                        <Text style={styles.fullStatus}>Complet</Text>
                    ) : (
                        <Text style={styles.openStatus}>Ouvert</Text>
                    )}
                </View>
            </View>

            <Text style={styles.matchupSport}>{item.sport}</Text>
            <Text style={styles.matchupDescription}>{item.description}</Text>

            <View style={styles.matchupMeta}>
                <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>{item.location}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>{formatDateTime(item.eventDate)}</Text>
                </View>
                <View style={styles.metaRow}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.metaText}>
                        {item.participants ? item.participants.length : 0}/{item.maxParticipants}
                    </Text>
                </View>
            </View>

            <View style={styles.skillLevelContainer}>
                <Text style={[
                    styles.skillLevel,
                    { color: getSkillLevelColor(item.skillLevel) }
                ]}>
                    Niveau: {item.skillLevel === 'beginner' ? 'Débutant' :
                    item.skillLevel === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                </Text>
            </View>

            <View style={styles.actionContainer}>
                {item.isParticipant && (
                    <Text style={styles.participantBadge}>Vous participez</Text>
                )}
                {!item.isFull && item.status !== 'closed' && !item.isParticipant && (
                    <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => joinMatchup(item.id)}
                        disabled={loadingAction}
                    >
                        <Text style={styles.joinButtonText}>Rejoindre</Text>
                    </TouchableOpacity>
                )}
                {item.createdBy === user?.id && item.status !== 'closed' && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => closeMatchup(item.id)}
                        disabled={loadingAction}
                    >
                        <Text style={styles.closeButtonText}>Fermer</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={40} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={fetchMatchups}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Image
                        source={require('../assets/logo2.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.headerTitle}>Matchups</Text>
                </View>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.createButtonText}>Créer</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher des matchups..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Filter Controls */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
                    onPress={() => handleFilterChange('all')}
                >
                    <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>Tous</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, activeFilter === 'available' && styles.activeFilter]}
                    onPress={() => handleFilterChange('available')}
                >
                    <Text style={[styles.filterText, activeFilter === 'available' && styles.activeFilterText]}>Disponibles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, activeFilter === 'my-matchups' && styles.activeFilter]}
                    onPress={() => handleFilterChange('my-matchups')}
                >
                    <Text style={[styles.filterText, activeFilter === 'my-matchups' && styles.activeFilterText]}>Mes Matchups</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, activeFilter === 'closed' && styles.activeFilter]}
                    onPress={() => handleFilterChange('closed')}
                >
                    <Text style={[styles.filterText, activeFilter === 'closed' && styles.activeFilterText]}>Fermés</Text>
                </TouchableOpacity>
            </View>

            {/* Matchups List */}
            <FlatList
                data={filteredMatchups}
                renderItem={renderMatchupItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007bff']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="basketball-outline" size={50} color="#999" />
                        <Text style={styles.emptyText}>Aucun matchup trouvé</Text>
                    </View>
                }
            />

            {/* Create Matchup Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Créer un Matchup</Text>
                        <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Titre du matchup *"
                            value={newMatchup.title}
                            onChangeText={(text) => setNewMatchup({...newMatchup, title: text})}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Sport *"
                            value={newMatchup.sport}
                            onChangeText={(text) => setNewMatchup({...newMatchup, sport: text})}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Description"
                            value={newMatchup.description}
                            onChangeText={(text) => setNewMatchup({...newMatchup, description: text})}
                            multiline={true}
                            numberOfLines={3}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Lieu *"
                            value={newMatchup.location}
                            onChangeText={(text) => setNewMatchup({...newMatchup, location: text})}
                        />

                        {/* Fixed Date and Time Picker */}
                        <View style={styles.dateTimeContainer}>
                            <Text style={styles.labelText}>Date et heure *</Text>

                            {/* Date Button */}
                            <TouchableOpacity style={styles.dateTimeButton} onPress={showDatepicker}>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.dateTimeText}>
                                    {selectedDate.toLocaleDateString('fr-FR')}
                                </Text>
                            </TouchableOpacity>

                            {/* Time Button */}
                            <TouchableOpacity style={styles.dateTimeButton} onPress={showTimepicker}>
                                <Ionicons name="time-outline" size={20} color="#666" />
                                <Text style={styles.dateTimeText}>
                                    {selectedDate.toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </TouchableOpacity>

                            {/* Date Picker */}
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={tempDate}
                                    mode="date"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                    minimumDate={new Date()}
                                />
                            )}

                            {/* Time Picker */}
                            {showTimePicker && (
                                <DateTimePicker
                                    testID="timePicker"
                                    value={tempDate}
                                    mode="time"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre maximum de participants *"
                            value={newMatchup.maxParticipants}
                            onChangeText={(text) => setNewMatchup({...newMatchup, maxParticipants: text})}
                            keyboardType="numeric"
                        />

                        <Text style={styles.labelText}>Niveau de compétence:</Text>
                        <View style={styles.skillLevelButtons}>
                            {['beginner', 'intermediate', 'advanced'].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.skillButton,
                                        newMatchup.skillLevel === level && styles.selectedSkillButton
                                    ]}
                                    onPress={() => setNewMatchup({...newMatchup, skillLevel: level})}
                                >
                                    <Text style={[
                                        styles.skillButtonText,
                                        newMatchup.skillLevel === level && styles.selectedSkillButtonText
                                    ]}>
                                        {level === 'beginner' ? 'Débutant' :
                                            level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.createSubmitButton}
                            onPress={createMatchup}
                            disabled={loadingAction}
                        >
                            {loadingAction ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.createSubmitButtonText}>Créer le Matchup</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
        marginVertical: 15,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingTop: 10,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 6,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    createButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        flexWrap: 'wrap',
        paddingHorizontal: 5,
    },
    filterButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },
    filterText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '500',
    },
    activeFilter: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    activeFilterText: {
        color: 'white',
        fontWeight: '600',
    },
    listContainer: {
        paddingBottom: 20,
    },
    matchupCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    matchupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    matchupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    openStatus: {
        color: '#4CAF50',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    fullStatus: {
        color: '#FF9800',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    closedStatus: {
        color: '#F44336',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        overflow: 'hidden',
    },
    matchupSport: {
        fontSize: 16,
        color: '#007bff',
        fontWeight: '600',
        marginBottom: 6,
    },
    matchupDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        lineHeight: 20,
    },
    matchupMeta: {
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    metaText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    skillLevelContainer: {
        marginBottom: 12,
    },
    skillLevel: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    participantBadge: {
        color: '#4CAF50',
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#E8F5E8',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        overflow: 'hidden',
    },
    joinButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#F44336',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        shadowColor: '#F44336',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    formContainer: {
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        height: 90,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    labelText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    dateTimeContainer: {
        marginBottom: 20,
    },
    dateTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 14,
        marginBottom: 10,
    },
    dateTimeText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    skillLevelButtons: {
        flexDirection: 'row',
        marginBottom: 25,
        gap: 8,
    },
    skillButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedSkillButton: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    skillButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedSkillButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    createSubmitButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 40,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    createSubmitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
    
    export default MatchupsScreen;