Nếu mục tiêu của bạn là **học Kafka theo hướng Backend production / Senior**, mình khuyên đi theo thứ tự từ **mental model → sử dụng → internals → reliability → performance → production** như này:

# 🚀 Roadmap học Apache Kafka: Cơ bản → Nâng cao

## 🟢 LEVEL 1 — Kafka là gì?

1. **Kafka giải quyết vấn đề gì?** ⭐⭐⭐

   * Message Queue là gì?
   * Event Streaming là gì?
   * Kafka khác REST API như thế nào?
   * Kafka khác RabbitMQ như thế nào?
   * Tại sao hệ thống lớn cần Kafka?

2. **Producer / Consumer / Broker** ⭐⭐⭐

   * Producer là gì?
   * Consumer là gì?
   * Broker là gì?
   * Kafka Cluster là gì?
   * Luồng:

     ```text
     Producer → Kafka Broker → Consumer
     ```

3. **Topic**

   * Topic là gì?
   * Message/Event nằm ở đâu?
   * Một topic có nhiều producer/consumer được không?
   * Topic có phải database table không?

4. **Partition** ⭐⭐⭐

   * Partition là gì?
   * Tại sao topic phải chia partition?
   * Một topic có nhiều partition như thế nào?
   * Partition quyết định scalability ra sao?

5. **Offset** ⭐⭐⭐

   * Offset là gì?
   * Consumer đọc message bằng offset thế nào?
   * Offset có phải ID của message không?
   * Offset có reset được không?

6. **Message / Record**

   * Key
   * Value
   * Headers
   * Timestamp
   * Offset

---

# 🟢 LEVEL 2 — Chạy Kafka thực tế

7. **Kafka local**

   * Kafka bằng Docker
   * Kafka + Docker Compose
   * Kafka UI
   * KRaft
   * ZooKeeper là gì?
   * Kafka hiện đại có còn cần ZooKeeper không?

8. **Kafka CLI**

   * `kafka-topics`
   * `kafka-console-producer`
   * `kafka-console-consumer`
   * `kafka-consumer-groups`

9. **Tạo Topic**

   * `partitions`
   * `replication factor`
   * topic configuration

10. **Produce message**

* gửi message
* gửi key/value
* gửi JSON
* gửi nhiều message

11. **Consume message**

* consumer đọc message
* `--from-beginning`
* offset
* polling

---

# 🟡 LEVEL 3 — Consumer Group ⭐⭐⭐

Đây là phần **cực kỳ quan trọng**.

12. **Consumer Group là gì?**

13. **Một topic + nhiều consumer**

```text
Topic
├── Partition 0
├── Partition 1
└── Partition 2

Consumer Group
├── Consumer A
├── Consumer B
└── Consumer C
```

14. **Partition ↔ Consumer**

* Một partition tại một thời điểm chỉ được xử lý bởi một consumer trong cùng consumer group.
* Một consumer có thể xử lý nhiều partition.

15. **Consumer Group khác nhau**

```text
Order Service
     ↓
Kafka
   ↙   ↘
Group A  Group B
```

* Group A xử lý payment
* Group B xử lý notification

16. **Consumer Group ID**

17. **Consumer rebalance** ⭐⭐⭐

* Khi consumer join
* Khi consumer chết
* Khi partition thay đổi
* Partition được assign lại thế nào?

---

# 🟡 LEVEL 4 — Kafka trong NestJS

Đây là phần bạn nên học sau khi hiểu Kafka core.

18. **Kafka + NestJS**

19. `@nestjs/microservices`

20. Kafka transport

21. **Producer trong NestJS**

22. **Consumer trong NestJS**

23. `ClientKafka`

24. `@MessagePattern()`

25. `emit()` vs `send()`

26. Event-driven architecture

Ví dụ:

```text
Order Service
      │
      │ OrderCreated
      ↓
    Kafka
   ↙    ↓    ↘
Payment Email Inventory
```

27. Kafka module architecture trong NestJS

28. Kafka DTO / Event schema

29. Error handling trong Kafka consumer

---

# 🟡 LEVEL 5 — Message Delivery Semantics ⭐⭐⭐

Đây là phần bắt đầu bước vào production.

30. **At-most-once**

31. **At-least-once** ⭐⭐⭐

32. **Exactly-once**

33. Tại sao Kafka thường dẫn tới duplicate message?

34. Consumer crash trước khi commit offset

35. Consumer crash sau khi xử lý message

Ví dụ:

```text
Kafka
  ↓
Consumer
  ↓
DB UPDATE
  ↓
commit offset
```

Nếu crash giữa:

```text
DB UPDATE ✓
commit offset ✗
```

→ message có thể được xử lý lại.

36. **Idempotency** ⭐⭐⭐

* Idempotent consumer
* Idempotency key
* Deduplication

---

# 🟠 LEVEL 6 — Offset & Commit

37. **Offset commit**

38. Auto commit

39. Manual commit

40. Sync commit

41. Async commit

42. Consumer position

43. Committed offset

44. Log end offset

45. Consumer lag ⭐⭐⭐

46. Reset offset

47. `earliest`

48. `latest`

---

# 🟠 LEVEL 7 — Replication & Fault Tolerance ⭐⭐⭐

49. **Replication**

50. Leader / Follower

```text
Partition 0

Broker 1 → Leader
Broker 2 → Follower
Broker 3 → Follower
```

51. **Replication Factor**

52. **ISR — In-Sync Replicas**

53. Leader election

54. Broker chết thì chuyện gì xảy ra?

55. Partition leader chết

56. Replica recovery

57. `acks`

58. `acks=0`

59. `acks=1`

60. `acks=all`

61. `min.insync.replicas`

---

# 🟠 LEVEL 8 — Producer Internals

62. Producer batching

63. `batch.size`

64. `linger.ms`

65. Compression

66. `compression.type`

67. `snappy`

68. `lz4`

69. `zstd`

70. Producer retries

71. `delivery.timeout.ms`

72. `request.timeout.ms`

73. **Idempotent Producer** ⭐⭐⭐

74. Producer sequence number

75. Duplicate prevention

---

# 🟠 LEVEL 9 — Consumer Internals

76. `poll()`

77. Consumer fetch

78. `fetch.min.bytes`

79. `fetch.max.wait.ms`

80. `max.poll.records`

81. `max.poll.interval.ms`

82. `session.timeout.ms`

83. `heartbeat.interval.ms`

84. Consumer heartbeat

85. Consumer timeout

86. Consumer lag

87. Slow consumer

88. Poison message

---

# 🔴 LEVEL 10 — Kafka Storage Internals ⭐⭐⭐

Đây là phần nên học nếu mục tiêu của bạn là **Senior Backend**.

89. **Kafka Log**

90. Partition thực chất được lưu như thế nào?

91. Segment

```text
partition-0/
├── 00000000000000000000.log
├── 00000000000000000000.index
├── 00000000000000000000.timeindex
├── 00000000000000123456.log
└── ...
```

92. Log segment

93. Log retention

94. Retention theo:

* time
* size

95. Log compaction ⭐⭐⭐

96. Tombstone

97. `.log`

98. `.index`

99. `.timeindex`

100. Sequential I/O

101. Page cache

102. Zero-copy ⭐⭐⭐

---

# 🔴 LEVEL 11 — Ordering ⭐⭐⭐

103. Kafka đảm bảo ordering ở đâu?

104. **Ordering trong một partition**

105. Kafka có đảm bảo ordering toàn topic không?

106. Message key ảnh hưởng ordering thế nào?

Ví dụ:

```text
userId = 100

Event A
Event B
Event C

      ↓
hash(userId)

      ↓

Partition 2
```

→ các event của user 100 có thể được giữ cùng partition.

107. Partition key

108. Custom partitioner

---

# 🔴 LEVEL 12 — Reliability / Production

109. Producer retry

110. Consumer retry

111. Retry topic

112. Dead Letter Topic / DLT ⭐⭐⭐

```text
Main Topic
    ↓
Consumer
    ↓
   ERROR
    ↓
Retry Topic
    ↓
Consumer
    ↓
   ERROR
    ↓
   DLT
```

113. Exponential backoff

114. Poison messages

115. Error classification

116. Transient error

117. Permanent error

118. Graceful shutdown

119. Consumer recovery

120. Broker failure

---

# 🔴 LEVEL 13 — Kafka + Database ⭐⭐⭐

Phần này **rất quan trọng với Backend**.

121. Kafka + PostgreSQL

122. DB transaction + Kafka

```text
DB transaction
      +
Kafka publish
```

→ tại sao dễ xảy ra inconsistency?

123. **Dual write problem** ⭐⭐⭐

```text
DB ✓
Kafka ✗
```

hoặc:

```text
Kafka ✓
DB ✗
```

124. **Transactional Outbox Pattern** ⭐⭐⭐⭐

```text
Application
    ↓
PostgreSQL
 ┌───────────────┐
 │ orders        │
 │ outbox_events │
 └───────────────┘
        ↓
   Outbox Worker
        ↓
      Kafka
```

125. CDC

126. Debezium

127. Kafka Connect

---

# 🔴 LEVEL 14 — Schema & Event Design

128. Event schema

129. JSON event

130. Schema Evolution

131. Backward compatibility

132. Forward compatibility

133. Full compatibility

134. Event versioning

135. Schema Registry ⭐⭐⭐

136. Avro

137. Protobuf

138. JSON Schema

139. Event contract

---

# 🔴 LEVEL 15 — Kafka Connect

140. Kafka Connect là gì?

141. Source Connector

142. Sink Connector

```text
PostgreSQL
    ↓
Source Connector
    ↓
  Kafka
    ↓
Sink Connector
    ↓
Elasticsearch
```

143. Standalone mode

144. Distributed mode

145. Connector configuration

146. Connector offset

147. Connector error handling

---

# 🔴 LEVEL 16 — Kafka Streams

148. Kafka Streams là gì?

149. Stream processing

150. Stateless processing

151. Stateful processing

152. `map`

153. `filter`

154. `groupBy`

155. `reduce`

156. `aggregate`

157. Windowing

158. Tumbling window

159. Sliding window

160. Session window

161. State store

162. Stream-table duality

163. KTable

164. KStream

---

# 🔴 LEVEL 17 — Performance & Scaling ⭐⭐⭐

165. Throughput

166. Latency

167. Partition scaling

168. Producer batching

169. Compression

170. Consumer parallelism

171. Consumer lag

172. Network bandwidth

173. Disk throughput

174. CPU bottleneck

175. Memory

176. Page cache

177. Partition count planning

178. Hot partition ⭐⭐⭐

179. Uneven key distribution

180. Repartitioning

---

# 🔴 LEVEL 18 — Kafka Cluster Architecture

181. Broker

182. Controller

183. KRaft

184. Controller quorum

185. Metadata

186. Cluster ID

187. Broker ID

188. Node roles

189. Leader election

190. Metadata propagation

191. Cluster expansion

192. Broker replacement

193. Partition reassignment

---

# 🔴 LEVEL 19 — Security

194. Authentication

195. Authorization

196. ACL

197. SASL

198. SASL/PLAIN

199. SASL/SCRAM

200. TLS/SSL

201. Encryption in transit

202. Encryption at rest

203. Kafka security architecture

---

# 🔴 LEVEL 20 — Monitoring / Observability ⭐⭐⭐

204. Kafka metrics

205. Consumer lag

206. Broker health

207. Under-replicated partitions

208. ISR shrink

209. Request latency

210. Throughput

211. Disk usage

212. CPU

213. Network

214. JMX

215. Prometheus

216. Grafana

217. Alerting

---

# 🔴 LEVEL 21 — Production Operations ⭐⭐⭐⭐

218. Kafka cluster deployment

219. 1 broker vs 3 brokers

220. Replication strategy

221. Partition planning

222. Capacity planning

223. Retention planning

224. Disk planning

225. Backup / disaster recovery

226. Cluster upgrade

227. Rolling upgrade

228. Broker replacement

229. Partition reassignment

230. Disaster recovery

231. Multi-datacenter Kafka

232. Multi-region Kafka

233. MirrorMaker 2

---

# 🔥 LEVEL 22 — Advanced Architecture

234. **Event-Driven Architecture**

235. Event choreography

236. Event orchestration

237. Saga Pattern ⭐⭐⭐

238. CQRS

239. Event sourcing

240. Transactional Outbox

241. CDC

242. Event replay

243. Event versioning

244. Distributed transactions

245. Exactly-once processing

246. Idempotent architecture

---

# 🧠 LEVEL 23 — Kafka Internals cực sâu

Nếu muốn thực sự hiểu Kafka chứ không chỉ biết dùng:

247. Kafka protocol

248. Produce request

249. Fetch request

250. Metadata request

251. Consumer group protocol

252. Group coordinator

253. Transaction coordinator

254. Producer ID

255. Sequence number

256. Epoch

257. Log append

258. Log recovery

259. Log compaction internals

260. Replica fetcher

261. Leader epoch

262. Controller internals

263. KRaft metadata log

264. Kafka network thread

265. I/O thread

266. Request queue

267. Thread model

---

# 🎯 Nếu mục tiêu của bạn là Senior Backend

**Không cần học 267 mục theo kiểu học thuộc.**

Mình khuyên chia thành 6 chặng:

```text
CHẶNG 1
Kafka fundamentals
        ↓
Topic
Partition
Offset
Producer
Consumer
Broker
        ↓
CHẶNG 2
Consumer Group
        ↓
CHẶNG 3
NestJS + Kafka
        ↓
CHẶNG 4
Reliability
        ↓
Replication
Delivery semantics
Retry
DLT
Idempotency
Outbox
        ↓
CHẶNG 5
Performance + Internals
        ↓
Partition
Consumer lag
Batching
Compression
Storage
Replication
        ↓
CHẶNG 6
Production Architecture
        ↓
KRaft
Security
Monitoring
Scaling
Disaster Recovery
Multi-region
```

**Đặc biệt với background NestJS của bạn**, mình sẽ ưu tiên học thật chắc các phần:

> **Topic → Partition → Offset → Consumer Group → Rebalance → Producer/Consumer → Delivery Semantics → Idempotency → Retry/DLT → Replication → Kafka + PostgreSQL → Outbox → Schema Registry → Kafka Connect → Monitoring → Performance**

Đây mới là chuỗi kiến thức biến Kafka từ “biết dùng thư viện Kafka trong NestJS” thành **hiểu Kafka ở mức Backend production**.
