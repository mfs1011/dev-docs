// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "tekis_jadval": "DROP TABLE\nCREATE TABLE\nINSERT 0 3\nUPDATE 1\n mijoz_ism |      mijoz_manzil      \n-----------+------------------------\n Ali       | Toshkent, Amir Temur 1\n Ali       | Toshkent, Navoiy 12\n(2 rows)\n\nDELETE 1\n vali_haqida \n-------------\n           0\n(1 row)\n\nNOTICE:  table \"buyurtma_tekis\" does not exist, skipping",
    "normallashgan": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 2\nINSERT 0 2\nINSERT 0 3\nINSERT 0 3\nUPDATE 1\n id |    sana    | ism  |         manzil         |  nom   | narx  | soni \n----+------------+------+------------------------+--------+-------+------\n  1 | 2026-02-01 | Ali  | Toshkent, Amir Temur 1 | Daftar | 12000 |    2\n  2 | 2026-02-03 | Ali  | Toshkent, Amir Temur 1 | Kitob  | 85000 |    1\n  3 | 2026-02-05 | Vali | Samarqand, Registon 5  | Daftar | 12000 |    3\n(3 rows)\n\nDELETE 1\nDELETE 1\n ism  |      tel      \n------+---------------\n Vali | +998907654321\n(1 row)\n\nNOTICE:  table \"buyurtma_qatorlari\" does not exist, skipping\nNOTICE:  table \"mahsulotlar\" does not exist, skipping\nNOTICE:  drop cascades to 2 other objects\nDETAIL:  drop cascades to constraint mijoz_profil_mijoz_id_fkey on table mijoz_profil\ndrop cascades to constraint orders_mijoz_id_fkey on table orders",
    "denormalizatsiya": "DROP TABLE\nCREATE TABLE\nINSERT 0 2\n    sana    | buyurtmalar | summa \n------------+-------------+-------\n 2026-02-01 |           1 | 24000\n 2026-02-03 |           1 | 85000\n(2 rows)\n\nCREATE TABLE\nINSERT 0 1\nINSERT 0 1\n jadvalda | haqiqiy \n----------+---------\n    24000 |   29000\n(1 row)\n\nNOTICE:  table \"kunlik_savdo\" does not exist, skipping"
  },
  "mysql": {
    "tests": "jami\n2"
  },
  "sqlite": {
    "tests": "╭──────────╮\n│ count(*) │\n╞══════════╡\n│        1 │\n╰──────────╯"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
