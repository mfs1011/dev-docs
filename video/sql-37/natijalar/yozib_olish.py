#!/usr/bin/env python3
import subprocess, json, os

PG_ENV = dict(os.environ, PGPASSFILE="/Users/mfsv/Projects/experiment/sql-sinov/pgpass")
PG_CMD = ["psql", "-h", "localhost", "-p", "5432", "-U", "postgres", "-d", "postgres", "-X"]
MY_CMD = ["mysql", "--defaults-extra-file=/Users/mfsv/Projects/experiment/sql-sinov/talaba.cnf", "qollanma", "-e"]
SQLITE_BIN = "/Users/mfsv/Projects/experiment/sql-sinov/bin/sqlite3"

def run_pg(sql):
    p = subprocess.run(PG_CMD, input=sql, text=True, capture_output=True, env=PG_ENV)
    return (p.stdout + p.stderr).strip()

def run_my(sql):
    p = subprocess.run(MY_CMD + [sql], capture_output=True, text=True)
    return (p.stdout + p.stderr).strip()

def run_sqlite(sql):
    p = subprocess.run([SQLITE_BIN, "-box", ":memory:"], input=sql, text=True, capture_output=True)
    return (p.stdout + p.stderr).strip()

out = {"pg": {}, "mysql": {}, "sqlite": {}}

print("PostgreSQL 18.6 sinovlari...")
out["pg"]["setup"] = run_pg("""
DROP TABLE IF EXISTS order_items, orders, products, mijoz_profil, mijozlar, posts, users, tenants CASCADE;

CREATE TABLE mijozlar (id int PRIMARY KEY, ism varchar(30) NOT NULL);
CREATE TABLE mijoz_profil (
    mijoz_id int PRIMARY KEY REFERENCES mijozlar (id) ON DELETE CASCADE,
    tug_sana date,
    bio      varchar(200)
);
CREATE TABLE products (product_no int PRIMARY KEY, name varchar(30), price numeric(10,2));
CREATE TABLE orders (
    order_id int PRIMARY KEY,
    mijoz_id int NOT NULL REFERENCES mijozlar (id) ON DELETE RESTRICT,
    shipping_address varchar(100)
);
CREATE TABLE order_items (
    product_no int REFERENCES products (product_no) ON DELETE RESTRICT,
    order_id   int REFERENCES orders (order_id)     ON DELETE CASCADE,
    quantity   int NOT NULL CHECK (quantity > 0),
    price      numeric(10,2) NOT NULL,
    PRIMARY KEY (product_no, order_id)
);

INSERT INTO mijozlar VALUES (1,'Ali'), (2,'Vali'), (3,'Sobir');
INSERT INTO mijoz_profil VALUES (1, '1995-03-10', 'Dasturchi');
INSERT INTO products VALUES (10,'Daftar',12000), (20,'Ruchka',3000), (30,'Kitob',85000);
INSERT INTO orders VALUES (100,1,'Toshkent'), (101,1,'Toshkent'), (102,2,'Samarqand');
INSERT INTO order_items VALUES
    (10,100,2,12000), (20,100,5,3000), (30,101,1,85000), (10,102,1,11500);
""")

out["pg"]["one_to_one"] = run_pg("""
INSERT INTO mijoz_profil VALUES (1, '2000-01-01', 'ikkinchi');
""")

out["pg"]["one_to_many"] = run_pg("""
SELECT m.ism, count(o.order_id) AS buyurtmalar
FROM mijozlar m LEFT JOIN orders o ON o.mijoz_id = m.id
GROUP BY m.id, m.ism ORDER BY m.id;
""")

out["pg"]["many_to_many"] = run_pg("""
SELECT o.order_id, p.name, oi.quantity, oi.price, oi.quantity * oi.price AS jami
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p     ON p.product_no = oi.product_no
ORDER BY o.order_id, p.name;
""")

out["pg"]["deletes"] = run_pg("""
DELETE FROM products WHERE product_no = 10;
DELETE FROM orders WHERE order_id = 100;
SELECT count(*) AS qolgan_qatorlar FROM order_items;
DELETE FROM mijozlar WHERE id = 3;
DELETE FROM mijozlar WHERE id = 2;
""")

out["pg"]["composite_set_null"] = run_pg("""
CREATE TABLE tenants (tenant_id int PRIMARY KEY);
CREATE TABLE users (
    tenant_id int REFERENCES tenants ON DELETE CASCADE,
    user_id   int NOT NULL,
    PRIMARY KEY (tenant_id, user_id)
);
CREATE TABLE posts (
    tenant_id int REFERENCES tenants ON DELETE CASCADE,
    post_id   int NOT NULL,
    author_id int,
    PRIMARY KEY (tenant_id, post_id),
    FOREIGN KEY (tenant_id, author_id) REFERENCES users ON DELETE SET NULL (author_id)
);
INSERT INTO tenants VALUES (1), (2);
INSERT INTO users VALUES (1,10), (2,10);
INSERT INTO posts VALUES (1,500,10), (2,600,10);
DELETE FROM users WHERE tenant_id = 1 AND user_id = 10;
SELECT * FROM posts ORDER BY tenant_id;
""")

print("MySQL sinovlari...")
out["mysql"]["tests"] = run_my("""
DROP TABLE IF EXISTS order_items, orders, products;
CREATE TABLE products (product_no int PRIMARY KEY);
CREATE TABLE orders (order_id int PRIMARY KEY);
CREATE TABLE order_items (
    product_no int REFERENCES products (product_no),
    order_id   int REFERENCES orders (order_id),
    PRIMARY KEY (product_no, order_id)
);
SHOW INDEX FROM order_items;
""")

print("SQLite sinovlari...")
out["sqlite"]["tests"] = run_sqlite("""
PRAGMA foreign_keys = ON;
CREATE TABLE p (a PRIMARY KEY, e);
CREATE INDEX pe ON p(e);
CREATE TABLE c4 (l, m REFERENCES p(e));
INSERT INTO c4 VALUES (1, 1);
""")

out_path = os.path.join(os.path.dirname(__file__), "tty.js")
with open(out_path, "w") as f:
    f.write("// PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.0 real natijalari\n")
    f.write("(function (g) {\n  g.TTY = ")
    f.write(json.dumps(out, indent=2, ensure_ascii=False))
    f.write(";\n})(typeof window !== 'undefined' ? window : globalThis);\n")

print(f"Yozildi: {out_path}")
