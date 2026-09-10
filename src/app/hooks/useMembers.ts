import * as repo from "../../repositories";
import type { Member } from "../types";
import type { Store } from "./useStore";

/** メンバーの一覧と更新操作 */
export function useMembers(store: Store) {
  const members = store.data.members;

  function addMember(input: Omit<Member, "id">) {
    const member: Member = { ...input, id: crypto.randomUUID() };
    store.mutate(
      (prev) => ({ ...prev, members: [...prev.members, member] }),
      () => repo.insertMember(member),
    );
  }

  function updateMember(member: Member) {
    store.mutate(
      (prev) => ({ ...prev, members: prev.members.map((m) => (m.id === member.id ? member : m)) }),
      () => repo.updateMember(member),
    );
  }

  /** メンバーを削除する。担当していたタスクは DB 側の SET NULL に合わせて担当を未定に戻す */
  function removeMember(id: string) {
    store.mutate(
      (prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
        tasks: prev.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: null } : t)),
      }),
      () => repo.deleteMember(id),
    );
  }

  return { members, addMember, updateMember, removeMember };
}
