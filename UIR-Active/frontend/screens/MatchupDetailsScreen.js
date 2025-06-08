import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const MatchupDetailsScreen = ({ route, navigation }) => {
    const { matchup: initialMatchup } = route.params;
    const { user } = useAuth();
    const [matchup, setMatchup] = useState(initialMatchup);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // const API_URL = 'http://10.85.201.23:8082/api/matchups';
    const API_URL = 'http://192.168.1.108:8082/api/matchups';

    const fetchMatchupDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/${matchup.id}`);
            const data = {
                ...response.data,
                isFull: response.data.participants && response.data.participants.length >= response.data.maxParticipants,
                isParticipant: response.data.participants && response.data.participants.some(p => p.id === user?.id)
            };
            setMatchup(data);
        } catch (error) {
            console.error('Error fetching matchup details:', error);
            Alert.alert('Error', 'Failed to load matchup details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const joinMatchup = async () => {
        if (!user) {
            Alert.alert('Error', 'You must be logged in to join a matchup');
            return;
        }

        try {
            setLoadingAction(true);
            
            // Optimistic update
            const updatedParticipants = matchup.participants 
                ? [...matchup.participants, { id: user.id, firstname: user.firstname,lastname: user.lastname }]
                : [{ id: user.id, firstname: user.firstname,lastname: user.lastname }];
            
            setMatchup(prev => ({
                ...prev,
                participants: updatedParticipants,
                isParticipant: true,
                isFull: updatedParticipants.length >= prev.maxParticipants
            }));

            // API call
            await axios.post(`${API_URL}/${matchup.id}/participants/${user.id}`);
            Alert.alert('Success', 'You have joined the matchup!');
            
            // Refresh to get accurate data
            fetchMatchupDetails();
            
        } catch (error) {
            console.error('Error joining matchup:', error);
            
            // Revert optimistic update
            const revertedParticipants = matchup.participants 
                ? matchup.participants.filter(p => p.id !== user.id)
                : [];
            
            setMatchup(prev => ({
                ...prev,
                participants: revertedParticipants,
                isParticipant: false,
                isFull: revertedParticipants.length >= prev.maxParticipants
            }));
            
            Alert.alert('Error', 'Failed to join matchup. It might be full or you may already be a participant.');
        } finally {
            setLoadingAction(false);
        }
    };

    const leaveMatchup = async () => {
        Alert.alert(
            'Leave Matchup',
            'Are you sure you want to leave this matchup?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoadingAction(true);
                            
                            // Note: You'll need to implement a leave endpoint in your backend
                            // await axios.delete(`${API_URL}/${matchup.id}/participants/${user.id}`);
                            
                            // For now, just update the UI optimistically
                            const updatedParticipants = matchup.participants.filter(p => p.id !== user.id);
                            setMatchup(prev => ({
                                ...prev,
                                participants: updatedParticipants,
                                isParticipant: false,
                                isFull: false
                            }));
                            
                            Alert.alert('Success', 'You have left the matchup');
                        } catch (error) {
                            console.error('Error leaving matchup:', error);
                            Alert.alert('Error', 'Failed to leave matchup');
                        } finally {
                            setLoadingAction(false);
                        }
                    }
                }
            ]
        );
    };

    const closeMatchup = async () => {
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
                            await axios.post(`${API_URL}/${matchup.id}/close`);
                            Alert.alert('Success', 'Matchup closed successfully!');
                            fetchMatchupDetails();
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

    const onRefresh = () => {
        setRefreshing(true);
        fetchMatchupDetails();
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        return {
            date: date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    const getSkillLevelColor = (level) => {
        switch(level) {
            case 'beginner': return '#4CAF50';
            case 'intermediate': return '#FF9800';
            case 'advanced': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const getSkillLevelText = (level) => {
        switch(level) {
            case 'beginner': return 'Débutant';
            case 'intermediate': return 'Intermédiaire';
            case 'advanced': return 'Avancé';
            default: return level;
        }
    };

    const getStatusColor = (status, isFull) => {
        if (status === 'closed') return '#F44336';
        if (isFull) return '#FF9800';
        return '#4CAF50';
    };

    const getStatusText = (status, isFull) => {
        if (status === 'closed') return 'Fermé';
        if (isFull) return 'Complet';
        return 'Ouvert';
    };

   const renderParticipant = ({ item }) => (
  <View style={styles.participantItem}>
    <View style={styles.participantAvatar}>
      <Text style={styles.participantInitial}>
        {item.firstname ? item.firstname[0].toUpperCase() : 'U'}
      </Text>
    </View>
    <Text style={styles.participantName}>
      {(item.firstname && item.lastname)
        ? `${item.firstname} ${item.lastname}`
        : 'Unknown User'}
    </Text>
  </View>
);


    const dateTime = formatDateTime(matchup.eventDate);

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#007bff']}
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails du Matchup</Text>
                <View style={styles.headerRight} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Title and Status */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{matchup.title}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(matchup.status, matchup.isFull) }
                    ]}>
                        <Text style={styles.statusText}>
                            {getStatusText(matchup.status, matchup.isFull)}
                        </Text>
                    </View>
                </View>

                {/* Sport */}
                <View style={styles.sportSection}>
                    <Ionicons name="basketball" size={20} color="#007bff" />
                    <Text style={styles.sportText}>{matchup.sport}</Text>
                </View>

                {/* Description */}
                {matchup.description && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{matchup.description}</Text>
                    </View>
                )}

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Détails</Text>
                    
                    <View style={styles.detailRow}>
                        <Ionicons name="location" size={20} color="#666" />
                        <Text style={styles.detailText}>{matchup.location}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={20} color="#666" />
                        <Text style={styles.detailText}>{dateTime.date}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time" size={20} color="#666" />
                        <Text style={styles.detailText}>{dateTime.time}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="people" size={20} color="#666" />
                        <Text style={styles.detailText}>
                            {matchup.participants ? matchup.participants.length : 0} / {matchup.maxParticipants} participants
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="trending-up" size={20} color="#666" />
                        <Text style={[
                            styles.detailText,
                            { color: getSkillLevelColor(matchup.skillLevel) }
                        ]}>
                            Niveau: {getSkillLevelText(matchup.skillLevel)}
                        </Text>
                    </View>
                </View>

                {/* Participants */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Participants ({matchup.participants ? matchup.participants.length : 0})
                    </Text>
                    
                    {matchup.participants && matchup.participants.length > 0 ? (
                        <FlatList
                            data={matchup.participants}
                            renderItem={renderParticipant}
                            keyExtractor={(item, index) => `${item.id}-${index}`}
                            scrollEnabled={false}
                            contentContainerStyle={styles.participantsList}
                        />
                    ) : (
                        <Text style={styles.noParticipants}>Aucun participant pour le moment</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    {matchup.isParticipant ? (
                        <View style={styles.participantBadgeContainer}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.participantBadgeText}>Vous participez à ce matchup</Text>
                            {matchup.status !== 'closed' && (
                                <TouchableOpacity
                                    style={styles.leaveButton}
                                    onPress={leaveMatchup}
                                    disabled={loadingAction}
                                >
                                    <Text style={styles.leaveButtonText}>Quitter</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        !matchup.isFull && matchup.status !== 'closed' && (
                            <TouchableOpacity
                                style={styles.joinButton}
                                onPress={joinMatchup}
                                disabled={loadingAction}
                            >
                                {loadingAction ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle" size={20} color="#fff" />
                                        <Text style={styles.joinButtonText}>Rejoindre le Matchup</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )
                    )}

                    {/* Creator actions */}
                    {matchup.createdBy === user?.id && matchup.status !== 'closed' && (
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeMatchup}
                            disabled={loadingAction}
                        >
                            <Ionicons name="close-circle" size={20} color="#fff" />
                            <Text style={styles.closeButtonText}>Fermer le Matchup</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 50,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 40,
    },
    content: {
        padding: 16,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sportSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    sportText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007bff',
        marginLeft: 8,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
        flex: 1,
    },
    participantsList: {
        paddingTop: 8,
    },
    participantItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    participantAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    participantInitial: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    participantName: {
        fontSize: 16,
        color: '#333',
    },
    noParticipants: {
        fontSize: 16,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 20,
    },
    actionSection: {
        marginTop: 8,
    },
    participantBadgeContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    participantBadgeText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
    joinButton: {
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    leaveButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    leaveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    closeButton: {
        backgroundColor: '#F44336',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default MatchupDetailsScreen;