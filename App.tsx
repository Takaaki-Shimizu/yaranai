import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  api,
  type IncomeType,
  type IncomeSettingResponse,
  type YaranaiItem,
} from './src/lib/api';
import { YaranaiItemRow } from './src/components/YaranaiItemRow';
import { IncomeSettingModal } from './src/components/IncomeSettingModal';

export default function App() {
  const [items, setItems] = useState<YaranaiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [incomeType, setIncomeType] = useState<IncomeType>('hourly');
  const [incomeAmount, setIncomeAmount] = useState('');

  // 新規登録用
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 一覧取得関数を外出し（登録後にも使う）
  const fetchItems = () => {
    setLoading(true);
    api
      .get<YaranaiItem[]>('/yaranai-items')
      .then((res) => {
        setItems(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 初期読み込み
  useEffect(() => {
    fetchItems();
  }, []);

  // 登録処理
  const handleAdd = () => {
    if (!title.trim()) {
      return;
    }

    api
      .post('/yaranai-items', {
        title,
        description: description || null,
      })
      .then(() => {
        // 入力欄をクリア
        setTitle('');
        setDescription('');
        // 一覧を再取得
        fetchItems();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    api
      .delete(`/yaranai-items/${id}`)
      .then(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setDeletingId(null);
      });
  };

  const handleUpdate = (id: number, payload: { title: string; description: string | null }) => {
    setUpdatingId(id);
    return api
      .put<YaranaiItem>(`/yaranai-items/${id}`, payload)
      .then((res) => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? res.data : item))
        );
      })
      .catch((err) => {
        console.error(err);
        throw err;
      })
      .finally(() => {
        setUpdatingId(null);
      });
  };

  const handleIncomeSubmit = (values: {
    incomeType: IncomeType;
    amount: string;
  }) => {
    const amountNumber = Number(values.amount);
    if (!Number.isFinite(amountNumber) || amountNumber < 0) {
      return Promise.reject(new Error('invalid amount'));
    }

    return api
      .post<IncomeSettingResponse>('/income-settings', {
        income_type: values.incomeType,
        amount: amountNumber,
      })
      .then((res) => {
        setHourlyRate(res.data.hourly_rate);
        setIncomeType(values.incomeType);
        setIncomeAmount(values.amount);
        setIncomeModalVisible(false);
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  const formattedHourlyRate = useMemo(() => {
    if (hourlyRate == null) {
      return null;
    }

    const floored = Math.floor(hourlyRate);
    const formatter = new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(floored);
  }, [hourlyRate]);

  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <View style={styles.heroBubbleOne} />
        <View style={styles.heroBubbleTwo} />
        <View style={styles.heroRow}>
          <View style={styles.logoBlock}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>
                Ya
                <Text style={styles.logoTextAccent}>ranai</Text>
              </Text>
              <View style={styles.logoPlus}>
                <MaterialCommunityIcons
                  name="plus"
                  size={18}
                  color="#fff"
                />
              </View>
            </View>
            <Text style={styles.logoSubtext}>
              大事な自分を守るための「やらない」から始めよう
            </Text>
          </View>
          <TouchableOpacity
            style={styles.hourlyInfo}
            onPress={() => setIncomeModalVisible(true)}
            activeOpacity={0.9}
          >
            <Text style={styles.hourlyLabel}>あなたの時給</Text>
            <View style={styles.hourlyValueRow}>
              {formattedHourlyRate ? (
                <>
                  <Text style={styles.hourlyValue}>{formattedHourlyRate}</Text>
                  <Text style={styles.hourlyYen}>円</Text>
                </>
              ) : (
                <Text style={styles.hourlyValue}>未設定です</Text>
              )}
              <View style={styles.hourlyEditBadge}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={14}
                  color="#fff"
                />
                <Text style={styles.hourlyEditText}>整える</Text>
              </View>
            </View>
            <Text style={styles.hourlyMessage}>
              今日のわたしの時間を、大切に積み上げていこう。
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 入力欄 */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>今日、やらないと決めること</Text>
        <TextInput
          style={styles.input}
          placeholder="例: ベッドでスマホを触らない"
          placeholderTextColor="#c08497"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.formLabel}>気持ちを添えるメモ（任意）</Text>
        <TextInput
          style={[styles.input, styles.inputSecondary]}
          placeholder="例: おやすみ前の時間を自分に使う"
          placeholderTextColor="#c4a1b5"
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>やらないことを追加</Text>
        </TouchableOpacity>
      </View>

      {/* 一覧 */}
      {loading ? (
        <Text>読み込み中...</Text>
      ) : (
        <FlatList
          style={{ marginTop: 24 }}
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <YaranaiItemRow
              item={item}
              deleting={deletingId === item.id}
              updating={updatingId === item.id}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}
          ListEmptyComponent={<Text>まだ登録されていません。</Text>}
        />
      )}

      <IncomeSettingModal
        visible={incomeModalVisible}
        defaultType={incomeType}
        defaultAmount={incomeAmount}
        onClose={() => setIncomeModalVisible(false)}
        onSubmit={handleIncomeSubmit}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: 24,
    backgroundColor: '#fff9fb',
  },
  heroContainer: {
    backgroundColor: '#fef2f6',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBubbleOne: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fde0f0',
    top: -30,
    right: -20,
    opacity: 0.5,
  },
  heroBubbleTwo: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffedd5',
    bottom: -20,
    left: -10,
    opacity: 0.6,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoBlock: {
    flex: 1,
    paddingRight: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: 1,
  },
  logoTextAccent: {
    color: '#f97316',
    fontWeight: '900',
  },
  logoPlus: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ec4899',
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 4,
  },
  logoSubtext: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
  },
  hourlyInfo: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#dbf1ff',
    shadowColor: '#93c5fd',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  hourlyLabel: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  hourlyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hourlyValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  hourlyYen: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 4,
  },
  hourlyMessage: {
    marginTop: 8,
    fontSize: 11,
    color: '#1e3a8a',
    lineHeight: 16,
  },
  hourlyEditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#f472b6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hourlyEditText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
  },
  formCard: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#f472b6',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffe4ed',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#be123c',
    marginBottom: 10,
  },
  formLabel: {
    marginTop: 16,
    fontSize: 12,
    color: '#9d174d',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fbcfe8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fff7fb',
    color: '#312e81',
  },
  inputSecondary: {
    marginTop: 8,
    backgroundColor: '#fdf2f8',
  },
  addButton: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f472b6',
    borderRadius: 999,
    paddingVertical: 12,
    shadowColor: '#f472b6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
