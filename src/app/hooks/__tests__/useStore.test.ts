import { renderHook, waitFor } from "@testing-library/react";
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

describe("useStore のリアルタイム同期", () => {
  beforeEach(() => vi.clearAllMocks());

  it("起動時に変更通知を購読し、通知が来たら少し待ってから読み直す", async () => {
    const { result, unmount } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(repo.loadSnapshot).toHaveBeenCalledTimes(1);
    expect(repo.subscribeToChanges).toHaveBeenCalledTimes(1);

    const onChange = repo.subscribeToChanges.mock.calls[0][0];
    onChange("tasks");
    onChange("tasks"); // 連続した通知は1回にまとめる

    await waitFor(() => expect(repo.loadSnapshot).toHaveBeenCalledTimes(2), { timeout: 2000 });
    unmount();
  });
});
