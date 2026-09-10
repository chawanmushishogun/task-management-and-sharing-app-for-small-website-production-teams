import * as repo from "../../repositories";
import type { Status, Task } from "../types";
import type { Store } from "./useStore";

/** タスク新規作成時に呼び出し側が指定する項目。残りは既定値で埋める */
export interface NewTaskInput {
  projectId: string;
  sectionId: string;
  name: string;
}

export function createTask({ projectId, sectionId, name }: NewTaskInput): Task {
  return {
    id: crypto.randomUUID(),
    sectionId,
    projectId,
    name,
    assigneeId: null,
    startDate: null,
    endDate: null,
    status: "todo",
    note: "",
  };
}

/**
 * タスクの一覧と更新操作。画面は先に更新し、DB には変えた列だけ書く。
 */
export function useTasks(store: Store) {
  const tasks = store.data.tasks;

  function updateTask(id: string, patch: Partial<Task>) {
    store.mutate(
      (prev) => ({ ...prev, tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),
      () => repo.updateTask(id, patch),
    );
  }

  function updateTaskStatus(id: string, status: Status) {
    updateTask(id, { status });
  }

  function addTask(input: NewTaskInput) {
    addTasks([input]);
  }

  function addTasks(inputs: NewTaskInput[]) {
    const created = inputs.map(createTask);
    store.mutate(
      (prev) => ({ ...prev, tasks: [...prev.tasks, ...created] }),
      () => repo.insertTasks(created),
    );
  }

  function removeTask(id: string) {
    store.mutate(
      (prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }),
      () => repo.deleteTask(id),
    );
  }

  return { tasks, addTask, addTasks, updateTask, updateTaskStatus, removeTask };
}
