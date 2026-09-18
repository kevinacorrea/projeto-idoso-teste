(() => {
    'use strict';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const API_BASE_URL = window.ZELO_API_BASE_URL || 'http://localhost:8080';
    const assistantRoot = document.createElement('div');
    assistantRoot.id = 'zelo-assistente-root';
    assistantRoot.innerHTML = `
        <button class="zelo-assistente-trigger" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="zelo-assistente-panel" aria-label="Falar com Zelo">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 11a7 7 0 0 1-14 0M12 18v4M8 22h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Falar com Zelo</span>
        </button>
        <section id="zelo-assistente-panel" class="zelo-assistente-panel" role="dialog" aria-modal="false" aria-labelledby="zelo-assistente-title" hidden>
            <header class="zelo-assistente-header">
                <div>
                    <h2 id="zelo-assistente-title" class="zelo-assistente-title">Zelo, seu companheiro</h2>
                    <p class="zelo-assistente-subtitle">Estou aqui para ajudar e conversar com você.</p>
                </div>
                <button class="zelo-assistente-close" type="button" aria-label="Fechar conversa">×</button>
            </header>
            <div class="zelo-assistente-status" role="status" aria-live="polite">
                <span class="zelo-status-dot"></span>
                <span class="zelo-status-label">Pronto para conversar</span>
            </div>
            <div class="zelo-assistente-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
            <div class="zelo-assistente-quick" aria-label="Sugestões rápidas">
                <button type="button" class="zelo-quick-button" data-command="como usar esta página">Como usar esta página</button>
                <button type="button" class="zelo-quick-button" data-command="abrir meus remédios">Meus remédios</button>
                <button type="button" class="zelo-quick-button" data-command="abrir minha família">Minha família</button>
                <button type="button" class="zelo-quick-button" data-command="vamos conversar">Vamos conversar</button>
            </div>
            <form class="zelo-assistente-composer">
                <label class="zelo-sr-only" for="zelo-assistente-input">Digite uma mensagem para Zelo</label>
                <textarea id="zelo-assistente-input" class="zelo-assistente-input" rows="1" placeholder="Diga ou escreva o que precisa..." autocomplete="off"></textarea>
                <button class="zelo-mic-button" type="button" aria-label="Falar agora" title="Falar agora">🎙</button>
                <button class="zelo-send-button" type="submit" aria-label="Enviar mensagem" title="Enviar mensagem">➤</button>
            </form>
            <footer class="zelo-assistente-footer">
                <span>Você pode falar naturalmente.</span>
                <button class="zelo-voice-toggle" type="button">Desligar voz</button>
            </footer>
        </section>
    `;
    document.body.appendChild(assistantRoot);

    const trigger = assistantRoot.querySelector('.zelo-assistente-trigger');
    const panel = assistantRoot.querySelector('.zelo-assistente-panel');
    const closeButton = assistantRoot.querySelector('.zelo-assistente-close');
    const statusLabel = assistantRoot.querySelector('.zelo-status-label');
    const statusDot = assistantRoot.querySelector('.zelo-status-dot');
    const messages = assistantRoot.querySelector('.zelo-assistente-messages');
    const input = assistantRoot.querySelector('.zelo-assistente-input');
    const micButton = assistantRoot.querySelector('.zelo-mic-button');
    const voiceToggle = assistantRoot.querySelector('.zelo-voice-toggle');
    const composer = assistantRoot.querySelector('.zelo-assistente-composer');

    const state = {
        recognition: null,
        listening: false,
        voiceEnabled: localStorage.getItem('zelo-voz-ativa') !== 'false',
        history: [],
        iaConfigurada: false,
        speaking: false
    };

    const destinos = {
        inicio: 'inicioidoso/inicioidoso.html',
        remedios: 'remedioidoso/remedioidoso.html',
        familia: 'fmlamgsidoso/fmlamgsidoso.html',
        medico: 'medicoidoso/medicoidoso.html',
        jogos: 'jogoidoso/jogosidoso.html',
        socorro: 'paginasocorro/socorro.html'
    };

    const normalize = (value) => String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const updateStatus = (message, mode = 'ready') => {
        statusLabel.textContent = message;
        statusDot.classList.toggle('is-warning', mode === 'warning');
        statusDot.classList.toggle('is-listening', mode === 'listening');
    };

    const setOpen = (open) => {
        panel.hidden = false;
        requestAnimationFrame(() => panel.classList.toggle('is-open', open));
        trigger.setAttribute('aria-expanded', String(open));
        if (!open) {
            panel.classList.remove('is-open');
            window.setTimeout(() => {
                if (!panel.classList.contains('is-open')) panel.hidden = true;
            }, 190);
        }
    };

    const addMessage = (text, role = 'assistant', speak = false) => {
        if (!text) return;
        const bubble = document.createElement('div');
        bubble.className = `zelo-msg zelo-msg-${role}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        if (role === 'assistant') {
            state.history.push({ role: 'assistant', content: text });
            if (speak) speakText(text);
        } else {
            state.history.push({ role: 'user', content: text });
        }
    };

    const speakText = (text) => {
        if (!state.voiceEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.92;
        utterance.pitch = 1;
        state.speaking = true;
        utterance.onend = () => { state.speaking = false; };
        window.speechSynthesis.speak(utterance);
    };

    const pageContext = () => {
        const clone = document.body.cloneNode(true);
        const root = clone.querySelector('#zelo-assistente-root');
        if (root) root.remove();
        return (clone.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
    };

    const assistantScriptUrl = document.currentScript?.src
        ? new URL(document.currentScript.src, window.location.href)
        : null;
    const currentSiteBase = () => {
        // O script fica em <raiz-do-site>/assistente/; subir um nível
        // funciona tanto no Live Server quanto no Spring Boot.
        if (assistantScriptUrl) return new URL('../', assistantScriptUrl.href).pathname;
        const path = window.location.pathname;
        const marker = '/idosos/';
        const markerIndex = path.toLowerCase().lastIndexOf(marker);
        return markerIndex >= 0 ? path.slice(0, markerIndex) + marker : '/';
    };

    const navigateTo = (destination) => {
        const target = destinos[destination];
        if (!target) return;
        window.location.assign(currentSiteBase() + target);
    };

    const findDestination = (text) => {
        const clean = normalize(text);
        if (/(meus remedios|meu remedio|remedios|medicamentos|medicacao)/.test(clean)) return 'remedios';
        if (/(minha familia|familia e amigos|familia|amigos|ligar para alguem)/.test(clean)) return 'familia';
        if (/(medico|consulta|falar com doutor|saude)/.test(clean)) return 'medico';
        if (/(jogos|jogar|memoria|quebra cabeca|baralho|cores|frutas)/.test(clean)) return 'jogos';
        if (/(inicio|pagina inicial|voltar para o comeco)/.test(clean)) return 'inicio';
        return null;
    };

    const localResponse = (text) => {
        const clean = normalize(text);
        const destination = findDestination(clean);
        if (destination) {
            const nomes = { remedios: 'seus remédios', familia: 'sua família e seus amigos', medico: 'o médico online', jogos: 'os jogos para a memória', inicio: 'a página inicial' };
            window.setTimeout(() => navigateTo(destination), 900);
            return `Claro. Vou abrir ${nomes[destination]} para você.`;
        }
        if (/(voltar|pagina anterior|volte)/.test(clean)) {
            if (window.history.length > 1) window.setTimeout(() => window.history.back(), 900);
            return 'Tudo bem. Vou voltar para a página anterior.';
        }
        if (/(socorro|emergencia|emergencia|nao estou bem|caí|cai|perigo)/.test(clean)) {
            highlightSos();
            return 'Sinto muito que você esteja passando por isso. O botão vermelho de socorro está destacado. Toque nele para pedir ajuda a um familiar. Se houver perigo imediato, procure ajuda humana agora.';
        }
        if (/(como usar|o que posso fazer|me ajude|ajuda|esta pagina|essa pagina)/.test(clean)) {
            return pageHelp();
        }
        if (/(companhia|conversar|papo|solid[aã]o|como voce|como você|bom dia|boa tarde|boa noite)/.test(text.toLowerCase())) {
            return 'Eu fico feliz em fazer companhia a você. Podemos conversar sobre o seu dia, suas lembranças, sua família ou qualquer assunto que deixe você bem. O que gostaria de contar?';
        }
        if (clean.includes('hora')) {
            return `Agora são ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date())}.`;
        }
        if (clean.includes('data') || clean.includes('dia e hoje')) {
            return `Hoje é ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())}.`;
        }
        return 'Estou aqui com você. Posso abrir seus remédios, sua família, o médico online ou os jogos. Se preferir, também podemos simplesmente conversar.';
    };

    const pageHelp = () => {
        const title = normalize(document.title);
        if (title.includes('remedio')) return 'Nesta página você pode consultar o próximo remédio, ver o lembrete e avisar um familiar. Diga “voltar” quando quiser retornar.';
        if (title.includes('familia')) return 'Nesta página você pode escolher um contato da sua família ou dos seus amigos. Diga “abrir meus remédios” ou “abrir o médico” para navegar.';
        if (title.includes('medico')) return 'Nesta página você pode falar com um médico e registrar o que está sentindo. Para uma emergência, use o botão vermelho de socorro.';
        if (title.includes('jogos')) return 'Nesta página você encontra jogos de frutas, memória, cores, quebra-cabeça e baralho. Diga “abrir jogos” sempre que quiser voltar para cá.';
        if (title.includes('inicio')) return 'Esta é a sua página inicial. Os retângulos coloridos levam aos remédios, família, médico e jogos. Você também pode pedir qualquer opção falando comigo.';
        return 'Eu posso explicar os botões, abrir uma área do site, responder perguntas simples ou fazer companhia. Diga o que você precisa com calma.';
    };

    const highlightSos = () => {
        const possible = [...document.querySelectorAll('button, a')].find((element) => normalize(element.textContent).includes('pedir socorro'));
        if (possible) {
            possible.scrollIntoView({ behavior: 'smooth', block: 'center' });
            possible.style.outline = '6px solid #f4c95d';
            possible.style.outlineOffset = '4px';
            window.setTimeout(() => { possible.style.outline = ''; possible.style.outlineOffset = ''; }, 5000);
        }
    };

    const updateVoiceLabel = () => {
        voiceToggle.textContent = state.voiceEnabled ? 'Desligar voz' : 'Ligar voz';
    };

    const startListening = () => {
        if (!SpeechRecognition) {
            updateStatus('Microfone não disponível; escreva sua mensagem', 'warning');
            addMessage('Seu navegador não oferece reconhecimento de voz. Você pode escrever sua mensagem na caixa abaixo.', 'assistant', false);
            input.focus();
            return;
        }
        if (!state.recognition) {
            state.recognition = new SpeechRecognition();
            state.recognition.lang = 'pt-BR';
            state.recognition.continuous = false;
            state.recognition.interimResults = false;
            state.recognition.maxAlternatives = 1;
            state.recognition.onstart = () => {
                state.listening = true;
                trigger.classList.add('is-listening');
                micButton.classList.add('is-listening');
                micButton.textContent = '■';
                updateStatus('Estou ouvindo você...', 'listening');
            };
            state.recognition.onresult = (event) => {
                const transcript = event.results?.[0]?.[0]?.transcript?.trim();
                if (transcript) {
                    input.value = transcript;
                    submitMessage(transcript);
                }
            };
            state.recognition.onerror = (event) => {
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    updateStatus('Permita o microfone para falar comigo', 'warning');
                    addMessage('Para falar comigo, permita o acesso ao microfone no aviso do navegador. Você também pode escrever sua mensagem.', 'assistant', false);
                } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
                    updateStatus('Não consegui ouvir; tente novamente', 'warning');
                }
            };
            state.recognition.onend = () => {
                state.listening = false;
                trigger.classList.remove('is-listening');
                micButton.classList.remove('is-listening');
                micButton.textContent = '🎙';
                if (!statusDot.classList.contains('is-warning')) updateStatus(state.iaConfigurada ? 'IA online' : 'Pronto para conversar', 'ready');
            };
        }
        if (state.listening) {
            state.recognition.stop();
        } else {
            state.recognition.start();
        }
    };

    const askBackend = async (text) => {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 18000);
        try {
            const response = await fetch(`${API_BASE_URL}/assistente/conversar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    message: text,
                    pageTitle: document.title,
                    pageContext: pageContext(),
                    history: state.history.slice(-8)
                })
            });
            if (!response.ok) throw new Error('Falha na conversa');
            const data = await response.json();
            return data.reply || localResponse(text);
        } finally {
            window.clearTimeout(timeout);
        }
    };

    const submitMessage = async (text) => {
        const cleanText = String(text || '').trim();
        if (!cleanText) return;
        setOpen(true);
        input.value = '';
        addMessage(cleanText, 'user');
        const destination = findDestination(cleanText);
        const command = /(voltar|socorro|emergencia|emergência|não estou bem|nao estou bem|como usar|me ajude|ajuda|companhia|conversar|papo|hora|data)/i.test(cleanText);
        if (destination || command) {
            const response = localResponse(cleanText);
            addMessage(response, 'assistant', true);
            return;
        }
        updateStatus('Estou pensando em uma resposta...', 'ready');
        try {
            const response = await askBackend(cleanText);
            addMessage(response, 'assistant', true);
        } catch (error) {
            const response = localResponse(cleanText);
            addMessage(response, 'assistant', true);
        } finally {
            if (!state.listening) updateStatus(state.iaConfigurada ? 'IA online' : 'Pronto para conversar', 'ready');
        }
    };

    const checkStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/assistente/status`, { headers: { Accept: 'application/json' } });
            if (!response.ok) return;
            const data = await response.json();
            state.iaConfigurada = Boolean(data.configurada);
            updateStatus(state.iaConfigurada ? 'IA online' : 'Modo acolhedor disponível', state.iaConfigurada ? 'ready' : 'warning');
        } catch (error) {
            updateStatus('Modo acolhedor disponível', 'warning');
        }
    };

    const openWithMessage = (message, listen = false) => {
        setOpen(true);
        if (message) addMessage(message, 'assistant', true);
        if (listen) window.setTimeout(startListening, 220);
        else window.setTimeout(() => input.focus(), 220);
    };

    trigger.addEventListener('click', () => {
        const opening = !panel.classList.contains('is-open');
        if (opening) openWithMessage('', true);
        else setOpen(false);
    });

    closeButton.addEventListener('click', () => setOpen(false));
    micButton.addEventListener('click', startListening);
    voiceToggle.addEventListener('click', () => {
        state.voiceEnabled = !state.voiceEnabled;
        localStorage.setItem('zelo-voz-ativa', String(state.voiceEnabled));
        updateVoiceLabel();
        if (!state.voiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    composer.addEventListener('submit', (event) => {
        event.preventDefault();
        submitMessage(input.value);
    });

    assistantRoot.querySelectorAll('[data-command]').forEach((button) => {
        button.addEventListener('click', () => submitMessage(button.dataset.command));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
    });

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('button, a') : null;
        if (!target || assistantRoot.contains(target)) return;
        const targetText = normalize(target.textContent);
        // Só o texto "RECEBER AJUDA" identifica o botão global de ajuda do Zelo.
        // Não usar a classe CSS "btn-help" aqui: ela é reaproveitada em vários
        // botões (ex.: "CLIQUE AQUI PARA AJUDA", "AINDA NÃO TENHO CADASTRO") que
        // não têm nada a ver com o assistente e não podem ser sequestrados por ele.
        if (targetText.includes('receber ajuda')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openWithMessage('Claro. Eu posso explicar esta página, abrir uma opção ou simplesmente conversar com você. O que você precisa?', false);
        } else if (target.matches('.btn-mic, [title*="Gravar"]')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openWithMessage('Pode falar comigo. Estou ouvindo você.', true);
        } else if (targetText.includes('pedir socorro')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            openWithMessage('O pedido de socorro é importante. Toque novamente no botão vermelho se você deseja chamar um familiar. Se houver perigo imediato, procure ajuda humana agora.', false);
            highlightSos();
        }
    }, true);

    updateVoiceLabel();
    checkStatus();

    // Ativação automática: assim que este script roda (ou seja, assim que a
    // página carrega), o Zelo já se apresenta sozinho — em texto e por voz —
    // sem precisar que a pessoa toque em "Falar com Zelo" primeiro. Só o
    // microfone continua exigindo um toque, porque o navegador não deixa
    // ligá-lo sozinho.
    window.setTimeout(() => {
        openWithMessage('Olá! Eu sou o Zelo, seu companheiro. Estou aqui para ajudar e conversar com você. Toque no microfone quando quiser falar comigo.', false);
    }, 600);
})();
