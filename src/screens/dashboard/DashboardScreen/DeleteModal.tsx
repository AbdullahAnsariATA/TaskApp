import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { AppItem } from 'store/slices/appsSlice';
import { COLORS } from 'utils/index';
import { ThemeColors } from 'types/themeTypes';

interface DeleteModalProps {
  visible: boolean;
  app: AppItem | null;
  colors: ThemeColors;
  bottomInset: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteModal = ({ visible, app, colors, bottomInset, onCancel, onConfirm }: DeleteModalProps) => {
  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      width: '100%',
      padding: 24,
      paddingBottom: bottomInset + 40,
    },
    icon: { fontSize: 44, textAlign: 'center', marginBottom: 12 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    appName: { fontWeight: '700', color: colors.text },
    actions: { flexDirection: 'row', gap: 12 },
    cancelBtn: {
      flex: 1,
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelText: { fontSize: 16, fontWeight: '600', color: colors.text },
    deleteBtn: {
      flex: 1,
      height: 52,
      borderRadius: 12,
      backgroundColor: COLORS.ERROR,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  });

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={modalStyles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={modalStyles.card}>
          <Text style={modalStyles.icon}>🗑️</Text>
          <Text style={modalStyles.title}>Delete Application</Text>
          <Text style={modalStyles.subtitle}>
            {'Are you sure you want to delete '}
            <Text style={modalStyles.appName}>{app?.name}</Text>
            {'? This action cannot be undone.'}
          </Text>
          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onCancel}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.deleteBtn} onPress={onConfirm}>
              <Text style={modalStyles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
