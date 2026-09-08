import { useState } from "react";
import { Modal } from "../Modal";
import { isSubmitEnter } from "../../utils/keyboard";

export function AddTaskModal({
  sections, defaultSection, onSubmit, onClose,
}: {
  sections: string[];
  defaultSection: string;
  onSubmit: (name: string, section: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [section, setSection] = useState(defaultSection);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), section || sections[0] || "その他");
  };

  return (
    <Modal title="新しいタスク" onClose={onClose}>
      <input
        autoFocus
        className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
        placeholder="タスク名を入力..."
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => isSubmitEnter(e) && submit()}
      />
      <div className="flex items-center gap-2 mb-4">
        <select
          value={section}
          onChange={e => setSection(e.target.value)}
          className="text-[13px] bg-muted text-foreground rounded-md px-2 py-1.5 outline-none border-0"
        >
          <option value="">セクション選択</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
          キャンセル
        </button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          タスクを追加
        </button>
      </div>
    </Modal>
  );
}
