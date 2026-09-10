import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { createRepositoriesMock } from "../../test/mockRepositories";

vi.mock("../../repositories", async () => {
  const { createRepositoriesMock } = await import("../../test/mockRepositories");
  const { buildSnapshot } = await import("../../test/factories");
  return createRepositoriesMock(buildSnapshot());
});
// 画像アップロードは Storage に触るので画面テストでは使わない
vi.mock("../../repositories/images", () => ({ uploadImage: vi.fn() }));
import * as repoModule from "../../repositories";
const repo = repoModule as unknown as ReturnType<typeof createRepositoriesMock>;

import App from "../App";

async function renderApp() {
  const user = userEvent.setup();
  render(<App onSignOut={() => {}} />);
  // 読み込みが終わると先頭の案件（Webサイト制作）が開く
  await screen.findByRole("heading", { name: "Webサイト制作" });
  return user;
}

describe("App の主要操作", () => {
  beforeEach(() => vi.clearAllMocks());

  it("案件のタスクがセクションごとに表示される", async () => {
    await renderApp();
    expect(screen.getByText("デザイン")).toBeInTheDocument();
    expect(screen.getByText("トップページ PC版")).toBeInTheDocument();
    expect(screen.getByText("トップページ SP版")).toBeInTheDocument();
    // その他案件のタスクは出ない
    expect(screen.queryByText("文言修正")).not.toBeInTheDocument();
  });

  it("その他案件で M2 からタスクを追加すると一覧に出る", async () => {
    const user = await renderApp();
    await user.click(screen.getByRole("button", { name: /その他案件/ }));
    await screen.findByText("チラシ修正");

    // セクションごとに「タスクを追加」があるので先頭のものを押す。M2 は Enter で送信
    await user.click(screen.getAllByRole("button", { name: "タスクを追加" })[0]);
    await user.type(screen.getByPlaceholderText("タスク名を入力..."), "校正{Enter}");

    expect(await screen.findByText("校正")).toBeInTheDocument();
    expect(repo.insertTasks).toHaveBeenCalledTimes(1);
    expect(repo.insertTasks.mock.calls[0][0][0]).toMatchObject({ name: "校正" });
  });

  it("完了チェックでステータスが done になり、変えた列だけ保存される", async () => {
    const user = await renderApp();
    const row = screen.getByText("トップページ PC版").closest(".group")!;
    await user.click(within(row as HTMLElement).getByRole("button", { name: "完了にする" }));

    await waitFor(() => expect(repo.updateTask).toHaveBeenCalledWith(expect.any(String), { status: "done" }));
    expect(within(row as HTMLElement).getByRole("button", { name: "未着手に戻す" })).toBeInTheDocument();
  });

  it("タスクの🗑 → M6 で「削除する」を押すと消える。キャンセルなら残る", async () => {
    const user = await renderApp();
    const row = screen.getByText("トップページ PC版").closest(".group")!;

    await user.click(within(row as HTMLElement).getByRole("button", { name: "タスクを削除" }));
    expect(screen.getByText(/「トップページ PC版」を削除します/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(screen.getByText("トップページ PC版")).toBeInTheDocument();
    expect(repo.deleteTask).not.toHaveBeenCalled();

    await user.click(within(row as HTMLElement).getByRole("button", { name: "タスクを削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));
    await waitFor(() => expect(screen.queryByText("トップページ PC版")).not.toBeInTheDocument());
    expect(repo.deleteTask).toHaveBeenCalledTimes(1);
  });

  it("M1 で案件を作るとテンプレートのセクションが並び、その案件が開く", async () => {
    const user = await renderApp();
    await user.click(screen.getByRole("button", { name: "プロジェクトを追加" }));
    await user.type(screen.getByPlaceholderText(/コーポレートサイト/), "新規案件");
    await user.click(screen.getByRole("button", { name: "作成する" }));

    expect(await screen.findByRole("heading", { name: "新規案件" })).toBeInTheDocument();
    expect(screen.getByText("企画/情報設計/PM")).toBeInTheDocument();
    expect(screen.getByText("公開")).toBeInTheDocument();
    expect(repo.insertProject).toHaveBeenCalledTimes(1);
  });

  it("案件の「案件を削除」→ M6 でタスク数が出て、削除すると先頭の案件に戻る", async () => {
    const user = await renderApp();
    await user.click(screen.getByRole("button", { name: "案件を削除" }));
    expect(screen.getByText(/中のタスク 2 件も一緒に削除されます/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => expect(repo.deleteProject).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("heading", { name: "その他案件" })).toBeInTheDocument();
  });
});
