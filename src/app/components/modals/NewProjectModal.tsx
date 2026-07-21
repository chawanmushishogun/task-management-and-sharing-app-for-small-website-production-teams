import { useState } from "react";
import { Modal } from "../Modal";
import { WEB_TEMPLATE } from "../../data";

/** Webサイト制作プロジェクトの新規作成。セクションとタスクはテンプレートから自動生成される */
export function NewProjectModal({ onSubmit, onClose }: { onSubmit: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const submit = () => { if (name.trim()) onSubmit(name.trim()); };

  return (
    <Modal title="Webサイト制作プロジェクトを追加" onClose={onClose}>
      <input
        autoFocus
        className="w-full text-[15px] text-foreground bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary mb-3 placeholder-muted-foreground"
        placeholder="例：株式会社○○ コーポレートサイト"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-[13px] text-muted-foreground mb-2">以下のセクション・タスクが自動で作成されます：</p>
        {WEB_TEMPLATE.map(s => (
          <div key={s.section} className="mb-1.5">
            <span className="text-[13px] font-medium text-foreground">{s.section}</span>
            <span className="text-[13px] text-muted-foreground ml-2">{s.tasks.join("・")}</span>
          </div>
        ))}
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
          作成する
        </button>
      </div>
    </Modal>
  );
}
