# DB - 실습

## DDL 실습

### 문제 1. 테이블 생성하기

1. `attendance` 테이블에서 중복되는 데이터는 `crew_id`, `nickname`이라고 보았습니다.  
   출석 기록은 날짜별로 여러 번 생기는데, 크루 정보까지 계속 같이 저장되고 있어서 중복이 생긴다고 생각했습니다.

2. 그래서 크루 정보만 따로 가지는 `crew` 테이블을 만들면 중복을 줄일 수 있다고 보았습니다.  
   일단 `crew_id`, `nickname` 정도로 구성하면 된다고 생각했습니다.

3. `crew` 테이블에 넣을 데이터는 `attendance`에서 중복 없이 뽑아오면 된다고 보았습니다.

```sql
SELECT DISTINCT crew_id, nickname
FROM attendance;
```

4. `crew` 테이블 생성

```sql
CREATE TABLE crew (
  crew_id INT NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  PRIMARY KEY (crew_id)
);
```

5. `attendance`에서 크루 정보를 추출해서 `crew`에 삽입

```sql
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT crew_id, nickname
FROM attendance;
```

### 문제 2. 테이블 컬럼 삭제하기

`crew` 테이블로 크루 정보를 따로 분리했기 때문에 `attendance`에서는 `nickname` 컬럼이 불필요해졌습니다.

```sql
ALTER TABLE attendance
DROP COLUMN nickname;
```

### 문제 3. 외래키 설정하기

`attendance.crew_id`가 `crew.crew_id`를 참조하도록 외래키를 설정했습니다.

```sql
ALTER TABLE attendance
ADD CONSTRAINT fk_attendance_crew
FOREIGN KEY (crew_id)
REFERENCES crew(crew_id);
```

### 문제 4. 유니크 키 설정

우테코에서는 닉네임 중복이 허용되지 않기 때문에 `nickname`에도 유니크 제약을 추가했습니다.

```sql
ALTER TABLE crew
ADD CONSTRAINT uq_crew_nickname UNIQUE (nickname);
```

## DML (CRUD) 실습

### 문제 5. 크루 닉네임 검색하기

닉네임 첫 글자가 `디`인 크루를 찾았습니다.

```sql
SELECT nickname
FROM crew
WHERE nickname LIKE '디%';
```

### 문제 6. 출석 기록 확인하기

일단 `어셔`가 현재 데이터에 있는지, 그리고 3월 6일 기록이 있는지 같이 확인해보았습니다.

```sql
SELECT a.*
FROM attendance AS a
JOIN crew AS c
  ON a.crew_id = c.crew_id
WHERE c.nickname = '어셔'
  AND a.attendance_date = '2025-03-06';
```

현재 초기 데이터 기준으로는 결과가 없어서, 기록이 없다고 볼 수 있었습니다.

### 문제 7. 누락된 출석 기록 추가

초기 데이터에 `어셔`가 없어서 실습용으로 먼저 크루를 추가하고, 출석 기록도 넣었습니다.

```sql
INSERT INTO crew (crew_id, nickname)
VALUES (13, '어셔');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (13, '2025-03-06', '09:31', '18:01');
```

### 문제 8. 잘못된 출석 기록 수정

이것도 실습용으로 `주니` 데이터를 만든 다음, 잘못 들어간 등교 시간을 수정했습니다.

```sql
INSERT INTO crew (crew_id, nickname)
VALUES (14, '주니');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (14, '2025-03-12', '10:05', '18:00');

UPDATE attendance
SET start_time = '10:00'
WHERE crew_id = 14
  AND attendance_date = '2025-03-12';
```

### 문제 9. 허위 출석 기록 삭제

이 문제도 실습용으로 `아론` 데이터를 넣고, 해당 출석 기록을 삭제하는 방식으로 진행했습니다.

```sql
INSERT INTO crew (crew_id, nickname)
VALUES (15, '아론');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (15, '2025-03-12', '10:00', '18:00');

DELETE FROM attendance
WHERE crew_id = 15
  AND attendance_date = '2025-03-12';
```

### 문제 10. 출석 정보 조회하기

`crew`와 `attendance`를 JOIN해서 닉네임까지 같이 조회했습니다.

```sql
SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM crew AS c
INNER JOIN attendance AS a
  ON c.crew_id = a.crew_id;
```

### 문제 11. nickname으로 쿼리 처리하기

닉네임으로 `crew_id`를 찾고, 그 값을 기준으로 출석 정보를 조회했습니다.

```sql
SELECT *
FROM attendance
WHERE crew_id = (
  SELECT crew_id
  FROM crew
  WHERE nickname = '검프'
);
```

### 문제 12. 가장 늦게 하교한 크루 찾기

3월 5일 기준으로 가장 늦게 하교한 크루를 찾았습니다.

```sql
SELECT c.nickname, a.end_time
FROM crew AS c
INNER JOIN attendance AS a
  ON c.crew_id = a.crew_id
WHERE a.attendance_date = '2025-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

## 집계 함수 실습

### 문제 13. 크루별로 기록된 날짜 수 조회

```sql
SELECT crew_id, COUNT(attendance_date) AS attendance_count
FROM attendance
GROUP BY crew_id;
```

### 문제 14. 크루별로 등교 기록이 있는 날짜 수 조회

```sql
SELECT crew_id, COUNT(attendance_date) AS start_count
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY crew_id;
```

### 문제 15. 날짜별로 등교한 크루 수 조회

```sql
SELECT attendance_date, COUNT(crew_id) AS crew_count
FROM attendance
WHERE start_time IS NOT NULL
GROUP BY attendance_date;
```

### 문제 16. 크루별 가장 빠른 등교 시각과 가장 늦은 등교 시각 조회

문제에서 등교 시각 기준이라고 보아서 `start_time`으로 최소/최대를 구했습니다.

```sql
SELECT crew_id,
       MIN(start_time) AS earliest_start_time,
       MAX(start_time) AS latest_start_time
FROM attendance
GROUP BY crew_id;
```

## 생각해 보기

### 기본키란 무엇이고 왜 필요한가?

기본키는 각 행을 유일하게 구분하기 위한 값입니다.  
이 값이 있어야 수정이나 삭제를 할 때 어떤 데이터를 대상으로 하는지 헷갈리지 않습니다.  
만약 기본키가 없으면 중복된 데이터가 있을 때 정확히 어떤 행을 건드려야 하는지 애매해질 수 있다고 생각했습니다.

### MySQL에서 `AUTO_INCREMENT`는 왜 필요한가?

id 값을 매번 직접 넣는 건 번거롭고 실수도 날 수 있습니다.  
`AUTO_INCREMENT`를 쓰면 DB가 자동으로 증가하는 값을 넣어주기 때문에 중복 걱정을 줄일 수 있습니다.

### `end_time`이 `NULL`일 때 주의할 점은?

`NULL`은 0이 아니라 값이 없다는 뜻입니다.  
그래서 비교할 때 `= NULL`이 아니라 `IS NULL`을 써야 합니다.  
또 서비스에서는 이 값을 그냥 비어 있다고 볼지, 하교 안 함인지, 기록 누락인지 해석도 따로 정해야 한다고 생각했습니다.

### `crew`와 `attendance` 테이블 관계를 비유하면?

`crew` 1명에 대해 `attendance` 기록이 여러 개 생기니까 1:N 관계라고 볼 수 있습니다.  
학생 1명과 여러 개의 출석 기록 같은 느낌으로 이해했습니다.

### 동시에 100명이 등교 버튼을 누르면 어떤 일이 일어날까? (트랜잭션과 ACID)

동시에 요청이 많이 들어오면 데이터가 꼬이지 않게 처리해야 합니다.  
이때 트랜잭션이 중요하고, ACID로 설명하면 다음과 같이 정리할 수 있습니다.

- 원자성: 하나의 출석 처리는 전부 성공하거나 전부 실패해야 합니다.
- 일관성: 출석 데이터는 제약 조건을 계속 만족해야 합니다.
- 격리성: 여러 요청이 동시에 와도 서로 섞이면 안 됩니다.
- 지속성: 한번 저장된 기록은 장애가 나도 유지되어야 합니다.

### 왜 CSV가 아니라 데이터베이스를 써야 할까?

파일로 관리하면 동시에 수정할 때 충돌 나기 쉽고, 조회도 불편합니다.  
반면 DB는 동시성 제어, 무결성, 검색, 보안 면에서 훨씬 낫습니다.  
출석처럼 계속 쌓이고 수정도 생길 수 있는 데이터는 DB가 더 맞다고 생각했습니다.

### NoSQL로 저장하면 어떤 차이가 있을까?

NoSQL에서는 크루 정보와 출석 기록을 문서 하나에 같이 넣는 식으로도 저장할 수 있습니다.  
JOIN 없이 읽기 편한 건 장점인데, 지금처럼 출석 집계나 관계가 중요한 데이터는 관계형 DB가 더 자연스럽다고 느꼈습니다.

### 왜 `nickname`을 기본키로 하지 않았을까?

닉네임은 바뀔 수도 있어서 기본키로 쓰기엔 불안합니다.  
기본키는 가능하면 안 바뀌는 값이어야 하니까 `crew_id` 같은 대리키를 두는 게 더 안정적이라고 생각했습니다.

### `RESTRICT`와 `CASCADE`는 무엇인가?

- `RESTRICT`: 참조 중인 데이터가 있으면 삭제를 막습니다.
- `CASCADE`: 부모 데이터가 삭제되면 연결된 자식 데이터도 같이 삭제합니다.

어떤 걸 쓸지는 데이터 성격에 따라 달라질 것 같습니다.  
출석 기록은 이력 성격이 있어서 무조건 같이 삭제하는 게 맞는지는 더 고민이 필요하다고 생각했습니다.

### 서브쿼리와 JOIN의 차이는?

둘 다 원하는 결과를 만들 수 있지만, 보통은 JOIN이 더 많이 쓰이고 성능도 유리한 경우가 많습니다.  
특히 테이블 관계가 명확할 때는 JOIN이 더 읽기 쉽다고 느꼈습니다.

### 정규화의 장점과 비정규화의 장점은?

정규화는 중복을 줄이고 이상 현상을 막는 장점이 있습니다.  
대신 조회할 때 JOIN이 늘어날 수 있습니다.  
비정규화는 조회 성능에는 유리할 수 있지만 중복 관리가 어려워질 수 있어서, 결국 상황에 맞게 균형을 잡아야 한다고 생각했습니다.

### 연결 풀링(Connection Pooling)은 무엇이고 왜 필요한가?

DB 연결은 비용이 큰 작업이라 요청마다 새로 연결하면 비효율적입니다.  
연결 풀링은 미리 여러 연결을 만들어 두고 재사용하는 방식입니다.  
사용자가 많아질수록 성능과 안정성 면에서 필요하다고 생각했습니다.

### INSERT, UPDATE, DELETE를 하나의 트랜잭션으로 묶는다면?

트랜잭션으로 묶으면 작업 중간에 하나라도 실패했을 때 전체를 되돌릴 수 있습니다.

```sql
START TRANSACTION;

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (13, '2025-03-06', '09:31', '18:01');

UPDATE attendance
SET start_time = '10:00'
WHERE crew_id = 14
  AND attendance_date = '2025-03-12';

DELETE FROM attendance
WHERE crew_id = 15
  AND attendance_date = '2025-03-12';

COMMIT;
```

중간에 오류가 나면 `ROLLBACK`을 해서 앞에서 한 작업까지 전부 취소해야 합니다.  
그래야 데이터가 반쯤만 반영된 이상한 상태를 막을 수 있습니다.
