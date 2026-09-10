import { useState } from "react";
import { Modal } from "../Modal";
import { isSubmitEnter } from "../../utils/keyboard";
import type { Section } from "../../types";

export function AddTaskModal({
  sections,
  defaultSectionId,
  onSubmit,
  onClose,
}: {
  sections: Section[];
  defaultSectionId: string | null;
  onSubmit: (name: string, sectionId: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [sectionId, setSectionId] = useState(defaultSectionId ?? sections[0]?.id ?? "");

  const submit = () => {
    if (!name.trim() || !sectionId) return;
    onSubmit(name.trim(), sectionId);
  };

  return (
    <Modal title="新しいタスク" onClose={onClose}>
      <input
        autoFocus
        className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
        placeholder="タスク名を入力..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => isSubmitEnter(e) && submit()}
      />
      <div className="flex items-center gap-2 mb-4">
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="text-[13px] bg-muted text-foreground rounded-md px-2 py-1.5 outline-none border-0"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
        >
          キャンセル
        </button>
        <button
          onClick={submit}
          disabled={!name.trim() || !sectionId}
          className="text-[13px] px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          タスクを追加
        </button>
      </div>
    </Modal>
  );
}
