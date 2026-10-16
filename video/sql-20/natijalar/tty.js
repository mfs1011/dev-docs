(function (g) {
  g.TTY = {
  "pg": {
    "on_conflict_demo": "DROP TABLE\nCREATE TABLE\n soz  | soni | yangi \n------+------+-------\n olma |    1 | t\n(1 row)\n\nINSERT 0 1\n soz  | soni | yangi \n------+------+-------\n olma |    2 | f\n(1 row)\n\nINSERT 0 1\n soz  | eski | yangi \n------+------+-------\n nok  |      |    10\n olma |    2 |     7\n(2 rows)\n\nINSERT 0 2\nDROP TABLE\nNOTICE:  table \"lugat\" does not exist, skipping",
    "merge_demo": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 3\n merge_action | sku  | soni | narx \n--------------+------+------+------\n UPDATE       | NON  |   30 | 4200\n INSERT       | TUZ  |   30 | 2000\n DELETE       | CHOY |    3 | 9000\n(3 rows)\n\nMERGE 3\n sku | soni | narx  \n-----+------+-------\n NON |   30 |  4200\n SUT |    5 | 12000\n TUZ |   30 |  2000\n(3 rows)\n\nDROP TABLE\nNOTICE:  table \"yangi_kelgan\" does not exist, skipping"
  },
  "mysql": {
    "upsert_demo": "rc_1\n1\nrc_2\n2\nid\tsoz\tsoni\n1\tolma\t7\n3\tnok\t10",
    "replace_demo": "rc_replace\n2\nid\tsoz\tsoni\n1\tolma\t100\n5\tnok\t1"
  },
  "sqlite": {
    "sqlite_demo": "╭────┬──────┬──────╮\n│ id │ soz  │ soni │\n╞════╪══════╪══════╡\n│  1 │ olma │    5 │\n│  2 │ nok  │   10 │\n╰────┴──────┴──────╯\n╭────┬───────┬──────╮\n│ id │  soz  │ soni │\n╞════╪═══════╪══════╡\n│  1 │ yangi │    5 │\n╰────┴───────┴──────╯\n╭────┬───────┬──────╮\n│ id │  soz  │ soni │\n╞════╪═══════╪══════╡\n│  1 │ yangi │    5 │\n│  3 │ nok   │    1 │\n╰────┴───────┴──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
