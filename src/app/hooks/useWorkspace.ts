import * as repo from "../../repositories";
import type { Store } from "./useStore";

/** ワークスペース名とロゴ（1行だけ） */
export function useWorkspace(store: Store) {
  const workspace = store.data.workspace;

  function update(patch: { name?: string; logoUrl?: string | null }) {
    if (!workspace) return;
    const id = workspace.id;
    store.mutate(
      (prev) => ({ ...prev, workspace: prev.workspace ? { ...prev.workspace, ...patch } : prev.workspace }),
      () => repo.updateWorkspace(id, patch),
    );
  }

  return {
    name: workspace?.name ?? "",
    logoUrl: workspace?.logoUrl ?? "",
    rename: (name: string) => update({ name }),
    setLogo: (logoUrl: string) => update({ logoUrl: logoUrl || null }),
  };
}
