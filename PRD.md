# 프로젝트: 간단한 퍼즐 게임

## 목표
- 브라우저에서 실행되는 퍼즐 게임

## 기능
- 퍼즐 보드 표시
- 클릭 이벤트 처리
- 클리어 조건 관련
- 4*4 퍼즐로 2개의 동일한 과일 이미지를 맞추는 게임

## 기술
- 단순 HTML, CSS, Javascript
- 하나의 index.html 파일, CSS 파일

## 폴더 구조

```text
puzzle-game/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  ├─ app.js    -- 기존 script.js에서 앱 시작점 관련 소스만 위치
│  ├─ board.js  -- 퍼즐보드 그리기 영역
│  ├─ game.js   -- 클릭이벤트, 정답확인, 클리어 조건
│  └─ utils.js  -- 랜덤 섞기, 공통함수
├─ assets/
│  └─ images/
└─ PRD.md

```

## 대상
- 코딩 상급자
