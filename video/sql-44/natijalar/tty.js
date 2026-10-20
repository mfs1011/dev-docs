// Auto-generated live database test runs for SQL Chapter 44
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
    "pg": {
      "version": "PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0",
      "hash_eq": "QUERY PLAN\n--------------------------------------------------\n Index Scan using t_kod_hash on t\n   Index Cond: (kod = 'K777'::text)",
      "hash_range": "QUERY PLAN\n--------------------------------------------------\n Seq Scan on t\n   Filter: (kod > 'K999998'::text)",
      "gin_array": "QUERY PLAN\n--------------------------------------------------\n Bitmap Heap Scan on t\n   Recheck Cond: (teglar @> '{3,5}'::integer[])\n   ->  Bitmap Index Scan on t_teglar_gin\n         Index Cond: (teglar @> '{3,5}'::integer[])",
      "gist_overlap": "QUERY PLAN\n--------------------------------------------------\n Bitmap Heap Scan on t\n   Recheck Cond: (davr && '[\"2026-02-01 10:00:00\",\"2026-02-01 10:05:00\")'::tsrange)\n   ->  Bitmap Index Scan on t_davr_gist\n         Index Cond: (davr && '[\"2026-02-01 10:00:00\",\"2026-02-01 10:05:00\")'::tsrange)",
      "spgist_knn": "QUERY PLAN\n--------------------------------------------------\n Limit\n   ->  Index Scan using t_nuqta_spgist on t\n         Order By: (nuqta <-> '(500,100)'::point)",
      "spgist_rows": "   id   |   nuqta   \n--------+-----------\n 100500 | (500,100)\n  99500 | (500,99)\n 101500 | (500,101)\n(3 rows)",
      "brin_scan": "QUERY PLAN\n--------------------------------------------------\n Aggregate (actual rows=1.00 loops=1)\n   Buffers: shared hit=136\n   ->  Bitmap Heap Scan on t (actual rows=601.00 loops=1)\n         Rows Removed by Index Recheck: 8359\n         Heap Blocks: lossy=128\n         ->  Bitmap Index Scan on t_vaqt_brin",
      "sizes": "    relname     | pg_size_pretty \n----------------+----------------\n t_davr_gist    | 7120 kB\n t_kod_hash     | 6824 kB\n t_nuqta_spgist | 9128 kB\n t_pkey         | 4408 kB\n t_teglar_gin   | 696 kB\n t_vaqt_brin    | 24 kB\n t_vaqt_btree   | 4408 kB"
    },
    "mysql": {
      "version": "MySQL 9.7.2 (InnoDB)",
      "hash_note": "Note 3502: This storage engine does not support the HASH index algorithm, storage engine default was used instead.\nINDEX_NAME | INDEX_TYPE\nPRIMARY    | BTREE\nt_kod_hash | BTREE",
      "spatial": "EXPLAIN\n-> Filter: mbrcontains(<cache>(st_geomfromtext('POLYGON(...)')),t.joy)\n    -> Index range scan on t using t_joy over (joy unprintable_geometry_value)",
      "invisible_on": "EXPLAIN\n-> Index lookup on t using t_j (j = 2)  (cost=0.35 rows=1)",
      "invisible_off": "EXPLAIN\n-> Filter: (t.j = 2)  (cost=0.55 rows=3)\n    -> Table scan on t  (cost=0.55 rows=3)\nIS_VISIBLE: NO"
    },
    "sqlite": {
      "version": "SQLite 3.54.0",
      "hash_error": "Parse error near line 2: near \"USING\": syntax error\n  CREATE INDEX t_h ON t USING HASH (kod);",
      "rtree": "QUERY PLAN\n`--SCAN joylar VIRTUAL TABLE INDEX 2:D0B1D2B3\n1\n2"
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
