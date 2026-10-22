
##  1. How to Run the Application

Before we dive into the code, let's get the application running on your machine.

### Prerequisites
Make sure you have installed:
- **Node.js** (v18 or higher)
- **Java Development Kit (JDK)**
- **Android Studio** (for the Android emulator)

### Step-by-step Setup
1. **Open your terminal** and navigate to the project folder (e.g., `cd ToDoApp`).
2. **Install the dependencies:** This will read the `package.json` file and install all necessary libraries.
   ```bash
   npm install
   ```
3. **Start the Metro Bundler:** Metro is the JavaScript bundler for React Native. It packages your JavaScript code so the app can understand it.
   ```bash
   npm start
   ```
4. **Run the App on Android:** Open a second terminal window (keep the Metro Bundler running) and execute:
   ```bash
   npm run android
   ```
   *This command will build the app and launch it on your connected Android emulator or physical device.*

---

##  2. How the App Works: Core Concepts

TaskFlow is built using **React Native** and uses **React Hooks** to manage what the user sees on the screen. Let's break down how the pieces fit together.

### The Entry Point
The app starts at `App.js`. However, `App.js` is kept very simple. Its only job is to load our main screen:
```javascript
// App.js
import React from 'react';
import HomeScreen from './src/screens/HomeScreen';

const App = () => {
  return <HomeScreen />;
};
```
*Note on "Navigation": Because this is a single-screen laboratory application, we intentionally did not install a heavy library like `react-navigation`. Instead, "navigation" (like opening the Add Task screen) is handled by rendering a React Native `<Modal>` component over the current screen.*

---

##  3. Deep Dive: Local Storage (AsyncStorage)

One of the most important features of a mobile app is **persistence**—saving data so it doesn't disappear when the user closes the app. We accomplish this using `@react-native-async-storage/async-storage`.

You will find this logic located in `src/services/taskStorage.js`.

### How Saving Works
AsyncStorage can only save **strings**. Therefore, before we save our tasks (which is a JavaScript array of objects), we must convert them into a string using `JSON.stringify()`.

```javascript
// Inside taskStorage.js
saveTasks(tasks) {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Convert the JavaScript array into a string format
      const jsonValue = JSON.stringify(tasks);
      
      // 2. Save the string to the device's storage asynchronously
      await AsyncStorage.setItem('@taskflow_tasks', jsonValue);
      
      resolve(true); // Tell the app we succeeded!
    } catch (error) {
      reject(error); // Tell the app we failed!
    }
  });
}
```

### How Loading Works
When the app opens, it needs to retrieve that data. Because the data was saved as a string, we must convert it back into a JavaScript array using `JSON.parse()`.

```javascript
// Inside taskStorage.js
loadTasks() {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Get the string data from the device
      const jsonValue = await AsyncStorage.getItem('@taskflow_tasks');
      
      if (jsonValue != null) {
        // 2. Convert it back into a JavaScript array
        resolve(JSON.parse(jsonValue)); 
      } else {
        // 3. If there is no data, return an empty array
        resolve([]); 
      }
    } catch (error) {
      reject(error);
    }
  });
}
```
**Why do we use Promises and `async/await`?**
Reading and writing to the phone's hard drive takes time. If we didn't wait for it to finish, the app would try to display tasks before they were loaded, causing a crash. `async/await` ensures the app patiently waits for the storage operations to complete.

---

##  4. Deep Dive: Functions and Array Methods

The heart of the application lives in `src/screens/HomeScreen.js`. Here, we use various JavaScript **Array Methods** to manipulate our to-do list.

### `map()` - Toggling a Task
When you check off a task, we need to update that specific task without changing the others. We use `.map()` to iterate over the array. If the task ID matches the one you clicked, we flip its `completed` status.

```javascript
const handleToggleTask = (taskId) => {
  const updatedTasks = tasks.map(task => 
    // If this is the task the user clicked, reverse its "completed" status.
    // Otherwise, return the task unchanged.
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  setTasks(updatedTasks);
};
```

### `filter()` - Deleting and Searching
The `.filter()` method creates a brand new array, but only includes items that pass a specific test. 

**For Deleting:** We filter out the task the user wants to delete.
```javascript
// Return all tasks EXCEPT the one with the matching ID
const updatedTasks = tasks.filter(task => task.id !== taskId);
```

**For Searching:** We filter tasks based on what the user typed in the search bar.
```javascript
const getFilteredTasks = () => {
  return tasks.filter(task => {
    // Check if the task title includes the search word
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });
};
```

### `findIndex()` - Editing a Task
When you edit a task, we need to know exactly *where* in the array that task is located so we can replace it.

```javascript
// Find the exact position (index) of the task in the array (e.g., Position 0, 1, 2)
const taskIndex = tasks.findIndex(t => t.id === editingTask.id);

if (taskIndex !== -1) { // -1 means it wasn't found
  updatedTasks = [...tasks];
  // Replace the old details with the new details at that specific position
  updatedTasks[taskIndex].title = taskData.title; 
}
```

### `reduce()` - Calculating Statistics
At the top of the app, you'll see a count of your total and active tasks. We use `.reduce()` in `src/components/TaskStats.js` to calculate this.

```javascript
// Start counting at 0. For every task that is NOT completed, add 1 to the count.
const active = tasks.reduce((count, task) => (!task.completed ? count + 1 : count), 0);
```

---

##  5. User Interface (UI) Components

To keep our code clean, we broke the UI into small, reusable pieces located in `src/components/`.

1. **`TaskList.js` (FlatList)**: We do not use `.map()` to render the visual list of tasks. Instead, we use React Native's `<FlatList>`. It is highly optimized for mobile devices and only renders the tasks that fit on the screen, saving memory.
2. **`AddTaskModal.js` (Controlled Inputs)**: The text boxes you type into are "Controlled." This means every time you press a key on your keyboard, React updates its internal state (`useState`) to exactly match what you typed.
3. **`SearchBar.js` (Uncontrolled Inputs)**: We use a `useRef` here. Instead of updating React state on every single keystroke, `useRef` creates a direct tunnel to the native search input, allowing us to command it directly (like telling it to `.clear()`).

---

##  Conclusion

By studying this application, you are looking at fundamental concepts used by professional React Native developers every day. 

Take your time exploring the files inside the `src/` folder. Try breaking the code and putting it back together—it is the best way to learn! Happy coding!
