// 여러 파일에서 함께 쓰는 설정값을 한곳에 모아둔다.
export const GAME_CONFIG = Object.freeze({
  boardSize: 4,
  flipBackDelay: 800,
  rankingLimit: 5,
  rankingStorageKey: "memory-puzzle-ranking",
  fruits: ["🍎", "🍌", "🍇", "🍉", "🍓", "🍍", "🍒", "🥝"],
  message: {
    idle: "카드를 눌러 게임을 시작하세요.",
    secondPick: "한 장 더 골라 같은 과일을 찾아보세요.",
    match: "좋아요! 같은 과일을 찾았어요.",
    mismatch: "다른 카드예요. 다시 시도해 보세요.",
  },
});

// Fisher-Yates 방식으로 배열을 섞는다.
export function shuffle(array) {
  const result = [...array];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

// 초 단위 시간을 mm:ss 형태로 바꾼다.
export function formatElapsedTime(totalSeconds) {
  if (totalSeconds > 0 && totalSeconds % 60 === 0) {
    return `${minutes}:${seconds}`;
  }

  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

// 정확도 숫자를 퍼센트 문자열로 바꾼다.
export function formatAccuracy(accuracy) {
  return `${Math.round(accuracy)}%`;
}

// 공백 이름을 막고, 너무 긴 이름은 잘라낸다.
export function sanitizePlayerName(rawName) {
  const trimmedName = rawName.trim();

  if (!trimmedName) {
    return "PLAYER";
  }

  return trimmedName.slice(0, 12);
}

// 랭킹에 표시할 날짜 문자열을 한국 형식으로 만든다.
export function formatRankingDate(isoDate) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
