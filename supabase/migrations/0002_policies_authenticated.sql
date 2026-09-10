-- ログイン済み（authenticated ロール）だけが全テーブルを読み書きできるポリシー。
-- 権限を分けない設計なので、各テーブル1本で足りる。anon には何も許可しない。

create policy "authenticated can do everything" on public.workspaces
  for all to authenticated using (true) with check (true);

create policy "authenticated can do everything" on public.members
  for all to authenticated using (true) with check (true);

create policy "authenticated can do everything" on public.projects
  for all to authenticated using (true) with check (true);

create policy "authenticated can do everything" on public.sections
  for all to authenticated using (true) with check (true);

create policy "authenticated can do everything" on public.tasks
  for all to authenticated using (true) with check (true);
