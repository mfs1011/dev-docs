// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 3\nNOTICE:  table \"odamlar\" does not exist, skipping",
    "concat": "id |       toliq        |   ota_bilan    |       c        |           cw           \n----+--------------------+----------------+----------------+------------------------\n  1 | Ali Valiyev        | Ali Karimovich | Ali Karimovich | Valiyev Ali Karimovich\n  2 | Oʻgʻiloy Sobirova  |                | Oʻgʻiloy       | Sobirova Oʻgʻiloy\n  3 |   Jasur   Tursunov |                |   Jasur        | Tursunov   Jasur  \n(3 rows)",
    "length": "id | len | chr | bayt \n----+-----+-----+------\n  1 |   3 |   3 |    3\n  2 |   8 |   8 |   10\n  3 |   9 |   9 |    9\n(3 rows)",
    "trim_case": "id |     t      |  katta   |        kichik        \n----+------------+----------+----------------------\n  1 | [Ali]      | VALIYEV  | ali.valiyev@misol.uz\n  2 | [Oʻgʻiloy] | SOBIROVA | ogiloy@misol.uz\n  3 | [Jasur]    | TURSUNOV | \n(3 rows)",
    "substring_split": "id | bosh | chap | ong |  domen   \n----+------+------+-----+----------\n  1 | Val  | Val  | ev  | misol.uz\n  2 | Sob  | Sob  | va  | Misol.UZ\n  3 | Tur  | Tur  | ov  | \n(3 rows)",
    "regex": "id |   raqamlar   | soni \n----+--------------+------\n  1 | 998901234567 |   12\n  2 | 907654321    |    9\n  3 | 901112233    |    9\n(3 rows)"
  },
  "mysql": {
    "tests": "id\tpipe_or\tota_null\tcw\tlen_bytes\tchr_chars\n1\t0\tAli Karimovich\tValiyev Ali Karimovich\t3\t3\n2\t0\tNULL\tSobirova Oʻgʻiloy\t10\t8\n3\t0\tNULL\tTursunov   Jasur  \t9\t9\nid\tdomen\traqamlar\n1\tmisol.uz\t998901234567\n2\tMisol.UZ\t907654321\n3\tNULL\t901112233"
  },
  "sqlite": {
    "tests": "╭────┬────────────────────┬────────────────────────┬─────┬──────┬──────────╮\n│ id │       toliq        │           cw           │ len │ bayt │  domen   │\n╞════╪════════════════════╪════════════════════════╪═════╪══════╪══════════╡\n│  1 │ Ali Valiyev        │ Valiyev Ali Karimovich │   3 │    3 │ misol.uz │\n│  2 │ Oʻgʻiloy Sobirova  │ Sobirova Oʻgʻiloy      │   8 │   10 │ Misol.UZ │\n│  3 │   Jasur   Tursunov │ Tursunov   Jasur       │   9 │    9 │          │\n╰────┴────────────────────┴────────────────────────┴─────┴──────┴──────────╯\n╭──────────────┬─────────────╮\n│ kirill_upper │ latin_upper │\n╞══════════════╪═════════════╡\n│ ўзбек тили   │ OʻGʻILOY    │\n╰──────────────┴─────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
