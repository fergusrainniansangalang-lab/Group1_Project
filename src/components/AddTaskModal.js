import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Square, CheckSquare } from 'lucide-react-native';
import { theme } from '../styles/theme';

// Merge helpers: keep the "other half" of a Date object when only
// the date part or only the time part was changed by a picker.
const mergeDatePart = (base, datePart) => {
  const merged = new Date(base);
  merged.setFullYear(datePart.getFullYear(), datePart.getMonth(), datePart.getDate());
  return merged;
};

const mergeTimePart = (base, timePart) => {
  const merged = new Date(base);
  merged.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
  return merged;
};

const AddTaskModal = ({ visible, onClose, onSave, editingTask, onDelete, initialTitle }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [hasDateRange, setHasDateRange] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Android shows pickers one at a time via these toggles.
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      if (editingTask.startDate && editingTask.endDate) {
        setStartDate(new Date(editingTask.startDate));
        setEndDate(new Date(editingTask.endDate));
        setHasDateRange(true);
      } else {
        const now = new Date();
        setStartDate(now);
        setEndDate(new Date(now.getTime() + 60 * 60 * 1000));
        setHasDateRange(false);
      }
    } else {
      setTitle(initialTitle || '');
      setDescription('');
      const now = new Date();
      setStartDate(now);
      setEndDate(new Date(now.getTime() + 60 * 60 * 1000));
      setHasDateRange(false);
    }
    setError('');
  }, [editingTask, visible, initialTitle]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (hasDateRange && endDate.getTime() <= startDate.getTime()) {
      setError('End date & time must be after the start');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      startDate: hasDateRange ? startDate.getTime() : null,
      endDate: hasDateRange ? endDate.getTime() : null,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>

          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError('');
            }}
            placeholder="What needs to be done?"
            placeholderTextColor={theme.colors.textMuted}
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setHasDateRange(!hasDateRange)}
          >
            {hasDateRange ? (
              <CheckSquare color={theme.colors.primary} size={22} />
            ) : (
              <Square color={theme.colors.textMuted} size={22} />
            )}
            <Text style={styles.checkboxLabel}>Date</Text>
          </TouchableOpacity>

          {hasDateRange && (
            <View>
              <Text style={styles.label}>From</Text>
              {Platform.OS === 'ios' ? (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setStartDate(mergeDatePart(startDate, selectedDate));
                    }}
                  />
                  <DateTimePicker
                    value={startDate}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) setStartDate(mergeTimePart(startDate, selectedTime));
                    }}
                  />
                </View>
              ) : (
                <View style={styles.pickerRow}>
                  <TouchableOpacity
                    style={[styles.input, styles.pickerButton]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={{ color: theme.colors.text }}>
                      {startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.pickerButton]}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={{ color: theme.colors.text }}>
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) setStartDate(mergeDatePart(startDate, selectedDate));
                      }}
                    />
                  )}
                  {showStartTimePicker && (
                    <DateTimePicker
                      value={startDate}
                      mode="time"
                      display="default"
                      onChange={(event, selectedTime) => {
                        setShowStartTimePicker(false);
                        if (selectedTime) setStartDate(mergeTimePart(startDate, selectedTime));
                      }}
                    />
                  )}
                </View>
              )}

              <Text style={styles.label}>To</Text>
              {Platform.OS === 'ios' ? (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setEndDate(mergeDatePart(endDate, selectedDate));
                    }}
                  />
                  <DateTimePicker
                    value={endDate}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) setEndDate(mergeTimePart(endDate, selectedTime));
                    }}
                  />
                </View>
              ) : (
                <View style={styles.pickerRow}>
                  <TouchableOpacity
                    style={[styles.input, styles.pickerButton]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={{ color: theme.colors.text }}>
                      {endDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.input, styles.pickerButton]}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={{ color: theme.colors.text }}>
                      {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setEndDate(mergeDatePart(endDate, selectedDate));
                      }}
                    />
                  )}
                  {showEndTimePicker && (
                    <DateTimePicker
                      value={endDate}
                      mode="time"
                      display="default"
                      onChange={(event, selectedTime) => {
                        setShowEndTimePicker(false);
                        if (selectedTime) setEndDate(mergeTimePart(endDate, selectedTime));
                      }}
                    />
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {editingTask && onDelete && (
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => {
                  onDelete(editingTask.id);
                  onClose();
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <View style={{flex: 1}} />
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingTask ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
  },
  multilineInput: {
    minHeight: 80,
  },
  pickerContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  checkboxLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
  },
  pickerButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
    marginTop: -theme.spacing.sm,
    ...theme.typography.caption,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  deleteButtonText: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  cancelButton: {
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
  },
  saveButtonText: {
    ...theme.typography.body,
    color: theme.colors.surface,
  },
});

export default AddTaskModal;
