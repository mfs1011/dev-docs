// Auto-generated live database test runs for SQL Chapter 48: Sahifalash
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.1

(function (g) {
  g.TTY = {
    "pg": {
      "version": "PostgreSQL 18.6 on aarch64-apple-darwin25.6.0",
      "offset_0": " Limit (cost=0.42..1.03 rows=20) (actual rows=20 loops=1)\n   -> Index Only Scan using b_sana_id on buyurtmalar (actual rows=20.00)\n Planning Time: 0.077 ms\n Execution Time: 0.029 ms",
      "offset_900k": " Limit (cost=27371.22..27371.83 rows=20) (actual rows=20 loops=1)\n   -> Index Only Scan using b_sana_id on buyurtmalar (actual rows=900020.00)\n Planning Time: 0.009 ms\n Execution Time: 36.260 ms (900k qator behuda o'qildi)",
      "keyset_row": " Limit (cost=0.42..1.08 rows=20) (actual rows=20 loops=1)\n   -> Index Only Scan using b_sana_id on buyurtmalar\n        Index Cond: (ROW(sana, id) > ROW('2025-07-28 08:00:00', 900000))\n Execution Time: 0.020 ms (B-tree to'g'ri nuqtaga sakradi)",
      "keyset_or": " Limit (cost=0.42..7.98 rows=20) (actual rows=20 loops=1)\n   -> Index Only Scan using b_sana_id on buyurtmalar\n        Filter: ((sana > ...) OR (sana = ... AND id > 900000))\n        Rows Removed by Filter: 900000\n Execution Time: 29.192 ms (PG da OR sekinlashadi)",
      "drift_offset": "OFFSET 3: 999998 qayta ko'rindi (yangi qator surgani sababli)",
      "drift_keyset": "KEYSET <: 999997 dan to'g'ri davom etdi (qiymat bo'yicha barqaror)"
    },
    "mysql": {
      "version": "MySQL 9.7.2",
      "offset_900k": "Limit/Offset: 20/900000 row(s)\n  -> Covering index scan on buyurtmalar using b_sana_id (actual rows=900020)\nActual Time: 73.2 ms",
      "row_constructor_scan": "Filter: ((buyurtmalar.sana,buyurtmalar.id) > ('2025-07-28 08:00:00',900000))\n  -> Covering index scan (rows=900020, possible_keys=NULL)\nActual Time: 90.2 ms (konstruktorni oraliqqa aylantirmadi)",
      "or_range_fast": "Covering index range scan on buyurtmalar over (sana = ... AND 900000 < id) OR (sana > ...)\nActual Time: 0.58 ms (MySQL da OR 150x tezroq!)"
    },
    "sqlite": {
      "version": "SQLite 3.54.1",
      "offset_plan": "QUERY PLAN\n`--SCAN buyurtmalar USING COVERING INDEX b_sana_id (7.7 ms)",
      "keyset_plan": "QUERY PLAN\n`--SEARCH buyurtmalar USING COVERING INDEX b_sana_id (sana>?) (0.028 ms)"
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
