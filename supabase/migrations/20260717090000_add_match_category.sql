alter table public.pertandingan
add column if not exists kategori_lomba text;

update public.pertandingan
set kategori_lomba = 'Umum'
where kategori_lomba is null;

alter table public.pertandingan
alter column kategori_lomba set default 'Umum';
