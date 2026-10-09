---
title: "18 database optimization techniques every backend developer should know"
description: "A practical tour from indexes and sargable queries to N+1 fixes, connection pooling, caching, replicas, partitioning, sharding and EXPLAIN — with when to use each."
pubDate: 2026-09-26
tags: [databases, sql, performance, backend]
---

Most of the slow endpoints I've debugged weren't slow because of Java. They were slow because of what Java asked the database to do. No amount of tuning application code fixes a query that scans ten million rows.

This is a condensed version of my [Database Optimization guide](https://github.com/Nayeemshaik29/Database-Optimization). The techniques are grouped by the layer where the problem usually lives.

## Part 1 — Indexing fundamentals

**1. Indexing.** An index lets the database jump to matching rows instead of reading the whole table. Index the columns you filter, join and sort on — but every index slows down writes, so don't index everything.

**2. Know how B-tree indexes work.** Most indexes are B-trees: sorted, balanced trees. That's why they're great for `=`, ranges (`BETWEEN`, `>`), prefixes (`LIKE 'abc%'`) and `ORDER BY` — and useless for `LIKE '%abc'`.

**3. Primary key choice.** A compact, ever-increasing key (like a `BIGINT` sequence) keeps inserts appending to the end of the index. Random UUIDs as clustered keys cause page splits and fragmentation; if you need UUIDs, prefer time-ordered ones (UUIDv7).

**4. Composite indexes.** An index on `(user_id, created_at)` serves `WHERE user_id = ? ORDER BY created_at`. Column order matters — the **leftmost prefix** rule means it does *not* help a query filtering only on `created_at`.

**5. Covering indexes.** If the index contains every column a query needs, the database never touches the table. A huge win for hot read paths.

## Part 2 — Query and schema design

**6. Avoid `SELECT *`.** It transfers columns you don't use, defeats covering indexes and breaks silently when the schema changes. In JPA, use projections or DTO queries for read-heavy endpoints.

**7. Write sargable queries.** Wrapping an indexed column in a function hides it from the index:

```sql
-- index on created_at is NOT used
SELECT * FROM orders WHERE YEAR(created_at) = 2026;

-- index IS used
SELECT * FROM orders
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';
```

**8. Paginate with keysets, not big offsets.** `OFFSET 100000` still reads and throws away 100,000 rows. Keyset pagination remembers where you stopped:

```sql
SELECT id, title FROM posts
WHERE id < :lastSeenId
ORDER BY id DESC
LIMIT 20;
```

**9. Normalise to remove duplication.** Normalised schemas keep data consistent and writes cheap.

**10. Denormalise deliberately.** For read-heavy screens, a carefully chosen duplicated column (like a cached `comment_count`) can save an expensive join or aggregate. Do it on purpose, and keep it in sync with events or triggers.

## Part 3 — Application-layer problems

**11. The N+1 query problem.** The classic ORM trap: load 50 orders, then lazily load each order's customer — 51 queries.

```java
// 1 query for orders + N queries for customers
List<Order> orders = orderRepo.findAll();
orders.forEach(o -> o.getCustomer().getName());

// 1 query total
@Query("select o from Order o join fetch o.customer")
List<Order> findAllWithCustomer();
```

`JOIN FETCH`, `@EntityGraph` or batch fetching (`hibernate.default_batch_fetch_size`) all fix it. Turning on SQL logging in development makes N+1 obvious.

**12. JOIN optimisation.** Index the join columns on both sides, join on matching types, and filter as early as possible so the join works on fewer rows.

## Part 4 — Scaling the database

**13. Connection pooling.** Opening a database connection is expensive. Spring Boot's default pool, HikariCP, reuses them. Bigger isn't better: a pool much larger than the database's cores often makes things *slower* due to contention.

**14. Caching.** Put frequently read, rarely changed data in Redis. The hard part isn't caching — it's invalidation. Use TTLs and evict on writes; never cache data that must be strongly consistent (like a balance) without thinking hard.

**15. Read replicas.** Send reads to replicas and writes to the primary. Remember replication lag: a user who just saved something may not see it on a replica immediately, so read-your-own-writes paths should hit the primary.

**16. Partitioning.** Split one huge table into partitions inside the same database — often by date. Queries that filter on the partition key touch only the relevant partitions, and old data can be dropped instantly.

**17. Sharding.** Split data across multiple databases by a shard key (for example `user_id`). It scales writes horizontally but makes cross-shard queries and transactions hard. It's the last resort, not the first.

## Part 5 — Diagnosis

**18. Use `EXPLAIN`.** Don't guess — ask the database for its plan.

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10;
```

Look for sequential scans on large tables, estimated vs actual row counts that differ wildly, and sorts that spill to disk. `EXPLAIN ANALYZE` (PostgreSQL) actually runs the query and reports real timings.

## The workflow I follow

1. **Measure first** — find the slow query from logs or `pg_stat_statements`.
2. **`EXPLAIN` it** to see *why* it's slow.
3. **Fix the query** (sargability, `SELECT *`, N+1) before adding hardware.
4. **Add or adjust an index** and confirm the plan changed.
5. **Cache** only after the query itself is efficient.
6. **Scale out** (replicas, partitions, shards) when a single, well-tuned database genuinely isn't enough.

Each technique has a full write-up with analogies, code and "when not to use it" in the [repository](https://github.com/Nayeemshaik29/Database-Optimization).
