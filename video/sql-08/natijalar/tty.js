(function (g) {
  g.TTY = {
  "pg": {
    "sel_tz": "TimeZone    \n---------------\n Asia/Tashkent\n(1 row)",
    "sel_voqealar_tashkent": "DROP TABLE\nSET\nCREATE TABLE\nINSERT 0 1\nINSERT 0 1\n   nom    |        oddiy        |         zonali         \n----------+---------------------+------------------------\n dars     | 2026-10-12 09:00:00 | 2026-10-12 09:00:00+05\n qongiroq | 2026-10-12 09:00:00 | 2026-10-12 11:00:00+05\n(2 rows)\n\nNOTICE:  table \"voqealar\" does not exist, skipping",
    "sel_voqealar_utc": "SET\n   nom    |        oddiy        |         zonali         \n----------+---------------------+------------------------\n dars     | 2026-10-12 09:00:00 | 2026-10-12 04:00:00+00\n qongiroq | 2026-10-12 09:00:00 | 2026-10-12 06:00:00+00\n(2 rows)\n\nDROP TABLE",
    "at_time_zone": "SET\n    moskva_vaqti     |    moskvadagi_soat     \n---------------------+------------------------\n 2026-10-12 07:00:00 | 2026-10-12 11:00:00+05\n(1 row)",
    "interval_math": "bir_oy        |     mart_oxiri      \n---------------------+---------------------\n 2026-02-28 00:00:00 | 2026-04-30 00:00:00\n(1 row)\n\n          normallashgan           \n----------------------------------\n 3 years 3 mons 700 days 99:00:00\n(1 row)\n\n      farq       | kunlar \n-----------------+--------\n 2 days 08:30:00 |    284\n(1 row)",
    "dst_ny": "SET\n        bir_kun         |   yigirma_tort_soat    \n------------------------+------------------------\n 2026-03-08 12:00:00-04 | 2026-03-08 13:00:00-04\n(1 row)",
    "datestyle_err": "ERROR:  date/time field value out of range: \"13/01/2026\"\nLINE 1: SELECT '13/01/2026'::date;\n               ^\nHINT:  Perhaps you need a different \"DateStyle\" setting.",
    "datestyle_ok": "SET\n    dmy     \n------------\n 2026-01-13\n(1 row)",
    "feb30_err": "ERROR:  date/time field value out of range: \"2026-02-30\"\nLINE 1: SELECT '2026-02-30'::date;\n               ^"
  },
  "mysql": {
    "dt_vs_ts": "nom\tdt\tts\ndars\t2026-10-12 09:00:00\t2026-10-12 04:00:00",
    "year2038_err": "ERROR 1292 (22007) at line 5: Incorrect datetime value: '2038-01-19 03:14:08' for column 'ts' at row 1",
    "interval_err": "ERROR 1064 (42000) at line 1: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'INTERVAL)' at line 1",
    "fractional": "a\tb\n2026-10-12 09:00:01\t2026-10-12 09:00:00.778",
    "math": "bir_oy\tkunlar\n2026-02-28\t284"
  },
  "sqlite": {
    "formats": "╭──────┬─────────────────────┬────────────┬─────────────╮\n│ nom  │        vaqt         │    unix    │   julian    │\n╞══════╪═════════════════════╪════════════╪═════════════╡\n│ dars │ 2026-10-12 09:00:00 │ 1791795600 │ 2461325.875 │\n╰──────┴─────────────────────┴────────────┴─────────────╯",
    "month_ceiling_floor": "╭────────────┬────────────╮\n│   bir_oy   │   floor    │\n╞════════════╪════════════╡\n│ 2026-03-03 │ 2026-02-28 │\n╰────────────┴────────────╯",
    "rollover": "╭────────────┬─────────╮\n│  fevral30  │ notogri │\n╞════════════╪═════════╡\n│ 2026-03-02 │         │\n╰────────────┴─────────╯",
    "str_cmp_pitfall": "╭───────────────────╮\n│ matn_solishtirish │\n╞═══════════════════╡\n│                 1 │\n╰───────────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
