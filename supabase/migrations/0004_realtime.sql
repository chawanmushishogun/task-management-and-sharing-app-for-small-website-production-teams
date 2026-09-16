-- リアルタイム同期（#53）。5テーブルの変更を Supabase Realtime で配信する。
-- 購読できるのは RLS を通る行だけなので、ログイン済み（authenticated）にしか届かない。

alter publication supabase_realtime add table public.workspaces;
alter publication supabase_realtime add table public.members;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.sections;
alter publication supabase_realtime add table public.tasks;
