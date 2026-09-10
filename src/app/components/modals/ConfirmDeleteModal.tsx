import { Modal } from "../Modal";

/** M6 削除の確認。取り消せない操作なので、対象の名前（案件ならタスク数も）を出して確認する */
export function ConfirmDeleteModal({
  title,
  targetName,
  taskCount,
  onConfirm,
  onClose,
}: {
  title: string;
  targetName: string;
  /** 案件・セクションの削除で中のタスク数を示す。タスク単体の削除では省略 */
  taskCount?: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose} width="max-w-sm">
      <p className="text-[14px] text-foreground mb-1">「{targetName}」を削除します。</p>
      {taskCount !== undefined && (
        <p className="text-[13px] text-muted-foreground mb-1">中のタスク {taskCount} 件も一緒に削除されます。</p>
      )}
      <p className="text-[13px] text-muted-foreground mb-5">この操作は取り消せません。</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          キャンセル
        </button>
        <button
          autoFocus
          onClick={onConfirm}
          className="text-[13px] px-4 py-1.5 rounded-md bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors"
        >
          削除する
        </button>
      </div>
    </Modal>
  );
}
