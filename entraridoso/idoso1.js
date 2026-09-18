const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
  // Cria a janela de ajuda
  const modalAjuda = document.createElement("div");
  modalAjuda.id = "caixa-ajuda-idoso";
  modalAjuda.innerHTML = `
        <div class="conteudo-ajuda">
            <h2>Precisa de uma ajuda? 😊</h2>
            <p>Para entrar, basta seguir estes passos:</p>
            <p>1. Escreva o seu número de telefone.</p>
            <p>2. Clique no botão verde <strong>ENTRAR</strong>.</p>
            <p>Se ainda não tem cadastro, toque em <strong>AINDA NÃO TENHO CADASTRO</strong> para criar o seu.</p>
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

  const loginSection = document.getElementById('login-section');
  const cadastroSection = document.getElementById('cadastro-section');
  document.getElementById('mostrarCadastro')?.addEventListener('click', () => { loginSection.hidden = true; cadastroSection.hidden = false; });
  document.getElementById('voltarLogin')?.addEventListener('click', () => { cadastroSection.hidden = true; loginSection.hidden = false; });

  ['loginTelefone', 'cadastroTelefone'].forEach(id => document.getElementById(id)?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 0) v = '(' + v;
    if (v.length > 3) v = v.slice(0, 3) + ') ' + v.slice(3);
    if (v.length > 10) v = v.slice(0, 10) + '-' + v.slice(10);
    e.target.value = v;
  }));

  async function enviar(url, dados) {
    const response = await fetch(`${API_BASE_URL}${url}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(dados) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.erro || body.message || `Erro ${response.status}`);
    body.userType = 'idoso';
    localStorage.setItem('currentUser', JSON.stringify(body));
    return body;
  }

  // Login: só com o telefone. Se o idoso já estiver cadastrado E vinculado
  // a um familiar, vai direto para a página inicial. Senão (cadastrado mas
  // ainda sem vínculo), é levado para a tela de QR Code para se vincular.
  document.getElementById('formLoginIdoso')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const body = await enviar('/auth/login', { tipo: 'idoso', telefone: loginTelefone.value });
      window.location.href = body.vinculado ? '../inicioidoso/inicioidoso.html' : '../vinculo/vinculo.html';
    } catch (err) { alert(err.message); }
  });

  // Cadastro novo: nunca começa vinculado, então sempre vai para a tela de
  // QR Code logo em seguida.
  document.getElementById('formCadastroIdoso')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await enviar('/idosos', { nome: cadastroNome.value, telefone: cadastroTelefone.value, idade: Number(cadastroIdade.value) });
      window.location.href = '../vinculo/vinculo.html';
    }
    catch (err) { alert('Não foi possível criar o cadastro: ' + err.message); }
  });
});
