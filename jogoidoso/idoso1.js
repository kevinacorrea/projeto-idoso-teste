document.addEventListener("DOMContentLoaded", () => {

    // Cria a janela de ajuda
    const modalAjuda = document.createElement("div");

    modalAjuda.id = "caixa-ajuda-idoso";

    modalAjuda.innerHTML = `
        <div class="conteudo-ajuda">
            <h2>Precisa de uma ajuda? 😊</h2>

            <p>Para entrar, basta seguir estes 4 passos:</p>

            <p>1. Escreva o seu número de telefone.</p>

            <p>2. Escreva o seu nome completo.</p>

            <p>3. Crie uma senha.</p>

            <p>4. Clique no botão verde <strong>ENTRAR</strong>.</p>

            <button id="fechar-ajuda">Entendi, obrigado!</button>
        </div>
    `;

    document.body.appendChild(modalAjuda);

    // Estilo da janela
    const estilo = document.createElement("style");

    estilo.textContent = `
        #caixa-ajuda-idoso {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.6);
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
            font-size: 20px;
            line-height: 1.5;
            margin-bottom: 15px;
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

        #fechar-ajuda:hover {
            background-color: #2563eb;
        }
    `;

    document.head.appendChild(estilo);

    // Botão de ajuda do HTML
    const botaoAjuda = document.querySelector(".btn-help");

    if (botaoAjuda) {
        botaoAjuda.addEventListener("click", (e) => {
            e.preventDefault();
            modalAjuda.style.display = "flex";
        });
    }

    // Fechar janela
    document.getElementById("fechar-ajuda").addEventListener("click", () => {
        modalAjuda.style.display = "none";
    });

});