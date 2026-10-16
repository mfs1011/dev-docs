(function (g) {
  g.TTY = {
  "pg": {
    "copy_error": "DROP TABLE\nCREATE TABLE\nNOTICE:  drop cascades to 2 other objects\nDETAIL:  drop cascades to view faol_mahsulotlar\ndrop cascades to materialized view narx_hisoboti\nERROR:  invalid input syntax for type numeric: \"abc\"\nCONTEXT:  COPY mahsulotlar, line 4, column narx: \"abc\"",
    "copy_ignore": "COPY 3\n sku | nom | narx  \n-----+-----+-------\n NON | Non |  4000\n SUT | Sut | 12000\n TUZ | Tuz |  2000\n(3 rows)\n\nNOTICE:  skipping row due to data type incompatibility at line 4 for column \"narx\": \"abc\"\nNOTICE:  skipping row due to data type incompatibility at line 6 for column \"narx\": \"narx_yoq\"\nNOTICE:  2 rows were skipped due to data type incompatibility",
    "copy_reject_limit": "TRUNCATE TABLE\nERROR:  skipped more than REJECT_LIMIT (1) rows due to data type incompatibility\nCONTEXT:  COPY mahsulotlar, line 6, column narx: \"narx_yoq\"",
    "copy_export": "sku,narx\nDROP TABLE"
  },
  "mysql": {
    "local_infile_check": "@@local_infile\t@@secure_file_priv\n0\tNULL",
    "load_data_local": "Level\tCode\tMessage\nWarning\t1366\tIncorrect decimal value: 'abc' for column 'narx' at row 3\nWarning\t1062\tDuplicate entry 'NON' for key 'mahsulotlar.PRIMARY'\nsku\tnom\tnarx\nCHOY\tChoy\t0.00\nNON\tNon\t4000.00\nSUT\tSut\t12000.00"
  },
  "sqlite": {
    "sqlite_import": "╭────────┬──────────┬──────────────╮\n│  sku   │   narx   │ typeof(narx) │\n╞════════╪══════════╪══════════════╡\n│ NON    │     4000 │ integer      │\n│ SUT    │    12000 │ integer      │\n│ CHOY   │ abc      │ text         │\n│ TUZ    │     2000 │ integer      │\n│ SHAKAR │ narx_yoq │ text         │\n╰────────┴──────────┴──────────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
