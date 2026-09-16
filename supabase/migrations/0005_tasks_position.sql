-- タスクの並び順（#55）。一括作成したタスクは created_at が同じで並びが不定になるため、
-- セクション内の表示順を position で持つ。既存行は created_at → id の順で振り直す。

alter table public.tasks add column position integer not null default 0;

update public.tasks t
set position = r.rn - 1
from (
  select id, row_number() over (partition by section_id order by created_at, id) as rn
  from public.tasks
) r
where r.id = t.id;

create index tasks_section_position_idx on public.tasks (section_id, position);
