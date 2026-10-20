// Auto-generated live database test runs for SQL Chapter 39
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
  "pg": {
    "version": "version                                                            \n------------------------------------------------------------------------------------------------------------------------------\n PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0, compiled by Apple clang version 21.0.0 (clang-2100.3.34.2), 64-bit\n(1 row)",
    "indexes": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 100000\nINSERT 0 100000\nINSERT 0 100000\n    relname    | indeks  \n---------------+---------\n k_bigint_pkey | 2208 kB\n k_v4_pkey     | 4376 kB\n k_v7_pkey     | 3104 kB\n(3 rows)\n\n bigint_bayt | uuid_bayt \n-------------+-----------\n           8 |        16\n(1 row)\n\n        v7_timestamp        \n----------------------------\n 2026-10-20 09:42:19.772+05\n(1 row)\n\nNOTICE:  table \"k_bigint\" does not exist, skipping\nNOTICE:  table \"k_v4\" does not exist, skipping\nNOTICE:  table \"k_v7\" does not exist, skipping"
  },
  "mysql": {
    "version": "VERSION()\n9.7.2",
    "indexes": "Table\tOp\tMsg_type\tMsg_text\nqollanma.k_int\tanalyze\tstatus\tOK\nqollanma.k_char\tanalyze\tstatus\tOK\nqollanma.k_bin\tanalyze\tstatus\tOK\nTABLE_NAME\tdata_mb\tikkilamchi_mb\nk_int\t1.5\t1.5\nk_bin\t2.5\t1.5\nk_char\t3.5\t2.5"
  },
  "sqlite": {
    "version": "╭──────────────────╮\n│ sqlite_version() │\n╞══════════════════╡\n│ 3.54.0           │\n╰──────────────────╯",
    "without_rowid": "Parse error near line 4: no such column: rowid\n  SELECT rowid, word FROM wordcount;\n         ^--- error here",
    "oddiy": "╭───────┬───────╮\n│ rowid │ word  │\n╞═══════╪═══════╡\n│     1 │ salom │\n╰───────┴───────╯",
    "errors": "Parse error near line 2: PRIMARY KEY missing on table xpk",
    "errors_ai": "Parse error near line 2: AUTOINCREMENT not allowed on WITHOUT ROWID tables",
    "wi_null": "Error near line 3: NOT NULL constraint failed: wi.id",
    "ri_ok": "╭────┬────╮\n│ id │ id │\n╞════╪════╡\n│  1 │  1 │\n╰────┴────╯"
  }
};

})(typeof window !== 'undefined' ? window : globalThis);
