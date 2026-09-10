-- ER図（docs/er-diagram.png）どおりの5テーブル。
-- 全テーブルで RLS を有効にし、ポリシーは置かない（全拒否）。ポリシーは 0002 で追加する。

create extension if not exists "pgcrypto";

-- updated_at を自動更新するトリガー関数
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ワークスペース（名前・ロゴ）。MVP は1行だけ
create table public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  name       varchar not null,
  logo_url   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- メンバー（担当者）
create table public.members (
  id         uuid primary key default gen_random_uuid(),
  name       varchar not null,
  color      varchar not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 案件。「その他案件」は is_other = true の1行
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  name       varchar not null,
  color      varchar not null,
  position   integer not null default 0,
  is_other   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 工程（セクション）。案件を消すと一緒に消える
create table public.sections (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name       varchar not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- タスク。セクションを消すと一緒に消える。担当者を消すと担当が NULL に戻る
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.sections (id) on delete cascade,
  assignee_id uuid references public.members (id) on delete set null,
  name        varchar not null,
  status      varchar not null default 'todo'
              check (status in ('todo', 'in_progress', 'done')),
  start_date  date,
  end_date    date,
  note        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tasks_section_id_idx  on public.tasks (section_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index sections_project_id_idx on public.sections (project_id);

-- updated_at トリガー
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
create trigger members_set_updated_at    before update on public.members    for each row execute function public.set_updated_at();
create trigger projects_set_updated_at   before update on public.projects   for each row execute function public.set_updated_at();
create trigger sections_set_updated_at   before update on public.sections   for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at      before update on public.tasks      for each row execute function public.set_updated_at();

-- RLS：有効化のみ。ポリシーなし＝ anon も authenticated も全拒否
alter table public.workspaces enable row level security;
alter table public.members    enable row level security;
alter table public.projects   enable row level security;
alter table public.sections   enable row level security;
alter table public.tasks      enable row level security;
