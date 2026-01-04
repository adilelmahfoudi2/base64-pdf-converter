import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'conversion_history';
const MAX_HISTORY_ITEMS = 50;

export const HistoryService = {
  getHistory: async () => {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      if (historyJson) {
        return JSON.parse(historyJson);
      }
      return [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  addToHistory: async (item) => {
    try {
      const history = await HistoryService.getHistory();
      
      const newItem = {
        id: Date.now().toString(),
        ...item,
        timestamp: new Date().toISOString(),
      };
      
      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
      return { success: true, item: newItem };
    } catch (error) {
      console.error('Error adding to history:', error);
      return { success: false, error: error.message };
    }
  },

  deleteFromHistory: async (id) => {
    try {
      const history = await HistoryService.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting from history:', error);
      return { success: false, error: error.message };
    }
  },

  clearHistory: async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing history:', error);
      return { success: false, error: error.message };
    }
  },

  formatDate: (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  },
};

export default HistoryService;
