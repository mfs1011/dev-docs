-- Kesh darsi bazasi: 1000 mahsulot, 500 000 sharh. sharh.mahsulot_id da INDEKS ATAYLAB YO'Q — mahsulot kartochkasi
-- so'rovi butun jadvalni ko'rib chiqadi (og'ir so'rov o'rnida). Tasodif o'rnida — deterministik formula.
create table mahsulot (id int primary key, nom text not null, narx int not null);
create table sharh (id bigserial primary key, mahsulot_id int not null references mahsulot, baho int not null);
insert into mahsulot select i, 'Mahsulot ' || i, 10000 + i * 100 from generate_series(1, 1000) i;
insert into sharh (mahsulot_id, baho) select 1 + (i::bigint * 7919) % 1000, 1 + (i::bigint * 31) % 5 from generate_series(1, 500000) i;
analyze;
