import { useLocalStorage } from "./useLocalStorage";
import { MEMBERS } from "../data";
import type { Member } from "../types";

/** メンバーの一覧と更新操作をまとめたフック */
export function useMembers() {
  const [members, setMembers] = useLocalStorage<Member[]>("members", MEMBERS);

  function addMember(member: Omit<Member, "id">) {
    setMembers(prev => [...prev, { ...member, id: `m${Date.now()}` }]);
  }

  function updateMember(member: Member) {
    setMembers(prev => prev.map(m => (m.id === member.id ? member : m)));
  }

  function removeMember(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  return { members, addMember, updateMember, removeMember };
}
