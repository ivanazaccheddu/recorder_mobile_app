import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Searchbar,
  IconButton,
  Menu,
  FAB,
  Card,
  Chip,
} from 'react-native-paper';
import { useRecordings } from '../context/RecordingsContext';
import { Recording, SortOption, SortOrder } from '../types';
import { fileManager } from '../storage/fileManager';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { NavigationParams } from '../types';

type NavigationProp = StackNavigationProp<NavigationParams>;

export const RecordingsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { recordings, isLoading, deleteRecording, searchRecordings, sortRecordings } =
    useRecordings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recording[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await searchRecordings(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSort = async (option: SortOption, order: SortOrder) => {
    setSortBy(option);
    setSortOrder(order);
    await sortRecordings(option, order);
    setShowSortMenu(false);
  };

  const handleDelete = (recording: Recording) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete "${recording.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(recording.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recording.');
            }
          },
        },
      ]
    );
  };

  const handlePlay = (recording: Recording) => {
    navigation.navigate('Playback', { recordingId: recording.id });
  };

  const displayRecordings = searchQuery.trim() ? searchResults : recordings;

  const renderRecording = ({ item }: { item: Recording }) => (
    <TouchableOpacity onPress={() => handlePlay(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{item.title}</Text>
              {item.isFavorite && (
                <IconButton icon="star" size={20} iconColor="#FFD700" />
              )}
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDelete(item)}
            />
          </View>

          <View style={styles.metadataContainer}>
            <Chip icon="clock-outline" compact>
              {fileManager.formatDuration(item.duration)}
            </Chip>
            <Chip icon="file-outline" compact>
              {fileManager.formatBytes(item.size)}
            </Chip>
            <Chip compact>{item.format.toUpperCase()}</Chip>
          </View>

          <Text style={styles.date}>
            {format(new Date(item.createdAt), 'MMM dd, yyyy • HH:mm')}
          </Text>

          {item.category && (
            <Chip style={styles.categoryChip}>{item.category}</Chip>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search recordings..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
        />
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <IconButton
              icon="sort"
              size={24}
              onPress={() => setShowSortMenu(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => handleSort('date', sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Date"
            leadingIcon={sortBy === 'date' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSort('name', sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Name"
            leadingIcon={sortBy === 'name' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSort('duration', sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Duration"
            leadingIcon={sortBy === 'duration' ? 'check' : undefined}
          />
          <Menu.Item
            onPress={() => handleSort('size', sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Size"
            leadingIcon={sortBy === 'size' ? 'check' : undefined}
          />
        </Menu>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text>Loading recordings...</Text>
        </View>
      ) : displayRecordings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? 'No recordings found'
              : 'No recordings yet. Start recording to see them here!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayRecordings}
          renderItem={renderRecording}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="microphone"
        style={styles.fab}
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  searchbar: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  categoryChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
