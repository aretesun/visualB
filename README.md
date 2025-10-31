# Visual Board

비전보드 웹 애플리케이션 - 꿈과 목표를 시각화하세요 ✨

## 소개

"The Secret"의 개념을 구현한 비전보드 서비스입니다. 원하는 것을 시각화하고 텍스트로 작성하여 매일 볼 수 있습니다.

## 주요 기능

- 📝 텍스트 카드 추가 (최대 300자)
- 🖼️ 이미지 카드 추가 (드래그 앤 드롭 지원)
- 🎯 자유로운 카드 배치 및 드래그
- 💾 로컬 스토리지 자동 저장
- 📥 백업 및 복원 기능
- 🎨 랜덤 배경 이미지
- 🔗 연관 서비스 링크

## 로컬 실행

**필수 요구사항:** Node.js 20 이상

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## GitHub Pages 배포

1. GitHub에서 새 저장소 생성
2. `vite.config.ts`에서 `base` 경로를 저장소 이름으로 변경
3. Git 커밋 및 푸시:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

4. GitHub 저장소 Settings → Pages → Source를 "GitHub Actions"로 변경
5. 자동으로 배포됩니다!

## 기술 스택

- React 19
- TypeScript
- Vite
- Tailwind CSS (via CDN)

## 라이선스

MIT
