// Auto-generated live database test runs for SQL Chapter 41
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
  "pg": {
    "version": "version                                                            \n------------------------------------------------------------------------------------------------------------------------------\n PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0, compiled by Apple clang version 21.0.0 (clang-2100.3.34.2), 64-bit\n(1 row)",
    "seq_scan": "DROP TABLE\nCREATE TABLE\nINSERT 0 100000\nANALYZE\n                     QUERY PLAN                      \n-----------------------------------------------------\n Seq Scan on buyurtmalar (actual rows=10.00 loops=1)\n   Filter: (mijoz_id = 777)\n   Rows Removed by Filter: 99990\n   Buffers: shared hit=637\n Planning:\n   Buffers: shared hit=29\n(6 rows)\n\nNOTICE:  drop cascades to constraint buyurtma_qatorlari_buyurtma_id_fkey on table buyurtma_qatorlari",
    "index_scan": "CREATE INDEX\n                                  QUERY PLAN                                  \n------------------------------------------------------------------------------\n Bitmap Heap Scan on buyurtmalar (actual rows=10.00 loops=1)\n   Recheck Cond: (mijoz_id = 777)\n   Heap Blocks: exact=10\n   Buffers: shared hit=10 read=2\n   ->  Bitmap Index Scan on buyurtmalar_mijoz_idx (actual rows=10.00 loops=1)\n         Index Cond: (mijoz_id = 777)\n         Index Searches: 1\n         Buffers: shared read=2\n Planning:\n   Buffers: shared hit=51 read=1\n(10 rows)",
    "selectivity": "CREATE INDEX\nANALYZE\n                            QUERY PLAN                            \n------------------------------------------------------------------\n Aggregate\n   ->  Index Only Scan using buyurtmalar_holat_idx on buyurtmalar\n         Index Cond: (holat = 'yangi'::text)\n(3 rows)\n\n                 QUERY PLAN                 \n--------------------------------------------\n Aggregate\n   ->  Seq Scan on buyurtmalar\n         Filter: (holat = 'yopilgan'::text)\n(3 rows)",
    "sizes": "relname        | pg_size_pretty \n-----------------------+----------------\n buyurtmalar           | 5096 kB\n buyurtmalar_holat_idx | 704 kB\n buyurtmalar_mijoz_idx | 936 kB\n buyurtmalar_pkey      | 2208 kB\n(4 rows)"
  },
  "mysql": {
    "version": "VERSION()\n9.7.2",
    "explain": "EXPLAIN\n-> Index lookup on buyurtmalar using mijoz_id (mijoz_id = 777)  (cost=0.7 rows=2)\\n\nEXPLAIN\n-> Covering index lookup on buyurtmalar using mijoz_id (mijoz_id = 777)  (cost=0.45 rows=2)\\n"
  },
  "sqlite": {
    "version": "╭──────────────────╮\n│ sqlite_version() │\n╞══════════════════╡\n│ 3.54.0           │\n╰──────────────────╯",
    "explain": "QUERY PLAN\n`--SEARCH buyurtmalar USING INTEGER PRIMARY KEY (rowid=?)\nQUERY PLAN\n`--SEARCH buyurtmalar USING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)\nQUERY PLAN\n`--SEARCH buyurtmalar USING COVERING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
