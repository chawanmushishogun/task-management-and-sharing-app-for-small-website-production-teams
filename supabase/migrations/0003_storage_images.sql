-- ロゴ・アバター画像の置き場（Supabase Storage）。
-- テーブルには URL だけ持つ（ER図の方針）。画像は URL を知っていれば見られる公開バケットにし、
-- アップロード・更新・削除はログイン済みだけに許可する。

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "public read images" on storage.objects
  for select to anon, authenticated using (bucket_id in ('avatars', 'logos'));

create policy "authenticated upload images" on storage.objects
  for insert to authenticated with check (bucket_id in ('avatars', 'logos'));

create policy "authenticated update images" on storage.objects
  for update to authenticated using (bucket_id in ('avatars', 'logos'));

create policy "authenticated delete images" on storage.objects
  for delete to authenticated using (bucket_id in ('avatars', 'logos'));
