// Auto-generated live database test runs for SQL Chapter 46
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
    "pg": {
      "version": "PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0",
      "stats_view": " attname | n_distinct |        most_common_vals         |                    most_common_freqs\n---------+------------+---------------------------------+-------------------------------------------------------\n holat   |          2 | {faol,yangi}                    | {0.97966665,0.020333333}\n viloyat |         10 | {V8,V5,V4,V2,V3,V1,V7,V6,V0,V9} | {0.103933334,0.101966664,0.100933336,...}\n(2 rows)\n reltuples: 100000, relpages: 541",
      "dep_before": "QUERY PLAN\n--------------------------------------------------------------------\n Seq Scan on manzillar  (cost=0.00..2041.00 rows=89 width=15) (actual rows=1000.00 loops=1)\n   Filter: ((tuman = 'T17'::text) AND (viloyat = 'V7'::text))\n   Rows Removed by Filter: 99000",
      "dep_after": "QUERY PLAN\n--------------------------------------------------------------------\n Seq Scan on manzillar  (cost=0.00..2041.00 rows=963 width=15) (actual rows=1000.00 loops=1)\n   Filter: ((tuman = 'T17'::text) AND (viloyat = 'V7'::text))\n statistics_name: manzil_dep | dependencies: {\"3 => 2\": 1.000000}",
      "stale_before": "QUERY PLAN (ANALYZE qilinmagan: 200k yangi qator)\n--------------------------------------------------------------------\n Seq Scan on manzillar  (cost=0.00..5369.69 rows=6026 width=15) (actual rows=202000.00 loops=1)\n   Filter: (holat = 'yangi'::text)",
      "stale_after": "QUERY PLAN (ANALYZE qilingandan keyin)\n--------------------------------------------------------------------\n Seq Scan on manzillar  (cost=0.00..5372.00 rows=202490 width=15) (actual rows=202000.00 loops=1)\n   Filter: (holat = 'yangi'::text)",
      "enable_seqscan": "SET enable_seqscan = off;\n-> Parallel Bitmap Heap Scan on manzillar (cost=2237.03..5328.29 rows=117541 width=0)\n     -> Bitmap Index Scan on m_holat (cost=0.00..2187.07 rows=199820 width=0)\nExecution Time: 6.145 ms (vs 6.753 ms Seq Scan)"
    },
    "mysql": {
      "version": "MySQL 9.7.2",
      "hist_before": "| type | rows   | filtered | Extra       |\n| ALL  | 199876 |    10.00 | Using where |",
      "hist_after": "| type | rows   | filtered | Extra       |\n| ALL  | 199876 |     2.00 | Using where |\ncolumn: holat | type: singleton | buckets: [[\"yangi\", 0.02], [\"yopilgan\", 1.0]]",
      "hint": "EXPLAIN ANALYZE SELECT /*+ NO_INDEX(b b_holat) */ sum(summa) FROM b WHERE holat = 'yopilgan';\n-> Table scan on b (actual time=0.12..14.7 rows=200000 loops=1)\nExecution Time: ~30 ms (vs ~93 ms indeks bilan)"
    },
    "sqlite": {
      "version": "SQLite 3.54.0",
      "stat1": "b|b_mijoz|200000 10\nb|b_holat|200000 100000",
      "indexed_by": "QUERY PLAN\n`--SCAN b USING INDEX b_holat\nQUERY PLAN (NOT INDEXED)\n`--SCAN b"
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
