// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 3\nNOTICE:  table \"buyurtmalar\" does not exist, skipping",
    "json_jsonb": "json_turi          |    jsonb_turi    \n----------------------------+------------------\n {\"b\": 1,   \"a\": 2, \"b\": 3} | {\"a\": 2, \"b\": 3}\n(1 row)",
    "operators": "id | json_qiymat | matn  | birinchi \n----+-------------+-------+----------\n  1 | \"Ali\"       | Ali   | Daftar\n  2 | \"Vali\"      | Vali  | Kitob\n  3 | \"Sobir\"     | Sobir | \n(3 rows)",
    "filter": "id | mijoz \n----+-------\n  1 | Ali\n  3 | Sobir\n(2 rows)\n\n id \n----\n  1\n(1 row)",
    "json_table": "id |  nom   | soni | narx  \n----+--------+------+-------\n  1 | Daftar |    2 | 12000\n  1 | Ruchka |    5 |  3000\n  2 | Kitob  |    1 | 85000\n(3 rows)",
    "update": "UPDATE 1\nUPDATE 1\n                                   hujjat                                    \n-----------------------------------------------------------------------------\n {\"mijoz\": \"Sobir\", \"shahar\": \"Buxoro\", \"tolangan\": true, \"mahsulotlar\": []}\n(1 row)"
  },
  "mysql": {
    "tests": "id\tjson_qiymat\tmatn\tbirinchi\n1\t\"Ali\"\tAli\tDaftar\n2\t\"Vali\"\tVali\tKitob\n3\t\"Sobir\"\tSobir\tNULL\nid\n1\n3\nid\n1"
  },
  "sqlite": {
    "tests": "╭────┬─────────────┬───────╮\n│ id │ json_qiymat │ matn  │\n╞════╪═════════════╪═══════╡\n│  1 │ \"Ali\"       │ Ali   │\n│  2 │ \"Vali\"      │ Vali  │\n│  3 │ \"Sobir\"     │ Sobir │\n╰────┴─────────────┴───────╯\n╭────┬────────┬──────┬───────╮\n│ id │  nom   │ soni │ narx  │\n╞════╪════════╪══════╪═══════╡\n│  1 │ Daftar │    2 │ 12000 │\n│  1 │ Ruchka │    5 │  3000 │\n│  2 │ Kitob  │    1 │ 85000 │\n╰────┴────────┴──────┴───────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
