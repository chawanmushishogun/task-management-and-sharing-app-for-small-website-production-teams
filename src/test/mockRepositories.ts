import { vi } from "vitest";
import type { Snapshot } from "../repositories";

/**
 * repositories を丸ごとモックする。loadSnapshot は与えた snapshot を返し、
 * 書き込み系は成功する vi.fn。呼び出し引数の検証に使う。
 */
export function createRepositoriesMock(snapshot: Snapshot) {
  return {
    loadSnapshot: vi.fn(async () => structuredClone(snapshot)),
    updateWorkspace: vi.fn(async () => {}),
    insertMember: vi.fn(async () => {}),
    updateMember: vi.fn(async () => {}),
    deleteMember: vi.fn(async () => {}),
    insertProject: vi.fn(async () => {}),
    updateProject: vi.fn(async () => {}),
    updateProjectPositions: vi.fn(async () => {}),
    deleteProject: vi.fn(async () => {}),
    insertSections: vi.fn(async () => {}),
    deleteSection: vi.fn(async () => {}),
    insertTasks: vi.fn(async () => {}),
    updateTask: vi.fn(async () => {}),
    deleteTask: vi.fn(async () => {}),
  };
}
