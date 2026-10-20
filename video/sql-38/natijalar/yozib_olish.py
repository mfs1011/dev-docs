#!/usr/bin/env python3
import subprocess, json, os

PG_ENV = dict(os.environ, PGPASSFILE="/Users/mfsv/Projects/experiment/sql-sinov/pgpass")
PG_CMD = ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X"]
MY_CMD = ["mysql", "--defaults-extra-file=/Users/mfsv/Projects/experiment/sql-sinov/talaba.cnf", "qollanma", "-e"]
SQLITE_BIN = "/Users/mfsv/Projects/experiment/sql-sinov/bin/sqlite3"

def run_pg(sql):
    p = subprocess.run(PG_CMD, input=sql, text=True, capture_output=True, env=PG_ENV)
    return (p.stdout + p.stderr).strip()

def run_my(sql):
    p = subprocess.run(MY_CMD + [sql], capture_output=True, text=True)
    return (p.stdout + p.stderr).strip()

def run_sqlite(sql):
    p = subprocess.run([SQLITE_BIN, "-box", ":memory:"], input=sql, text=True, capture_output=True)
    return (p.stdout + p.stderr).strip()

out = {"pg": {}, "mysql": {}, "sqlite": {}}

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["tekis_jadval"] = run_pg("""
DROP TABLE IF EXISTS buyurtma_tekis CASCADE;
CREATE TABLE buyurtma_tekis (
    buyurtma_id int PRIMARY KEY, sana date,
    mijoz_ism varchar(30), mijoz_tel varchar(20), mijoz_manzil varchar(60),
    mahsulot varchar(30), narx int, soni int
);
INSERT INTO buyurtma_tekis VALUES
 (1, '2026-02-01', 'Ali',  '+998901234567', 'Toshkent, Navoiy 12',   'Daftar', 12000, 2),
 (2, '2026-02-03', 'Ali',  '+998901234567', 'Toshkent, Navoiy 12',   'Kitob',  85000, 1),
 (3, '2026-02-05', 'Vali', '+998907654321', 'Samarqand, Registon 5', 'Daftar', 12000, 3);

UPDATE buyurtma_tekis SET mijoz_manzil = 'Toshkent, Amir Temur 1' WHERE buyurtma_id = 2;
SELECT DISTINCT mijoz_ism, mijoz_manzil FROM buyurtma_tekis WHERE mijoz_ism = 'Ali';

DELETE FROM buyurtma_tekis WHERE buyurtma_id = 3;
SELECT count(*) AS vali_haqida FROM buyurtma_tekis WHERE mijoz_ism = 'Vali';
""")

out["pg"]["normallashgan"] = run_pg("""
DROP TABLE IF EXISTS buyurtma_qatorlari, buyurtmalar, mahsulotlar, mijozlar CASCADE;
CREATE TABLE mijozlar (
    id int PRIMARY KEY, ism varchar(30) NOT NULL,
    tel varchar(20) NOT NULL, manzil varchar(60)
);
CREATE TABLE mahsulotlar (id int PRIMARY KEY, nom varchar(30) NOT NULL UNIQUE, narx int NOT NULL);
CREATE TABLE buyurtmalar (
    id int PRIMARY KEY,
    mijoz_id int NOT NULL REFERENCES mijozlar (id),
    sana date NOT NULL
);
CREATE TABLE buyurtma_qatorlari (
    buyurtma_id int REFERENCES buyurtmalar (id),
    mahsulot_id int REFERENCES mahsulotlar (id),
    narx int NOT NULL,
    soni int NOT NULL,
    PRIMARY KEY (buyurtma_id, mahsulot_id)
);
INSERT INTO mijozlar VALUES
    (1, 'Ali',  '+998901234567', 'Toshkent, Navoiy 12'),
    (2, 'Vali', '+998907654321', 'Samarqand, Registon 5');
INSERT INTO mahsulotlar VALUES (1, 'Daftar', 12000), (2, 'Kitob', 85000);
INSERT INTO buyurtmalar VALUES (1, 1, '2026-02-01'), (2, 1, '2026-02-03'), (3, 2, '2026-02-05');
INSERT INTO buyurtma_qatorlari VALUES (1, 1, 12000, 2), (2, 2, 85000, 1), (3, 1, 12000, 3);

UPDATE mijozlar SET manzil = 'Toshkent, Amir Temur 1' WHERE id = 1;

SELECT b.id, b.sana, m.ism, m.manzil, p.nom, q.narx, q.soni
FROM buyurtmalar b
JOIN mijozlar m           ON m.id = b.mijoz_id
JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
JOIN mahsulotlar p        ON p.id = q.mahsulot_id
ORDER BY b.id;

DELETE FROM buyurtma_qatorlari WHERE buyurtma_id = 3;
DELETE FROM buyurtmalar WHERE id = 3;
SELECT ism, tel FROM mijozlar WHERE id = 2;
""")

out["pg"]["denormalizatsiya"] = run_pg("""
DROP TABLE IF EXISTS kunlik_savdo, b CASCADE;
CREATE TABLE kunlik_savdo (sana date PRIMARY KEY, buyurtmalar int NOT NULL, summa int NOT NULL);
INSERT INTO kunlik_savdo
SELECT b.sana, count(DISTINCT b.id), sum(q.narx * q.soni)
FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
GROUP BY b.sana;
SELECT * FROM kunlik_savdo ORDER BY sana;

CREATE TABLE b (id int PRIMARY KEY, sana date, summa int);
INSERT INTO b VALUES (1, '2026-02-01', 24000);
INSERT INTO b VALUES (2, '2026-02-01', 5000);
SELECT k.summa AS jadvalda, (SELECT sum(summa) FROM b WHERE sana = k.sana) AS haqiqiy FROM kunlik_savdo k WHERE k.sana = '2026-02-01';
""")

print("MySQL 9.7 sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS buyurtma_tekis;
CREATE TABLE buyurtma_tekis (
    buyurtma_id INT PRIMARY KEY, sana DATE,
    mijoz_ism VARCHAR(30), mijoz_tel VARCHAR(20), mijoz_manzil VARCHAR(60),
    mahsulot VARCHAR(30), narx INT, soni INT
);
INSERT INTO buyurtma_tekis VALUES
 (1, '2026-02-01', 'Ali',  '+998901234567', 'Toshkent, Navoiy 12',   'Daftar', 12000, 2),
 (2, '2026-02-03', 'Ali',  '+998901234567', 'Toshkent, Navoiy 12',   'Kitob',  85000, 1);
SELECT count(*) AS jami FROM buyurtma_tekis;
DROP TABLE buyurtma_tekis;
""")

print("SQLite 3.54 sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
PRAGMA foreign_keys = ON;
CREATE TABLE mijozlar (id INT PRIMARY KEY, ism TEXT);
CREATE TABLE buyurtmalar (id INT PRIMARY KEY, mijoz_id INT REFERENCES mijozlar(id));
INSERT INTO mijozlar VALUES (1, 'Ali');
INSERT INTO buyurtmalar VALUES (10, 1);
SELECT count(*) FROM buyurtmalar;
""")

with open("video/sql-38/natijalar/tty.js", "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n")
    f.write("  g.TTY = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    f.write("})(typeof window !== 'undefined' ? window : globalThis);\n")

print("Natijalar yozildi: video/sql-38/natijalar/tty.js")
