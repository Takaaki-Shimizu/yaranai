import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { IncomeType } from '../lib/api';

type Props = {
  visible: boolean;
  defaultType: IncomeType;
  defaultAmount: string;
  onClose: () => void;
  onSubmit: (values: { incomeType: IncomeType; amount: string }) => Promise<void>;
};

const incomeOptions: Array<{ value: IncomeType; label: string }> = [
  { value: 'annual', label: '年収' },
  { value: 'monthly', label: '月収' },
  { value: 'hourly', label: '時給' },
];

export function IncomeSettingModal({
  visible,
  onClose,
  onSubmit,
  defaultType,
  defaultAmount,
}: Props) {
  const [incomeType, setIncomeType] = useState<IncomeType>('hourly');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatWithCommas = (value: string) => {
    if (!value) {
      return '';
    }

    const [integerPart, decimalPart] = value.split('.');
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart}`;
    }

    return formattedInteger;
  };

  const sanitizeAmount = (value: string) => {
    const digitsOnly = value.replace(/[^0-9.]/g, '');
    const parts = digitsOnly.split('.');
    if (parts.length === 1) {
      return parts[0];
    }
    const integer = parts.shift() ?? '';
    const decimals = parts.join('');
    return `${integer}.${decimals}`;
  };

  const handleAmountChange = (value: string) => {
    const sanitized = sanitizeAmount(value);
    setAmountRaw(sanitized);
    setAmountDisplay(formatWithCommas(sanitized));
  };

  useEffect(() => {
    if (visible) {
      setIncomeType(defaultType);
      const sanitizedDefault = sanitizeAmount(defaultAmount);
      setAmountRaw(sanitizedDefault);
      setAmountDisplay(formatWithCommas(sanitizedDefault));
      setError('');
    }
  }, [visible, defaultType, defaultAmount]);

  const handleSubmit = () => {
    if (!amountRaw.trim()) {
      setError('金額を入力してください');
      return;
    }

    setSubmitting(true);
    setError('');
    onSubmit({ incomeType, amount: amountRaw.trim() })
      .catch(() => {
        setError('保存に失敗しました。もう一度お試しください。');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>収入を入力</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close" size={22} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>入力する収入の種類</Text>
          <View style={styles.optionRow}>
            {incomeOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  index !== incomeOptions.length - 1 && styles.optionButtonSpacing,
                  incomeType === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => setIncomeType(option.value)}
                disabled={submitting}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    incomeType === option.value && styles.optionButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            {incomeType === 'annual'
              ? '年間の金額'
              : incomeType === 'monthly'
              ? '月間の金額'
              : '時給'}
          </Text>
          <TextInput
            style={styles.input}
            value={amountDisplay}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="例: 5000000"
            editable={!submitting}
          />
          <Text style={styles.hint}>※数字のみを入力してください</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
  },
  optionButtonSpacing: {
    marginRight: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionButtonText: {
    color: '#1f2937',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 8,
    color: '#b91c1c',
    fontSize: 13,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
