SET search_path = video_dokon;
\echo == select
SELECT nomi, narxi FROM mahsulotlar WHERE narxi < 10000 ORDER BY narxi;
\echo == join
SELECT b.id, p.nomi, b.soni FROM buyurtmalar b JOIN mahsulotlar p ON p.id = b.mahsulot_id ORDER BY b.id;
\echo == group
SELECT shahar, count(*) FROM mijozlar GROUP BY shahar ORDER BY shahar;
\echo == fk
INSERT INTO buyurtmalar VALUES (7, 9, 1, 1);
\echo == dml
INSERT INTO mahsulotlar VALUES (6, 'Chizg‘ich', 4000);
UPDATE mahsulotlar SET narxi = 7000 WHERE nomi = 'Daftar';
DELETE FROM mahsulotlar WHERE id = 6;
\echo == index
CREATE INDEX ON mahsulotlar (nomi);
\echo == tx-rollback
BEGIN;
UPDATE hisoblar SET balans = balans - 50000 WHERE egasi = 'Ali';
ROLLBACK;
SELECT egasi, balans FROM hisoblar ORDER BY egasi;
\echo == tx-commit
BEGIN;
UPDATE hisoblar SET balans = balans - 50000 WHERE egasi = 'Ali';
UPDATE hisoblar SET balans = balans + 50000 WHERE egasi = 'Malika';
COMMIT;
SELECT egasi, balans FROM hisoblar ORDER BY egasi;
