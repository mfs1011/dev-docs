// Auto-generated live database test runs for SQL Chapter 43
// Databases: PostgreSQL 18.6, MySQL, SQLite 3.54.0

(function (g) {
  g.TTY = {
  "pg": {
    "version": "version                                                            \n------------------------------------------------------------------------------------------------------------------------------\n PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0, compiled by Apple clang version 21.0.0 (clang-2100.3.34.2), 64-bit\n(1 row)",
    "lower_seq": "QUERY PLAN                        \n----------------------------------------------------------\n Gather\n   Workers Planned: 1\n   ->  Parallel Seq Scan on f\n         Filter: (lower(email) = 'user77@misol.uz'::text)\n(4 rows)",
    "lower_idx": "QUERY PLAN                       \n--------------------------------------------------------\n Index Scan using f_lower_email on f\n   Index Cond: (lower(email) = 'user77@misol.uz'::text)\n(2 rows)",
    "like_seq": "QUERY PLAN              \n--------------------------------------\n Seq Scan on f\n   Filter: (email ~~ 'user77%'::text)\n(2 rows)",
    "like_pattern": "QUERY PLAN                                 \n----------------------------------------------------------------------------\n Index Scan using f_email_pattern on f\n   Index Cond: ((email ~>=~ 'user77'::text) AND (email ~<~ 'user78'::text))\n   Filter: (email ~~ 'user77%'::text)\n(3 rows)",
    "sizes": "relname    | pg_size_pretty \n--------------+----------------\n f_holat_full | 1368 kB\n f_yangi      | 64 kB\n(2 rows)",
    "partial_yangi": "QUERY PLAN             \n------------------------------------\n Index Only Scan using f_yangi on f\n   Index Cond: (id > 199000)\n(2 rows)",
    "include_before": "QUERY PLAN                            \n------------------------------------------------------------------\n Index Only Scan using f_id_inc on f (actual rows=101.00 loops=1)\n   Index Cond: ((id >= 1000) AND (id <= 1100))\n   Heap Fetches: 101\n   Index Searches: 1\n(4 rows)",
    "include_after": "QUERY PLAN                            \n------------------------------------------------------------------\n Index Only Scan using f_id_inc on f (actual rows=101.00 loops=1)\n   Index Cond: ((id >= 1000) AND (id <= 1100))\n   Heap Fetches: 0\n   Index Searches: 1\n(4 rows)"
  },
  "mysql": {
    "version": "VERSION()\n26.7.0",
    "ci_lookup": "EXPLAIN\n-> Covering index lookup on f using f_email (email = 'USER77@MISOL.UZ')  (cost=0.48 rows=1)\\n",
    "lower_lookup": "EXPLAIN\n-> Index lookup on f using f_lower_email (lower(email) = 'user77@misol.uz')  (cost=0.35 rows=1)\\n"
  },
  "sqlite": {
    "version": "3.54.0",
    "output": "QUERY PLAN\n`--SEARCH f USING INDEX f_lower_email (<expr>=?)\nQUERY PLAN\n`--SEARCH f USING COVERING INDEX f_yangi (id>?)"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
