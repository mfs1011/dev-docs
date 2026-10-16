(function (g) {
  g.TTY = {
  "pg": {
    "virtual_and_stored": "DROP TABLE\nCREATE TABLE\nINSERT 0 2\n id |   narx   | soni |  summa   | summa_s  \n----+----------+------+----------+----------\n  1 |  4000.00 |    3 | 12000.00 | 12000.00\n  2 | 12000.00 |    2 | 24000.00 | 24000.00\n(2 rows)\n\nNOTICE:  table \"buyurtma_qatorlari\" does not exist, skipping",
    "update_demo": "UPDATE 1\n id | soni |  summa   | summa_s  \n----+------+----------+----------\n  1 |    5 | 20000.00 | 20000.00\n(1 row)",
    "catalog_check": "attname | attgenerated \n---------+--------------\n summa   | v\n summa_s | s\n(2 rows)",
    "cannot_insert_non_default": "ERROR:  cannot insert a non-DEFAULT value into column \"summa\"\nDETAIL:  Column \"summa\" is a generated column.",
    "disallowed_now": "DROP TABLE\nNOTICE:  table \"xato1\" does not exist, skipping\nERROR:  generation expression is not immutable",
    "disallowed_chain": "DROP TABLE\nDROP TABLE\nNOTICE:  table \"xato2\" does not exist, skipping\nERROR:  cannot use generated column \"b\" in column generation expression\nLINE 1: ...RATED ALWAYS AS (a * 2), c int GENERATED ALWAYS AS (b + 1));\n                                                               ^\nDETAIL:  A generated column cannot reference another generated column.\nNOTICE:  table \"xato1\" does not exist, skipping\nNOTICE:  table \"xato2\" does not exist, skipping"
  },
  "mysql": {
    "mysql_gen": "id\tnarx\tsoni\tsumma\tsumma_s\tjami_qqs\n1\t4000.00\t3\t12000.00\t12000.00\t13440.00",
    "mysql_err": "ERROR 3105 (HY000) at line 2: The value specified for generated column 'summa' in table 'buyurtma_my' is not allowed."
  },
  "sqlite": {
    "sqlite_gen": "╭────┬──────┬──────┬───────┬─────────┬──────────────╮\n│ id │ narx │ soni │ summa │ summa_s │ ikki_baravar │\n╞════╪══════╪══════╪═══════╪═════════╪══════════════╡\n│  1 │ 4000 │    3 │ 12000 │   12000 │        24000 │\n╰────┴──────┴──────┴───────┴─────────┴──────────────╯",
    "sqlite_alter_stored_err": "Error near line 5: cannot add a STORED column"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
