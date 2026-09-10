/** DB の読み書きに失敗したときの右下の通知 */
export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 max-w-md bg-destructive text-white text-[13px] rounded-lg shadow-lg px-4 py-3 flex items-start gap-3"
    >
      <span className="flex-1">エラー：{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100">
        閉じる
      </button>
    </div>
  );
}
