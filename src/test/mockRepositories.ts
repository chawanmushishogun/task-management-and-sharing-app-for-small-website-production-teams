import { vi } from "vitest";
import type { Snapshot } from "../repositories";
import type { Member, Project, Section, Task } from "../app/types";

/**
 * repositories を丸ごとモックする。loadSnapshot は与えた snapshot を返し、
 * 書き込み系は成功する vi.fn。呼び出し引数の検証に使う。
 */
export function createRepositoriesMock(snapshot: Snapshot) {
  return {
    loadSnapshot: vi.fn(async () => structuredClone(snapshot)),
    updateWorkspace: vi.fn(async (_id: string, _patch: { name?: string; logoUrl?: string | null }) => {}),
    insertMember: vi.fn(async (_member: Member) => {}),
    updateMember: vi.fn(async (_member: Member) => {}),
    deleteMember: vi.fn(async (_id: string) => {}),
    insertProject: vi.fn(async (_project: Project) => {}),
    updateProject: vi.fn(async (_id: string, _patch: { name?: string }) => {}),
    updateProjectPositions: vi.fn(async (_projects: Project[]) => {}),
    deleteProject: vi.fn(async (_id: string) => {}),
    insertSections: vi.fn(async (_sections: Section[]) => {}),
    deleteSection: vi.fn(async (_id: string) => {}),
    insertTasks: vi.fn(async (_tasks: Task[]) => {}),
    updateTask: vi.fn(async (_id: string, _patch: Partial<Task>) => {}),
    deleteTask: vi.fn(async (_id: string) => {}),
  };
}
