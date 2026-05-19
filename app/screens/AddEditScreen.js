import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase/config';
import { COLORS } from '../theme';
import CustomAlert from '../components/CustomAlert';

export default function AddEditScreen({ navigation, route }) {
  const existingGift = route.params?.gift || null;
  const isEditing = existingGift !== null;

  const [personName, setPersonName] = useState(existingGift?.personName || '');
  const [giftIdea, setGiftIdea] = useState(existingGift?.giftIdea || '');
  const [eventDate, setEventDate] = useState(
    existingGift?.eventDate ? new Date(existingGift.eventDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, message: '', onConfirm: null });

  const showAlert = (message, onConfirm) =>
    setAlert({ visible: true, message, onConfirm });
  const hideAlert = () =>
    setAlert({ visible: false, message: '', onConfirm: null });

  const formatDate = (date) => {
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setEventDate(selectedDate);
  };

  const handleSave = async () => {
    if (!personName || !giftIdea) {
      showAlert('Please fill in all fields.', hideAlert);
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'gifts', existingGift.id), {
          personName,
          giftIdea,
          eventDate: eventDate.toISOString(),
        });
        showAlert('Gift plan updated successfully!', () => {
          hideAlert();
          navigation.goBack();
        });
      } else {
        await addDoc(collection(db, 'gifts'), {
          personName,
          giftIdea,
          eventDate: eventDate.toISOString(),
          userId: auth.currentUser.uid,
          isGiven: false,
          createdAt: new Date().toISOString(),
        });
        showAlert('Gift plan added successfully!', () => {
          hideAlert();
          navigation.goBack();
        });
      }
    } catch (error) {
      showAlert(error.message, hideAlert);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Plan' : 'New Plan'}
        </Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inner}>

        <View style={styles.formCard}>

          {/* Person Name */}
          <Text style={styles.sectionLabel}>Who is this gift for?</Text>
          <Text style={styles.label}>Person's Name</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Maria, Juan"
              placeholderTextColor={COLORS.textLight}
              value={personName}
              onChangeText={setPersonName}
            />
          </View>

          {/* Gift Idea */}
          <Text style={styles.sectionLabel}>What's the gift?</Text>
          <Text style={styles.label}>Gift Idea</Text>
          <View style={styles.inputRow}>
            <Ionicons
              name="gift-outline"
              size={18}
              color={COLORS.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. Perfume, Watch, Book"
              placeholderTextColor={COLORS.textLight}
              value={giftIdea}
              onChangeText={setGiftIdea}
            />
          </View>

          {/* Event Date */}
          <Text style={styles.sectionLabel}>When is the event?</Text>
          <Text style={styles.label}>Event Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primaryMid}
              style={styles.inputIcon}
            />
            <Text style={styles.dateButtonText}>{formatDate(eventDate)}</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.textLight}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.buttonText}>Saving...</Text>
          ) : (
            <View style={styles.buttonInner}>
              <Ionicons
                name={isEditing ? 'checkmark-circle-outline' : 'save-outline'}
                size={18}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                {isEditing ? '  Update Gift Plan' : '  Save Gift Plan'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cancel button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.cancelButtonText}>  Cancel</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={isEditing ? 'Updated!' : 'Saved!'}
        message={alert.message}
        type={alert.message.includes('successfully') ? 'success' : 'warning'}
        confirmText="OK"
        onConfirm={alert.onConfirm || hideAlert}
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  backText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  inner: { padding: 20, paddingBottom: 40 },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryMid,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  inputIcon: { paddingHorizontal: 10 },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    paddingVertical: 14,
    paddingRight: 14,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonDisabled: { backgroundColor: COLORS.primaryMid },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cancelButton: {
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});