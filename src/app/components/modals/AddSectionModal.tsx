import { useState } from "react";
import { Modal } from "../Modal";

/** 「その他案件」の案件（セクション）追加 */
export function AddSectionModal({ onSubmit, onClose }: { onSubmit: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const submit = () => { if (name.trim()) onSubmit(name.trim()); };

  return (
    <Modal title="案件を追加" onClose={onClose}>
      <input
        autoFocus
        className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-4 placeholder-muted-foreground"
        placeholder="例：ロゴ制作、チラシデザイン..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
          キャンセル
        </button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          追加する
        </button>
      </div>
    </Modal>
  );
}
