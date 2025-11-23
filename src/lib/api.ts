// src/lib/api.ts
import axios from 'axios';
import { Platform } from 'react-native';

// 将来 Android エミュレータ対応も見据えておく
const baseURL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api' // Android エミュレータ
    : 'http://127.0.0.1:8000/api'; // Web / iOS

export const api = axios.create({
  baseURL,
});

// 型定義（後で拡張していく）
export type YaranaiItem = {
  id: number;
  title: string;
  description?: string | null;
};
