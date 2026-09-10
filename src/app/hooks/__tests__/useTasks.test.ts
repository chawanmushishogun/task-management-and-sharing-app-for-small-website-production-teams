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
import { useTasks } from "../useTasks";

function setup() {
  const hook = renderHook(() => {
    const { store, loading } = useStore();
    return { loading, tasks: useTasks(store) };
  });
  return hook;
}

describe("useTasks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("初期表示で loadSnapshot のタスクを持つ", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks.tasks).toHaveLength(3);
    expect(repo.loadSnapshot).toHaveBeenCalledTimes(1);
  });

  it("updateTask は画面を先に更新し、変えた列だけ DB に書く", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    const target = result.current.tasks.tasks[0];

    act(() => result.current.tasks.updateTask(target.id, { note: "会議で確認" }));

    expect(result.current.tasks.tasks[0].note).toBe("会議で確認");
    expect(repo.updateTask).toHaveBeenCalledWith(target.id, { note: "会議で確認" });
  });

  it("updateTaskStatus は status だけを更新する", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    const target = result.current.tasks.tasks[0];

    act(() => result.current.tasks.updateTaskStatus(target.id, "done"));

    expect(result.current.tasks.tasks[0].status).toBe("done");
    expect(repo.updateTask).toHaveBeenCalledWith(target.id, { status: "done" });
  });

  it("addTask は既定値で埋めたタスクを追加し、同じ内容を insert する", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    const section = (await repo.loadSnapshot()).sections[0];

    act(() => result.current.tasks.addTask({ projectId: section.projectId, sectionId: section.id, name: "見積" }));

    const added = result.current.tasks.tasks.at(-1)!;
    expect(added).toMatchObject({ name: "見積", sectionId: section.id, status: "todo", assigneeId: null, note: "" });
    expect(repo.insertTasks).toHaveBeenCalledWith([added]);
  });

  it("removeTask は一覧から消して delete を呼ぶ", async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    const target = result.current.tasks.tasks[0];

    act(() => result.current.tasks.removeTask(target.id));

    expect(result.current.tasks.tasks.find((t) => t.id === target.id)).toBeUndefined();
    expect(repo.deleteTask).toHaveBeenCalledWith(target.id);
  });

  it("DB への書き込みに失敗したら読み直して元に戻す", async () => {
    repo.updateTask.mockRejectedValueOnce(new Error("network"));
    const { result } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    const target = result.current.tasks.tasks[0];

    act(() => result.current.tasks.updateTask(target.id, { name: "失敗する更新" }));
    expect(result.current.tasks.tasks[0].name).toBe("失敗する更新");

    await waitFor(() => expect(result.current.tasks.tasks[0].name).toBe(target.name));
    expect(repo.loadSnapshot).toHaveBeenCalledTimes(2);
  });
});
