// Configurações das URLs da API do servidor Backend C#
const API_URL = "https://time7-api.azurewebsites.net/api";
const API_PERFIL_URL = "https://time7-api.azurewebsites.net/api/Usuarios/Perfil"; 

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
    atualizarDadosUsuario(); // Invoca a validação e exibição do usuário logado
});

// Configuração do evento 'input' para filtragem ágil em memória
function configurarMecanismoBusca() {
    if (inputSearch) {
        inputSearch.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase();
            const filtrados = funcionariosControle.filter(f => 
                f.nome.toLowerCase().includes(termo) || 
                f.cargo.toLowerCase().includes(termo)
            );
            renderizarCards(filtrados);
        });
    }
}

// Requisição HTTP GET: Busca a lista geral de funcionários cadastrados
async function carregarFuncionarios() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    try {
        const response = await fetch(`${API_URL}/Funcionarios`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            if (employeeGrid) employeeGrid.innerHTML = `<p style="color: #e57373;">Acesso não autorizado. Por favor, refaça o login.</p>`;
            return;
        }

        if (!response.ok) throw new Error("Erro ao carregar funcionários da base de dados.");

        funcionariosControle = await response.json();
        renderizarCards(funcionariosControle);

    } catch (erro) {
        console.error(erro);
        if (employeeGrid) employeeGrid.innerHTML = `<p style="color: #e57373;">Falha de comunicação com a API. Verifique se o serviço C# está rodando.</p>`;
    }
}

// Reconstrói e exibe a listagem visual dos cards de funcionários
function renderizarCards(lista) {
    if (!employeeGrid) return;

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
        const response = await fetch(`${API_URL}/Funcionarios/${id}`, {
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

        if (modalOverlay) modalOverlay.style.display = "flex";

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar os dados específicos deste funcionário.");
    }
}

function fecharModal() {
    if (modalOverlay) modalOverlay.style.display = "none";
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
   MÓDULO DE IDENTIFICAÇÃO DE USUÁRIO LOGADO (LÓGICA IGUAL AO DASHBOARD)
======================================================================== */
function atualizarDadosUsuario() {
    let token = null;
    
    try {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch (e) {
        console.warn("Acesso ao storage bloqueado.");
    }
    
    const nomeElement = document.getElementById('user-name');
    if (!nomeElement) return; // Proteção caso o elemento mude de ID no HTML

    if (!token) {
        nomeElement.textContent = "Usuário não logado";
        window.location.replace("./login.html");
        return;
    }

    const payloadJson = parseJwt(token);

    if (payloadJson) {
        const nomeUsuario = payloadJson["unique_name"] || 
                            payloadJson["name"] || 
                            payloadJson["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || 
                            "Usuário Boreal";
        
        nomeElement.textContent = nomeUsuario;
    } else {
        nomeElement.textContent = "Erro de Sessão";
    }
}

// Auxiliar utilitário para decodificar base64 do JWT localmente
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Falha ao decodificar token:", e);
        return null;
    }
}

// Limpa as credenciais de sessão e redireciona para a tela de autenticação
function efectuarLogout() {
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) {
        console.error("Erro ao efetuar limpeza:", e);
    }
    window.location.replace("./index.html");
}