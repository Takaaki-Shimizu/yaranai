import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DeleteButton } from './DeleteButton';
import type { YaranaiItem } from '../lib/api';

type UpdatePayload = {
  title: string;
  description: string | null;
};

type Props = {
  item: YaranaiItem;
  deleting: boolean;
  updating: boolean;
  onDelete: (id: number) => void;
  onUpdate: (id: number, payload: UpdatePayload) => Promise<void>;
};

export function YaranaiItemRow({
  item,
  deleting,
  updating,
  onDelete,
  onUpdate,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setTitle(item.title);
      setDescription(item.description ?? '');
    }
  }, [item, editing]);

  const startEdit = () => {
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setTitle(item.title);
    setDescription(item.description ?? '');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onUpdate(item.id, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
      });
      setEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <View style={styles.item}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="タイトル"
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="説明（任意）"
        />
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.secondaryButton, styles.actionButton]}
            onPress={cancelEdit}
            disabled={saving}
          >
            <Text style={styles.secondaryButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.actionButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>保存</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.itemDescription}>{item.description}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={startEdit}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="項目を編集"
          >
            <MaterialCommunityIcons name="pencil" size={22} color="#2563eb" />
          </TouchableOpacity>
          <DeleteButton onPress={() => onDelete(item.id)} loading={deleting} />
        </View>
      </View>
      {updating ? (
        <View style={styles.updatingBadge}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.updatingText}>更新中...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  itemDescription: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconButton: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    marginRight: 8,
  },
  updatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  updatingText: {
    fontSize: 12,
    color: '#2563eb',
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    marginLeft: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
