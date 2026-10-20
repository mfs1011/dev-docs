// Auto-generated live database test runs for SQL Chapter 45
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0

(function (g) {
  g.TTY = {
    "pg": {
      "version": "PostgreSQL 18.6 (Homebrew) on aarch64-apple-darwin25.6.0",
      "simple_seq": "QUERY PLAN\n--------------------------------------------------------------------\n Seq Scan on buyurtmalar  (cost=0.00..3082.00 rows=200000 width=16)",
      "tree_plan": "QUERY PLAN\n--------------------------------------------------------------------\n Limit  (cost=3579.63..3580.77 rows=10 width=16)\n   ->  Gather Merge  (cost=3579.63..3822.05 rows=2127 width=16)\n         Workers Planned: 1\n         ->  Sort  (cost=2579.62..2582.75 rows=1251 width=16)\n               Sort Key: summa\n               ->  Parallel Seq Scan on buyurtmalar  (cost=0.00..2552.59 rows=1251 width=16)\n                     Filter: (summa > 99000)",
      "nested_loop": "QUERY PLAN\n--------------------------------------------------------------------\n GroupAggregate  (cost=218.35..218.75 rows=2 width=17) (actual time=0.035..0.035 rows=1.00 loops=1)\n   Group Key: m.shahar\n   Buffers: shared hit=63\n   ->  Sort  (cost=218.35..218.48 rows=50 width=13) (actual time=0.030..0.031 rows=50.00 loops=1)\n         Sort Key: m.shahar\n         Sort Method: quicksort  Memory: 26kB\n         ->  Nested Loop  (cost=4.66..216.94 rows=50 width=13) (actual time=0.008..0.025 rows=50.00 loops=1)\n               ->  Index Scan using mijozlar_pkey on mijozlar m  (cost=0.29..8.38 rows=5 width=13) (actual time=0.002..0.002 rows=5.00 loops=1)\n                     Index Cond: (id <= 5)\n               ->  Bitmap Heap Scan on buyurtmalar b  (cost=4.37..41.61 rows=10 width=8) (actual time=0.002..0.004 rows=10.00 loops=5)\n                     Recheck Cond: (m.id = mijoz_id)\n                     Heap Blocks: exact=50\n                     ->  Bitmap Index Scan on buyurtmalar_mijoz_idx (rows=10 loops=5)\n Planning Time: 0.162 ms\n Execution Time: 0.044 ms",
      "hash_join": "QUERY PLAN\n--------------------------------------------------------------------\n Finalize GroupAggregate (actual time=19.023..19.482 rows=2.00 loops=1)\n   ->  Partial HashAggregate (actual time=18.053..18.053 rows=2.00 loops=2)\n         Group Key: m.shahar\n         ->  Hash Join (actual time=1.578..12.559 rows=100000.00 loops=2)\n               Hash Cond: (b.mijoz_id = m.id)\n               ->  Parallel Seq Scan on buyurtmalar b (actual time=0.002..2.630 rows=100000.00 loops=2)\n               ->  Hash (actual time=1.564..1.564 rows=20000.00 loops=2)\n                     Buckets: 32768  Batches: 1  Memory Usage: 1194kB\n                     ->  Seq Scan on mijozlar m (actual time=0.009..0.730 rows=20000.00 loops=2)\n Execution Time: 19.497 ms",
      "dml_rollback": "QUERY PLAN\n--------------------------------------------------------------------\n Delete on buyurtmalar (actual rows=0.00 loops=1)\n   Buffers: shared hit=1630\n   ->  Seq Scan on buyurtmalar (actual rows=548.00 loops=1)\n         Filter: (sana = '2026-03-01'::date)\n         Rows Removed by Filter: 199452\n ROLLBACK\n count: 548"
    },
    "mysql": {
      "version": "MySQL 9.7.2",
      "traditional": "| id | select_type | table | type  | possible_keys | key      | rows | filtered | Extra                        |\n|  1 | SIMPLE      | m     | range | PRIMARY       | PRIMARY  |    5 |   100.00 | Using where; Using temporary |\n|  1 | SIMPLE      | b     | ref   | mijoz_id      | mijoz_id |   10 |   100.00 | NULL                         |",
      "tree": "-> Table scan on <temporary>  (actual time=0.291..0.291 rows=1 loops=1)\n    -> Nested loop inner join  (cost=18.9 rows=50.4) (actual time=0.0224..0.0511 rows=50 loops=1)\n        -> Index range scan on m using PRIMARY over (id <= 5) (cost=1.26 rows=5 loops=1)\n        -> Index lookup on b using mijoz_id (mijoz_id = m.id) (cost=2.72 rows=10.1 loops=5)"
    },
    "sqlite": {
      "version": "SQLite 3.54.0",
      "eqp": "QUERY PLAN\n|--SEARCH m USING INTEGER PRIMARY KEY (rowid<?)\n|--SEARCH b USING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)\n`--USE TEMP B-TREE FOR GROUP BY"
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
