import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { loadSnapshot, subscribeToChanges, type Snapshot } from "../../repositories";

export interface Store {
  data: Snapshot;
  setData: Dispatch<SetStateAction<Snapshot>>;
  /** 画面を先に更新してから DB に書く。失敗したら DB から読み直してエラーを表示する */
  mutate: (optimistic: (prev: Snapshot) => Snapshot, persist: () => Promise<void>) => void;
  error: string | null;
  reload: () => Promise<void>;
}

const EMPTY: Snapshot = { workspace: null, members: [], projects: [], sections: [], tasks: [] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * ログイン直後は発行されたばかりのトークンを API 側が「未来の発行時刻」と判定して
 * 一時的に失敗することがある（サーバー間の時計のズレ）。少し待って読み直す。
 */
async function loadWithRetry(attempts = 3): Promise<Snapshot> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await loadSnapshot();
    } catch (e) {
      lastError = e;
      await sleep(1000 * (i + 1));
    }
  }
  throw lastError;
}

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
      loadWithRetry()
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

  // 自分の書き込み中に他人の変更通知で読み直すと、まだ届いていない自分の変更が一瞬消える。
  // 書き込みが終わるまで読み直しを待たせる
  const pendingWrites = useRef(0);
  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) clearTimeout(reloadTimer.current);
    reloadTimer.current = setTimeout(() => {
      reloadTimer.current = null;
      if (pendingWrites.current > 0) scheduleReload();
      else reload();
    }, 400);
  }, [reload]);

  // 他の端末の変更をリロードなしで反映する（#53）。通知が来たら少し待ってまとめて読み直す
  useEffect(() => subscribeToChanges(() => scheduleReload()), [scheduleReload]);

  const mutate = useCallback<Store["mutate"]>(
    (optimistic, persist) => {
      setData(optimistic);
      pendingWrites.current += 1;
      persist()
        .catch((e) => {
          setError(e instanceof Error ? e.message : String(e));
          reload();
        })
        .finally(() => {
          pendingWrites.current -= 1;
        });
    },
    [reload],
  );

  const store: Store = { data, setData, mutate, error, reload };
  return { store, loading, error, clearError: () => setError(null) };
}
