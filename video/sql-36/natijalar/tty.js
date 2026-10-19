// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nDROP DOMAIN\nDROP TYPE\nCREATE TABLE\nINSERT 0 3\nNOTICE:  table \"maqolalar\" does not exist, skipping\nNOTICE:  table \"bron\" does not exist, skipping\nNOTICE:  table \"tolovlar\" does not exist, skipping\nNOTICE:  table \"mijozlar2\" does not exist, skipping\nNOTICE:  type \"telefon_raqam\" does not exist, skipping\nNOTICE:  type \"musbat_summa\" does not exist, skipping\nNOTICE:  type \"manzil\" does not exist, skipping",
    "arrays": "id |        teglar         | birinchi | yoq | soni | uzunlik \n----+-----------------------+----------+-----+------+---------\n  1 | {sql,postgres}        | sql      |     |    2 |       2\n  2 | {json,postgres,mysql} | json     |     |    3 |       3\n  3 | {}                    |          |     |    0 |        \n(3 rows)\n\n id \n----\n  1\n  2\n(2 rows)\n\n id \n----\n  2\n(1 row)\n\n id \n----\n  1\n  2\n(2 rows)",
    "unnest": "teg    | count \n----------+-------\n postgres |     2\n json     |     1\n mysql    |     1\n sql      |     1\n(4 rows)\n\n         array_agg         \n---------------------------\n {\"SQL asoslari\",JSON,Git}\n(1 row)",
    "range": "yopiq          |   r    | ichidami | kesishadi |   yuqori   | bosh \n-------------------------+--------+----------+-----------+------------+------\n [2026-02-01,2026-02-06) | [2,11) | f        | t         | 2026-02-05 | t\n(1 row)",
    "exclusion": "CREATE EXTENSION\nCREATE TABLE\nINSERT 0 1\nINSERT 0 1\nINSERT 0 1\nERROR:  conflicting key value violates exclusion constraint \"bron_xona_davr_excl\"\nDETAIL:  Key (xona, davr)=(101, [\"2026-02-02 11:30:00\",\"2026-02-02 12:30:00\")) conflicts with existing key (xona, davr)=(101, [\"2026-02-02 10:00:00\",\"2026-02-02 12:00:00\")).",
    "domain": "CREATE DOMAIN\nCREATE DOMAIN\nCREATE TABLE\nINSERT 0 1\nERROR:  value for domain telefon_raqam violates check constraint \"telefon_raqam_check\"",
    "composite": "CREATE TYPE\nCREATE TABLE\nINSERT 0 2\n id |         manzil         |  shahar   \n----+------------------------+-----------\n  1 | (Toshkent,Navoiy,12)   | Toshkent\n  2 | (Samarqand,Registon,5) | Samarqand\n(2 rows)"
  },
  "mysql": {
    "tests": "id\n1"
  },
  "sqlite": {
    "tests": "╭────────┬────────────────╮\n│ teglar │ typeof(teglar) │\n╞════════╪════════════════╡\n│ {a,b}  │ text           │\n╰────────┴────────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
