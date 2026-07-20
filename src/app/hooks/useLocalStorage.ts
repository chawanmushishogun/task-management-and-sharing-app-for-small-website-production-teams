import { useState, useEffect, useRef } from "react";

const PREFIX = "asana-clone:";

/**
 * useState と同じインターフェースで、値を localStorage に永続化する。
 * 初回マウント時に保存済みの値を読み、以降は変更のたびに書き戻す。
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const storageKey = PREFIX + key;

  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === null ? initialValue : (JSON.parse(saved) as T);
    } catch {
      // 壊れた JSON やプライベートモードでの読み取り失敗は初期値で復帰する
      return initialValue;
    }
  });

  // 初回は読み込んだ直後なので書き戻さない
  const skipWrite = useRef(true);

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {
      // 容量超過（アバター画像の入れすぎなど）。保存はあきらめて動作は継続する
      console.warn(`[useLocalStorage] ${storageKey} の保存に失敗しました`, e);
    }
  }, [storageKey, value]);

  return [value, setValue] as const;
}
