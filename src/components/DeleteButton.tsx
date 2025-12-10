import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type DeleteButtonProps = {
  onPress: () => void;
  loading?: boolean;
};

export function DeleteButton({ onPress, loading = false }: DeleteButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="やらない項目を削除"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#b91c1c" />
      ) : (
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={22}
          color="#b91c1c"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
