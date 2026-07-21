import { useLocalStorage } from "./useLocalStorage";
import { INITIAL_TASKS } from "../data";
import type { Status, Task } from "../types";

/** タスク新規作成時に呼び出し側が指定する項目。残りは既定値で埋める */
export interface NewTaskInput {
  projectId: string;
  name: string;
  section: string;
}

function createTask({ projectId, name, section }: NewTaskInput): Task {
  return {
    // 同一ミリ秒に複数作られてもぶつからないよう乱数を混ぜる
    id: `t${Date.now()}_${Math.random().toString(36).slice(2)}`,
    projectId,
    name,
    section,
    assigneeId: null,
    startDate: null,
    endDate: null,
    status: "todo",
    description: "",
    completed: false,
    tags: [],
    subtasks: [],
    comments: [],
    note: "",
  };
}

/**
 * タスクの一覧と更新操作をまとめたフック。
 * 永続化先を localStorage から差し替えるときはこの中だけを書き換えれば済むようにしてある。
 */
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", INITIAL_TASKS);

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  }

  /** ステータスと completed は常に連動させる。片方だけ更新しないこと */
  function updateTaskStatus(id: string, status: Status) {
    updateTask(id, { status, completed: status === "done" });
  }

  function addTask(input: NewTaskInput) {
    setTasks(prev => [...prev, createTask(input)]);
  }

  function addTasks(inputs: NewTaskInput[]) {
    setTasks(prev => [...prev, ...inputs.map(createTask)]);
  }

  return { tasks, addTask, addTasks, updateTask, updateTaskStatus };
}
