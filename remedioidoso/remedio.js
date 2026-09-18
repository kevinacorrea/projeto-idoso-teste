document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Cria a estrutura da caixinha de ajuda no centro da tela
    const modalAjudaRemedios = document.createElement("div");
    modalAjudaRemedios.id = "ajuda-remedios-idoso";
    modalAjudaRemedios.innerHTML = `
        <div class="conteudo-ajuda">
            <h2>Precisa de ajuda com seus remédios? 💊</h2>
            <p>Esta tela mostra o horário do seu próximo remédio.</p>
            
            <div class="instrucoes-remedios">
                <p><strong>O que fazer?</strong></p>
                <ul>
                    <li>Olhe o nome do remédio e a hora marcados na caixa amarela da tela.</li>
                    <li>Quando você <strong>já tiver tomado</strong> o remédio, toque no botão verde lá embaixo:</li>
                </ul>
                
                <div class="simulacao-botao-verde">
                    NOTIFICAR FAMILIAR DE REMÉDIO TOMADO
                </div>
                
                <p class="nota-importante">💡 Assim, sua família vai saber que você tomou o remédio direitinho e ninguém vai ficar preocupado!</p>
            </div>

            <button id="fechar-ajuda-remedios">Entendi, obrigado!</button>
        </div>
    `;
    document.body.appendChild(modalAjudaRemedios);

    // 2. Estilização focada em acessibilidade e conforto visual para idosos
    const estilo = document.createElement("style");
    estilo.textContent = `
        #ajuda-remedios-idoso {
            display: none; /* Começa escondido */
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.7); /* Fundo escuro para isolar o fundo e evitar distração */
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
            color: #0284c7; /* Azul acolhedor */
            font-size: 26px;
            margin-bottom: 15px;
        }
        .conteudo-ajuda p {
            color: #334155;
            font-size: 19px;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .instrucoes-remedios {
            text-align: left; /* Facilita a leitura de listas */
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            border-left: 5px solid #0284c7;
        }
        .instrucoes-remedios ul {
            padding-left: 20px;
            margin-top: 5px;
            margin-bottom: 15px;
        }
        .instrucoes-remedios li {
            font-size: 18px;
            color: #475569;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        .simulacao-botao-verde {
            background-color: #c2e8b9;
            color: #1e3a1e;
            font-weight: bold;
            font-size: 15px;
            text-align: center;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #a3d997;
            margin: 10px auto 15px auto;
            max-width: 90%;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .nota-importante {
            font-size: 17px !important;
            color: #0f172a !important;
            background-color: #fef08a; /* Fundo amarelo suave para destacar a dica de tranquilidade */
            padding: 10px;
            border-radius: 8px;
            margin: 0;
        }
        #fechar-ajuda-remedios {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 16px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
        }
        #fechar-ajuda-remedios:hover {
            background-color: #1d4ed8;
        }
    `;
    document.head.appendChild(estilo);

    // 3. Procura o botão vermelho escuro "CLIQUE AQUI PARA RECEBER AJUDA!" e ativa a caixinha
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
            modalAjudaRemedios.style.display = "flex"; // Abre o painel centralizado
        });
    }

    // Fecha a caixinha ao clicar no botão azul "Entendi"
    document.getElementById("fechar-ajuda-remedios").addEventListener("click", () => {
        modalAjudaRemedios.style.display = "none";
    });
});