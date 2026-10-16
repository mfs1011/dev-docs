(function (g) {
  g.TTY = {
  "pg": {
    "insert_demo": "mahsulot_id |  nom   | soni | narx  \n-------------+--------+------+-------\n           1 | Non    |  100 |  4000\n           2 | Sut    |    0 |     0\n           3 | Choy   |    0 |     0\n           4 | Tuz    |   50 |  2000\n           5 | Shakar |   80 | 11000\n(5 rows)\n\nNOTICE:  table \"sotuvlar\" does not exist, skipping\nNOTICE:  table \"ombor\" does not exist, skipping",
    "update_from": "mahsulot_id |  nom   | soni | narx  \n-------------+--------+------+-------\n           1 | Non    |  100 |  4000\n           2 | Sut    |    0 |     0\n           3 | Choy   |    0 |     0\n           4 | Tuz    |   50 |  2000\n           5 | Shakar |   80 | 11000\n(5 rows)\n\n mahsulot_id |  nom   | soni | narx  \n-------------+--------+------+-------\n           1 | Non    |   85 |  4000\n           2 | Sut    |    0 |     0\n           3 | Choy   |    0 |     0\n           4 | Tuz    |   47 |  2000\n           5 | Shakar |   60 | 11000\n(5 rows)",
    "delete_using": "mahsulot_id |  nom   | soni | narx  \n-------------+--------+------+-------\n           1 | Non    |  100 |  4000\n           2 | Sut    |    0 |     0\n           3 | Choy   |    0 |     0\n           4 | Tuz    |   50 |  2000\n           5 | Shakar |   80 | 11000\n(5 rows)\n\n mahsulot_id |  nom   | soni | narx  \n-------------+--------+------+-------\n           1 | Non    |   85 |  4000\n           2 | Sut    |    0 |     0\n           3 | Choy   |    0 |     0\n           4 | Tuz    |   47 |  2000\n           5 | Shakar |   60 | 11000\n(5 rows)\n\n id | mahsulot_id | soni \n----+-------------+------\n  1 |           1 |   10\n  2 |           1 |    5\n  3 |           4 |    3\n(3 rows)",
    "values_demo": "column1 | column2 \n---------+---------\n       2 | ikki\n       1 | bir\n(2 rows)\n\n raqam | soz  \n-------+------\n     1 | bir\n     2 | ikki\n(2 rows)"
  },
  "mysql": {
    "insert_err": "ERROR 1136 (21S01) at line 12: Column count doesn't match value count at row 1",
    "update_join": "mahsulot_id\tnom\tsoni\tnarx\n1\tNon\t85\t4000.00\n4\tTuz\t47\t2000.00\n5\tShakar\t60\t11000.00",
    "order_limit": "mahsulot_id\tnarx\n5\t11001.00"
  },
  "sqlite": {
    "sqlite_demo": "1|Non|85\n4|Tuz|47\n5|Shakar|60\n7|\nParse error near line 10: near \"USING\": syntax error\n  DELETE FROM sotuvlar USING ombor WHERE sotuvlar.mahsulot_id = ombor.mahsulot_i\n                       ^--- error here"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
