SELECT "salom";
.dbconfig dqs_dml on
SELECT "salom";
.dbconfig dqs_dml off
CREATE TABLE sinov (n integer);
INSERT INTO sinov VALUES ('abc');
SELECT n, typeof(n) FROM sinov;
SELECT 'Salom, ' || 'dunyo' AS natija;
