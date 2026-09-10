import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { loadSnapshot, type Snapshot } from "../../repositories";

export interface Store {
  data: Snapshot;
  setData: Dispatch<SetStateAction<Snapshot>>;
  /** 画面を先に更新してから DB に書く。失敗したら DB から読み直してエラーを表示する */
  mutate: (optimistic: (prev: Snapshot) => Snapshot, persist: () => Promise<void>) => void;
  error: string | null;
  reload: () => Promise<void>;
}

const EMPTY: Snapshot = { workspace: null, members: [], projects: [], sections: [], tasks: [] };

/**
 * アプリ全体のデータを1つの Snapshot として持つ。
 * 初期表示で loadSnapshot を1回呼び、以降の更新は楽観的に行う（last write wins）。
 */
export function useStore() {
  const [data, setData] = useState<Snapshot>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      loadSnapshot()
        .then((snapshot) => {
          setData(snapshot);
          setError(null);
        })
        .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
        .finally(() => setLoading(false)),
    [],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const mutate = useCallback<Store["mutate"]>(
    (optimistic, persist) => {
      setData(optimistic);
      persist().catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
        reload();
      });
    },
    [reload],
  );

  const store: Store = { data, setData, mutate, error, reload };
  return { store, loading, error, clearError: () => setError(null) };
}
