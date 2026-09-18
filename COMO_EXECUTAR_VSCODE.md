# Executar o frontend no VS Code

O backend Spring Boot deve estar executando separadamente no IntelliJ em:

```text
http://localhost:8080
```

No VS Code, abra esta pasta `Idosos` e instale a extensão **Live Server**. Depois, clique com o botão direito em `paginainicial/paginainicial.html` e selecione **Open with Live Server**.

Não abra o arquivo diretamente com `file://`. O servidor local evita bloqueios do navegador e permite que o assistente faça chamadas para o backend.

O frontend já está configurado para usar:

```javascript
const API_BASE_URL = 'http://localhost:8080';
```

O assistente usa os endpoints:

```text
GET  http://localhost:8080/assistente/status
POST http://localhost:8080/assistente/conversar
```

## Ordem de inicialização

Primeiro, inicie o backend no IntelliJ com a variável de ambiente `ASSISTENTE_IA_CHAVE` configurada. Depois, abra a página `paginainicial/paginainicial.html` com o Live Server no VS Code e clique em **Falar com Zelo**.

Se o status indicar modo acolhedor, o backend está funcionando, mas a chave Groq não foi configurada. Se o navegador mostrar erro de conexão, confirme se o Spring Boot está em `localhost:8080` e se a porta não está sendo usada por outro programa.
