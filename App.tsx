import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
} from 'react-native';
import { useEffect, useState } from 'react';
import { api, type YaranaiItem } from './src/lib/api';

export default function App() {
  const [items, setItems] = useState<YaranaiItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yaranai</Text>

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
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.itemDescription}>{item.description}</Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={<Text>まだ登録されていません。</Text>}
        />
      )}

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
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
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
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
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
});
