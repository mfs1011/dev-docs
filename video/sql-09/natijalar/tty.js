(function (g) {
  g.TTY = {
  "pg": {
    "bool_sel": "DROP TABLE\nCREATE TABLE\nINSERT 0 4\n   nom    | bajarildi \n----------+-----------\n xat      | t\n qongiroq | f\n hisobot  | t\n sinov    | \n(4 rows)\n\nNOTICE:  table \"vazifalar\" does not exist, skipping",
    "bool_int_err": "ERROR:  column \"bajarildi\" is of type boolean but expression is of type integer\nLINE 1: INSERT INTO vazifalar VALUES ('xato', 2);\n                                              ^\nHINT:  You will need to rewrite or cast the expression.",
    "bool_null_where": "nom   \n---------\n xat\n hisobot\n(2 rows)\n\n   nom    \n----------\n qongiroq\n(1 row)\n\n   nom    | bajarilmagan \n----------+--------------\n xat      | f\n qongiroq | t\n hisobot  | f\n sinov    | t\n(4 rows)\n\nDROP TABLE",
    "uuid_demo": "v4_ver | v7_ver \n--------+--------\n      4 |      7\n(1 row)\n\n uuid_bayt | matn_bayt \n-----------+-----------\n        16 |        40\n(1 row)",
    "enum_demo": "DROP TABLE\nDROP TYPE\nCREATE TYPE\nCREATE TABLE\nINSERT 0 3\n id |     h     \n----+-----------\n  2 | yangi\n  3 | jarayonda\n  1 | yopildi\n(3 rows)\n\nNOTICE:  table \"murojaatlar\" does not exist, skipping\nNOTICE:  type \"holat\" does not exist, skipping",
    "enum_invalid_err": "ERROR:  invalid input value for enum holat: \"bekor\"\nLINE 1: INSERT INTO murojaatlar VALUES (4, 'bekor');\n                                           ^",
    "enum_alter": "ALTER TYPE\n           enum_range            \n---------------------------------\n {yangi,jarayonda,bekor,yopildi}\n(1 row)\n\nDROP TABLE\nDROP TYPE"
  },
  "mysql": {
    "bool_trap": "nom\tbajarildi\tteng_true\tshart\nxat\t1\t1\tha\nqongiroq\t0\t0\tyoq\nxato\t2\t0\tha\nsalbiy\t-5\t0\tha",
    "uuid_to_bin": "oddiy\talmashtirilgan\n6CCD780CBABA102695645B8C656024DB\t1026BABA6CCD780C95645B8C656024DB",
    "enum_demo": "id\th\tindeks\n2\tyangi\t1\n3\tjarayonda\t2\n1\tyopildi\t3"
  },
  "sqlite": {
    "bool_demo": "╭────┬───────────╮\n│ b  │ typeof(b) │\n╞════╪═══════════╡\n│  1 │ integer   │\n│  2 │ integer   │\n│ ha │ text      │\n╰────┴───────────╯",
    "no_uuid_err": "Parse error near line 1: no such function: uuid\n  SELECT uuid();\n         ^--- error here"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
