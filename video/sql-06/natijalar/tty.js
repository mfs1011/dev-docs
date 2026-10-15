(function (g) {
  g.TTY = {
  "pg": {
    "point1": "numeric_yigindi |    float_yigindi    \n-----------------+---------------------\n             0.3 | 0.30000000000000004\n(1 row)",
    "compare": "teng_mi | numeric_teng_mi \n---------+-----------------\n f       | t\n(1 row)",
    "smallint_err": "ERROR:  smallint out of range",
    "int_err": "ERROR:  integer out of range",
    "bigint": "bigint_bilan \n--------------\n   2147483648\n(1 row)",
    "num_overflow": "ERROR:  numeric field overflow\nDETAIL:  A field with precision 5, scale 2 must round to an absolute value less than 10^3.",
    "narxlar": "n    \n--------\n 123.46\n 999.99\n(2 rows)",
    "div": "butun_bolish |   numeric_bolish   | qoldiq \n--------------+--------------------+--------\n            2 | 2.5000000000000000 |      2\n(1 row)",
    "round": "x   | num_round | dbl_round \n------+-----------+-----------\n -2.5 |        -3 |        -2\n -1.5 |        -2 |        -2\n -0.5 |        -1 |        -0\n  0.5 |         1 |         0\n  1.5 |         2 |         2\n  2.5 |         3 |         2\n(6 rows)",
    "special": "nan_teng | cheksiz  \n----------+----------\n t        | Infinity\n(1 row)\n\n minglik \n---------\n    1000\n(1 row)",
    "money": "lc_monetary \n-------------\n en_US.UTF-8\n(1 row)\n\n  pul   | bolingan \n--------+----------\n $12.35 |  $333.33\n(1 row)"
  },
  "mysql": {
    "warnings": "+---------+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+\n| Level   | Code | Message                                                                                                                                                                   |\n+---------+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+\n| Warning | 1681 | The ZEROFILL attribute is deprecated and will be removed in a future release. Use the LPAD function to zero-pad numbers, or store the formatted numbers in a CHAR column. |\n| Warning | 1681 | Integer display width is deprecated and will be removed in a future release.                                                                                              |\n| Warning | 1681 | UNSIGNED for decimal and floating point data types is deprecated and support for it will be removed in a future release.                                                  |\n+---------+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------+",
    "strict_err": "ERROR 1264 (22003) at line 1: Out of range value for column 't' at row 1",
    "relaxed": "+------+------+\n| t    | tu   |\n+------+------+\n|  127 |    0 |\n+------+------+",
    "float_point": "+-----------------+---------------------+\n| decimal_yigindi | double_yigindi      |\n+-----------------+---------------------+\n|             0.3 | 0.30000000000000004 |\n+-----------------+---------------------+",
    "div": "+--------+--------------+--------+\n| bolish | butun_bolish | qoldiq |\n+--------+--------------+--------+\n| 2.5000 |            2 |      2 |\n+--------+--------------+--------+"
  },
  "sqlite": {
    "out": "╭────────┬───────────┬───────────┬───────────┬─────┬───────────╮\n│   n    │ typeof(n) │     d     │ typeof(d) │  i  │ typeof(i) │\n╞════════╪═══════════╪═══════════╪═══════════╪═════╪═══════════╡\n│ 300000 │ integer   │   123.456 │ real      │   3 │ integer   │\n│ abc    │ text      │ 99999.999 │ real      │ 2.5 │ real      │\n╰────────┴───────────┴───────────┴───────────┴─────┴───────────╯\n╭────────┬─────────┬────────╮\n│ bolish │ haqiqiy │ qoldiq │\n╞════════╪═════════╪════════╡\n│      2 │     2.5 │      2 │\n╰────────┴─────────┴────────╯\n╭────────────────────────┬──────╮\n│         natija         │ tip  │\n╞════════════════════════╪══════╡\n│ 9.2233720368547758e+18 │ real │\n╰────────────────────────┴──────╯\n╭─────────────────────┬─────────╮\n│       yigindi       │ teng_mi │\n╞═════════════════════╪═════════╡\n│ 0.30000000000000004 │       0 │\n╰─────────────────────┴─────────╯\n╭──────╮\n│ aniq │\n╞══════╡\n│ 0.3  │\n╰──────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
