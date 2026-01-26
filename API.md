# API 문서

## 개요

이 문서는 Frontend Developer Blog의 REST API 엔드포인트를 설명합니다.

## 기본 정보

- **Base URL**: `/api/rest`
- **응답 형식**: JSON
- **인증**: 관리자 작업은 세션 기반 인증 필요

## 표준 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "message": "Optional message"
}
```

### 에러 응답

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // 선택적
}
```

## 엔드포인트

### GET /api/rest/posts

모든 포스트 목록을 가져옵니다.

**Query Parameters:**

- `category` (optional): 카테고리 필터

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "slug": "event-loop",
      "title": "이벤트 루프란 무엇인가?",
      "subtitle": "...",
      "date": "JANUARY 23, 2025",
      "category": "JavaScript",
      "readingTime": "10 Min",
      "heroImage": "https://...",
      "content": "..."
    }
  ],
  "count": 10
}
```

### GET /api/rest/posts/[slug]

특정 포스트를 가져옵니다.

**Path Parameters:**

- `slug`: 포스트 슬러그

**Response:**

```json
{
  "success": true,
  "data": {
    "slug": "event-loop",
    "title": "이벤트 루프란 무엇인가?",
    ...
  }
}
```

### POST /api/rest/posts

새 포스트를 생성합니다. (인증 필요)

**Request Body:**

```json
{
  "slug": "event-loop",
  "title": "이벤트 루프란 무엇인가?",
  "subtitle": "부제목",
  "content": "마크다운 콘텐츠",
  "category": "JavaScript",
  "date": "JANUARY 23, 2025",
  "readingTime": "10 Min",
  "heroImage": "https://..."
}
```

**Response:**

```json
{
  "success": true,
  "data": { ... }
}
```

### PUT /api/rest/posts/[slug]

포스트를 업데이트합니다. (인증 필요)

**Path Parameters:**

- `slug`: 기존 포스트 슬러그

**Request Body:** POST와 동일

### DELETE /api/rest/posts/[slug]

포스트를 삭제합니다. (인증 필요)

**Path Parameters:**

- `slug`: 삭제할 포스트 슬러그

**Response:**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

### GET /api/rest/posts/search

포스트를 검색합니다.

**Query Parameters:**

- `q`: 검색어 (필수)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

**Response:**

```json
{
  "success": true,
  "data": [...],
  "count": 5,
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "query": "검색어"
}
```

## 에러 코드

- `400`: 잘못된 요청 (필수 필드 누락, 유효하지 않은 데이터)
- `401`: 인증 필요
- `404`: 리소스를 찾을 수 없음
- `429`: 너무 많은 요청 (Rate limit 초과)
- `500`: 서버 오류

## Rate Limiting

- **제한**: 1분당 10회 요청 (POST, PUT, DELETE)
- **헤더**: Rate limit 정보는 응답 헤더에 포함되지 않습니다.

## 보안

- 모든 관리자 작업(POST, PUT, DELETE)은 인증이 필요합니다.
- 입력값은 자동으로 sanitization됩니다.
- Slug는 소문자, 숫자, 하이픈만 허용됩니다.
