import {
  shuffle,
  formatElapsedTime,
  formatAccuracy,
  sanitizePlayerName,
  formatRankingDate,
} from "./utils.js";
import { renderBoard } from "./board.js";

// 게임 상태, 이벤트, 랭킹을 한곳에서 관리하는 메인 클래스다.
export class MemoryPuzzleGame {
  constructor({
    boardElement,
    attemptsElement,
    elapsedTimeElement,
    accuracyElement,
    messageElement,
    restartButton,
    playerNameElement,
    rankingListElement,
    clearRankingButton,
    config,
  }) {
    this.boardElement = boardElement;
    this.attemptsElement = attemptsElement;
    this.elapsedTimeElement = elapsedTimeElement;
    this.accuracyElement = accuracyElement;
    this.messageElement = messageElement;
    this.restartButton = restartButton;
    this.playerNameElement = playerNameElement;
    this.rankingListElement = rankingListElement;
    this.clearRankingButton = clearRankingButton;
    this.config = config;
    this.state = this.createInitialState();
    this.flipBackTimerId = null;
    this.timerIntervalId = null;
    this.rankings = this.loadRankings();

    this.handleBoardClick = this.handleBoardClick.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.handleClearRankings = this.handleClearRankings.bind(this);

    this.attachEvents();
    this.renderRankings();
    this.resetGame();
  }

  createInitialState() {
    // 새 게임을 시작할 때마다 이 기본 상태로 되돌아간다.
    return {
      cards: [],
      flippedCardIds: [],
      attempts: 0,
      elapsedSeconds: 0,
      hasStarted: false,
      matchedPairs: 0,
      isBoardLocked: false,
    };
  }

  get totalPairs() {
    return this.config.fruits.length;
  }

  attachEvents() {
    // 카드마다 이벤트를 붙이지 않고 보드 하나에만 클릭 이벤트를 건다.
    this.boardElement.addEventListener("click", this.handleBoardClick);
    this.restartButton.addEventListener("click", this.resetGame);
    this.clearRankingButton.addEventListener("click", this.handleClearRankings);
  }

  buildDeck() {
    // 과일 8종을 2장씩 복제해서 4x4 덱을 만든다.
    const duplicatedFruits = [...this.config.fruits, ...this.config.fruits];
    const shuffledFruits = shuffle(duplicatedFruits);

    return shuffledFruits.map((fruit, index) => ({
      id: index,
      fruit,
      isFlipped: false,
      isMatched: false,
    }));
  }

  getCardById(cardId) {
    return this.state.cards.find((card) => card.id === cardId);
  }

  updateCard(cardId, updates) {
    // id가 같은 카드만 새 상태로 교체한다.
    this.state.cards = this.state.cards.map((card) => (
      card.id === cardId ? { ...card, ...updates } : card
    ));
  }

  setMessage(text) {
    this.messageElement.textContent = text;
  }

  getAccuracyPercentage() {
    if (this.state.attempts === 0) {
      return 0;
    }

    return (this.state.matchedPairs / this.state.attempts) * 100;
  }

  updateStatus() {
    this.attemptsElement.textContent = String(this.state.attempts);
    this.elapsedTimeElement.textContent = formatElapsedTime(this.state.elapsedSeconds);
    this.accuracyElement.textContent = formatAccuracy(this.getAccuracyPercentage());
  }

  renderBoard() {
    renderBoard(this.boardElement, this.state.cards, this.state.isBoardLocked);
  }

  render() {
    this.updateStatus();
    this.renderBoard();
  }

  clearPendingTimer() {
    if (this.flipBackTimerId !== null) {
      window.clearTimeout(this.flipBackTimerId);
      this.flipBackTimerId = null;
    }
  }

  clearTimerInterval() {
    if (this.timerIntervalId !== null) {
      window.clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  startTimer() {
    if (this.state.hasStarted || this.timerIntervalId !== null) {
      return;
    }

    // 첫 카드 클릭 이후부터 1초마다 시간을 올린다.
    this.state.hasStarted = true;
    this.timerIntervalId = window.setInterval(() => {
      this.state.elapsedSeconds += 1;
      this.updateStatus();
    }, 1000);
  }

  stopTimer() {
    this.clearTimerInterval();
  }

  loadRankings() {
    try {
      // 브라우저를 새로 열어도 기록이 남도록 localStorage를 사용한다.
      const savedRanking = window.localStorage.getItem(this.config.rankingStorageKey);

      if (!savedRanking) {
        return [];
      }

      const parsedRanking = JSON.parse(savedRanking);
      return Array.isArray(parsedRanking) ? parsedRanking : [];
    } catch (error) {
      return [];
    }
  }

  persistRankings() {
    window.localStorage.setItem(
      this.config.rankingStorageKey,
      JSON.stringify(this.rankings),
    );
  }

  sortRankings(rankings) {
    // 우선순위: 적은 시도 횟수 -> 짧은 시간 -> 높은 정확도 -> 더 먼저 달성한 기록
    return [...rankings].sort((left, right) => {
      if (left.attempts !== right.attempts) {
        return left.attempts - right.attempts;
      }

      if ((left.elapsedSeconds ?? Number.MAX_SAFE_INTEGER) !== (right.elapsedSeconds ?? Number.MAX_SAFE_INTEGER)) {
        return (left.elapsedSeconds ?? Number.MAX_SAFE_INTEGER) - (right.elapsedSeconds ?? Number.MAX_SAFE_INTEGER);
      }

      if ((right.accuracy ?? 0) !== (left.accuracy ?? 0)) {
        return (right.accuracy ?? 0) - (left.accuracy ?? 0);
      }

      return new Date(left.completedAt).getTime() - new Date(right.completedAt).getTime();
    });
  }

  addRankingEntry() {
    const playerName = sanitizePlayerName(this.playerNameElement.value);
    this.playerNameElement.value = playerName;

    const nextRankings = this.sortRankings([
      ...this.rankings,
      {
        name: playerName,
        attempts: this.state.attempts,
        elapsedSeconds: this.state.elapsedSeconds,
        accuracy: Math.round(this.getAccuracyPercentage()),
        completedAt: new Date().toISOString(),
      },
    ]).slice(0, this.config.rankingLimit);

    this.rankings = nextRankings;
    this.persistRankings();
    this.renderRankings();
  }

  renderRankings() {
    this.rankingListElement.innerHTML = "";

    if (this.rankings.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "ranking-empty";
      emptyMessage.textContent = "아직 기록이 없습니다. 첫 클리어를 만들어 보세요.";
      this.rankingListElement.appendChild(emptyMessage);
      return;
    }

    const fragment = document.createDocumentFragment();

    this.rankings.forEach((entry) => {
      const item = document.createElement("li");
      item.className = "ranking-item";

      const row = document.createElement("div");
      row.className = "ranking-row";

      const name = document.createElement("span");
      name.className = "ranking-name";
      name.textContent = entry.name;

      const attempts = document.createElement("strong");
      attempts.textContent = `${entry.attempts}회`;

      const meta = document.createElement("div");
      meta.className = "ranking-meta";
      meta.textContent = `${formatElapsedTime(entry.elapsedSeconds ?? 0)} · ${formatAccuracy(entry.accuracy ?? 0)} · ${formatRankingDate(entry.completedAt)}`;

      row.append(name, attempts);
      item.append(row, meta);
      fragment.appendChild(item);
    });

    this.rankingListElement.appendChild(fragment);
  }

  handleClearRankings() {
    if (this.rankings.length === 0) {
      this.rankingListElement.innerHTML = "";
    }

    this.rankings = [];
    this.persistRankings();
    this.renderRankings();
  }

  resetGame() {
    this.clearPendingTimer();
    this.clearTimerInterval();
    this.state = {
      ...this.createInitialState(),
      cards: this.buildDeck(),
    };

    this.setMessage(this.config.message.idle);
    this.render();
  }

  handleBoardClick(event) {
    // 클릭된 실제 요소에서 가장 가까운 .card 버튼을 찾는다.
    const cardElement = event.target.closest(".card");

    if (!cardElement || !this.boardElement.contains(cardElement)) {
      return;
    }

    const cardId = Number(cardElement.dataset.id);

    if (cardId === this.state.cards.length - 1) {
      this.handleCardSelection(cardId);
      return;
    }

    this.handleCardSelection(cardId);
  }

  handleCardSelection(cardId) {
    if (this.state.isBoardLocked) {
      return;
    }

    const selectedCard = this.getCardById(cardId);

    if (!selectedCard || selectedCard.isFlipped || selectedCard.isMatched) {
      return;
    }

    this.startTimer();
    this.updateCard(cardId, { isFlipped: true });
    this.state.flippedCardIds = [...this.state.flippedCardIds, cardId];
    this.renderBoard();

    // 첫 번째 카드는 보여주기만 하고, 두 번째 카드가 선택되면 판정을 시작한다.
    if (this.state.flippedCardIds.length === 1) {
      this.setMessage(this.config.message.secondPick);
      return;
    }

    this.resolveTurn();
  }

  resolveTurn() {
    const [firstId, secondId] = this.state.flippedCardIds;
    const firstCard = this.getCardById(firstId);
    const secondCard = this.getCardById(secondId);

    // 카드 2장을 뒤집은 시점을 1번의 시도로 계산한다.
    this.state.attempts += 1;
    this.state.isBoardLocked = true;
    this.updateStatus();

    if (firstCard && secondCard && firstCard.fruit === secondCard.fruit) {
      this.resolveMatch(firstId, secondId);
      return;
    }

    this.resolveMismatch(firstId, secondId);
  }

  resolveMatch(firstId, secondId) {
    this.updateCard(firstId, { isMatched: true });
    this.updateCard(secondId, { isMatched: true });

    this.state.matchedPairs += 1;
    this.state.flippedCardIds = [];
    this.state.isBoardLocked = false;

    if (this.state.matchedPairs === this.totalPairs) {
      this.stopTimer();
      this.addRankingEntry();
      this.setMessage(
        `축하합니다! ${this.state.attempts}번 시도, ${formatElapsedTime(this.state.elapsedSeconds)}, 정확도 ${formatAccuracy(this.getAccuracyPercentage())}로 완료했어요.`,
      );
      this.render();
      return;
    }

    this.setMessage(this.config.message.match);
    this.render();
  }

  resolveMismatch(firstId, secondId) {
    // 틀린 카드는 잠깐 보여준 뒤 다시 뒤집는다.
    this.flipBackTimerId = window.setTimeout(() => {
      this.updateCard(firstId, { isFlipped: false });
      this.updateCard(secondId, { isFlipped: false });

      this.state.flippedCardIds = [];
      this.state.isBoardLocked = false;
      this.flipBackTimerId = null;

      this.setMessage(this.config.message.mismatch);
      this.renderBoard();
    }, this.config.flipBackDelay);
  }
}
