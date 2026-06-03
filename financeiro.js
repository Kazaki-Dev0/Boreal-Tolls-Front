const API_URL = "http://localhost:5187/api/Financeiro";

/* =========================================================
   TOKEN
========================================================= */
function obterToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/* =========================================================
   SALVAR NOVO LANÇAMENTO
========================================================= */
async function salvarDadosFormulario(event) {
    event.preventDefault();

    const token = obterToken();

    if (!token) {
        alert("Usuário não autenticado.");
        window.location.href = "./login.html";
        return;
    }

    try {

        const tipoSelecionado =
            document.getElementById("tipo-transacao").value;

        const dataEfetiva =
            document.querySelector('input[name="data_efetiva"]').value;

        const efetivadoAgora =
            document.querySelector('input[name="efetivado_agora"]').checked;

        const dataVencimento =
            document.querySelector('input[name="data_vencimento"]').value;

        const valor =
            parseFloat(document.querySelector('input[name="valor"]').value);

        const descricao =
            document.querySelector('textarea[name="descricao"]').value;

        /* =====================================================
           MONTA STATUS
        ===================================================== */
        let status = "Pendente";

        if (efetivadoAgora || dataEfetiva) {
            status = "Pago";
        }

        /* =====================================================
           CONVERTE TIPO
        ===================================================== */
        let tipo = "Receber";

        if (tipoSelecionado === "pagamento") {
            tipo = "Pagar";
        }

        /* =====================================================
           OBJETO DTO
        ===================================================== */
        const financeiroDTO = {
            pedidoId: 0,
            tipo: tipo,
            valor: valor,
            dataVencimento: dataVencimento,
            dataPagamento: dataEfetiva || null,
            status: status,
            descricao: descricao
        };

        console.log(financeiroDTO);

        /* =====================================================
           ENVIO API
        ===================================================== */
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(financeiroDTO)
        });

        if (!response.ok) {

            const erro = await response.text();

            console.error(erro);

            throw new Error("Erro ao salvar lançamento.");
        }

        alert("Lançamento salvo com sucesso!");

        window.location.href = "./financeiro.html";

    } catch (error) {

        console.error(error);

        alert("Erro ao salvar lançamento.");
    }
}

/* =========================================================
   CARREGAR FINANCEIRO
========================================================= */
async function carregarFinanceiro() {

    const tabela = document.getElementById("listaFinanceira");

    if (!tabela) return;

    const token = obterToken();

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar financeiro");
        }

        const dados = await response.json();

        tabela.innerHTML = "";

        dados.forEach(item => {

            const data = new Date(item.dataVencimento)
                .toLocaleDateString("pt-BR");

            const valorFormatado =
                Number(item.valor)
                .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });

            const badgeTipo =
                item.tipo === "Receber"
                    ? `<span class="badge badge-entrada">Entrada</span>`
                    : `<span class="badge badge-saida">Saída</span>`;

            const classeValor =
                item.tipo === "Receber"
                    ? "value-entrada"
                    : "value-saida";

            const sinal =
                item.tipo === "Receber"
                    ? "+"
                    : "-";

            let corStatus = "#81c784";

            if (item.status === "Pendente") {
                corStatus = "#e5a93c";
            }

            if (item.status === "Atrasado") {
                corStatus = "#ff6b6b";
            }

            tabela.innerHTML += `
                <tr>
                    <td>${data}</td>

                    <td>${badgeTipo}</td>

                    <td style="color:white; font-weight:500;">
                        ${item.descricao}
                    </td>

                    <td>
                        <span style="color:${corStatus}">
                            ${item.status}
                        </span>
                    </td>

                    <td class="${classeValor}">
                        ${sinal} ${valorFormatado}
                    </td>
                </tr>
            `;
        });

    } catch (error) {

        console.error(error);

        alert("Erro ao carregar financeiro.");
    }
}

/* =========================================================
   PESQUISA
========================================================= */
function configurarPesquisaFinanceira() {

    const inputPesquisa =
        document.getElementById("txtPesquisaFinanceira");

    if (!inputPesquisa) return;

    inputPesquisa.addEventListener("keyup", () => {

        const filtro =
            inputPesquisa.value.toLowerCase();

        const linhas =
            document.querySelectorAll("#listaFinanceira tr");

        linhas.forEach(linha => {

            const texto =
                linha.innerText.toLowerCase();

            linha.style.display =
                texto.includes(filtro)
                    ? ""
                    : "none";
        });
    });
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */
document.addEventListener("DOMContentLoaded", () => {

    carregarFinanceiro();

    configurarPesquisaFinanceira();
});