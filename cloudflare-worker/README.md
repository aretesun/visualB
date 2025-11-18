# Vision Board - Cloudflare Worker 배포 가이드

## 🚀 빠른 시작 (5분)

### 1. Cloudflare 계정 생성
1. https://dash.cloudflare.com/sign-up 접속
2. 이메일로 무료 계정 생성 (신용카드 불필요)

### 2. Wrangler CLI 설치

```bash
npm install -g wrangler
```

### 3. Cloudflare 로그인

```bash
wrangler login
```

브라우저가 열리면 로그인 승인

### 4. KV 네임스페이스 생성

```bash
# Production KV 생성
wrangler kv:namespace create "VISION_BOARD_KV"

# 출력 예시:
# ✨ Success!
# Add the following to your wrangler.toml:
# { binding = "VISION_BOARD_KV", id = "abc123..." }

# Development KV 생성 (선택사항)
wrangler kv:namespace create "VISION_BOARD_KV" --preview
```

### 5. wrangler.toml 수정

위에서 출력된 KV ID를 `wrangler.toml` 파일에 입력:

```toml
[[kv_namespaces]]
binding = "VISION_BOARD_KV"
id = "abc123..."  # 👈 여기에 실제 ID 입력
```

### 6. 배포!

```bash
# 프로젝트 폴더로 이동
cd cloudflare-worker

# 배포
wrangler deploy
```

### 7. 배포 완료 🎉

```
✨ Success! Deployed to:
https://vision-board-api.your-username.workers.dev
```

이 URL을 복사해서 프론트엔드 코드에 입력하세요!

---

## 📝 배포 후 할 일

### 프론트엔드 코드 수정

`visual-board/App.tsx` 파일에서:

```javascript
// Worker URL 설정
const WORKER_URL = 'https://vision-board-api.your-username.workers.dev';
```

---

## 🧪 테스트

### 1. 헬스 체크

```bash
curl https://vision-board-api.your-username.workers.dev
```

응답:
```json
{
  "status": "ok",
  "service": "Vision Board API",
  "endpoints": { ... }
}
```

### 2. 이미지 프록시 테스트

브라우저에서:
```
https://vision-board-api.your-username.workers.dev/proxy?url=https://images.unsplash.com/photo-123.jpg
```

이미지가 표시되면 성공! ✅

### 3. 데이터 저장 테스트

```bash
curl -X POST https://vision-board-api.your-username.workers.dev/save \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":1,"position":{"x":100,"y":200},"text":"테스트"}]}'
```

응답:
```json
{
  "success": true,
  "id": "a3x9k2",
  "expiresIn": "1 year"
}
```

### 4. 데이터 불러오기 테스트

```bash
curl https://vision-board-api.your-username.workers.dev/load?id=a3x9k2
```

응답:
```json
{
  "success": true,
  "items": [...],
  "createdAt": "2025-11-11T..."
}
```

---

## 🔧 개발 환경

로컬에서 테스트하려면:

```bash
# 개발 서버 실행
wrangler dev

# 로컬에서 접속
# http://localhost:8787
```

---

## 📊 모니터링

Cloudflare 대시보드에서 확인:
- https://dash.cloudflare.com
- Workers & Pages > vision-board-api > Metrics

확인 가능한 정보:
- 요청 수
- 에러율
- 응답 시간
- KV 사용량

---

## 💰 비용

**무료 한도:**
- Workers 요청: 100,000/일
- KV 읽기: 100,000/일
- KV 쓰기: 1,000/일
- KV 저장: 1GB

**예상 사용량 (월 1,000명 기준):**
- Workers 요청: ~10,000/일 (여유 90%)
- KV 쓰기: ~100/일 (여유 90%)
- KV 저장: ~10MB (여유 99%)

**결론: 완전 무료! 🎉**

---

## 🛠️ 트러블슈팅

### "KV namespace not found" 에러

```bash
# KV 네임스페이스 다시 생성
wrangler kv:namespace create "VISION_BOARD_KV"

# wrangler.toml 파일의 ID 확인
```

### CORS 에러

Worker 코드의 `corsHeaders`에 프론트엔드 도메인이 포함되어 있는지 확인:

```javascript
'Access-Control-Allow-Origin': '*'  // 모든 도메인 허용
```

### 배포 실패

```bash
# Wrangler 업데이트
npm update -g wrangler

# 로그아웃 후 다시 로그인
wrangler logout
wrangler login
```

---

## 📚 추가 자료

- Cloudflare Workers 문서: https://developers.cloudflare.com/workers/
- Wrangler CLI 문서: https://developers.cloudflare.com/workers/wrangler/
- KV 문서: https://developers.cloudflare.com/workers/runtime-apis/kv/

---

## 🔄 업데이트

코드 수정 후:

```bash
wrangler deploy
```

즉시 전 세계에 배포됨! (CDN 캐시 업데이트는 최대 1분 소요)
