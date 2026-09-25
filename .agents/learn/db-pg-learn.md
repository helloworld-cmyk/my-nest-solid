Nếu mục tiêu của bạn là học **PostgreSQL từ số 0 → đủ sâu để làm Backend production**, mình khuyên học theo thứ tự dưới đây. Đừng học lan man; PostgreSQL rất rộng, nhưng có một số phần **cực kỳ quan trọng đối với Backend Engineer**.

# PostgreSQL Roadmap: Cơ bản → Nâng cao

## 🟢 LEVEL 1 — Nền tảng Database

1. **Database là gì?**

   * Database giải quyết vấn đề gì?
   * DBMS là gì?
   * PostgreSQL là gì?
   * PostgreSQL khác MySQL/MongoDB thế nào?
   * Relational Database là gì?

2. **Database / Schema / Table**

   * Database
   * Schema
   * Table
   * Row
   * Column
   * Primary Key
   * Foreign Key

3. **Data Type**

   * `integer`
   * `bigint`
   * `numeric`
   * `decimal`
   * `real`
   * `double precision`
   * `boolean`
   * `varchar`
   * `text`
   * `date`
   * `timestamp`
   * `timestamptz`
   * `uuid`
   * `json`
   * `jsonb`
   * `array`
   * `enum`

4. **NULL**

   * `NULL` là gì?
   * `NULL` khác `0`
   * `NULL` khác `''`
   * `IS NULL`
   * `IS NOT NULL`
   * 3-valued logic

---

# 🟢 LEVEL 2 — SQL

5. **SELECT**

   * `SELECT`
   * `FROM`
   * `WHERE`
   * `ORDER BY`
   * `LIMIT`
   * `OFFSET`
   * `DISTINCT`

6. **INSERT**

   * Insert một record
   * Insert nhiều record
   * `RETURNING`

7. **UPDATE**

   * Update một record
   * Update nhiều record
   * Update có điều kiện
   * `RETURNING`

8. **DELETE**

   * Delete
   * Delete nhiều record
   * Delete có điều kiện
   * `RETURNING`

9. **Operators**

   * `=`
   * `!=`
   * `>`
   * `<`
   * `>=`
   * `<=`
   * `IN`
   * `BETWEEN`
   * `LIKE`
   * `ILIKE`
   * `IS NULL`

10. **Logical operators**

* `AND`
* `OR`
* `NOT`

---

# 🟢 LEVEL 3 — Quan hệ giữa bảng

11. **Primary Key**

* Tại sao cần PK?
* `SERIAL`
* `IDENTITY`
* UUID
* Composite Primary Key

12. **Foreign Key**

* FK là gì?
* Referential Integrity
* `ON DELETE`
* `CASCADE`
* `RESTRICT`
* `SET NULL`

13. **Relationship**

* One-to-One
* One-to-Many
* Many-to-Many

14. **JOIN**

* `INNER JOIN`
* `LEFT JOIN`
* `RIGHT JOIN`
* `FULL JOIN`
* `CROSS JOIN`
* Self Join

15. **Normalization**

* 1NF
* 2NF
* 3NF
* Denormalization
* Khi nào nên normalize?
* Khi nào nên denormalize?

---

# 🟢 LEVEL 4 — SQL nâng cao

16. **Aggregate**

* `COUNT`
* `SUM`
* `AVG`
* `MIN`
* `MAX`

17. **GROUP BY**

* `GROUP BY`
* `HAVING`

18. **Subquery**

* Scalar subquery
* Correlated subquery
* `EXISTS`
* `NOT EXISTS`

19. **CTE**

* `WITH`
* Recursive CTE

20. **CASE**

* `CASE WHEN`

21. **Set operations**

* `UNION`
* `UNION ALL`
* `INTERSECT`
* `EXCEPT`

22. **Window Functions**

* `OVER`
* `PARTITION BY`
* `ROW_NUMBER`
* `RANK`
* `DENSE_RANK`
* `LAG`
* `LEAD`

---

# 🟡 LEVEL 5 — Constraint & Data Integrity

23. **Constraints**

* `PRIMARY KEY`
* `FOREIGN KEY`
* `UNIQUE`
* `NOT NULL`
* `CHECK`
* `EXCLUDE`

24. **UNIQUE constraint**

* Unique một column
* Composite unique

25. **CHECK constraint**

* Validate dữ liệu ngay tại DB

26. **DEFAULT**

* Default value
* `CURRENT_TIMESTAMP`
* `gen_random_uuid()`

27. **Generated Columns**

* Generated column
* Stored generated column

---

# 🟡 LEVEL 6 — Index ⭐⭐⭐

Đây là một phần **rất quan trọng đối với Backend senior**.

28. **Index là gì?**

* Tại sao index giúp query nhanh?
* Index thực sự lưu cái gì?
* Trade-off của index

29. **B-Tree**

* Default index
* Equality query
* Range query

30. **Composite Index**

* `(user_id, created_at)`
* Thứ tự column trong index
* Leftmost prefix

31. **Unique Index**

32. **Partial Index**

* `WHERE`

33. **Expression Index**

* `LOWER(email)`

34. **GIN**

* `jsonb`
* Array
* Full-text search

35. **GiST**

36. **BRIN**

* Dataset rất lớn
* Time-series data

37. **Index Scan**

* Sequential Scan
* Index Scan
* Bitmap Index Scan

38. **Index Maintenance**

* Index bloat
* Duplicate indexes
* Unused indexes

---

# 🟡 LEVEL 7 — Transaction ⭐⭐⭐

39. **Transaction**

* Transaction là gì?
* `BEGIN`
* `COMMIT`
* `ROLLBACK`

40. **ACID**

* Atomicity
* Consistency
* Isolation
* Durability

41. **Isolation Level**

* Read Uncommitted
* Read Committed
* Repeatable Read
* Serializable

42. **Concurrency**

* Hai request cùng update một row thì sao?
* Lost Update
* Dirty Read
* Non-repeatable Read
* Phantom Read

---

# 🟡 LEVEL 8 — Locking ⭐⭐⭐

43. **Row Lock**

* `SELECT ... FOR UPDATE`
* `FOR SHARE`

44. **Table Lock**

45. **Lock Conflict**

46. **Deadlock**

* Deadlock xảy ra thế nào?
* PostgreSQL phát hiện deadlock thế nào?
* Cách tránh deadlock

47. **MVCC ⭐⭐⭐**

* Multi-Version Concurrency Control
* PostgreSQL không đơn giản là "lock tất cả"
* Row version
* Snapshot

Đây là phần bạn nên học rất kỹ nếu muốn hiểu PostgreSQL **thực sự hoạt động bên trong**.

---

# 🟡 LEVEL 9 — Query Optimization ⭐⭐⭐

48. **EXPLAIN**

* `EXPLAIN`

49. **EXPLAIN ANALYZE**

* `EXPLAIN ANALYZE`

50. **Query Plan**

* Sequential Scan
* Index Scan
* Bitmap Heap Scan
* Nested Loop
* Hash Join
* Merge Join

51. **Cost**

* Startup Cost
* Total Cost
* Rows
* Width

52. **Query Optimization**

* Vì sao query chậm?
* Vì sao PostgreSQL không dùng index?
* Query nào thực sự tốn CPU?
* Query nào tốn I/O?

53. **Statistics**

* PostgreSQL statistics
* `ANALYZE`
* Query Planner

---

# 🟠 LEVEL 10 — PostgreSQL Internals ⭐⭐⭐⭐

Đây là chỗ bắt đầu đi từ **"biết dùng PostgreSQL" → "hiểu PostgreSQL"**.

54. **PostgreSQL Architecture**

* Client
* Server
* Backend process
* Shared buffers
* WAL

55. **Process Architecture**

* Postmaster / server process
* Backend process
* Background workers

56. **Memory**

* `shared_buffers`
* `work_mem`
* `maintenance_work_mem`
* `effective_cache_size`

57. **Storage**

* Data directory
* Heap
* Page
* Tuple

58. **MVCC Internals**

* Tuple version
* `xmin`
* `xmax`
* Visibility

59. **VACUUM**

* Tại sao cần VACUUM?
* Dead tuples
* Autovacuum
* VACUUM FULL

60. **Table Bloat**

* Table bloat
* Index bloat

61. **WAL ⭐⭐⭐**

* Write Ahead Log
* WAL segment
* Durability
* Crash recovery

---

# 🟠 LEVEL 11 — PostgreSQL Performance ⭐⭐⭐⭐

62. **Connection Management**

* PostgreSQL connection
* Connection pooling
* `pgBouncer`

63. **Connection Pool**

* Vì sao không nên mở connection vô hạn?
* Pool size
* Connection exhaustion

64. **Query Performance**

* Slow query
* N+1 query
* Pagination
* Keyset pagination

65. **Pagination**

* `OFFSET/LIMIT`
* Cursor pagination
* Keyset pagination

66. **Bulk Operations**

* Bulk INSERT
* COPY
* Batch update
* Batch delete

67. **Performance Monitoring**

* `pg_stat_activity`
* `pg_stat_database`
* `pg_stat_user_tables`
* `pg_stat_user_indexes`

68. **Slow Query Detection**

* `pg_stat_statements`

---

# 🟠 LEVEL 12 — JSONB ⭐⭐⭐

69. **JSON vs JSONB**

70. **JSONB Operators**

* `->`
* `->>`
* `#>`
* `#>>`
* `@>`
* `?`

71. **JSONB Index**

* GIN index

72. **Khi nào dùng JSONB?**

* Flexible metadata
* Config
* Dynamic attributes

73. **Khi nào không nên dùng JSONB?**

* Quan hệ quan trọng
* Field cần query thường xuyên
* Constraint phức tạp

---

# 🟠 LEVEL 13 — PostgreSQL Advanced Features

74. **View**

* View
* Materialized View

75. **Stored Procedure / Function**

* PostgreSQL Function
* PL/pgSQL

76. **Trigger**

* BEFORE
* AFTER
* Row trigger
* Statement trigger

77. **Sequence**

* Sequence hoạt động thế nào?

78. **Schema**

* Multiple schemas
* Search path

79. **Extension**

* PostgreSQL extension
* `CREATE EXTENSION`

---

# 🔴 LEVEL 14 — Partitioning ⭐⭐⭐⭐

80. **Partitioning là gì?**

81. **Range Partitioning**

* Theo thời gian
* Ví dụ theo tháng

82. **List Partitioning**

83. **Hash Partitioning**

84. **Partition Pruning**

85. **Partition Index**

86. **Khi nào nên Partition?**

* Table rất lớn
* Time-series
* Data lifecycle

---

# 🔴 LEVEL 15 — Backup & Recovery ⭐⭐⭐⭐

87. **Backup**

* Logical backup
* Physical backup

88. **pg_dump**

89. **pg_restore**

90. **pg_basebackup**

91. **Point-in-Time Recovery — PITR**

92. **WAL Archive**

93. **Disaster Recovery**

94. **RPO**

* Recovery Point Objective

95. **RTO**

* Recovery Time Objective

---

# 🔴 LEVEL 16 — Replication ⭐⭐⭐⭐

96. **Replication là gì?**

97. **Streaming Replication**

98. **Primary / Standby**

99. **Read Replica**

100. **Synchronous Replication**

101. **Asynchronous Replication**

102. **Replication Slot**

103. **Failover**

104. **High Availability**

---

# 🔴 LEVEL 17 — Security ⭐⭐⭐

105. **PostgreSQL User**

106. **Role**

107. **Privileges**

* `GRANT`
* `REVOKE`

108. **Database Authentication**

* `pg_hba.conf`

109. **SSL/TLS**

110. **Least Privilege**

111. **SQL Injection**

* Parameterized query
* Prepared statement

---

# 🔴 LEVEL 18 — Production PostgreSQL ⭐⭐⭐⭐⭐

112. **Connection Pooling**

* Pool configuration
* DB connection limit

113. **Migration**

* Migration là gì?
* Schema versioning
* TypeORM migration
* Prisma migration

114. **Zero-downtime migration**

* Add column
* Backfill
* Remove column
* Index concurrently

115. **Monitoring**

* CPU
* Memory
* Disk
* IOPS
* Connections
* Locks
* Replication lag

116. **Alerting**

117. **Logging**

* Error log
* Slow query log
* Connection log

118. **Database capacity planning**

* Storage
* Connection
* CPU
* RAM

119. **High Availability**

* Failover
* Replica
* Load balancing

120. **Database disaster recovery**

---

# 🔴 LEVEL 19 — PostgreSQL cho hệ thống lớn

121. **Large Table Design**

122. **High Write Throughput**

123. **High Read Throughput**

124. **Sharding**

* PostgreSQL native capabilities
* Citus

125. **Read/Write Splitting**

126. **Distributed PostgreSQL**

127. **Multi-region Database**

128. **Replication Lag**

129. **Hotspot**

130. **Database bottleneck analysis**

---

# 🔥 LEVEL 20 — Time-series / PostgreSQL nâng cao

Phần này **đặc biệt phù hợp với project backtest của bạn**.

131. **Time-series database**

132. **TimescaleDB**

133. **Hypertable**

134. **Time-based partitioning**

135. **Continuous Aggregate**

136. **Retention Policy**

137. **Compression**

138. **Time-series indexing**

139. **OHLCV data design**

140. **1m → 5m → 1h → 1d aggregation**

141. **Large-scale candle storage**

142. **Backtesting database optimization**

---

# 🎯 Thứ tự mình khuyên bạn học

Không nên học 142 mục trên một lúc. Với Backend NestJS của bạn, hãy đi theo pipeline:

```text
SQL
 ↓
Database Design
 ↓
JOIN
 ↓
Constraint
 ↓
Index
 ↓
Transaction
 ↓
Lock
 ↓
MVCC
 ↓
EXPLAIN ANALYZE
 ↓
Query Optimization
 ↓
Connection Pool
 ↓
VACUUM
 ↓
WAL
 ↓
Backup / Restore
 ↓
Replication
 ↓
Partitioning
 ↓
Monitoring
 ↓
Production Architecture
 ↓
TimescaleDB
```

### 5 phần quan trọng nhất cần thật sự hiểu

```text
1. Index
2. Transaction + Isolation
3. Lock + MVCC
4. EXPLAIN ANALYZE + Query Planner
5. PostgreSQL Internals + WAL
```

Khi bạn hiểu 5 phần này, bạn sẽ không còn chỉ ở mức **"biết dùng TypeORM để CRUD PostgreSQL"**, mà bắt đầu hiểu được **tại sao production PostgreSQL chạy nhanh/chậm, tại sao bị lock, tại sao query không dùng index, tại sao dữ liệu lớn cần partition, và tại sao database cần WAL/replication/backup**.
