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
import { useProjects } from "../useProjects";

const TEMPLATE = [
  { section: "企画", tasks: ["見積", "サイトマップ"] },
  { section: "デザイン", tasks: ["トップページ"] },
];

async function setup() {
  const hook = renderHook(() => {
    const { store, loading } = useStore();
    return { loading, store, projects: useProjects(store) };
  });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("useProjects", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createProject はテンプレートからセクションとタスクを展開し、その他案件の手前に置く", async () => {
    const { result } = await setup();

    let created!: ReturnType<typeof result.current.projects.createProject>;
    act(() => {
      created = result.current.projects.createProject("新規案件", TEMPLATE);
    });

    const { projects, sections } = result.current.projects;
    const tasks = result.current.store.data.tasks;
    expect(projects.map((p) => p.name)).toEqual(["Webサイト制作", "新規案件", "その他案件"]);
    expect(created.position).toBe(1);
    expect(sections.filter((s) => s.projectId === created.id).map((s) => s.name)).toEqual(["企画", "デザイン"]);
    expect(tasks.filter((t) => t.projectId === created.id).map((t) => t.name)).toEqual([
      "見積",
      "サイトマップ",
      "トップページ",
    ]);
    expect(repo.insertProject).toHaveBeenCalledWith(created);
    // 案件 → セクション → タスクの順に書くので、後ろ2つは非同期に呼ばれる
    await waitFor(() => expect(repo.insertSections).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(repo.insertTasks).toHaveBeenCalledTimes(1));
  });

  it("reorderProjects は position を振り直し、その他案件は末尾に残す", async () => {
    const { result } = await setup();
    act(() => {
      result.current.projects.createProject("2件目", TEMPLATE);
    });
    const [first, second] = result.current.projects.projects;

    act(() => result.current.projects.reorderProjects(second.id, first.id));

    const names = result.current.projects.projects.map((p) => p.name);
    expect(names).toEqual(["2件目", "Webサイト制作", "その他案件"]);
    expect(result.current.projects.projects.map((p) => p.position).slice(0, 2)).toEqual([0, 1]);
    expect(repo.updateProjectPositions).toHaveBeenCalledTimes(1);
  });

  it("removeProject は中のセクション・タスクも画面から取り除く", async () => {
    const { result } = await setup();
    const target = result.current.projects.projects[0];

    act(() => result.current.projects.removeProject(target.id));

    expect(result.current.projects.projects.find((p) => p.id === target.id)).toBeUndefined();
    expect(result.current.projects.sections.some((s) => s.projectId === target.id)).toBe(false);
    expect(result.current.store.data.tasks.some((t) => t.projectId === target.id)).toBe(false);
    expect(repo.deleteProject).toHaveBeenCalledWith(target.id);
  });

  it("addSection / removeSection は空のセクションを持てる", async () => {
    const { result } = await setup();
    const other = result.current.projects.otherProject!;

    let section!: ReturnType<typeof result.current.projects.addSection>;
    act(() => {
      section = result.current.projects.addSection(other.id, "ロゴ制作");
    });
    expect(result.current.projects.sections.filter((s) => s.projectId === other.id)).toHaveLength(2);
    expect(section.position).toBe(1);
    expect(repo.insertSections).toHaveBeenCalledWith([section]);

    act(() => result.current.projects.removeSection(section.id));
    expect(result.current.projects.sections.find((s) => s.id === section.id)).toBeUndefined();
    expect(repo.deleteSection).toHaveBeenCalledWith(section.id);
  });

  it("renameProject は名前だけ更新する", async () => {
    const { result } = await setup();
    const target = result.current.projects.projects[0];

    act(() => result.current.projects.renameProject(target.id, "改名後"));

    expect(result.current.projects.projects[0].name).toBe("改名後");
    expect(repo.updateProject).toHaveBeenCalledWith(target.id, { name: "改名後" });
  });
});
