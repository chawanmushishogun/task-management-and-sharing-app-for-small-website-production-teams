-- 初期データ。SQL Editor（postgres ロール）で実行する。
-- workspaces は1行だけ。projects の「その他案件」は is_other = true の1行だけ。

insert into public.workspaces (name) values ('Acme Corp');

insert into public.projects (name, color, position, is_other)
values ('その他案件', '#94a3b8', 9999, true);
