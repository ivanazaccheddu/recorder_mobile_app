import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recording, SortOption, SortOrder } from '../types';
import { databaseService } from '../storage/database';
import { fileManager } from '../storage/fileManager';

interface RecordingsContextType {
  recordings: Recording[];
  isLoading: boolean;
  error: string | null;
  refreshRecordings: () => Promise<void>;
  addRecording: (recording: Recording) => Promise<void>;
  updateRecording: (recording: Partial<Recording> & { id: string }) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  deleteMultipleRecordings: (ids: string[]) => Promise<void>;
  searchRecordings: (query: string) => Promise<Recording[]>;
  sortRecordings: (sortBy: SortOption, sortOrder: SortOrder) => Promise<void>;
}

const RecordingsContext = createContext<RecordingsContextType | undefined>(undefined);

export const RecordingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeServices = async () => {
    try {
      await databaseService.init();
      await fileManager.init();
      await refreshRecordings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
      setIsLoading(false);
    }
  };

  const refreshRecordings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allRecordings = await databaseService.getAllRecordings();
      setRecordings(allRecordings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recordings');
    } finally {
      setIsLoading(false);
    }
  };

  const addRecording = async (recording: Recording) => {
    try {
      await databaseService.saveRecording(recording);
      await refreshRecordings();
    } catch (err) {
      throw err;
    }
  };

  const updateRecording = async (recording: Partial<Recording> & { id: string }) => {
    try {
      await databaseService.updateRecording(recording);
      await refreshRecordings();
    } catch (err) {
      throw err;
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      const recording = await databaseService.getRecording(id);
      if (recording) {
        await fileManager.deleteRecording(recording.uri);
        await databaseService.deleteRecording(id);
        await refreshRecordings();
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteMultipleRecordings = async (ids: string[]) => {
    try {
      const recordingsToDelete = await Promise.all(
        ids.map(id => databaseService.getRecording(id))
      );
      const uris = recordingsToDelete
        .filter((r): r is Recording => r !== null)
        .map(r => r.uri);
      
      await fileManager.deleteMultipleRecordings(uris);
      await databaseService.deleteMultipleRecordings(ids);
      await refreshRecordings();
    } catch (err) {
      throw err;
    }
  };

  const searchRecordings = async (query: string): Promise<Recording[]> => {
    try {
      return await databaseService.searchRecordings(query);
    } catch (err) {
      throw err;
    }
  };

  const sortRecordings = async (sortBy: SortOption, sortOrder: SortOrder) => {
    try {
      setIsLoading(true);
      const sorted = await databaseService.getAllRecordings(sortBy, sortOrder);
      setRecordings(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sort recordings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RecordingsContext.Provider
      value={{
        recordings,
        isLoading,
        error,
        refreshRecordings,
        addRecording,
        updateRecording,
        deleteRecording,
        deleteMultipleRecordings,
        searchRecordings,
        sortRecordings,
      }}
    >
      {children}
    </RecordingsContext.Provider>
  );
};

export const useRecordings = (): RecordingsContextType => {
  const context = useContext(RecordingsContext);
  if (!context) {
    throw new Error('useRecordings must be used within RecordingsProvider');
  }
  return context;
};
