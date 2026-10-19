// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 4\nNOTICE:  table \"narxlar\" does not exist, skipping",
    "case_toifa": "nom   | narx  | toifa  \n--------+-------+--------\n Daftar | 12000 | o'rta\n Ruchka |  3000 | arzon\n Kitob  | 85000 | qimmat\n Sumka  |     0 | tekin\n(4 rows)",
    "case_null": "nom   | xato | togri \n--------+------+-------\n Daftar | bor  | yo'q\n Ruchka | bor  | bor\n Kitob  | bor  | bor\n Sumka  | bor  | yo'q\n(4 rows)",
    "coalesce": "nom   |         matn          \n--------+-----------------------\n Daftar | Katak daftar 48 varaq\n Ruchka | Ruchka\n Kitob  | (yo'q)\n Sumka  | Bo'sh\n(4 rows)\n\n  nom   | yakuniy \n--------+---------\n Daftar |   12000\n Ruchka |    2500\n Kitob  |   85000\n Sumka  |       0\n(4 rows)",
    "nullif": "nom   | qisqa  \n--------+--------\n Daftar | Daftar\n Ruchka | Ruchka\n Kitob  | \n Sumka  | \n(4 rows)\n\n  nom   | nisbat \n--------+--------\n Daftar |     83\n Ruchka |    333\n Kitob  |     11\n Sumka  |       \n(4 rows)",
    "greatest_least": "nom   | katta | kichik \n--------+-------+--------\n Daftar | 15000 |  12000\n Ruchka |  3000 |   3000\n Kitob  | 90000 |  85000\n Sumka  |     0 |      0\n(4 rows)"
  },
  "mysql": {
    "tests": "nom\tkatta\tkichik\nDaftar\t15000\t12000\nRuchka\tNULL\tNULL\nKitob\t90000\t85000\nSumka\tNULL\tNULL\nIF(narx > 10000, 'ha', 'yo''q')\tIFNULL(chegirma, 0)\nha\t0"
  },
  "sqlite": {
    "tests": "╭────────┬───────┬────────────╮\n│  nom   │   k   │ iif_natija │\n╞════════╪═══════╪════════════╡\n│ Daftar │ 15000 │ ha         │\n╰────────┴───────┴────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
