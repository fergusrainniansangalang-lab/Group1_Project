# TaskFlow — React Native To-Do List

TaskFlow is a modern mobile To-Do List application built with React Native. It helps users organize their day by adding, editing, searching, and filtering tasks, while keeping data persistent.

## Learning Objectives

This project was built as an educational demonstration of the following React Native and JavaScript concepts:

* **Arrays & Array Methods**: Utilizes arrays to manage state. Demonstrates practical use of `.map()`, `.filter()`, `.find()`, `.findIndex()`, `.some()`, and `.reduce()`.
* **FlatList**: Efficiently renders a list of tasks without relying on `.map()` for the main UI structure.
* **Controlled Inputs**: Uses React state to manage form inputs (e.g., Add/Edit Task modal).
* **Uncontrolled Inputs**: Demonstrates the use of `useRef` to clear/focus the search input natively.
* **Callbacks**: Implements parent-child communication for task actions (toggling, editing, deleting).
* **Promises**: Uses Promises to wrap asynchronous local storage operations.
* **Async/Await**: Used heavily for startup data loading and data persistence handling.
* **Local Storage / Cache**: Persists data using `@react-native-async-storage/async-storage` so it survives app restarts.
* **APK Generation**: Preconfigured and ready for generating an Android APK release build.

## Installation

```bash
# Install the project dependencies
npm install
```

## Running the application

```bash
# Start the Metro bundler
npm start

# Run on Android
npm run android
```

## Project Structure

```text
TaskFlow/
├── src/
│   ├── components/      # Reusable UI components (TaskItem, TaskList, etc.)
│   ├── screens/         # Main screens (HomeScreen)
│   ├── services/        # Logic for AsyncStorage operations
│   ├── utils/           # Helper functions (ID generation)
│   └── styles/          # Design system and theme variables
├── App.js               # Entry point of the application
├── package.json         # Dependencies and scripts
└── android/             # Android native code and build configurations
```

## Educational Walkthrough

- **`src/screens/HomeScreen.js`**: Contains main state logic, `async/await`, array methods (`map`, `filter`, `find`, `findIndex`, `some`), and callbacks.
- **`src/components/TaskStats.js`**: Demonstrates `.reduce()` to calculate task statistics dynamically.
- **`src/components/TaskList.js`**: Showcases `FlatList` with `ListEmptyComponent` and `keyExtractor`.
- **`src/components/AddTaskModal.js`**: Shows controlled components tied to state (`useState`).
- **`src/components/SearchBar.js`**: Highlights uncontrolled component usage with `useRef`.
- **`src/services/taskStorage.js`**: Implements custom Promises wrapped around `AsyncStorage`.

## Laboratory Concept Mapping

| Required Concept        | Implementation              | Location |
| ----------------------- | --------------------------- | -------- |
| Arrays                  | Task state array            | `HomeScreen.js` |
| `map()`                 | Task toggling               | `HomeScreen.js` |
| `filter()`              | Search/filter / deletion    | `HomeScreen.js` |
| `find()`                | Retrieve task for edit      | `HomeScreen.js` |
| `findIndex()`           | Update task after edit      | `HomeScreen.js` |
| `some()`                | Checking if any task is done| `HomeScreen.js` |
| `reduce()`              | Task statistics             | `TaskStats.js` |
| FlatList                | Main task rendering         | `TaskList.js` |
| Controlled variable     | Add/Edit Task form          | `AddTaskModal.js` |
| Uncontrolled variable   | Search input ref            | `SearchBar.js` |
| Callback                | Parent-child task handlers  | `TaskItem.js` / `HomeScreen.js` |
| Promise                 | Storage service             | `taskStorage.js` |
| Async/Await             | Loading/saving tasks        | `HomeScreen.js` |
| Cache/Temporary Storage | AsyncStorage                | `taskStorage.js` |
| APK                     | Android release build       | `BUILD_APK.md` |
