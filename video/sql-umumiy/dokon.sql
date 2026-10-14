-- Video uchun do'kon sxemasi (PostgreSQL 18, sinov bazasi `qollanma`, alohida sxema)
DROP SCHEMA IF EXISTS video_dokon CASCADE;
CREATE SCHEMA video_dokon;
SET search_path = video_dokon;

CREATE TABLE mijozlar (
    id     integer PRIMARY KEY,
    ism    text NOT NULL,
    shahar text NOT NULL
);
CREATE TABLE mahsulotlar (
    id    integer PRIMARY KEY,
    nomi  text NOT NULL,
    narxi integer NOT NULL
);
CREATE TABLE buyurtmalar (
    id          integer PRIMARY KEY,
    mijoz_id    integer NOT NULL REFERENCES mijozlar (id),
    mahsulot_id integer NOT NULL REFERENCES mahsulotlar (id),
    soni        integer NOT NULL
);
CREATE TABLE hisoblar (
    egasi  text PRIMARY KEY,
    balans integer NOT NULL
);

INSERT INTO mijozlar VALUES (1, 'Ali', 'Toshkent'), (2, 'Malika', 'Samarqand'), (3, 'Jasur', 'Buxoro'), (4, 'Nodira', 'Toshkent');
INSERT INTO mahsulotlar VALUES (1, 'Daftar', 8000), (2, 'Qalam', 3000), (3, 'Kitob', 45000), (4, 'Ruchka', 5000), (5, 'Sumka', 120000);
INSERT INTO buyurtmalar VALUES (1, 1, 1, 3), (2, 2, 3, 1), (3, 1, 2, 5), (4, 3, 5, 1), (5, 4, 1, 2), (6, 2, 4, 4);
INSERT INTO hisoblar VALUES ('Ali', 100000), ('Malika', 20000);
