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
out["pg"]["version"] = run_pg("SELECT version();")
out["pg"]["temporal"] = run_pg("""
CREATE EXTENSION IF NOT EXISTS btree_gist;
DROP TABLE IF EXISTS aksiyalar, narxlar CASCADE;

CREATE TABLE narxlar (
    mahsulot_id int,
    amal_davri  daterange,
    narx        int NOT NULL,
    PRIMARY KEY (mahsulot_id, amal_davri WITHOUT OVERLAPS)
);

INSERT INTO narxlar VALUES
    (1, '[2026-01-01,2026-02-01)', 12000),
    (1, '[2026-02-01,)',           13000),
    (2, '[2026-01-01,)',           85000);

-- Kesishadigan qator kiritish:
INSERT INTO narxlar VALUES (1, '[2026-01-15,2026-01-20)', 11000);
""")

out["pg"]["period_fk"] = run_pg("""
CREATE TABLE aksiyalar (
    id int PRIMARY KEY,
    mahsulot_id int,
    davr daterange,
    FOREIGN KEY (mahsulot_id, PERIOD davr) REFERENCES narxlar (mahsulot_id, PERIOD amal_davri)
);

INSERT INTO aksiyalar VALUES (1, 1, '[2026-01-25,2026-02-10)');
INSERT INTO aksiyalar VALUES (2, 2, '[2025-12-25,2026-01-10)');
""")

out["pg"]["audit"] = run_pg("""
DROP TABLE IF EXISTS xodimlar_audit, xodimlar CASCADE;

CREATE TABLE xodimlar (
    id int PRIMARY KEY, ism text NOT NULL, maosh int,
    yaratilgan  timestamptz NOT NULL DEFAULT now(),
    yangilangan timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE xodimlar_audit (
    amal char(1) NOT NULL, vaqt timestamptz NOT NULL, kim text NOT NULL,
    id int, ism text, maosh int
);

CREATE OR REPLACE FUNCTION yangilangan_belgila() RETURNS trigger AS $$
BEGIN
    NEW.yangilangan := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xodimlar_yangilangan
    BEFORE UPDATE ON xodimlar
    FOR EACH ROW EXECUTE FUNCTION yangilangan_belgila();

CREATE OR REPLACE FUNCTION xodimlar_audit_yoz() RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO xodimlar_audit SELECT 'D', now(), current_user, OLD.id, OLD.ism, OLD.maosh;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO xodimlar_audit SELECT 'U', now(), current_user, NEW.id, NEW.ism, NEW.maosh;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO xodimlar_audit SELECT 'I', now(), current_user, NEW.id, NEW.ism, NEW.maosh;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xodimlar_audit
    AFTER INSERT OR UPDATE OR DELETE ON xodimlar
    FOR EACH ROW EXECUTE FUNCTION xodimlar_audit_yoz();

INSERT INTO xodimlar (id, ism, maosh) VALUES (1, 'Ali', 5000), (2, 'Vali', 4000);
SELECT pg_sleep(0.05);
UPDATE xodimlar SET maosh = 5500 WHERE id = 1;
DELETE FROM xodimlar WHERE id = 2;

SELECT amal, kim, id, ism, maosh FROM xodimlar_audit ORDER BY vaqt, amal DESC, id;
""")

out["pg"]["soft_delete"] = run_pg("""
DROP TABLE IF EXISTS foydalanuvchilar CASCADE;
CREATE TABLE foydalanuvchilar (id int PRIMARY KEY, email text NOT NULL, ochirilgan timestamptz);
CREATE UNIQUE INDEX foydalanuvchilar_email_faol ON foydalanuvchilar (email) WHERE ochirilgan IS NULL;

INSERT INTO foydalanuvchilar VALUES (1, 'ali@misol.uz', NULL);
-- Ikkinchi faol:
INSERT INTO foydalanuvchilar VALUES (2, 'ali@misol.uz', NULL);
-- Yumshoq o'chirish:
UPDATE foydalanuvchilar SET ochirilgan = now() WHERE id = 1;
-- Endi mumkin:
INSERT INTO foydalanuvchilar VALUES (2, 'ali@misol.uz', NULL);
SELECT id, email, ochirilgan IS NOT NULL AS ochirilganmi FROM foydalanuvchilar ORDER BY id;
""")

print("MySQL 9.7.2 sinovlari...")
out["mysql"]["version"] = run_my("SELECT VERSION();")
out["mysql"]["on_update"] = run_my("""
DROP TABLE IF EXISTS xodimlar;
CREATE TABLE xodimlar (
    id int PRIMARY KEY, ism varchar(30) NOT NULL, maosh int,
    yaratilgan  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    yangilangan DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

INSERT INTO xodimlar VALUES (1, 'Ali', 5000, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));
SELECT SLEEP(0.05);
UPDATE xodimlar SET maosh = 5000 WHERE id = 1;
SELECT ROW_COUNT() AS ozgardi, yangilangan > yaratilgan AS yangilandi FROM xodimlar WHERE id = 1;
SELECT SLEEP(0.05);
UPDATE xodimlar SET maosh = 5500 WHERE id = 1;
SELECT maosh, yangilangan > yaratilgan AS yangilandi FROM xodimlar WHERE id = 1;
""")

out["mysql"]["no_overlap_error"] = run_my("""
CREATE TABLE narxlar (id int, davr varchar(20), PRIMARY KEY (id, davr WITHOUT OVERLAPS));
""")

print("SQLite 3.54.0 sinovlari...")
out["sqlite"]["version"] = run_sqlite("SELECT sqlite_version();")
out["sqlite"]["soft_delete"] = run_sqlite("""
CREATE TABLE foydalanuvchilar (id INTEGER PRIMARY KEY, email TEXT NOT NULL, ochirilgan TEXT);
CREATE UNIQUE INDEX foydalanuvchilar_email_faol ON foydalanuvchilar (email) WHERE ochirilgan IS NULL;

INSERT INTO foydalanuvchilar VALUES (1, 'ali@misol.uz', NULL);
-- duplicate active insert
INSERT INTO foydalanuvchilar VALUES (2, 'ali@misol.uz', NULL);
""")

out["sqlite"]["soft_delete_ok"] = run_sqlite("""
CREATE TABLE foydalanuvchilar (id INTEGER PRIMARY KEY, email TEXT NOT NULL, ochirilgan TEXT);
CREATE UNIQUE INDEX foydalanuvchilar_email_faol ON foydalanuvchilar (email) WHERE ochirilgan IS NULL;

INSERT INTO foydalanuvchilar VALUES (1, 'ali@misol.uz', NULL);
UPDATE foydalanuvchilar SET ochirilgan = datetime('now') WHERE id = 1;
INSERT INTO foydalanuvchilar VALUES (2, 'ali@misol.uz', NULL);
SELECT id, email, ochirilgan IS NOT NULL AS ochirilganmi FROM foydalanuvchilar;
""")

out["sqlite"]["trigger_when"] = run_sqlite("""
CREATE TABLE xodimlar (id INTEGER PRIMARY KEY, ism TEXT NOT NULL, maosh INT,
    yaratilgan  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    yangilangan TEXT NOT NULL DEFAULT (datetime('now', 'subsec')));

CREATE TRIGGER x_yangilangan AFTER UPDATE ON xodimlar
FOR EACH ROW WHEN NEW.yangilangan = OLD.yangilangan
BEGIN
    UPDATE xodimlar SET yangilangan = datetime('now', 'subsec') WHERE id = NEW.id;
END;

INSERT INTO xodimlar (id, ism, maosh) VALUES (1, 'Ali', 5000);
UPDATE xodimlar SET maosh = 5500 WHERE id = 1;
SELECT id, maosh, yangilangan >= yaratilgan AS yangilandi FROM xodimlar;
""")

# Save outputs to tty.js with UMD wrapper
tty_js = f"""// Auto-generated live database test runs for SQL Chapter 40
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {{
  g.TTY = {json.dumps(out, indent=2, ensure_ascii=False)};
}})(typeof window !== 'undefined' ? window : globalThis);
"""

with open("video/sql-40/natijalar/tty.js", "w", encoding="utf-8") as f:
    f.write(tty_js)

print("Tamomlandi! video/sql-40/natijalar/tty.js yozildi.")
