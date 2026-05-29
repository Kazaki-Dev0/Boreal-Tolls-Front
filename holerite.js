// Configuração das rotas da API do Servidor C#
const API_FUNCIONARIOS = "http://localhost:5187/api/Funcionarios";
const API_PERFIL_URL = "http://localhost:5187/api/Usuarios/Perfil";
// Endpoint fictício para salvar o holerite gerado (ajuste caso mude no backend)
const API_FINANCEIRO_FOLHA = "http://localhost:5187/api/Financeiro/Lancamentos"; 

// Armazenamento em memória dos dados dos funcionários para troca rápida no select
let listaFuncionariosCache = [];

document.addEventListener("DOMContentLoaded", () => {
    atualizarDadosUsuario();
    buscarFuncionariosDaAPI();
    configurarEventosCalculo();
    configurarBotaoLancamento();
});

// Busca a lista de funcionários do banco para alimentar o elemento Select da página
async function buscarFuncionariosDaAPI() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const selectElement = document.getElementById("funcionario");

    try {
        const response = await fetch(API_FUNCIONARIOS, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erro ao coletar lista de funcionários.");

        listaFuncionariosCache = await response.json();
        
        selectElement.innerHTML = `<option value="">-- Selecione um Funcionário --</option>`;
        listaFuncionariosCache.forEach(func => {
            selectElement.innerHTML += `<option value="${func.id}">${func.nome} (${func.cargo})</option>`;
        });

        // Evento que auto-preenche o salário base ao mudar a opção do funcionário
        selectElement.addEventListener("change", (e) => {
            const funcionarioSelecionado = listaFuncionariosCache.find(f => f.id == e.target.value);
            if (funcionarioSelecionado) {
                document.getElementById("salario").value = funcionarioSelecionado.salario;
            } else {
                document.getElementById("salario").value = "";
            }
            calcularValoresFolha();
        });

    } catch (erro) {
        console.error(erro);
        selectElement.innerHTML = `<option value="">Erro ao carregar colaboradores</option>`;
    }
}

// Vincula o gatilho de cálculo a qualquer alteração de dígitos em todos os campos numéricos
function configurarEventosCalculo() {
    const camposInputs = ["salario", "adicionais", "inss", "irrf", "beneficios", "faltas"];
    camposInputs.forEach(id => {
        document.getElementById(id).addEventListener("input", calcularValoresFolha);
    });
}

// Executa a matemática financeira da folha e atualiza o resumo visual na tabela
function calcularValoresFolha() {
    // Auxiliar interno para converter texto vazio ou nulo em zero flutuante seguro
    const obterValor = (id) => parseFloat(document.getElementById(id).value) || 0;

    const salarioBase = obterValor("salario");
    const adicionais  = obterValor("adicionais");
    const inss        = obterValor("inss");
    const irrf        = obterValor("irrf");
    const beneficios  = obterValor("beneficios");
    const faltas      = obterValor("faltas");

    // Processamento matemático simples
    const totalProventos = salarioBase + adicionais;
    const totalDescontos = inss + irrf + beneficios + faltas;
    const totalLiquido   = totalProventos - totalDescontos;

    // Renderização com máscara monetária brasileira nos elementos correspondentes
    document.getElementById("totalProventos").innerText = totalProventos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    document.getElementById("totalDesconto").innerText  = `- ${totalDescontos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    document.getElementById("totalLiquido").innerText   = totalLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Submete o holerite gerado como uma despesa na API do sistema corporativo
function configurarBotaoLancamento() {
    const botao = document.getElementById("btn-lançar");

    botao.addEventListener("click", async () => {
        const idFuncionario = document.getElementById("funcionario").value;
        if (!idFuncionario) {
            alert("Selecione primeiramente um funcionário antes de lançar o holerite.");
            return;
        }

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const obterValor = (id) => parseFloat(document.getElementById(id).value) || 0;

        const dadosFolha = {
            funcionarioId: parseInt(idFuncionario),
            salarioBase: obterValor("salario"),
            adicionais: obterValor("adicionais"),
            inss: obterValor("inss"),
            irrf: obterValor("irrf"),
            beneficios: obterValor("beneficios"),
            faltas: obterValor("faltas"),
            dataLancamento: new Date().toISOString()
        };

        try {
            // Exemplo de integração POST para registrar o lançamento financeiro
            alert(`Sucesso! Lançamento processado em memória.\nTotal Líquido: ${document.getElementById("totalLiquido").innerText}`);
            console.log("Payload enviado:", dadosFolha);
            
            /* Descomente o trecho abaixo quando a rota correspondente de destino estiver totalmente ativa no C#:
            const response = await fetch(API_FINANCEIRO_FOLHA, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(dadosFolha)
            });
            if(response.ok) { alert("Lançado no Contas a Pagar do Financeiro!"); }
            */

        } catch (erro) {
            console.error("Falha ao comunicar lançamento:", erro);
        }
    });
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

    const nomeArmazenado = localStorage.getItem("usuarioNome") || localStorage.getItem("username");
    if (nomeArmazenado) {
        document.getElementById("nomeUsuarioSidebar").innerText = nomeArmazenado;
        return;
    }

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
            localStorage.setItem("usuarioNome", nomeFinal);
            return;
        }
    } catch (erro) {
        console.warn("Recorrendo ao plano alternativo (Decodificação JWT)...");
    }

    const payload = parseJwt(token);
    if (payload) {
        document.getElementById("nomeUsuarioSidebar").innerText = 
            payload["unique_name"] || payload["name"] || "Usuário Boreal";
    } else {
        document.getElementById("nomeUsuarioSidebar").innerText = "Usuário Autenticado";
    }
}

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

function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./login.html");
}