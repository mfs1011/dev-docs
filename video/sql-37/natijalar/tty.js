// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari
(function (g) {
  g.TTY = {
  "pg": {
    "setup": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 3\nINSERT 0 1\nINSERT 0 3\nINSERT 0 3\nINSERT 0 4",
    "one_to_one": "ERROR:  duplicate key value violates unique constraint \"mijoz_profil_pkey\"\nDETAIL:  Key (mijoz_id)=(1) already exists.",
    "one_to_many": "ism  | buyurtmalar \n-------+-------------\n Ali   |           2\n Vali  |           1\n Sobir |           0\n(3 rows)",
    "many_to_many": "order_id |  name  | quantity |  price   |   jami   \n----------+--------+----------+----------+----------\n      100 | Daftar |        2 | 12000.00 | 24000.00\n      100 | Ruchka |        5 |  3000.00 | 15000.00\n      101 | Kitob  |        1 | 85000.00 | 85000.00\n      102 | Daftar |        1 | 11500.00 | 11500.00\n(4 rows)",
    "deletes": "DELETE 1\n qolgan_qatorlar \n-----------------\n               2\n(1 row)\n\nDELETE 1\nERROR:  update or delete on table \"products\" violates RESTRICT setting of foreign key constraint \"order_items_product_no_fkey\" on table \"order_items\"\nDETAIL:  Key (product_no)=(10) is referenced from table \"order_items\".\nERROR:  update or delete on table \"mijozlar\" violates RESTRICT setting of foreign key constraint \"orders_mijoz_id_fkey\" on table \"orders\"\nDETAIL:  Key (id)=(2) is referenced from table \"orders\".",
    "composite_set_null": "CREATE TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 2\nINSERT 0 2\nINSERT 0 2\nDELETE 1\n tenant_id | post_id | author_id \n-----------+---------+-----------\n         1 |     500 |          \n         2 |     600 |        10\n(2 rows)"
  },
  "mysql": {
    "tests": "Table\tNon_unique\tKey_name\tSeq_in_index\tColumn_name\tCollation\tCardinality\tSub_part\tPacked\tNull\tIndex_type\tComment\tIndex_comment\tVisible\tExpression\norder_items\t0\tPRIMARY\t1\tproduct_no\tA\t0\tNULL\tNULL\t\tBTREE\t\t\tYES\tNULL\norder_items\t0\tPRIMARY\t2\torder_id\tA\t0\tNULL\tNULL\t\tBTREE\t\t\tYES\tNULL\norder_items\t1\torder_id\t1\torder_id\tA\t0\tNULL\tNULL\t\tBTREE\t\t\tYES\tNULL"
  },
  "sqlite": {
    "tests": "Parse error near line 6: foreign key mismatch - \"c4\" referencing \"p\""
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
