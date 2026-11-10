// Auto-generated live database test runs for SQL Chapter 49: To'liq matnli qidiruv
// Databases: PostgreSQL 18.6, MySQL 9.7.2, SQLite 3.54.1

(function (g) {
  g.TTY = {
    "pg": {
      "version": "PostgreSQL 18.6 on aarch64-apple-darwin25.6.0",
      "tsvector_simple": "'bilan':8 'bir':5 'bir-birini':4 'birini':6 'bitta':1 'konteynerlar':3 'nomi':7 'tarmoqdagi':2 'topadi':9",
      "tsvector_english": "'applic':5 'contain':2,6 'isol':8 'run':3",
      "exact_vs_prefix": "Aniq 'konteyner': id 1, 2 ('konteynerda' topilmadi)\nPrefiks 'konteyner:*': id 1, 2, 5 (qo'shimchali barcha so'zlar topildi)",
      "websearch_rank": "websearch('konteyner -docker'): id 2 (xatosiz xavfsiz qidiruv)\nts_rank('konteyner:* & ilova:*'): id 1 (Docker konteynerlari, reyting: 0.1878)",
      "benchmark_like": "Seq Scan on katta (cost=0.00..2975.00 rows=10) (actual rows=20.00 loops=1)\n  Filter: (matn ~~ '%konteyner%'::text)\n  Rows Removed by Filter: 99980\nPlanning Time: 0.588 ms | Execution Time: 4.882 ms",
      "benchmark_gin": "Bitmap Heap Scan on katta (cost=17.25..132.58 rows=32) (actual rows=20.00 loops=1)\n  -> Bitmap Index Scan on katta_hujjat (cost=0.00..17.25 rows=32)\n       Index Cond: (hujjat @@ '''konteyner'''::tsquery)\nPlanning Time: 0.218 ms | Execution Time: 0.030 ms (160x tezroq!)",
      "trgm_similarity": "similarity('konteyner', 'kontener') = 0.5833 (xatoli so'z topildi)\nLIKE '%konteyner%' katta_trgm GIN indeksi bilan: 0.038 ms"
    },
    "mysql": {
      "version": "MySQL 9.7.2",
      "match_boolean": "MATCH AGAINST ('konteyner*' IN BOOLEAN MODE) -> id 5, 1, 2\ntype: fulltext, key: ft, Extra: Using where; Ft_hints: no_ranking",
      "min_token": "innodb_ft_min_token_size = 3 ('va' so'zi 2 harf bo'lgani uchun indekslanmadi)",
      "ngram": "MATCH(sarlavha) AGAINST ('\"teyner\"' IN BOOLEAN MODE) WITH PARSER ngram -> id 1, 2, 5"
    },
    "sqlite": {
      "version": "SQLite 3.54.1",
      "fts5_match": "CREATE VIRTUAL TABLE izlash USING fts5(content='maqolalar')\nizlash MATCH 'konteyner*' -> 1, 2, 5 (bm25 reyting: -0.5965 eng mos)",
      "trigram": "CREATE VIRTUAL TABLE izlash_tri USING fts5(sarlavha, tokenize='trigram')\nsarlavha LIKE '%teyner%' -> SCAN izlash_tri VIRTUAL TABLE INDEX (0.03 ms)"
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
