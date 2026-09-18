document.addEventListener("DOMContentLoaded", () => {
    // 1. Cria a estrutura da mensagem amigável para o idoso
    const modalAjuda = document.createElement("div");
    modalAjuda.id = "caixa-ajuda-idoso";
    modalAjuda.innerHTML = `
        <div class="conteudo-ajuda">
            <h2>Precisa de uma ajuda? 😊</h2>
            <p>Para continuar e entrar, você só precisa tocar ou clicar no <strong>botão verde</strong> onde está escrito:</p>
            <p> <strong>CLIQUE AQUI PARA ENTRAR </strong></p>
            <button id="fechar-ajuda">Entendi, obrigado!</button>
        </div>
    `;
    document.body.appendChild(modalAjuda);

    const estilo = document.createElement("style");
    estilo.textContent = `
        #caixa-ajuda-idoso {
            display: none; /* Escondido por padrão */
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6); /* Fundo escurecido para dar foco */
            z-index: 9999;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        }
        .conteudo-ajuda {
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 450px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .conteudo-ajuda h2 {
            color: #333;
            font-size: 28px;
            margin-bottom: 20px;
        }
        .conteudo-ajuda p {
            color: #555;
            font-size: 20px; /* Fonte grande para facilitar a leitura */
            line-height: 1.5;
            margin-bottom: 20px;
        }
        .simulacao-botao-verde {
            background-color: #22c55e;
            color: white;
            font-weight: bold;
            padding: 12px;
            border-radius: 8px;
            font-size: 18px;
            margin: 15px auto;
            max-width: 280px;
        }
        #fechar-ajuda {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
            width: 100%;
        }
        #fechar-ajuda:hover { background-color: #2563eb; }
    `;
    document.head.appendChild(estilo);

    // 3. Lógica para mostrar e fechar a mensagem
    
    // Procura o botão de ajuda pelo texto dele (vermelho)
    const botoes = document.querySelectorAll('button, a, div, input[type="button"]');
    let botaoAjuda = null;
    botoes.forEach(el => {
        if (el.textContent.trim().toUpperCase().includes("RECEBER AJUDA")) {
            botaoAjuda = el;
        }
    });

    if (botaoAjuda) {
        botaoAjuda.addEventListener("click", (e) => {
            e.preventDefault();
            modalAjuda.style.display = "flex"; // Mostra a mensagem no centro
        });
    }

    // Fecha a mensagem quando clica no botão azul "Entendi"
    document.getElementById("fechar-ajuda").addEventListener("click", () => {
        modalAjuda.style.display = "none";
    });
});

