import { GAME_CONFIG } from "./utils.js";
import { MemoryPuzzleGame } from "./game.js";

// 앱 시작점: 화면 요소와 게임 클래스를 연결한다.
const game = new MemoryPuzzleGame({
  boardElement: document.getElementById("gameBoard"),
  attemptsElement: document.getElementById("attempts"),
  elapsedTimeElement: document.getElementById("elapsedTime"),
  accuracyElement: document.getElementById("accuracy"),
  messageElement: document.getElementById("message"),
  restartButton: document.getElementById("restartButton"),
  playerNameElement: document.getElementById("playerName"),
  rankingListElement: document.getElementById("rankingList"),
  clearRankingButton: document.getElementById("clearRankingButton"),
  config: GAME_CONFIG,
});

// 브라우저 콘솔에서 현재 게임 인스턴스를 확인할 수 있게 노출한다.
window.memoryPuzzleGame = game;
