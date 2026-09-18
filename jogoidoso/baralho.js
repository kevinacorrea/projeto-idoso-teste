(() => {
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const suits = ['♠','♥','♦','♣'];
    // create a small, recognizable set for elderly: use only ranks A,2,3,4 and suits ♠ ♥ ♦ ♣ to make 8 pairs (16 cards)
    const pairCards = ['A♠','A♥','2♠','2♥','3♠','3♥','4♠','4♥'];

    const deckEl = document.getElementById('deck');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const restartBtn = document.getElementById('restartBtn');
    const movesEl = document.getElementById('moves');

    let cards = [];
    let first = null, second = null, lock = false, moves = 0, matched = 0;

    function buildCards(){
        cards = pairCards.concat(pairCards).map((label,i)=>({id:i,label}));
        shuffle(cards);
    }

    function shuffle(a){
        for (let i=a.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [a[i],a[j]]=[a[j],a[i]];
        }
    }

    function render(){
        if (!deckEl) return;
        deckEl.innerHTML='';
        cards.forEach((c,idx)=>{
            const el = document.createElement('button');
            el.className='card';
            el.dataset.idx = idx;
            el.setAttribute('aria-label', 'Carta fechada');
            el.innerHTML = `<div class="front">${escapeHtml(c.label)}</div><div class="back">🂠</div>`;
            el.addEventListener('click', onCardClick);
            deckEl.appendChild(el);
        });
        matched = 0; moves = 0; updateMoves();
    }

    function onCardClick(e){
        if (lock) return;
        const idx = Number(e.currentTarget.dataset.idx);
        const el = deckEl.children[idx];
        if (el.classList.contains('matched') || el.classList.contains('open')) return;
        el.classList.add('open');
        el.setAttribute('aria-label', `Carta ${cards[idx].label}`);

        if (!first) { first = {idx, el}; return; }
        second = {idx, el};
        lock = true;
        moves++; updateMoves();

        const a = cards[first.idx].label, b = cards[second.idx].label;
        if (a === b) {
            first.el.classList.add('matched');
            second.el.classList.add('matched');
            matched += 2;
            resetTurn();
            if (matched === cards.length) setTimeout(()=>alert(`Parabéns! Você encontrou todos os pares em ${moves} movimentos.`),200);
        } else {
            setTimeout(()=>{
                first.el.classList.remove('open');
                second.el.classList.remove('open');
                first.el.setAttribute('aria-label','Carta fechada');
                second.el.setAttribute('aria-label','Carta fechada');
                resetTurn();
            },900);
        }
    }

    function resetTurn(){ first=null; second=null; lock=false; }
    function updateMoves(){ if (movesEl) movesEl.textContent = `Movimentos: ${moves}` }

    shuffleBtn && shuffleBtn.addEventListener('click', ()=>{ shuffle(cards); render(); });
    restartBtn && restartBtn.addEventListener('click', ()=>{ init(); });

    function escapeHtml(text){ return text.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

    function init(){ buildCards(); render(); }

    init();

})();
