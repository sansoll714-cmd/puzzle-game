(function () {
  function getCardAriaLabel(card) {
    if (card.isMatched) {
      return `${card.fruit} 카드, 짝맞추기 완료`;
    }

    if (card.isFlipped) {
      return `${card.fruit} 카드, 앞면 표시 중`;
    }

    return "뒤집힌 과일 카드";
  }

  function createCardElement(card, isBoardLocked) {
    const button = document.createElement("button");
    const isInteractive = !card.isMatched && !isBoardLocked;

    button.type = "button";
    button.className = "card";
    button.dataset.id = String(card.id);
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-pressed", String(card.isFlipped || card.isMatched));
    button.setAttribute("aria-label", getCardAriaLabel(card));
    button.disabled = card.isMatched;
    button.innerHTML = `
      <span class="card-inner">
        <span class="card-face card-back">✦</span>
        <span class="card-face card-front">${card.fruit}</span>
      </span>
    `;

    if (card.isFlipped) {
      button.classList.add("is-flipped");
    }

    if (card.isMatched) {
      button.classList.add("is-matched");
    }

    if (!isInteractive && !card.isMatched) {
      button.setAttribute("aria-disabled", "true");
    }

    return button;
  }

  function renderBoard(boardElement, cards, isBoardLocked) {
    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
      fragment.appendChild(createCardElement(card, isBoardLocked));
    });

    boardElement.replaceChildren(fragment);
  }

  window.MemoryPuzzleBoard = {
    renderBoard,
  };
}());
