import { useState } from "react";
import { Modal } from "../Modal";
import { ImageDropZone } from "../ImageDropZone";
import type { Member } from "../../types";

const EMPTY: Omit<Member, "id"> = { name: "", initials: "", color: "#3b82f6", role: "", avatarUrl: "" };

/** メンバーの追加と編集で共用するフォーム。initial を渡すと編集モードになる */
export function MemberFormModal({
  initial, onSubmit, onClose,
}: {
  initial?: Member;
  onSubmit: (draft: Omit<Member, "id">) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Omit<Member, "id">>(initial ?? EMPTY);
  const isEdit = initial !== undefined;

  return (
    <Modal title={isEdit ? "メンバーを編集" : "メンバーを追加"} onClose={onClose} width="max-w-sm" padding="p-6">
      <div className="space-y-4">
        <div>
          <label className="text-[13px] text-muted-foreground block mb-1">名前</label>
          <input
            className="w-full text-[15px] border border-border rounded-lg px-3 py-2 bg-background outline-none focus:border-primary"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="例）山田 太郎"
          />
        </div>
        <div>
          <label className="text-[13px] text-muted-foreground block mb-2">
            プロフィール画像{isEdit ? "" : "（任意）"}
          </label>
          <ImageDropZone value={draft.avatarUrl} onChange={avatarUrl => setDraft({ ...draft, avatarUrl })} />
        </div>
        <div>
          <label className="text-[13px] text-muted-foreground block mb-1">カラー</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="w-8 h-8 rounded cursor-pointer border border-border"
              value={draft.color}
              onChange={e => setDraft({ ...draft, color: e.target.value })}
            />
            <span className="text-[13px] text-muted-foreground">{draft.color}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          onClick={onClose}
          className="flex-1 text-[13px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
        >
          キャンセル
        </button>
        <button
          disabled={!draft.name.trim()}
          onClick={() => onSubmit({ ...draft, name: draft.name.trim() })}
          className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-40"
        >
          {isEdit ? "保存" : "追加"}
        </button>
      </div>
    </Modal>
  );
}
