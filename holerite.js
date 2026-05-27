const API_FUNCIONARIOS =
    "http://localhost:5187/api/Funcionarios";

const API_FOLHA =
    "http://localhost:5187/api/FolhaPagamentos";

const API_FINANCEIRO =
    "http://localhost:5187/api/Financeiro";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {

    carregarFuncionarios();

    document
        .getElementById("btn-holerite")
        .addEventListener("click", lancarFolhaPagamento);
});

async function carregarFuncionarios() {

    try {

        const resposta = await fetch(API_FUNCIONARIOS, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const funcionarios = await resposta.json();

        const select =
            document.getElementById("funcionario");

        select.innerHTML =
            '<option value="">Selecione...</option>';

        funcionarios.forEach(funcionario => {

            select.innerHTML += `
                <option value="${funcionario.id}">
                    ${funcionario.nome}
                </option>
            `;
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar funcionários:",
            erro
        );
    }
}

async function lancarFolhaPagamento() {

    try {

        const funcionarioSelect =
            document.getElementById("funcionario");

        const funcionarioId =
            parseInt(funcionarioSelect.value);

        if (!funcionarioId) {

            alert("Selecione um funcionário.");
            return;
        }

        const nomeFuncionario =
            funcionarioSelect.options[
                funcionarioSelect.selectedIndex
            ].text;

        const salario =
            parseFloat(
                document.getElementById("salario").value
            ) || 0;

        const adicionais =
            parseFloat(
                document.getElementById("adicionais").value
            ) || 0;

        const inss =
            parseFloat(
                document.getElementById("inss").value
            ) || 0;

        const irrf =
            parseFloat(
                document.getElementById("irrf").value
            ) || 0;

        const beneficios =
            parseFloat(
                document.getElementById("beneficios").value
            ) || 0;

        const faltas =
            parseFloat(
                document.getElementById("faltas").value
            ) || 0;

        const totalProventos =
            salario + adicionais;

        const totalDescontos =
            inss +
            irrf +
            beneficios +
            faltas;

        const valorLiquido =
            totalProventos -
            totalDescontos;

        // ==================================
        // SALVAR FOLHA DE PAGAMENTO
        // ==================================

        const folha = {

            salario: salario,
            adicionais: adicionais,
            inss: inss,
            irrf: irrf,
            beneficiosVtVr: beneficios,
            faltas: faltas,
            funcionarioId: funcionarioId
        };

        const respostaFolha =
            await fetch(API_FOLHA, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(folha)
            });

        if (!respostaFolha.ok) {

            throw new Error(
                "Erro ao salvar folha de pagamento."
            );
        }

        // ==================================
        // LANÇAR NO FINANCEIRO
        // ==================================

        const financeiro = {

            pedidoId: 0,

            tipo: "Saída",

            valor: valorLiquido,

            dataVencimento:
                new Date().toISOString(),

            dataPagamento: null,

            status: "Pendente",

            descricao:
                `Folha de Pagamento - ${nomeFuncionario}`,

            produtoId: null,

            quantidadeMovimentacao: 0
        };

        const respostaFinanceiro =
            await fetch(API_FINANCEIRO, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(financeiro)
            });

        if (!respostaFinanceiro.ok) {

            const erro =
                await respostaFinanceiro.text();

            throw new Error(erro);
        }

        alert(
            "Folha criada e despesa lançada no financeiro com sucesso!"
        );

    } catch (erro) {

        console.error("ERRO COMPLETO:", erro);
    
        alert(
            "Erro ao lançar folha:\n\n" +
            erro.message
        );
    }
}