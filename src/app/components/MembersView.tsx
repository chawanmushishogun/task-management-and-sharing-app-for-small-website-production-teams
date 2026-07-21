import { Plus } from "lucide-react";
import { Avatar } from "./Avatar";
import type { Member } from "../types";

export function MembersView({
  members, onAdd, onEdit, onRemove,
}: {
  members: Member[];
  onAdd: () => void;
  onEdit: (member: Member) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[15px] text-muted-foreground">{members.length}名のメンバー</p>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} />メンバーを追加
          </button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-[15px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[13px] text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">名前</th>
                <th className="w-20 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => (
                <tr
                  key={member.id}
                  className={`border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar member={member} size="md" />
                      <div className="font-medium text-foreground text-[15px]">{member.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onEdit(member)}
                        className="px-2.5 py-1 text-[13px] rounded-md border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => onRemove(member.id)}
                        className="px-2.5 py-1 text-[13px] rounded-md border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors text-muted-foreground"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
