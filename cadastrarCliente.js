const formCliente = document.getElementById("clienteForm");
const apiURL = "http://localhost:5187/api/Clientes";
const API_PERFIL_URL = "http://localhost:5187/api/Usuarios/Perfil";

document.addEventListener("DOMContentLoaded", () => {
    atualizarDadosUsuario();
});

// CADASTRAR CLIENTE / FORNECEDOR
async function cadastrarCliente(event) {
    event.preventDefault();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const cliente = {
        tipo: document.getElementById("tipo").value,
        nome: document.getElementById("Nome").value,
        cpf: document.getElementById("CPF").value,
        telefone: document.getElementById("Telefone").value,
        email: document.getElementById("Email").value,
        dataNascimento: document.getElementById("DataNascimento").value || null, // Evita strings vazias na API para datas
        cep: document.getElementById("CEP").value,
        cidade: document.getElementById("Cidade").value,
        rua: document.getElementById("Rua").value,
        bairro: document.getElementById("Bairro").value,
        numero: document.getElementById("Número").value,
        estado: document.getElementById("Estado").value,
        complemento: document.getElementById("Complemento").value
    };

    try {
        const resposta = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(cliente)
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(erroTexto || "Erro interno ao cadastrar registro.");
        }

        alert("Registro cadastrado com sucesso!");
        formCliente.reset();
        
        // Redireciona de volta para o painel de listagem em grid
        window.location.href = "ClienteFornecedor.html";

    } catch (error) {
        console.error("Erro na operação:", error);
        alert(error.message || "Erro ao efetuar o cadastro. Verifique os dados.");
    }
}

// EVENTO DO FORMULÁRIO
formCliente.addEventListener("submit", cadastrarCliente);

// ATUALIZAR NOME DO PERFIL NA SIDEBAR
async function atualizarDadosUsuario() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) { efetuarLogout(); return; }

    const nomeArmazenado = localStorage.getItem("usuarioNome") || localStorage.getItem("username");
    if (nomeArmazenado) {
        document.getElementById("nomeUsuarioSidebar").innerText = nomeArmazenado;
        return;
    }

    try {
        const response = await fetch(API_PERFIL_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        });
        if (response.ok) {
            const dados = await response.json();
            const nomeFinal = dados.nome || dados.username;
            document.getElementById("nomeUsuarioSidebar").innerText = nomeFinal;
            localStorage.setItem("usuarioNome", nomeFinal);
        }
    } catch (e) {
        document.getElementById("nomeUsuarioSidebar").innerText = "Usuário Autenticado";
    }
}

function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./login.html");
}