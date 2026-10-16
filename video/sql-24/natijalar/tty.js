(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nINSERT 0 6\nNOTICE:  table \"talabalar2\" does not exist, skipping",
    "nulls_order": "ism   | ball \n---------+------\n Sobir   |     \n Vali    |   92\n Dilnoza |   92\n Ali     |   85\n Jasur   |   85\n Malika  |   78\n(6 rows)\n\n   ism   | ball \n---------+------\n Vali    |   92\n Dilnoza |   92\n Ali     |   85\n Jasur   |   85\n Malika  |   78\n Sobir   |     \n(6 rows)",
    "with_ties": "ism   | ball \n---------+------\n Vali    |   92\n Dilnoza |   92\n(2 rows)",
    "pagination": "ism   | ball \n---------+------\n Vali    |   92\n Dilnoza |   92\n(2 rows)\n\n  ism  | ball \n-------+------\n Ali   |   85\n Jasur |   85\n(2 rows)"
  },
  "mysql": {
    "mysql_tests": "ism\tball\nSobir\tNULL\nMalika\t78\nAli\t85\nJasur\t85\nVali\t92\nDilnoza\t92\nism\tball\nVali\t92\nDilnoza\t92\nAli\t85\nJasur\t85\nMalika\t78\nSobir\tNULL\nism\tball\nAli\t85\nJasur\t85"
  },
  "sqlite": {
    "sqlite_tests": "╭─────────┬──────╮\n│   ism   │ ball │\n╞═════════╪══════╡\n│ Sobir   │      │\n│ Malika  │   78 │\n│ Ali     │   85 │\n│ Jasur   │   85 │\n│ Vali    │   92 │\n│ Dilnoza │   92 │\n╰─────────┴──────╯\n╭─────────┬──────╮\n│   ism   │ ball │\n╞═════════╪══════╡\n│ Sobir   │      │\n│ Vali    │   92 │\n│ Dilnoza │   92 │\n╰─────────┴──────╯\n╭───────┬──────╮\n│  ism  │ ball │\n╞═══════╪══════╡\n│ Ali   │   85 │\n│ Jasur │   85 │\n╰───────┴──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
