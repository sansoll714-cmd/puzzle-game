(function () {
  const {
    shuffle,
    formatElapsedTime,
    formatAccuracy,
  } = window.MemoryPuzzleUtils;
  const { renderBoard } = window.MemoryPuzzleBoard;

  class MemoryPuzzleGame {
    constructor({
      boardElement,
      attemptsElement,
      elapsedTimeElement,
      accuracyElement,
      messageElement,
      restartButton,
      difficultyButtons,
      difficultySummaryElement,
      boardSubtitleElement,
      config,
    }) {
      this.boardElement = boardElement;
      this.attemptsElement = attemptsElement;
      this.elapsedTimeElement = elapsedTimeElement;
      this.elapsedTimeCard = elapsedTimeElement.closest(".status-card");
      this.accuracyElement = accuracyElement;
      this.messageElement = messageElement;
      this.restartButton = restartButton;
      this.difficultyButtons = [...difficultyButtons];
      this.difficultySummaryElement = difficultySummaryElement;
      this.boardSubtitleElement = boardSubtitleElement;
      this.config = config;
      this.currentDifficultyKey = config.defaultDifficulty;
      this.state = this.createInitialState();
      this.flipBackTimerId = null;
      this.timerIntervalId = null;

      this.handleBoardClick = this.handleBoardClick.bind(this);
      this.handleDifficultyClick = this.handleDifficultyClick.bind(this);
      this.resetGame = this.resetGame.bind(this);

      this.attachEvents();
      this.applyDifficulty(this.currentDifficultyKey);
    }

    get currentDifficulty() {
      return this.config.difficulties[this.currentDifficultyKey];
    }

    createInitialState() {
      return {
        cards: [],
        flippedCardIds: [],
        attempts: 0,
        remainingSeconds: this.currentDifficulty.timeLimitSeconds,
        hasStarted: false,
        matchedPairs: 0,
        isBoardLocked: false,
        isGameOver: false,
      };
    }

    get totalPairs() {
      return (this.currentDifficulty.boardSize ** 2) / 2;
    }

    attachEvents() {
      this.boardElement.addEventListener("click", this.handleBoardClick);
      this.restartButton.addEventListener("click", this.resetGame);
      this.difficultyButtons.forEach((button) => {
        button.addEventListener("click", this.handleDifficultyClick);
      });
    }

    updateDifficultyButtons() {
      this.difficultyButtons.forEach((button) => {
        const isActive = button.dataset.difficulty === this.currentDifficultyKey;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    updateDifficultyText() {
      if (this.difficultySummaryElement) {
        this.difficultySummaryElement.textContent = this.currentDifficulty.summary;
      }

      if (this.boardSubtitleElement) {
        this.boardSubtitleElement.textContent = this.currentDifficulty.boardSubtitle;
      }
    }

    configureBoard() {
      this.boardElement.style.setProperty("--board-columns", String(this.currentDifficulty.boardSize));
      this.boardElement.setAttribute(
        "aria-label",
        `${this.currentDifficulty.boardSize}x${this.currentDifficulty.boardSize} 과일 짝맞추기 보드`,
      );
    }

    buildDeck() {
      const activeFruits = this.config.fruits.slice(0, this.totalPairs);
      const duplicatedFruits = [...activeFruits, ...activeFruits];
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

    updateTimerAppearance() {
      if (!this.elapsedTimeCard) {
        return;
      }

      this.elapsedTimeCard.classList.remove("is-warning", "is-danger");

      if (this.state.remainingSeconds <= this.config.dangerTimeSeconds) {
        this.elapsedTimeCard.classList.add("is-danger");
        return;
      }

      if (this.state.remainingSeconds <= this.config.warningTimeSeconds) {
        this.elapsedTimeCard.classList.add("is-warning");
      }
    }

    updateStatus() {
      this.attemptsElement.textContent = String(this.state.attempts);
      this.elapsedTimeElement.textContent = formatElapsedTime(this.state.remainingSeconds);
      this.accuracyElement.textContent = formatAccuracy(this.getAccuracyPercentage());
      this.updateTimerAppearance();
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

    handleTimeExpired() {
      this.clearPendingTimer();
      this.clearTimerInterval();
      this.state.flippedCardIds = [];
      this.state.isBoardLocked = true;
      this.state.isGameOver = true;
      this.state.remainingSeconds = 0;
      this.setMessage(this.config.message.timeout);
      this.render();
    }

    startTimer() {
      if (this.state.hasStarted || this.timerIntervalId !== null || this.state.isGameOver) {
        return;
      }

      this.state.hasStarted = true;
      this.timerIntervalId = window.setInterval(() => {
        this.state.remainingSeconds -= 1;

        if (this.state.remainingSeconds <= 0) {
          this.handleTimeExpired();
          return;
        }

        this.updateStatus();
      }, 1000);
    }

    stopTimer() {
      this.clearTimerInterval();
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

    applyDifficulty(difficultyKey) {
      if (!this.config.difficulties[difficultyKey]) {
        return;
      }

      this.currentDifficultyKey = difficultyKey;
      this.configureBoard();
      this.updateDifficultyButtons();
      this.updateDifficultyText();
      this.resetGame();
    }

    handleDifficultyClick(event) {
      const { difficulty } = event.currentTarget.dataset;

      if (!difficulty || difficulty === this.currentDifficultyKey) {
        return;
      }

      this.applyDifficulty(difficulty);
    }

    handleBoardClick(event) {
      const cardElement = event.target.closest(".card");

      if (!cardElement || !this.boardElement.contains(cardElement)) {
        return;
      }

      const cardId = Number(cardElement.dataset.id);
      this.handleCardSelection(cardId);
    }

    handleCardSelection(cardId) {
      if (this.state.isBoardLocked || this.state.isGameOver || this.state.remainingSeconds <= 0) {
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
        this.state.isGameOver = true;
        this.setMessage(
          `완료! ${this.currentDifficulty.label} 난이도 클리어, ${this.state.attempts}번 시도, 남은 시간 ${formatElapsedTime(this.state.remainingSeconds)}, 정확도 ${formatAccuracy(this.getAccuracyPercentage())}`,
        );
        this.render();
        return;
      }

      this.setMessage(this.config.message.match);
      this.render();
    }

    resolveMismatch(firstId, secondId) {
      this.flipBackTimerId = window.setTimeout(() => {
        if (this.state.isGameOver) {
          return;
        }

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

  window.MemoryPuzzleGame = MemoryPuzzleGame;
}());
