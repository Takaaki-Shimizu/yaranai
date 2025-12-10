import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
  const titleInputRef = useRef<TextInput | null>(null);
  const focusCountRef = useRef(0);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editing) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      focusCountRef.current = 0;
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    } else {
      titleInputRef.current?.focus();
    }
  }, [item, editing]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!editing || saving) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim()
      ? description.trim()
      : null;

    if (!trimmedTitle) {
      setTitle(item.title);
      setDescription(item.description ?? '');
      setEditing(false);
      return;
    }

    const currentDescription = item.description ?? null;
    if (
      trimmedTitle === item.title &&
      trimmedDescription === currentDescription
    ) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onUpdate(item.id, {
        title: trimmedTitle,
        description: trimmedDescription,
      });
      setEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleOutsideTap = () => {
    if (!editing) {
      setEditing(true);
    }
  };

  const handleInputFocus = () => {
    focusCountRef.current += 1;
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const handleInputBlur = () => {
    if (!editing) {
      return;
    }

    focusCountRef.current = Math.max(0, focusCountRef.current - 1);
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }

    blurTimeoutRef.current = setTimeout(() => {
      if (focusCountRef.current === 0) {
        handleSave();
      }
    }, 120);
  };

  if (editing) {
    return (
      <View style={styles.item}>
        <TextInput
          ref={titleInputRef}
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="タイトル"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          returnKeyType="next"
        />
        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          value={description}
          onChangeText={setDescription}
          placeholder="説明（任意）"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          multiline
        />
        <Text style={styles.editHint}>別の場所をタップすると保存されます</Text>
        {saving ? (
          <View style={styles.updatingBadge}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.updatingText}>保存中...</Text>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <TouchableOpacity
          style={styles.itemText}
          onPress={handleOutsideTap}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="項目を編集"
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.itemDescription}>{item.description}</Text>
          ) : null}
        </TouchableOpacity>

        <View style={styles.actions}>
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
  editHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
  },
});
