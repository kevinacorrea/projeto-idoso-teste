// Variáveis globais
let video = null;
let canvas = null;
let canvasContext = null;
let isScanning = false;
let currentQRCode = null;

// URL base da API
const API_BASE_URL = 'http://localhost:8080';

// Monta o cabeçalho de autenticação a partir do token salvo no cadastro.
// O servidor usa esse token (e não o "id" enviado na URL) para saber de
// quem é o cadastro sendo acessado — então editar o localStorage não
// adianta mais para agir em nome de outra pessoa.
function getAuthHeaders() {
    const currentUser = getFromLocalStorage('currentUser');
    if (!currentUser || !currentUser.token) {
        return {};
    }
    return { 'Authorization': `Bearer ${currentUser.token}` };
}

// ===== INICIALIZAÇÃO ÚNICA =====
document.addEventListener('DOMContentLoaded', async function () {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    if (canvas) {
        canvasContext = canvas.getContext('2d', { willReadFrequently: true });
    }

    // Tenta carregar o usuário atual do LocalStorage
    let currentUser = getFromLocalStorage('currentUser');

    // Se não houver usuário logado, ou faltar o token (ex.: dado antigo/
    // adulterado no localStorage), redireciona para a seleção de perfil.
    if (!currentUser || !currentUser.token) {
        console.log('Nenhuma sessão válida. Redirecionando para seleção de perfil...');
        localStorage.removeItem('currentUser');
        window.location.href = "entrarcomo.html";
        return;
    }

    console.log('Sessão inicial ativa como:', currentUser);

    // ===== CONTROLE DE ACESSO POR TIPO DE USUÁRIO =====
    if (currentUser.userType === 'idoso') {
        console.log('Usuário Idoso detectado. Mostrando apenas QR Code...');
        // Oculta as opções de seleção
        document.querySelector('.content').style.display = 'none';
        // Oculta a seção de scanner
        document.getElementById('scanSection').classList.remove('active');
        document.getElementById('scanSection').style.display = 'none';
        // Ativa apenas a seção de geração de QR Code
        document.getElementById('generateSection').classList.add('active');
        document.getElementById('generateSection').style.display = 'block';
        // Carrega o QR Code do idoso
        loadQRCodeFromBackend();
    } else if (currentUser.userType === 'familiar') {
        console.log('Usuário Familiar detectado. Mostrando apenas Scanner...');
        // Oculta as opções de seleção
        document.querySelector('.content').style.display = 'none';
        // Oculta a seção de geração de QR Code
        document.getElementById('generateSection').style.display = 'none';
        // Ativa apenas a seção de scanner
        document.getElementById('scanSection').classList.add('active');
        document.getElementById('scanSection').style.display = 'block';
    }
});

// ===== SELEÇÃO DE ABAS / MODO =====
async function selectOption(option) {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => card.classList.remove('active'));

    if (option === 'scan') {
        if (cards[0]) cards[0].classList.add('active');
        document.getElementById('scanSection')?.classList.add('active');
        document.getElementById('generateSection')?.classList.remove('active');
        clearQRData();

        // Alterna para o Familiar (quem lê o código)
        console.log('Modo Scanner (Familiar) ativado');

    } else {
        if (cards[1]) cards[1].classList.add('active');
        document.getElementById('generateSection')?.classList.add('active');
        document.getElementById('scanSection')?.classList.remove('active');
        stopCamera();

        // Alterna para o Idoso (quem exibe o código)
        console.log('Modo QR Code (Idoso) ativado');

        // Recarrega o QR Code gerado para o idoso
        loadQRCodeFromBackend();
    }

    hideResultMessage();
}

// Funções de criação automática removidas para usar o formulário real.

// ===== CÂMERA E ESCANEAR QR CODE =====
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        video.onloadedmetadata = function () {
            video.play();
            isScanning = true;
            scanQRCode();
        };

        showResultMessage('Câmera iniciada. Aponte para o QR Code.', 'success');
    } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        showResultMessage('Erro ao acessar a câmera. Verifique as permissões.', 'error');
    }
}

function stopCamera() {
    isScanning = false;
    if (video && video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

function scanQRCode() {
    if (!isScanning) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
        });

        if (code) {
            console.log("QR Code detectado:", code.data);
            isScanning = false;

            let idosoId = code.data;

            try {
                // Tenta extrair dados caso venha formatado em JSON
                const dadosIdoso = JSON.parse(code.data);
                idosoId = dadosIdoso.id || code.data;

                if (dadosIdoso.nome) document.getElementById('infoNome').innerText = dadosIdoso.nome;
                if (dadosIdoso.idade) document.getElementById('infoIdade').innerText = dadosIdoso.idade;
                if (dadosIdoso.telefone) document.getElementById('infoTelefone').innerText = dadosIdoso.telefone;
                document.getElementById('dadosIdosoContainer').style.display = 'block';
            } catch (e) {
                console.log("Conteúdo do QR não é JSON simples. Buscando via API...");
                buscarInformacoesIdoso(idosoId);
            }

            document.getElementById('qrData').value = idosoId;
            showResultMessage('✓ QR Code detectado! Processando vínculo...', 'success');

            stopCamera();
            processQRCode();
            return;
        }
    }

    if (isScanning) {
        requestAnimationFrame(scanQRCode);
    }
}

async function buscarInformacoesIdoso(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/idosos/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Não foi possível obter dados do idoso.');

        const idoso = await response.json();
        if (idoso) {
            document.getElementById('infoNome').innerText = idoso.nome || '-';
            document.getElementById('infoIdade').innerText = idoso.idade || 'Não informada';
            document.getElementById('infoTelefone').innerText = idoso.telefone || 'Não informada';
            document.getElementById('dadosIdosoContainer').style.display = 'block';
        }
    } catch (error) {
        console.warn('Erro ao buscar dados adicionais do idoso:', error);
    }
}

function clearQRData() {
    document.getElementById('qrData').value = '';
    currentQRCode = null;
    const container = document.getElementById('dadosIdosoContainer');
    if (container) container.style.display = 'none';

    document.getElementById('infoNome').innerText = '-';
    document.getElementById('infoIdade').innerText = '-';
    document.getElementById('infoTelefone').innerText = '-';
    hideResultMessage();
}

// ===== PROCESSAMENTO DE VINCULAÇÃO =====
async function processQRCode() {
    const qrData = document.getElementById('qrData').value.trim();

    if (!qrData) {
        showResultMessage('Por favor, escaneie um QR Code primeiro.', 'error');
        return;
    }

    try {
        const currentUser = getFromLocalStorage('currentUser');

        if (!currentUser || !currentUser.id) {
            showResultMessage('Erro: Usuário (Familiar) não identificado. Faça login.', 'error');
            return;
        }

        // Se o seu backend espera a String crua no Body, envie com Content-Type text/plain ou formate como JSON
        const response = await fetch(
            `${API_BASE_URL}/api/vinculo/vincular-automatico?familiarId=${currentUser.id}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain', ...getAuthHeaders() },
                body: qrData
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result?.message || result?.error || `Erro HTTP: ${response.status}`);
        }

        showResultMessage(
    `✓ Vinculado com sucesso ao idoso ${result.nome || result.id || ''}`,
    'success'
);

    // Aguarda 2 segundos para mostrar a mensagem e redireciona
    setTimeout(() => {
        window.location.href = "../iniciofamiliar/iniciofamiliar.html";
    }, 2000);

    } catch (error) {
        console.error('Erro ao processar QR Code:', error);
        showResultMessage(`Erro ao processar a vinculação: ${error.message}`, 'error');
    }
}

let pollingInterval = null;

function iniciarPollingVinculo(userId) {
    if (pollingInterval) clearInterval(pollingInterval);
    
    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/idosos/${userId}`, {
                headers: getAuthHeaders()
            });
            if (!response.ok) return;
            
            const idosoData = await response.json();
            if (idosoData && idosoData.familiares && idosoData.familiares.length > 0) {
                console.log('Vínculo detectado via polling!', idosoData.familiares);
                clearInterval(pollingInterval);
                
                showResultMessage('✓ Vinculação realizada com sucesso! Redirecionando...', 'success');
                
                setTimeout(() => {
                    window.location.href = '../inicioidoso/inicioidoso.html';
                }, 1500);
            }
        } catch (err) {
            console.log('Erro no polling de vínculo:', err);
        }
    }, 3000);
}

// ===== CARREGAR E EXIBIR QR CODE DO BACKEND =====
async function loadQRCodeFromBackend() {
    try {
        const currentUser = getFromLocalStorage('currentUser');

        if (!currentUser || !currentUser.id) {
            showResultMessage('Erro: Usuário (Idoso) não identificado.', 'error');
            document.getElementById('qrPreview').innerHTML = '<p style="color:red;">Usuário não encontrado</p>';
            return;
        }

        const qrCodeUrl = `${API_BASE_URL}/api/vinculo/qrcode/${currentUser.id}`;

        // Uma tag <img src="..."> não consegue enviar o cabeçalho de
        // autenticação, então buscamos a imagem via fetch (com o token) e
        // convertemos a resposta num link temporário que o <img> pode usar.
        const response = await fetch(qrCodeUrl, { headers: getAuthHeaders() });
        if (!response.ok) {
            throw new Error(`QR Code não encontrado. Status: ${response.status}`);
        }

        const imagemBlob = await response.blob();
        const imagemUrl = URL.createObjectURL(imagemBlob);

        document.getElementById('qrPreview').innerHTML = `
        <img
            src="${imagemUrl}"
            alt="QR Code"
            style="max-width:250px; height:auto; border:5px solid white; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);"
        />`;

    showResultMessage('✓ QR Code carregado com sucesso! Aguardando vínculo...', 'success');
    iniciarPollingVinculo(currentUser.id);

    } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
        showResultMessage(`Erro ao carregar QR Code: ${error.message}`, 'error');
        document.getElementById('qrPreview').innerHTML = '<p style="color:red;">Erro ao carregar QR Code</p>';
    }
}

function refreshQRCode() {
    document.getElementById('qrPreview').innerHTML = 'Carregando seu código QR...';
    loadQRCodeFromBackend();
}

function downloadQRCode() {
    const qrElement = document.querySelector('#qrPreview img');
    if (!qrElement) {
        showResultMessage('QR Code não encontrado.', 'error');
        return;
    }

    const link = document.createElement('a');
    link.href = qrElement.src;
    link.download = `qrcode_zelo_${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printQRCode() {
    const qrElement = document.querySelector('#qrPreview img');
    if (!qrElement) return;

    const printWindow = window.open('', '', 'height=600,width=600');
    printWindow.document.write('<html><head><title>Imprimir QR Code - ZELO</title></head><body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">');
    printWindow.document.write('<h2>Seu Código QR de Vinculação</h2>');
    printWindow.document.write('<img src="' + qrElement.src + '" style="max-width: 400px;"/>');
    printWindow.document.write('<p>Escaneie para vincular ao perfil no app ZELO</p>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
}

// ===== UTILS =====
function showResultMessage(message, type) {
    const messageElement = document.getElementById('resultMessage');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `result-message ${type}`;
        messageElement.style.display = 'block';
    }
}

function hideResultMessage() {
    const messageElement = document.getElementById('resultMessage');
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}

window.addEventListener('beforeunload', function () {
    stopCamera();
    if (pollingInterval) clearInterval(pollingInterval);
});