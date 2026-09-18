const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
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
    const response = await fetch(`${API_BASE_URL}${url}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(dados)});
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.erro || body.message || `Erro ${response.status}`);
    body.userType = 'familiar';
    localStorage.setItem('currentUser', JSON.stringify(body));
    return body;
  }

  // Login: só com o telefone. Se o familiar já estiver cadastrado E
  // vinculado a um idoso, vai direto para a página inicial dele. Senão
  // (cadastrado mas ainda sem vínculo), é levado para a tela de leitura do
  // QR Code para se vincular.
  document.getElementById('formLoginFamiliar')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const body = await enviar('/auth/login', { tipo: 'familiar', telefone: loginTelefone.value });
      window.location.href = body.vinculado ? '../iniciofamiliar/iniciofamiliar.html' : '../vinculo/vinculo.html';
    } catch (err) { alert(err.message); }
  });

  // Cadastro novo: nunca começa vinculado, então sempre vai para a tela de
  // leitura do QR Code logo em seguida.
  document.getElementById('formCadastroFamiliar')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await enviar('/familiares', { nome: cadastroNome.value, telefone: cadastroTelefone.value, idade: Number(cadastroIdade.value) });
      window.location.href = '../vinculo/vinculo.html';
    }
    catch (err) { alert('Não foi possível criar o cadastro: ' + err.message); }
  });
});
