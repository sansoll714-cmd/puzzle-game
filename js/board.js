// 카드 상태에 따라 스크린 리더용 문구를 바꾼다.
export function getCardAriaLabel(card) {
  if (card.isMatched) {
    return `${card.fruit} 카드, 짝 맞춤 완료`;
  }

  if (card.isFlipped) {
    return `${card.fruit} 카드, 뒤집힘`;
  }

  return "숨겨진 과일 카드";
}

// 카드 1장을 화면에 그릴 DOM 요소로 만든다.
export function createCardElement(card, isBoardLocked) {
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
      <span class="card-face card-back">?</span>
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

// 현재 카드 배열 상태를 기준으로 보드 전체를 다시 그린다.
export function renderBoard(boardElement, cards, isBoardLocked) {
  const fragment = document.createDocumentFragment();

  cards.forEach((card) => {
    fragment.appendChild(createCardElement(card, isBoardLocked));
  });

  boardElement.replaceChildren(fragment);
}
