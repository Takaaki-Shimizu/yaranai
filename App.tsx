import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
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
      return '未設定です';
    }

    const floored = Math.floor(hourlyRate);
    const formatter = new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(floored)}円`;
  }, [hourlyRate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yaranai</Text>
        <TouchableOpacity
          style={styles.hourlyInfo}
          onPress={() => setIncomeModalVisible(true)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.hourlyLabel}>あなたの時給は</Text>
            <Text style={styles.hourlyValue}>{formattedHourlyRate}</Text>
          </View>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={22}
            color="#2563eb"
            style={styles.hourlyIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 入力欄 */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="やらないことを入力"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, { marginTop: 8 }]}
          placeholder="説明（任意）"
          value={description}
          onChangeText={setDescription}
        />

        <Button title="追加" onPress={handleAdd} />
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
    paddingTop: 80,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  hourlyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  hourlyLabel: {
    fontSize: 12,
    color: '#2563eb',
  },
  hourlyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  hourlyIcon: {
    marginLeft: 8,
  },
  form: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
});
