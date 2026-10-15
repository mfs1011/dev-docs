(function (g) {
  g.TTY = {
  "pg": {
    "case1": "CREATE TABLE\nINSERT 0 1\n nom \n-----\n Non\n(1 row)",
    "not_exist": "ERROR:  relation \"Mahsulot\" does not exist\nLINE 1: SELECT * FROM \"Mahsulot\";\n                      ^",
    "case2": "CREATE TABLE\n\n            List of tables\n Schema |   Name    | Type  |  Owner   \n--------+-----------+-------+----------\n public | Mahsulot  | table | postgres\n public | mahsulot  | table | postgres\n public | talabalar | table | postgres\n(3 rows)",
    "col_err": "ERROR:  column \"nom\" does not exist\nLINE 1: SELECT Nom FROM \"Mahsulot\";\n               ^\nHINT:  Perhaps you meant to reference the column \"Mahsulot.Nom\".",
    "col_ok": "Nom \n-----\n(0 rows)",
    "order_err": "ERROR:  syntax error at or near \"order\"\nLINE 1: CREATE TABLE order (id integer);\n                     ^",
    "order_ok": "CREATE TABLE",
    "trunc": "NOTICE:  identifier \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\" will be truncated to \"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"",
    "str": "ism   \n--------\n Ma'ruf\n(1 row)",
    "esc": "oddiy | escape \n-------+--------\n a\\nb  | a     +\n       | b\n(1 row)",
    "dollar": "dollar      \n-----------------\n Ma'ruf \"aka\" \\n\n(1 row)",
    "lines": "ikki_qator  \n--------------\n Salom, dunyo\n(1 row)",
    "lines_err": "ERROR:  syntax error at or near \"'dunyo'\"\nLINE 1: SELECT 'Salom, ' 'dunyo';\n                         ^",
    "nums": "million | hex | bin | oct \n---------+-----+-----+-----\n 1000000 | 255 |  10 | 493\n(1 row)",
    "types": "a    |   b    |    c    \n---------+--------+---------\n integer | bigint | numeric\n(1 row)",
    "comm5": "?column? \n----------\n        5\n(1 row)",
    "comm6": "natija \n--------\n      6\n(1 row)",
    "nested": "natija \n--------\n      2\n(1 row)",
    "precedence": "a  | b  | daraja \n----+----+--------\n 14 | 20 |     64\n(1 row)"
  },
  "mysql": {
    "order_ok": "Query OK, 0 rows affected",
    "order_err": "ERROR 1064 (42000) at line 1: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'order (id int)' at line 1",
    "len_err": "ERROR 1059 (42000) at line 1: Identifier name 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' is too long",
    "case": "+------+\n| nom  |\n+------+\n| Non  |\n| Non  |\n+------+\n+-------------------------------+\n| Tables_in_qollanma (Mahsulot) |\n+-------------------------------+\n| Mahsulot                      |\n+-------------------------------+",
    "strs": "+--------+-----------+\n| ism    | backslash |\n+--------+-----------+\n| Ma'ruf | Ma'ruf    |\n+--------+-----------+\n+-------+\n| oddiy |\n+-------+\n| a\nb   |\n+-------+\n+--------------+\n| bir_qator    |\n+--------------+\n| Salom, dunyo |\n+--------------+",
    "nums": "+-----+---------+---------+\n| hex | hex_son | bin_son |\n+-----+---------+---------+\n| �    |     255 |      10 |\n+-----+---------+---------+",
    "err_1000": "ERROR 1054 (42S22) at line 1: Unknown column '1_000' in 'field list'",
    "comm": "+--------+\n| natija |\n+--------+\n|      6 |\n+--------+",
    "cond": "+-------+-------------+\n| x     | faqat_mysql |\n+-------+-------------+\n| MySQL |           2 |\n+-------+-------------+",
    "xor": "+------------+--------+\n| xor_natija | daraja |\n+------------+--------+\n|          1 |      8 |\n+------------+--------+"
  },
  "sqlite": {
    "case_err": "Parse error in 3rd command line argument: table \"mahsulot\" already exists\n  CREATE TABLE \"mahsulot\" (x);\n               ^--- error here",
    "nums": "╭─────┬─────────╮\n│ hex │ million │\n╞═════╪═════════╡\n│ 255 │ 1000000 │\n╰─────┴─────────╯",
    "nested_err": "Parse error in 3rd command line argument: near \"izoh\": syntax error\n  SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1;\n                        error here ---^",
    "comm": "╭─────────────────╮\n│ 5--1 AS natija; │\n╞═════════════════╡\n│               5 │\n╰─────────────────╯"
  }
  };
})(typeof window !== 'undefined' ? window : globalThis);
