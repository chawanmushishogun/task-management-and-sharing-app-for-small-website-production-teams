import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { createRepositoriesMock } from "../../../test/mockRepositories";

vi.mock("../../../repositories", async () => {
  const { createRepositoriesMock } = await import("../../../test/mockRepositories");
  const { buildSnapshot } = await import("../../../test/factories");
  return createRepositoriesMock(buildSnapshot());
});
import * as repoModule from "../../../repositories";
const repo = repoModule as unknown as ReturnType<typeof createRepositoriesMock>;

import { useStore } from "../useStore";
import { useMembers } from "../useMembers";

async function setup() {
  const hook = renderHook(() => {
    const { store, loading } = useStore();
    return { loading, store, members: useMembers(store) };
  });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("useMembers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("addMember は id を採番して追加し、insert する", async () => {
    const { result } = await setup();

    act(() => result.current.members.addMember({ name: "佐藤 太郎", color: "#000", avatarUrl: null }));

    const added = result.current.members.members.at(-1)!;
    expect(added.name).toBe("佐藤 太郎");
    expect(added.id).toBeTruthy();
    expect(repo.insertMember).toHaveBeenCalledWith(added);
  });

  it("updateMember は同じ id のメンバーを置き換える", async () => {
    const { result } = await setup();
    const target = result.current.members.members[0];

    act(() => result.current.members.updateMember({ ...target, name: "改名" }));

    expect(result.current.members.members[0].name).toBe("改名");
    expect(repo.updateMember).toHaveBeenCalledWith({ ...target, name: "改名" });
  });

  it("removeMember は担当していたタスクの担当を未定に戻す", async () => {
    const { result } = await setup();
    const target = result.current.members.members[0];
    expect(result.current.store.data.tasks.some((t) => t.assigneeId === target.id)).toBe(true);

    act(() => result.current.members.removeMember(target.id));

    expect(result.current.members.members).toHaveLength(0);
    expect(result.current.store.data.tasks.every((t) => t.assigneeId !== target.id)).toBe(true);
    expect(repo.deleteMember).toHaveBeenCalledWith(target.id);
  });
});
