(function (g) {
  g.TTY = {
  "pg": {
    "always_err": "DROP TABLE\nCREATE TABLE\nINSERT 0 2\nNOTICE:  table \"mijozlar\" does not exist, skipping\nERROR:  cannot insert a non-DEFAULT value into column \"id\"\nDETAIL:  Column \"id\" is an identity column defined as GENERATED ALWAYS.\nHINT:  Use OVERRIDING SYSTEM VALUE to override.",
    "always_override": "INSERT 0 1\n id |  ism  \n----+-------\n  1 | Ali\n  2 | Vali\n 10 | Sobir\n(3 rows)",
    "by_default": "DROP TABLE\nCREATE TABLE\nINSERT 0 1\nINSERT 0 1\nINSERT 0 1\n id |  ism  \n----+-------\n  1 | Ali\n  2 | Vali\n 10 | Sobir\n(3 rows)\n\nNOTICE:  table \"mijozlar_def\" does not exist, skipping",
    "serial_seq": "DROP TABLE\nCREATE TABLE\n pg_get_serial_sequence \n------------------------\n public.eski_id_seq\n(1 row)\n\n n1 | n2 | c \n----+----+---\n  1 |  2 | 2\n(1 row)\n\nDROP TABLE\nNOTICE:  table \"eski\" does not exist, skipping",
    "gap_demo": "BEGIN\nINSERT 0 1\nROLLBACK\nINSERT 0 1\n id |   ism   \n----+---------\n  1 | Ali\n  2 | Vali\n  4 | Keyingi\n 10 | Sobir\n(4 rows)\n\nDROP TABLE"
  },
  "mysql": {
    "auto_demo": "LAST_INSERT_ID()\n1\nid\tism\n1\tAli\n2\tVali\n3\tNol\n4\tNull\n100\tSobir\n101\tKeyingi",
    "tinyint_err": "ERROR 1062 (23000) at line 5: Duplicate entry '127' for key 'kichik.PRIMARY'"
  },
  "sqlite": {
    "autoincrement_demo": "╭────────┬────┬───────╮\n│ jadval │ id │  ism  │\n╞════════╪════╪═══════╡\n│ oddiy  │  1 │ Ali   │\n│ oddiy  │  2 │ Vali  │\n│ oddiy  │  3 │ Yangi │\n│ auto   │  1 │ Ali   │\n│ auto   │  2 │ Vali  │\n│ auto   │  4 │ Yangi │\n╰────────┴────┴───────╯\n╭──────┬─────╮\n│ name │ seq │\n╞══════╪═════╡\n│ auto │   4 │\n╰──────┴─────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
