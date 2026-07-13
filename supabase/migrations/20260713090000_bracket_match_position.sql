begin;

alter table public.pertandingan
add column if not exists posisi integer;

with ranked as (
  select
    id,
    row_number() over (
      partition by round_id
      order by dibuat_pada, id
    )::integer as nomor
  from public.pertandingan
)
update public.pertandingan p
set posisi = ranked.nomor
from ranked
where p.id = ranked.id
  and p.posisi is null;

alter table public.pertandingan
alter column posisi set not null;

create unique index if not exists pertandingan_round_posisi_unique
on public.pertandingan(round_id, posisi);

create or replace function public.generate_first_round(p_acara_id uuid)
returns void
language plpgsql
as $$
declare
  teams uuid[];
  team_count int;
  bracket_size int;
  bye_count int;
  generated_round_id uuid;
  team_index int;
  match_position int := 1;
begin
  select array_agg(id order by nama, id)
  into teams
  from public.tim
  where acara_id = p_acara_id
    and status = 'aktif';

  team_count := array_length(teams, 1);

  if team_count < 2 then
    raise exception 'Minimal 2 tim';
  end if;

  bracket_size := public.next_power_of_two(team_count);
  bye_count := bracket_size - team_count;

  insert into public.round (
    acara_id, nama, urutan, min_tim, max_tim, dibuat_pada
  ) values (
    p_acara_id, 'Round Awal', 1, team_count, bracket_size, now()
  ) returning id into generated_round_id;

  team_index := 1;

  while team_index <= bye_count loop
    insert into public.pertandingan (
      acara_id, round_id, posisi, tim_a_id, status,
      skor_tim_a, skor_tim_b, pemenang_id, is_bye, dibuat_pada
    ) values (
      p_acara_id, generated_round_id, match_position, teams[team_index],
      'selesai', 1, 0, teams[team_index], true, now()
    );
    team_index := team_index + 1;
    match_position := match_position + 1;
  end loop;

  while team_index < team_count loop
    insert into public.pertandingan (
      acara_id, round_id, posisi, tim_a_id, tim_b_id,
      status, is_bye, dibuat_pada
    ) values (
      p_acara_id, generated_round_id, match_position,
      teams[team_index], teams[team_index + 1],
      'dijadwalkan', false, now()
    );
    team_index := team_index + 2;
    match_position := match_position + 1;
  end loop;
end;
$$;

create or replace function public.get_round_winners(p_round_id uuid)
returns uuid[]
language sql
stable
as $$
  select array_agg(pemenang_id order by posisi)
  from public.pertandingan
  where round_id = p_round_id
    and pemenang_id is not null;
$$;

create or replace function public.generate_next_round()
returns trigger
language plpgsql
as $$
declare
  curr_round record;
  winners uuid[];
  total int;
  next_round_id uuid;
  i int;
begin
  select * into curr_round
  from public.round
  where id = new.round_id;

  if exists (
    select 1 from public.round
    where acara_id = curr_round.acara_id
      and urutan = curr_round.urutan + 1
  ) then
    return new;
  end if;

  if exists (
    select 1 from public.pertandingan
    where round_id = curr_round.id
      and status != 'selesai'
  ) then
    return new;
  end if;

  winners := public.get_round_winners(curr_round.id);
  total := array_length(winners, 1);

  if total is null or total <= 1 then
    return new;
  end if;

  insert into public.round (
    acara_id, nama, urutan, min_tim, max_tim, dibuat_pada
  ) values (
    curr_round.acara_id,
    case
      when total = 2 then 'Final'
      when total = 4 then 'Semifinal'
      when total = 8 then 'Perempat Final'
      else 'Round Lanjutan'
    end,
    curr_round.urutan + 1,
    total,
    total,
    now()
  ) returning id into next_round_id;

  i := 1;
  while i < total loop
    insert into public.pertandingan (
      acara_id, round_id, posisi, tim_a_id, tim_b_id,
      status, is_bye, dibuat_pada
    ) values (
      curr_round.acara_id,
      next_round_id,
      ((i + 1) / 2),
      winners[i],
      winners[i + 1],
      'dijadwalkan',
      false,
      now()
    );
    i := i + 2;
  end loop;

  return new;
end;
$$;

commit;
