// O'quv ma'lumotlar bazasi: kichik do'kon. SQL ikkala dvigatelda (PostgreSQL va SQLite) bir xil ishlaydi.
// Ataylab: bitta mijozning shahri NULL (Jasur), ikki mijoz buyurtma bermagan (Nilufar, Kamola),
// bitta mahsulot hech sotilmagan (Ruchka), bitta buyurtma bekor qilingan.

export const DOKON = `CREATE TABLE mijozlar (
  id integer PRIMARY KEY,
  ism text NOT NULL,
  shahar text,
  royxatdan_otgan date NOT NULL
);

CREATE TABLE mahsulotlar (
  id integer PRIMARY KEY,
  nomi text NOT NULL,
  kategoriya text NOT NULL,
  narx numeric(12, 2) NOT NULL CHECK (narx > 0)
);

CREATE TABLE buyurtmalar (
  id integer PRIMARY KEY,
  mijoz_id integer NOT NULL REFERENCES mijozlar (id),
  sana date NOT NULL,
  holat text NOT NULL DEFAULT 'yangi'
);

CREATE TABLE buyurtma_qatorlari (
  buyurtma_id integer NOT NULL REFERENCES buyurtmalar (id),
  mahsulot_id integer NOT NULL REFERENCES mahsulotlar (id),
  soni integer NOT NULL CHECK (soni > 0),
  PRIMARY KEY (buyurtma_id, mahsulot_id)
);

INSERT INTO mijozlar (id, ism, shahar, royxatdan_otgan) VALUES
  (1, 'Aziz', 'Toshkent', '2025-01-10'),
  (2, 'Dilnoza', 'Samarqand', '2025-02-03'),
  (3, 'Bekzod', 'Toshkent', '2025-02-20'),
  (4, 'Malika', 'Buxoro', '2025-03-15'),
  (5, 'Jasur', NULL, '2025-04-01'),
  (6, 'Nilufar', 'Andijon', '2025-05-12'),
  (7, 'Sardor', 'Toshkent', '2025-06-30'),
  (8, 'Kamola', 'Namangan', '2025-07-07');

INSERT INTO mahsulotlar (id, nomi, kategoriya, narx) VALUES
  (1, 'Choynak', 'Oshxona', 85000),
  (2, 'Piyola', 'Oshxona', 120000),
  (3, 'Qozon', 'Oshxona', 350000),
  (4, 'Gilam', 'Uy', 1200000),
  (5, 'Yostiq', 'Uy', 450000),
  (6, 'Atlas', 'Kiyim', 180000),
  (7, 'Belbog', 'Kiyim', 95000),
  (8, 'Chopon', 'Kiyim', 650000),
  (9, 'Daftar', 'Kanselyariya', 12000),
  (10, 'Ruchka', 'Kanselyariya', 5000);

INSERT INTO buyurtmalar (id, mijoz_id, sana, holat) VALUES
  (1, 1, '2025-03-01', 'yetkazildi'),
  (2, 2, '2025-03-05', 'yetkazildi'),
  (3, 1, '2025-04-10', 'yetkazildi'),
  (4, 3, '2025-04-12', 'bekor'),
  (5, 4, '2025-05-02', 'yetkazildi'),
  (6, 5, '2025-05-20', 'yetkazildi'),
  (7, 2, '2025-06-11', 'yolda'),
  (8, 7, '2025-07-01', 'yetkazildi'),
  (9, 1, '2025-08-15', 'yangi'),
  (10, 3, '2025-08-20', 'yangi'),
  (11, 7, '2025-09-03', 'yolda'),
  (12, 4, '2025-09-28', 'yangi');

INSERT INTO buyurtma_qatorlari (buyurtma_id, mahsulot_id, soni) VALUES
  (1, 1, 2), (1, 2, 1), (2, 4, 1), (3, 3, 1), (3, 9, 10), (4, 6, 2), (5, 5, 2), (5, 1, 1),
  (6, 8, 1), (7, 7, 3), (7, 2, 2), (8, 4, 1), (8, 6, 1), (9, 9, 5), (10, 3, 1), (11, 5, 1),
  (11, 7, 1), (12, 8, 2), (12, 1, 1);
`

// SQLite'da tashqi kalit tekshiruvi standart bo'yicha o'chiq (https://www.sqlite.org/foreignkeys.html) — yoqamiz
export const boshlash = (dvigatel, bosh = false) => (dvigatel === 'sqlite' ? 'PRAGMA foreign_keys = ON;\n' : '') + (bosh ? '' : DOKON)
