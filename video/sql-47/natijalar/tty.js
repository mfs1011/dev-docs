// Auto-generated live database test runs for SQL Chapter 47
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
    "pg": {
      "version": "PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0",
      "lower_seq": " Seq Scan on mijozlar  (cost=0.00..2425.00 rows=500 width=4) (actual rows=1.00 loops=1)\n   Filter: (lower(email) = 'mijoz500@misol.uz'::text)\n   Rows Removed by Filter: 99999\n Execution Time: 10.075 ms",
      "lower_idx": " Index Scan using m_email_lower on mijozlar  (cost=0.42..8.44 rows=1 width=4) (actual rows=1.00 loops=1)\n   Index Cond: (lower(email) = 'mijoz500@misol.uz'::text)\n Execution Time: 0.023 ms (400x tezroq)",
      "date_extract": " Seq Scan on mijozlar  (cost=0.00..2425.00 rows=500 width=0) (actual rows=26900.00 loops=1)\n   Filter: (EXTRACT(year FROM sana) = '2025'::numeric)\n Execution Time: 7.800 ms (taxmin 54x xato)",
      "date_range": " Bitmap Heap Scan on mijozlar  (cost=365.47..1690.23 rows=26651 width=0) (actual rows=26900.00 loops=1)\n   Recheck Cond: ((sana >= '2025-01-01'::date) AND (sana < '2026-01-01'::date))\n   ->  Bitmap Index Scan on m_sana  (cost=0.00..358.80 rows=26651 width=0)\n Execution Time: 1.245 ms",
      "type_error": "ERROR:  operator does not exist: text = bigint\nLINE 1: SELECT id FROM mijozlar WHERE telefon = 998900000500;\n                                              ^\nHINT:  No operator matches the given name and argument types.",
      "type_fixed": " Index Scan using m_telefon on mijozlar  (cost=0.42..8.44 rows=1 width=4) (actual rows=1.00 loops=1)\n   Index Cond: (telefon = '998900000500'::text)\n Execution Time: 0.016 ms",
      "bitmap_or": " Bitmap Heap Scan on mijozlar  (cost=8.87..16.89 rows=2 width=4) (actual rows=2.00 loops=1)\n   Recheck Cond: ((email = 'Mijoz7@misol.uz'::text) OR (telefon = '998900000500'::text))\n   ->  BitmapOr  (cost=8.87..8.87 rows=2 width=0)\n         ->  Bitmap Index Scan on m_email  (cost=0.00..4.43 rows=1 width=0)\n         ->  Bitmap Index Scan on m_telefon  (cost=0.00..4.43 rows=1 width=0)\n Execution Time: 0.052 ms",
      "count_star": " Finalize Aggregate  (cost=1418.06..1418.07 rows=1 width=8) (actual rows=1.00 loops=1)\n   ->  Gather  (cost=1417.85..1418.06 rows=2 width=8) (actual rows=3.00 loops=1)\n         Workers Planned: 2\n         ->  Parallel Index Only Scan using m_email on mijozlar\n Execution Time: 5.617 ms (100k qator)"
    },
    "mysql": {
      "version": "MySQL 9.7.2",
      "type_warn": "| Warning | 1739 | Cannot use ref access on index 'm_telefon' due to type or collation conversion on field 'telefon' |\n1 row in set, 2 warnings",
      "type_scan": "Filter: (mijozlar.telefon = 998900000500) (actual time=0.108..9.81 rows=1 loops=1)\n  -> Covering index scan on mijozlar using m_telefon (rows=100000)\nExecution Time: 9.81 ms (vs 0.004 ms qo'shtirnoq bilan)",
      "or_union": "| type        | possible_keys    | key               | Extra                                       |\n| index_merge | m_email,m_telefon| m_email,m_telefon | Using union(m_email,m_telefon); Using where |",
      "collation": "SELECT @@collation_database;\n-> utf8mb4_0900_ai_ci (case-insensitive: lower() shart emas)"
    },
    "sqlite": {
      "version": "SQLite 3.54.0",
      "affinity": "EXPLAIN QUERY PLAN SELECT id FROM mijozlar WHERE telefon = 998900000500;\n`--SEARCH mijozlar USING INDEX m_telefon (telefon=?) (TEXT affinity)",
      "multi_or": "EXPLAIN QUERY PLAN SELECT id FROM mijozlar WHERE email = '...' OR telefon = '...';\n`--MULTI-INDEX OR\n   |--SEARCH mijozlar USING INDEX m_email (email=?)\n   `--SEARCH mijozlar USING INDEX m_telefon (telefon=?)",
      "count_scan": "EXPLAIN QUERY PLAN SELECT count(*) FROM mijozlar;\n`--SCAN mijozlar USING COVERING INDEX m_email_lower"
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
