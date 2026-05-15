(function () {
  const FRUITS = Object.freeze([
    "🍎", "🍌", "🍇", "🍉", "🍓", "🍍", "🍒", "🥝",
    "🥥", "🍋", "🍑", "🍐", "🍊", "🥭", "🍈", "🍏",
    "🫐", "🍅", "🥑", "🌽", "🥕", "🍆", "🥔", "🫛",
    "🥦", "🧄", "🧅", "🌶️", "🍄", "🥜", "🫘", "🥬",
  ]);

  const DIFFICULTIES = Object.freeze({
    easy: Object.freeze({
      key: "easy",
      label: "쉬움",
      boardSize: 4,
      timeLimitSeconds: 240,
      summary: "쉬움 · 4x4 · 04:00",
      boardSubtitle: "쉬움 난이도에서 4x4 보드를 4분 안에 클리어하세요.",
    }),
    medium: Object.freeze({
      key: "medium",
      label: "보통",
      boardSize: 6,
      timeLimitSeconds: 120,
      summary: "보통 · 6x6 · 02:00",
      boardSubtitle: "보통 난이도에서 6x6 보드를 2분 안에 완성해 보세요.",
    }),
    hard: Object.freeze({
      key: "hard",
      label: "어려움",
      boardSize: 8,
      timeLimitSeconds: 120,
      summary: "어려움 · 8x8 · 02:00",
      boardSubtitle: "어려움 난이도에서 8x8 대형 보드를 2분 안에 정복해 보세요.",
    }),
  });

  const GAME_CONFIG = Object.freeze({
    defaultDifficulty: "easy",
    flipBackDelay: 550,
    warningTimeSeconds: 30,
    dangerTimeSeconds: 10,
    fruits: FRUITS,
    difficulties: DIFFICULTIES,
    message: {
      idle: "난이도를 고른 뒤 카드를 눌러 게임을 시작해 보세요.",
      secondPick: "하나를 더 골라 같은 과일 카드 쌍을 찾아보세요.",
      match: "좋아요. 같은 과일 카드 쌍을 찾았어요.",
      mismatch: "다른 카드예요. 위치를 기억하고 다시 도전해 보세요.",
      timeout: "시간 종료! 제한시간 안에 모든 카드를 맞추지 못했어요.",
    },
  });

  function shuffle(array) {
    const result = [...array];

    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }

    return result;
  }

  function formatElapsedTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function formatAccuracy(accuracy) {
    return `${Math.round(accuracy)}%`;
  }

  window.MemoryPuzzleUtils = {
    GAME_CONFIG,
    shuffle,
    formatElapsedTime,
    formatAccuracy,
  };
}());
