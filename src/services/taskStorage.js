import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@taskflow_tasks';

export const taskStorage = {
  // PROMISE: We return a new Promise to handle the asynchronous nature of storage.
  saveTasks(tasks) {
    return new Promise(async (resolve, reject) => {
      try {
        const jsonValue = JSON.stringify(tasks);
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },

  // PROMISE: Wraps the load operation
  loadTasks() {
    return new Promise(async (resolve, reject) => {
      try {
        const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (jsonValue != null) {
          resolve(JSON.parse(jsonValue));
        } else {
          resolve([]); // No tasks found
        }
      } catch (error) {
        reject(error);
      }
    });
  }
};
