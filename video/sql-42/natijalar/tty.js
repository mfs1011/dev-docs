// Auto-generated live database test runs for SQL Chapter 42
// Databases: PostgreSQL 18.6, MySQL, SQLite 3.54.0

(function (g) {
  g.TTY = {
  "pg": {
    "version": "version                                                            \n------------------------------------------------------------------------------------------------------------------------------\n PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0, compiled by Apple clang version 21.0.0 (clang-2100.3.34.2), 64-bit\n(1 row)",
    "leftmost": "QUERY PLAN                             \n--------------------------------------------------------------------\n Aggregate\n   ->  Bitmap Heap Scan on xodimlar\n         Recheck Cond: ((rol = 'talaba'::text) AND (boy = 180))\n         ->  Bitmap Index Scan on x_rol_boy\n               Index Cond: ((rol = 'talaba'::text) AND (boy = 180))\n(5 rows)",
    "skip_scan": "QUERY PLAN                              \n----------------------------------------------------------------------\n Aggregate (actual rows=1.00 loops=1)\n   Buffers: shared hit=1469 read=5\n   ->  Bitmap Heap Scan on xodimlar (actual rows=4000.00 loops=1)\n         Recheck Cond: (boy = 180)\n         Heap Blocks: exact=1469\n         Buffers: shared hit=1469 read=5\n         ->  Bitmap Index Scan on x_boy (actual rows=4000.00 loops=1)\n               Index Cond: (boy = 180)\n               Index Searches: 1\n               Buffers: shared read=5\n Planning:\n   Buffers: shared hit=124\n(12 rows)",
    "order_by": "QUERY PLAN                   \n------------------------------------------------\n Limit\n   ->  Index Scan using x_bolim_fam on xodimlar\n         Index Cond: (bolim = 5)\n(3 rows)",
    "order_desc": "QUERY PLAN                        \n---------------------------------------------------------\n Limit\n   ->  Index Scan Backward using x_bolim_fam on xodimlar\n(2 rows)",
    "order_mixed": "QUERY PLAN                      \n------------------------------------------------------\n Limit\n   ->  Incremental Sort\n         Sort Key: bolim, familiya DESC\n         Presorted Key: bolim\n         ->  Index Scan using x_bolim_fam on xodimlar\n(5 rows)",
    "order_mixed_idx": "QUERY PLAN                      \n-----------------------------------------------------\n Limit\n   ->  Index Scan using x_bolim_fam_desc on xodimlar\n(2 rows)",
    "bitmap_or": "QUERY PLAN                     \n---------------------------------------------------\n Bitmap Heap Scan on xodimlar\n   Recheck Cond: ((bolim = 5) OR (boy = 199))\n   ->  BitmapOr\n         ->  Bitmap Index Scan on x_bolim_fam_desc\n               Index Cond: (bolim = 5)\n         ->  Bitmap Index Scan on x_boy\n               Index Cond: (boy = 199)\n(7 rows)"
  },
  "mysql": {
    "version": "VERSION()\n26.7.0",
    "skip_scan": "EXPLAIN\n-> Aggregate: count(0)  (cost=331 rows=1)\\n    -> Covering index lookup on xodimlar using x_boy (boy = 180)  (cost=101 rows=1000)\\n",
    "order_mixed": "EXPLAIN\n-> Limit: 5 row(s)  (cost=4966 rows=5)\\n    -> Sort: xodimlar.bolim, xodimlar.familiya DESC, limit input to 5 row(s) per chunk  (cost=4966 rows=49659)\\n        -> Table scan on xodimlar  (cost=4966 rows=49659)\\n"
  },
  "sqlite": {
    "version": "3.54.0",
    "output": "QUERY PLAN\n`--SEARCH xodimlar USING COVERING INDEX x_boy (boy=?)\nQUERY PLAN\n`--SEARCH xodimlar USING COVERING INDEX x_boy (boy=?)\nQUERY PLAN\n`--MULTI-INDEX OR\n   |--INDEX 1\n   |  `--SEARCH xodimlar USING INDEX x_bolim_fam (bolim=?)\n   `--INDEX 2\n      `--SEARCH xodimlar USING INDEX x_boy (boy=?)"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
