(function (g) {
  g.TTY = {
  "pg": {
    "enc": "server_encoding \n-----------------\n UTF8\n(1 row)\n\n client_encoding \n-----------------\n UTF8\n(1 row)\n\n datcollate  |  datctype   | datlocprovider \n-------------+-------------+----------------\n en_US.UTF-8 | en_US.UTF-8 | c\n(1 row)",
    "uz_sort": "DROP TABLE\nCREATE TABLE\nINSERT 0 10\n                              c_tartib                               \n---------------------------------------------------------------------\n Anor, Oʻrik, banan, choy, gilos, gʻoz, olma, sabzi, shaftoli, zarda\n(1 row)\n\n                            default_en_us                            \n---------------------------------------------------------------------\n Anor, banan, choy, gilos, gʻoz, olma, Oʻrik, sabzi, shaftoli, zarda\n(1 row)\n\n                               uz_icu                                \n---------------------------------------------------------------------\n Anor, banan, gilos, olma, sabzi, zarda, Oʻrik, gʻoz, shaftoli, choy\n(1 row)\n\nNOTICE:  table \"sozlar\" does not exist, skipping",
    "case_ci": "u    |    l     |   turk   \n--------+----------+----------\n OʻZBEK | istanbul | ıstanbul\n(1 row)\n\nDROP COLLATION\nCREATE COLLATION\n oddiy | ci_bilan | urgu \n-------+----------+------\n f     | t        | f\n(1 row)\n\nNOTICE:  collation \"ci\" does not exist, skipping",
    "unique_email_err": "DROP TABLE\nCREATE TABLE\nINSERT 0 1\n    email    \n-------------\n Ali@Mail.uz\n(1 row)\n\nDROP TABLE\nDROP TABLE\nDROP COLLATION\nNOTICE:  table \"foydalanuvchilar\" does not exist, skipping\nERROR:  duplicate key value violates unique constraint \"foydalanuvchilar_email_key\"\nDETAIL:  Key (email)=(ali@mail.uz) already exists."
  },
  "mysql": {
    "enc": "@@character_set_server\t@@collation_server\t@@character_set_client\nutf8mb4\tutf8mb4_0900_ai_ci\tutf8mb4",
    "ci_demo": "katta_kichik\turgu\tbin_bilan\tas_cs\n1\t1\t0\t0",
    "emoji_err": "ERROR 1366 (HY000) at line 4: Incorrect string value: '\\xF0\\x9F\\x98\\x80' for column 's' at row 1"
  },
  "sqlite": {
    "enc_col": "╭──────────╮\n│ encoding │\n╞══════════╡\n│ UTF-8    │\n╰──────────╯\n╭─────────┬────────┬────────────────┬───────╮\n│ binary_ │ nocase │ nocase_unicode │ rtrim │\n╞═════════╪════════╪════════════════╪═══════╡\n│       0 │      1 │              0 │     1 │\n╰─────────┴────────┴────────────────┴───────╯\n╭───────┬────────────┬─────────╮\n│ ascii │  unicode   │ kirill  │\n╞═══════╪════════════╪═════════╡\n│ SALOM │ öLMA OʻRIK │ тошкент │\n╰───────┴────────────┴─────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
