(function (g) {
  g.TTY = {
  "pg": {
    "view_updatable": "id |    nom    | narx  | faol \n----+-----------+-------+------\n  1 | Non       |  4500 | t\n  2 | Sut       | 12000 | t\n  3 | Eski choy |  9000 | f\n  4 | Tuz       |  2000 | t\n(4 rows)\n\nNOTICE:  materialized view \"narx_hisoboti\" does not exist, skipping\nNOTICE:  view \"statistika\" does not exist, skipping\nNOTICE:  view \"arzonlar\" does not exist, skipping\nNOTICE:  view \"faol_mahsulotlar\" does not exist, skipping\nNOTICE:  table \"mahsulotlar\" does not exist, skipping",
    "check_option_err": "NOTICE:  materialized view \"narx_hisoboti\" does not exist, skipping\nNOTICE:  view \"statistika\" does not exist, skipping\nNOTICE:  view \"arzonlar\" does not exist, skipping\nERROR:  new row violates check option for view \"arzonlar\"\nDETAIL:  Failing row contains (6, Go'sht, 90000, t).",
    "not_updatable_err": "NOTICE:  materialized view \"narx_hisoboti\" does not exist, skipping\nNOTICE:  view \"statistika\" does not exist, skipping\nNOTICE:  view \"faol_mahsulotlar\" does not exist, skipping\nERROR:  cannot update view \"statistika\"\nDETAIL:  Views containing GROUP BY are not automatically updatable.\nHINT:  To enable updating the view, provide an INSTEAD OF UPDATE trigger or an unconditional ON UPDATE DO INSTEAD rule.",
    "matview_refresh": "holat    | faol | soni | jami  \n-------------+------+------+-------\n eski_natija | f    |    1 |  9000\n eski_natija | t    |    2 | 16000\n(2 rows)\n\n    holat     | faol | soni | jami  \n--------------+------+------+-------\n yangi_natija | f    |    1 |  9000\n yangi_natija | t    |    3 | 31000\n(2 rows)\n\nNOTICE:  materialized view \"narx_hisoboti\" does not exist, skipping\nNOTICE:  view \"arzonlar\" does not exist, skipping\nNOTICE:  view \"faol_mahsulotlar\" does not exist, skipping",
    "concurrent_refresh": "NOTICE:  view \"statistika\" does not exist, skipping\nNOTICE:  view \"arzonlar\" does not exist, skipping\nNOTICE:  view \"faol_mahsulotlar\" does not exist, skipping\nERROR:  cannot refresh materialized view \"public.narx_hisoboti\" concurrently\nHINT:  Create a unique index with no WHERE clause on one or more columns of the materialized view.",
    "drop_dep_err": "NOTICE:  view \"statistika\" does not exist, skipping\nNOTICE:  view \"arzonlar\" does not exist, skipping\nNOTICE:  view \"faol_mahsulotlar\" does not exist, skipping\nERROR:  cannot drop column narx of table mahsulotlar because other objects depend on it\nDETAIL:  view faol_mahsulotlar depends on column narx of table mahsulotlar\nmaterialized view narx_hisoboti depends on column narx of table mahsulotlar\nHINT:  Use DROP ... CASCADE to drop the dependent objects too."
  },
  "mysql": {
    "drop_broken_view": "ERROR 1356 (HY000) at line 13: View 'qollanma.faol_mahsulotlar' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them",
    "matview_fake": "faol\tsoni\n1\t2\nERROR 1064 (42000) at line 8: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'REFRESH MATERIALIZED VIEW mv' at line 1"
  },
  "sqlite": {
    "sqlite_demo": "1|Non|4500|1\n2|Eski choy|9000|0\nParse error near line 5: cannot modify faol_mahsulotlar because it is a view\nParse error near line 10: near \"MATERIALIZED\": syntax error\n  CREATE MATERIALIZED VIEW x AS SELECT 1;\n         ^--- error here"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
