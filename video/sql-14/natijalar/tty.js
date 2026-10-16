(function (g) {
  g.TTY = {
  "pg": {
    "check_err": "DROP TABLE\nCREATE TABLE\nINSERT 0 1\nNOTICE:  table \"mahsulotlar\" does not exist, skipping\nERROR:  new row for relation \"mahsulotlar\" violates check constraint \"musbat_narx\"\nDETAIL:  Failing row contains (2, Sut, -5, null, SUT-1).",
    "table_check_err": "ERROR:  new row for relation \"mahsulotlar\" violates check constraint \"mahsulotlar_check\"\nDETAIL:  Failing row contains (3, Choy, 9000, 9500, CHOY-1).",
    "null_check_pass": "INSERT 0 1\n id | nom | narx | chegirma \n----+-----+------+----------\n  1 | Non | 4000 |     3500\n  4 | Tuz |      |         \n(2 rows)",
    "unique_nulls": "DROP TABLE\nCREATE TABLE\nINSERT 0 1\nNOTICE:  table \"t_unique\" does not exist, skipping\nERROR:  duplicate key value violates unique constraint \"t_unique_kod_key\"\nDETAIL:  Key (kod)=(null) already exists.",
    "fk_cascade_restrict": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 2\nINSERT 0 1\nINSERT 0 1\nDELETE 1\n id | ota_id \n----+--------\n(0 rows)\n\nNOTICE:  table \"ota\" does not exist, skipping\nNOTICE:  table \"bola_cascade\" does not exist, skipping\nNOTICE:  table \"bola_restrict\" does not exist, skipping\nERROR:  update or delete on table \"ota\" violates RESTRICT setting of foreign key constraint \"bola_restrict_ota_id_fkey\" on table \"bola_restrict\"\nDETAIL:  Key (id)=(2) is referenced from table \"bola_restrict\".",
    "deferrable_demo": "DROP TABLE\nCREATE TABLE\nBEGIN\nINSERT 0 1\nINSERT 0 1\nCOMMIT\n id | keyingi \n----+---------\n  1 |       2\n  2 |       1\n(2 rows)\n\nDROP TABLE\nNOTICE:  table \"aylana\" does not exist, skipping"
  },
  "mysql": {
    "check_demo": "ERROR 3819 (HY000) at line 7: Check constraint 'mahsulot_my_chk_1' is violated.",
    "fk_auto_index": "Table\tNon_unique\tKey_name\tSeq_in_index\tColumn_name\tCollation\tCardinality\tSub_part\tPacked\tNull\tIndex_type\tComment\tIndex_comment\tVisible\tExpression\nbola_my\t0\tPRIMARY\t1\tid\tA\t0\tNULL\tNULL\t\tBTREE\t\t\tYES\tNULL\nbola_my\t1\tota_id\t1\tota_id\tA\t0\tNULL\tNULL\tYES\tBTREE\t\t\tYES\tNULL"
  },
  "sqlite": {
    "fk_pragma_demo": "╭──────────────╮\n│ foreign_keys │\n╞══════════════╡\n│            0 │\n╰──────────────╯\n╭────┬────────╮\n│ id │ ota_id │\n╞════╪════════╡\n│  1 │    999 │\n╰────┴────────╯\nError near line 8: FOREIGN KEY constraint failed"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
