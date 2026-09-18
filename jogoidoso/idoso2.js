document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Cria a estrutura da caixinha de ajuda no centro da tela
    const modalAjudaMenu = document.createElement("div");
    modalAjudaMenu.id = "ajuda-menu-idoso";
    modalAjudaMenu.innerHTML = `
        <div class="conteudo-ajuda">
            <h2>Precisa de ajuda com os botões? 😊</h2>
            <p>Escolha o que você quer fazer tocando em um dos retângulos coloridos:</p>
            
            <ul class="lista-opcoes-ajuda">
                <li><span class="quadradinho laranja"></span> <strong>Laranja:</strong> Ver os seus remédios</li>
                <li><span class="quadradinho azul"></span> <strong>Azul:</strong> Falar com família e amigos</li>
                <li><span class="quadradinho verde"></span> <strong>Verde:</strong> Falar com o médico online</li>
                <li><span class="quadradinho roxo"></span> <strong>Roxo:</strong> Jogos para treinar a memória</li>
                <li><span class="quadradinho vermelho"></span> <strong>Vermelho:</strong> Pedir socorro para familiar</li>
            </ul>

            <button id="fechar-ajuda-menu">Entendi, obrigado!</button>
        </div>
    `;
    document.body.appendChild(modalAjudaMenu);

    // 2. Estilização focada em acessibilidade (Fontes grandes, cores vivas e espaçamento)
    const estilo = document.createElement("style");
    estilo.textContent = `
        #ajuda-menu-idoso {
            display: none; /* Começa escondido */
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.7); /* Fundo escurecido para isolar o resto da página */
            z-index: 10000;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        }
        .conteudo-ajuda {
            background: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        }
        .conteudo-ajuda h2 {
            color: #1e293b;
            font-size: 26px;
            margin-bottom: 15px;
        }
        .conteudo-ajuda p {
            color: #475569;
            font-size: 18px;
            margin-bottom: 20px;
            line-height: 1.4;
        }
        .lista-opcoes-ajuda {
            list-style: none;
            padding: 0;
            margin: 0 refinement 25px 0;
            text-align: left; /* Alinha o texto para facilitar a leitura em lista */
        }
        .lista-opcoes-ajuda li {
            font-size: 19px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            color: #334155;
        }
        /* Pequenos quadradinhos coloridos para o idoso associar visualmente */
        .quadradinho {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 6px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .laranja { background-color: #f6b27e; }
        .azul { background-color: #4a82d2; }
        .verde { background-color: #c2e8b9; }
        .roxo { background-color: #a491c8; }
        .vermelho { background-color: #f25252; }

        #fechar-ajuda-menu {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 16px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            margin-top: 15px;
        }
        #fechar-ajuda-menu:hover {
            background-color: #1d4ed8;
        }
    `;
    document.head.appendChild(estilo);

    // 3. Procura o botão de ajuda na tela e ativa o clique
    const elementos = document.querySelectorAll('button, a, div, input[type="button"]');
    let botaoAjuda = null;

    elementos.forEach(el => {
        if (el.textContent.trim().toUpperCase().includes("RECEBER AJUDA")) {
            botaoAjuda = el;
        }
    });

    if (botaoAjuda) {
        botaoAjuda.addEventListener("click", (e) => {
            e.preventDefault();
            modalAjudaMenu.style.display = "flex"; // Abre o painel no meio da tela
        });
    }

    // Fecha a caixinha ao clicar no botão azul "Entendi"
    document.getElementById("fechar-ajuda-menu").addEventListener("click", () => {
        modalAjudaMenu.style.display = "none";
    });
});