(() => {
    const gridEl = document.querySelector('.board');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const restartBtn = document.getElementById('restartBtn');
    const movesEl = document.getElementById('moves');

    // support either images (window.GAME_IMAGES) or symbols (window.GAME_SYMBOLS)
    const useSymbols = Array.isArray(window.GAME_SYMBOLS) && window.GAME_SYMBOLS.length > 0;
    const useImages = Array.isArray(window.GAME_IMAGES) && window.GAME_IMAGES.length > 0;

    if (!gridEl || (!useSymbols && !useImages)) return;

    let items = useSymbols ? window.GAME_SYMBOLS.slice() : window.GAME_IMAGES.slice();
    // ensure at least 3 distinct items by duplicating if needed
    while (items.length < 3) items = items.concat(items.slice(0, 3 - items.length));

    let cards = [];
    let first = null, second = null, lock = false, moves = 0, matched = 0;

    function init() {
        cards = items.concat(items).map((val, i) => ({id: i, val}));
        shuffle(cards);
        render();
    }

    function shuffle(a) {
        for (let i = a.length -1; i>0; i--){
            const j = Math.floor(Math.random()*(i+1));
            [a[i],a[j]]=[a[j],a[i]];
        }
    }

    function render(){
        gridEl.innerHTML='';
        cards.forEach((c, idx)=>{
            const el = document.createElement('div');
            el.className='card';
            el.dataset.idx=idx;
            if (useImages) {
                const img = document.createElement('img');
                img.src = c.val;
                img.alt = 'card';
                el.appendChild(img);
                const cover = document.createElement('div'); cover.className='cover'; el.appendChild(cover);
            } else {
                // symbol mode: show large emoji/symbols
                el.innerHTML = `<div class="front">${escapeHtml(c.val)}</div><div class="cover"></div>`;
            }
            el.addEventListener('click', onCardClick);
            gridEl.appendChild(el);
        });
        matched = 0; moves = 0; updateMoves();
    }

    function onCardClick(e){
        if (lock) return;
        const idx = Number(e.currentTarget.dataset.idx);
        const el = gridEl.children[idx];
        if (el.classList.contains('matched') || el.classList.contains('open')) return;
        el.classList.add('open');
        const cover = el.querySelector('.cover'); if (cover) cover.style.opacity = '0';

        if (!first) { first = {idx, el}; return; }
        second = {idx, el};
        lock = true;
        moves++; updateMoves();

        const a = cards[first.idx].val, b = cards[second.idx].val;
        if (a === b) {
            first.el.classList.add('matched');
            second.el.classList.add('matched');
            matched += 2;
            resetTurn();
            if (matched === cards.length) setTimeout(()=>alert(`Parabéns! Você completou em ${moves} movimentos.`),200);
        } else {
            setTimeout(()=>{
                first.el.classList.remove('open'); if (first.el.querySelector('.cover')) first.el.querySelector('.cover').style.opacity='1';
                second.el.classList.remove('open'); if (second.el.querySelector('.cover')) second.el.querySelector('.cover').style.opacity='1';
                resetTurn();
            },700);
        }
    }

    function resetTurn(){ first=null; second=null; lock=false; }
    function updateMoves(){ if(movesEl) movesEl.textContent = `Movimentos: ${moves}` }

    shuffleBtn && shuffleBtn.addEventListener('click', ()=>{ shuffle(cards); render(); });
    restartBtn && restartBtn.addEventListener('click', ()=>{ init(); });

    function escapeHtml(text){ return String(text).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

    init();

})();
