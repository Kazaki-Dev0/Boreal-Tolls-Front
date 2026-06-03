// Configurações das URLs da API do servidor Backend C#
const API_URL = "https://api-time7.azurewebsites.net/api/Funcionarios";
const API_PERFIL_URL = "https://api-time7.azurewebsites.net/api/Usuarios/Perfil"; // Altere se o endpoint de perfil for diferente

// Lista global usada para o mecanismo de busca instantânea
let funcionariosControle = [];

// Seletores globais de elementos do DOM
const employeeGrid = document.getElementById('employee-grid');
const inputSearch = document.getElementById('input-search');
const modalOverlay = document.getElementById('modalOverlay');

// Executado assim que o documento HTML termina de ser carregado
document.addEventListener('DOMContentLoaded', () => {
    carregarFuncionarios();
    configurarMecanismoBusca();
    atualizarDadosUsuario();
});

// Configuração do evento 'input' para filtragem ágil em memória
function configurarMecanismoBusca() {
    inputSearch.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = funcionariosControle.filter(f => 
            f.nome.toLowerCase().includes(termo) || 
            f.cargo.toLowerCase().includes(termo)
        );
        renderizarCards(filtrados);
    });
}

// Requisição HTTP GET: Busca a lista geral de funcionários cadastrados
async function carregarFuncionarios() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            employeeGrid.innerHTML = `<p style="color: #e57373;">Acesso não autorizado. Por favor, refaça o login.</p>`;
            return;
        }

        if (!response.ok) throw new Error("Erro ao carregar funcionários da base de dados.");

        funcionariosControle = await response.json();
        renderizarCards(funcionariosControle);

    } catch (erro) {
        console.error(erro);
        employeeGrid.innerHTML = `<p style="color: #e57373;">Falha de comunicação com a API. Verifique se o serviço C# está rodando.</p>`;
    }
}

// Reconstrói e exibe a listagem visual dos cards de funcionários
function renderizarCards(lista) {
    if (lista.length === 0) {
        employeeGrid.innerHTML = `<p style="color: #aaa;">Nenhum funcionário encontrado.</p>`;
        return;
    }

    employeeGrid.innerHTML = "";

    lista.forEach(funcionario => {
        const salarioFormatado = Number(funcionario.salario).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        employeeGrid.innerHTML += `
            <div class="employee-card">
                <div>
                    <div class="employee-top">
                        <div class="employee-info">
                            <div class="employee-photo">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div class="employee-name">
                                <h4>${funcionario.nome}</h4>
                                <p>${funcionario.cargo}</p>
                            </div>
                        </div>
                        <div class="employee-id">ID: ${funcionario.id}</div>
                    </div>

                    <table class="employee-table">
                        <tr>
                            <td>Departamento</td>
                            <td>${funcionario.departamento || 'Não Cadastrado'}</td>
                        </tr>
                        <tr>
                            <td>Salário Base</td>
                            <td>${salarioFormatado}</td>
                        </tr>
                    </table>
                </div>

                <div class="card-actions">
                    <button type="button" class="btn-detalhes" onclick="abrirDetalhes(${funcionario.id})">
                        Ver detalhes
                    </button>
                    <button type="button" class="btn-delete" onclick="deletarFuncionario(${funcionario.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

// Requisição HTTP GET Individual: Preenche e abre o modal detalhado do funcionário
async function abrirDetalhes(id) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar os detalhes do registro escolhido.");

        const funcionario = await response.json();
        document.getElementById('modal-emp-name').innerText = funcionario.nome;
        
        const salarioFormatado = Number(funcionario.salario).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        const dataNascFormatada = funcionario.dataNascimento ? new Date(funcionario.dataNascimento).toLocaleDateString('pt-BR') : '---';

        document.getElementById("modalContent").innerHTML = `
            <div class="info-box"><strong>Cargo</strong>${funcionario.cargo || '---'}</div>
            <div class="info-box"><strong>Departamento</strong>${funcionario.departamento || '---'}</div>
            <div class="info-box"><strong>Salário Base</strong><span style="color:#7bcf9c; font-weight:600;">${salarioFormatado}</span></div>
            <div class="info-box"><strong>Data Nasc.</strong>${dataNascFormatada}</div>
            <div class="info-box"><strong>CPF</strong>${funcionario.cpf || '---'}</div>
            <div class="info-box"><strong>RG</strong>${funcionario.rg || '---'}</div>
            <div class="info-box"><strong>Telefone</strong>${funcionario.telefone || '---'}</div>
            <div class="info-box"><strong>Email de contato</strong>${funcionario.email || '---'}</div>
            <div class="info-box"><strong>Cidade / Estado</strong>${funcionario.cidade || '---'} - ${funcionario.estado || '--'}</div>
            <div class="info-box" style="grid-column: span 2;"><strong>Endereço Cadastrado</strong>${funcionario.rua || '---'}, ${funcionario.bairro || '---'}</div>
        `;

        modalOverlay.style.display = "flex";

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar os dados específicos deste funcionário.");
    }
}

function fecharModal() {
    modalOverlay.style.display = "none";
}

// Fecha o modal caso o usuário dê um clique fora do quadro de conteúdo
window.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
});

// Requisição HTTP DELETE: Remove o funcionário fisicamente da base de dados do sistema
async function deletarFuncionario(id) {
    const confirmar = confirm("Deseja realmente remover permanentemente este funcionário do quadro da empresa?");
    if (!confirmar) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const erroTexto = await response.text();
            alert(`Erro na exclusão (${response.status}): ${erroTexto}`);
            return;
        }

        alert("Funcionário deletado com sucesso!");
        carregarFuncionarios();

    } catch (erro) {
        console.error(erro);
        alert("Houve um erro interno de rede ao tentar deletar o registro.");
    }
}

/* ========================================================================
   MÓDULO DE IDENTIFICAÇÃO DE USUÁRIO LOGADO (API / LOCAL STORAGE / JWT)
======================================================================== */
async function atualizarDadosUsuario() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
        efetuarLogout();
        return;
    }

    // Estratégia 1: Verifica se o nome já reside de prontidão no Storage do navegador
    const nomeArmazenado = localStorage.getItem("usuarioNome") || localStorage.getItem("username");
    if (nomeArmazenado) {
        document.getElementById("nomeUsuarioSidebar").innerText = nomeArmazenado;
        return;
    }

    // Estratégia 2: Caso não encontre no storage, solicita os dados reais ao Endpoint do Perfil na API
    try {
        const response = await fetch(API_PERFIL_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            const dadosUsuario = await response.json();
            const nomeFinal = dadosUsuario.nome || dadosUsuario.username;
            document.getElementById("nomeUsuarioSidebar").innerText = nomeFinal;
            
            // Grava no storage para poupar o servidor de requisições redundantes nas próximas páginas
            localStorage.setItem("usuarioNome", nomeFinal);
            return;
        }
    } catch (erro) {
        console.warn("Rota de perfil inacessível. Recorrendo ao plano alternativo (Decodificação JWT)...", erro);
    }

    // Estratégia 3: Fallback por decodificação local dos Claims do Token JWT
    const payload = parseJwt(token);
    if (payload) {
        document.getElementById("nomeUsuarioSidebar").innerText = 
            payload["unique_name"] || payload["name"] || "Usuário Boreal";
    } else {
        document.getElementById("nomeUsuarioSidebar").innerText = "Usuário Atenticado";
    }
}

// Auxiliar utilitário para decodificar base64 do JWT localmente
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(window.atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')));
    } catch (e) {
        return null;
    }
}

// Limpa as credenciais de sessão e redireciona para a tela de autenticação
function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./login.html");
}