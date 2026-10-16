(function (g) {
  g.TTY = {
  "pg": {
    "add_columns": "DROP TABLE\nCREATE TABLE\nCREATE TABLE\nINSERT 0 2\nINSERT 0 1\nALTER TABLE\nALTER TABLE\n id | nom | narx  | tavsif | soni \n----+-----+-------+--------+------\n  1 | Non | 4000  |        |    0\n  2 | Sut | 12000 |        |    0\n(2 rows)\n\nNOTICE:  table \"qatorlar\" does not exist, skipping\nNOTICE:  table \"mahsulotlar\" does not exist, skipping",
    "type_using_err": "ERROR:  column \"narx\" cannot be cast automatically to type numeric\nHINT:  You might need to specify \"USING narx::numeric(12,2)\".",
    "type_using_fix": "ALTER TABLE\nALTER TABLE\nALTER TABLE\nALTER TABLE\nALTER TABLE\n               Table \"public.mahsulotlar\"\n Column |     Type      | Collation | Nullable | Default \n--------+---------------+-----------+----------+---------\n id     | integer       |           | not null | \n nomi   | text          |           | not null | \n narx   | numeric(12,2) |           |          | \n tavsif | text          |           |          | \n soni   | integer       |           | not null | 1\nIndexes:\n    \"mahsulotlar_pkey\" PRIMARY KEY, btree (id)\nCheck constraints:\n    \"mahsulotlar_tavsif_check\" CHECK (tavsif <> ''::text)\n    \"musbat_narx\" CHECK (narx > 0::numeric)\nReferenced by:\n    TABLE \"qatorlar\" CONSTRAINT \"qatorlar_mahsulot_id_fkey\" FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)",
    "drop_cascade_demo": "ERROR:  cannot drop table mahsulotlar because other objects depend on it\nDETAIL:  constraint qatorlar_mahsulot_id_fkey on table qatorlar depends on table mahsulotlar\nHINT:  Use DROP ... CASCADE to drop the dependent objects too.",
    "drop_cascade_rollback": "BEGIN\nDROP TABLE\n                Table \"public.qatorlar\"\n   Column    |  Type   | Collation | Nullable | Default \n-------------+---------+-----------+----------+---------\n id          | integer |           | not null | \n mahsulot_id | integer |           |          | \nIndexes:\n    \"qatorlar_pkey\" PRIMARY KEY, btree (id)\n\nROLLBACK\n mahsulotlar_qaytdi \n--------------------\n                  2\n(1 row)\n\nNOTICE:  drop cascades to constraint qatorlar_mahsulot_id_fkey on table qatorlar",
    "truncate_demo": "ERROR:  cannot truncate a table referenced in a foreign key constraint\nDETAIL:  Table \"qatorlar\" references \"mahsulotlar\".\nHINT:  Truncate table \"qatorlar\" at the same time, or use TRUNCATE ... CASCADE.",
    "truncate_rollback": "BEGIN\nTRUNCATE TABLE\nROLLBACK\n qatorlar_qaytdi \n-----------------\n               1\n(1 row)\n\nDROP TABLE"
  },
  "mysql": {
    "alter_instant": "id\tnomi\tnarx\tsoni\n1\tNon\t4000.00\t0\n2\tSut\t12000.00\t0",
    "implicit_commit": "id\tnomi\n1\tNon\n2\tSut\n3\tChoy"
  },
  "sqlite": {
    "alter_demo": "╭────────────────────────────────────────────────────────────────────────────────────────────╮\n│                                            sql                                             │\n╞════════════════════════════════════════════════════════════════════════════════════════════╡\n│ CREATE TABLE m (id INTEGER PRIMARY KEY, nomi TEXT UNIQUE, soni INTEGER NOT NULL DEFAULT 0) │\n╰────────────────────────────────────────────────────────────────────────────────────────────╯",
    "alter_err": "╭──────────────────────────────────────────────────────────────╮\n│ raise(ABORT,'Cannot add a column with non-constant default') │\n╘══════════════════════════════════════════════════════════════╛\nParse error near line 4: Cannot add a UNIQUE column"
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
