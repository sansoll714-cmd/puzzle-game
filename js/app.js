(function () {
  const { GAME_CONFIG } = window.MemoryPuzzleUtils;
  const game = new window.MemoryPuzzleGame({
    boardElement: document.getElementById("gameBoard"),
    attemptsElement: document.getElementById("attempts"),
    elapsedTimeElement: document.getElementById("elapsedTime"),
    accuracyElement: document.getElementById("accuracy"),
    messageElement: document.getElementById("message"),
    restartButton: document.getElementById("restartButton"),
    difficultyButtons: document.querySelectorAll("[data-difficulty]"),
    difficultySummaryElement: document.getElementById("difficultySummary"),
    boardSubtitleElement: document.getElementById("boardSubtitle"),
    config: GAME_CONFIG,
  });

  window.memoryPuzzleGame = game;
}());
