(() => {
    const rows = 3, cols = 3; // 3x3 puzzle
    const puzzleEl = document.getElementById('puzzle');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const restartBtn = document.getElementById('restartBtn');
    const movesEl = document.getElementById('moves');

    let pieces = [];
    let moves = 0;
    let currentImage = null;

    function createPieces() {
        pieces = [];
        const total = rows * cols;
        for (let i = 0; i < total; i++) {
            pieces.push({id: i, correctIndex: i});
        }
    }

    function render() {
        if (!puzzleEl) return;
        puzzleEl.innerHTML = '';
        pieces.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = 'piece';
            div.dataset.index = idx;
            const imageSrc = currentImage || window.PUZZLE_IMAGE || 'jogoquebracabeca1.png';
            div.style.backgroundImage = `url("${imageSrc}")`;
            const posX = (p.correctIndex % cols) * (100 / (cols - 1));
            const posY = Math.floor(p.correctIndex / cols) * (100 / (rows - 1));
            div.style.backgroundPosition = `${posX}% ${posY}%`;
            div.addEventListener('click', onPieceClick);
            puzzleEl.appendChild(div);
        });
        updateMoves();
    }

    function shuffleArray(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }

    function shuffle() {
        shuffleArray(pieces);
        moves = 0;
        render();
    }

    let firstSelected = null;
    function onPieceClick(e) {
        const idx = Number(e.currentTarget.dataset.index);
        if (firstSelected === null) {
            firstSelected = idx;
            e.currentTarget.style.outline = '4px solid rgba(90,155,216,.95)';
            return;
        }

        [pieces[firstSelected], pieces[idx]] = [pieces[idx], pieces[firstSelected]];
        firstSelected = null;
        Array.from(puzzleEl.children).forEach(c => c.style.outline = '');
        moves++;
        render();
        checkWin();
    }

    function checkWin() {
        const ok = pieces.every((p, i) => p.correctIndex === i);
        if (ok) {
            setTimeout(() => alert(`Parabéns! Você completou o quebra-cabeça em ${moves} movimentos.`), 100);
        }
    }

    function updateMoves(){
        if (movesEl) movesEl.textContent = `Movimentos: ${moves}`;
    }

    // expose init so page can set image and re-init
    function initPuzzle(image) {
        currentImage = image || window.PUZZLE_IMAGE || 'jogoquebracabeca1.png';
        createPieces();
        // small initial shuffle to make it playable
        shuffleArray(pieces);
        moves = 0;
        render();
    }

    shuffleBtn && shuffleBtn.addEventListener('click', () => { shuffle(); });
    restartBtn && restartBtn.addEventListener('click', () => { initPuzzle(currentImage); });

    window.initPuzzle = initPuzzle;

    // auto init on load
    document.addEventListener('DOMContentLoaded', () => initPuzzle(window.PUZZLE_IMAGE));

})();
