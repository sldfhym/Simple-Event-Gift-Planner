import {
  Modal, View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

export default function CustomAlert({
  visible, title, message, type = 'warning',
  confirmText = 'Confirm', cancelText = 'Cancel',
  onConfirm, onCancel
}) {
  const config = {
    warning: {
      icon: 'warning-outline',
      color: '#FF9800',
      bgColor: '#FFF8E1',
      borderColor: '#FFE082',
    },
    danger: {
      icon: 'trash-outline',
      color: '#E53935',
      bgColor: '#FFEEEE',
      borderColor: '#FFCDD2',
    },
    success: {
      icon: 'checkmark-circle-outline',
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      borderColor: '#C8E6C9',
    },
    info: {
      icon: 'information-circle-outline',
      color: COLORS.primary,
      bgColor: COLORS.primarySoft,
      borderColor: COLORS.border,
    },
  };

  const current = config[type] || config.warning;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>

          {/* Top accent bar */}
          <View style={[styles.topBar, { backgroundColor: current.color }]} />

          {/* Icon */}
          <View style={[styles.iconCircle, {
            backgroundColor: current.bgColor,
            borderColor: current.borderColor,
          }]}>
            <Ionicons name={current.icon} size={34} color={current.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttons}>
            {onCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onCancel}
              >
                <Ionicons
                  name="close-outline"
                  size={16}
                  color={COLORS.textMuted}
                />
                <Text style={styles.cancelText}> {cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: current.color }]}
              onPress={onConfirm}
            >
              <Ionicons
                name="checkmark-outline"
                size={16}
                color="#fff"
              />
              <Text style={styles.confirmText}> {confirmText}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 16, 48, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  box: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topBar: {
    width: '100%',
    height: 5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: 20,
  },
  divider: {
    width: '85%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});