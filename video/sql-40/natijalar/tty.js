// Auto-generated live database test runs for SQL Chapter 40
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
  "pg": {
    "version": "version                                                            \n------------------------------------------------------------------------------------------------------------------------------\n PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0, compiled by Apple clang version 21.0.0 (clang-2100.3.34.2), 64-bit\n(1 row)",
    "temporal": "CREATE EXTENSION\nDROP TABLE\nCREATE TABLE\nINSERT 0 3\nNOTICE:  extension \"btree_gist\" already exists, skipping\nNOTICE:  table \"aksiyalar\" does not exist, skipping\nERROR:  conflicting key value violates exclusion constraint \"narxlar_pkey\"\nDETAIL:  Key (mahsulot_id, amal_davri)=(1, [2026-01-15,2026-01-20)) conflicts with existing key (mahsulot_id, amal_davri)=(1, [2026-01-01,2026-02-01)).",
    "period_fk": "CREATE TABLE\nINSERT 0 1\nERROR:  insert or update on table \"aksiyalar\" violates foreign key constraint \"aksiyalar_mahsulot_id_davr_fkey\"\nDETAIL:  Key (mahsulot_id, davr)=(2, [2025-12-25,2026-01-10)) is not present in table \"narxlar\".",
    "audit": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE FUNCTION\nCREATE TRIGGER\nCREATE FUNCTION\nCREATE TRIGGER\nINSERT 0 2\n pg_sleep \n----------\n \n(1 row)\n\nUPDATE 1\nDELETE 1\n amal |   kim    | id | ism  | maosh \n------+----------+----+------+-------\n I    | postgres |  1 | Ali  |  5000\n I    | postgres |  2 | Vali |  4000\n U    | postgres |  1 | Ali  |  5500\n D    | postgres |  2 | Vali |  4000\n(4 rows)\n\nNOTICE:  table \"xodimlar_audit\" does not exist, skipping\nNOTICE:  table \"xodimlar\" does not exist, skipping",
    "soft_delete": "DROP TABLE\nCREATE TABLE\nCREATE INDEX\nINSERT 0 1\nUPDATE 1\nINSERT 0 1\n id |    email     | ochirilganmi \n----+--------------+--------------\n  1 | ali@misol.uz | t\n  2 | ali@misol.uz | f\n(2 rows)\n\nNOTICE:  table \"foydalanuvchilar\" does not exist, skipping\nERROR:  duplicate key value violates unique constraint \"foydalanuvchilar_email_faol\"\nDETAIL:  Key (email)=(ali@misol.uz) already exists."
  },
  "mysql": {
    "version": "VERSION()\n9.7.2",
    "on_update": "SLEEP(0.05)\n0\nozgardi\tyangilandi\n0\t0\nSLEEP(0.05)\n0\nmaosh\tyangilandi\n5500\t1",
    "no_overlap_error": "ERROR 1064 (42000) at line 2: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'WITHOUT OVERLAPS))' at line 1"
  },
  "sqlite": {
    "version": "╭──────────────────╮\n│ sqlite_version() │\n╞══════════════════╡\n│ 3.54.0           │\n╰──────────────────╯",
    "soft_delete": "Error near line 7: UNIQUE constraint failed: foydalanuvchilar.email",
    "soft_delete_ok": "╭────┬──────────────┬──────────────╮\n│ id │    email     │ ochirilganmi │\n╞════╪══════════════╪══════════════╡\n│  1 │ ali@misol.uz │            1 │\n│  2 │ ali@misol.uz │            0 │\n╰────┴──────────────┴──────────────╯",
    "trigger_when": "╭────┬───────┬────────────╮\n│ id │ maosh │ yangilandi │\n╞════╪═══════╪════════════╡\n│  1 │  5500 │          1 │\n╰────┴───────┴────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
