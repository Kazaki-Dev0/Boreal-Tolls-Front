const API_URL = "http://localhost:5187/api/Funcionarios";

async function carregarFuncionarios() {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(API_URL, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {

            throw new Error("Erro ao carregar funcionários");
        }

        const funcionarios = await response.json();

        const grid =
            document.querySelector(".employee-grid");

        grid.innerHTML = "";

        funcionarios.forEach(funcionario => {

            grid.innerHTML += `

                <div class="employee-card">

                    <div class="employee-top">

                        <div class="employee-info">

                            <div class="employee-photo"></div>

                            <div class="employee-name">

                                <h4>${funcionario.nome}</h4>

                                <p>${funcionario.cargo}</p>

                            </div>

                        </div>

                        <div class="employee-id">

                            ID: ${funcionario.id}

                        </div>

                    </div>

                    <table class="employee-table">

                        <tr>
                            <td>Salário Base</td>

                            <td>
                                R$ ${Number(
                                    funcionario.salario
                                ).toLocaleString(
                                    "pt-BR",
                                    {
                                        minimumFractionDigits:2
                                    }
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Departamento</td>

                            <td>
                                ${funcionario.departamento}
                            </td>
                        </tr>

                    </table>

<div class="card-actions">

    <button
        type="button"
        class="btn-detalhes"
        onclick="abrirDetalhes(${funcionario.id})">

        Ver detalhes

    </button>

    <button
        type="button"
        class="btn-delete"
        onclick="deletarFuncionario(${funcionario.id})">

        <i class="fa-solid fa-trash"></i>

    </button>

</div>
            `;
        });

    } catch (erro) {

        console.error(erro);
    }
}

async function abrirDetalhes(id) {

    const token = localStorage.getItem("token");

    try {

        const response =
            await fetch(`${API_URL}/${id}`, {

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        if (!response.ok) {

            throw new Error(
                "Erro ao carregar detalhes"
            );
        }

        const funcionario =
            await response.json();

        document.getElementById(
            "modalContent"
        ).innerHTML = `

            <div class="info-box">
                <strong>Nome</strong>
                ${funcionario.nome}
            </div>

            <div class="info-box">
                <strong>Cargo</strong>
                ${funcionario.cargo}
            </div>

            <div class="info-box">
                <strong>Departamento</strong>
                ${funcionario.departamento}
            </div>

            <div class="info-box">
                <strong>Salário</strong>
                R$ ${Number(
                    funcionario.salario
                ).toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits:2
                    }
                )}
            </div>

            <div class="info-box">
                <strong>Email</strong>
                ${funcionario.email}
            </div>

            <div class="info-box">
                <strong>Telefone</strong>
                ${funcionario.telefone}
            </div>

            <div class="info-box">
                <strong>CPF</strong>
                ${funcionario.cpf}
            </div>

            <div class="info-box">
                <strong>RG</strong>
                ${funcionario.rg}
            </div>

            <div class="info-box">
                <strong>Cidade</strong>
                ${funcionario.cidade}
            </div>

            <div class="info-box">
                <strong>Estado</strong>
                ${funcionario.estado}
            </div>
        `;

        document.getElementById(
            "modalOverlay"
        ).style.display = "flex";

    } catch (erro) {

        console.error(erro);
    }
}

function fecharModal() {

    document.getElementById(
        "modalOverlay"
    ).style.display = "none";
}

async function deletarFuncionario(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este funcionário?"
    );

    if (!confirmar) return;

    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    try {

        const response =
            await fetch(`${API_URL}/${id}`, {

                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

        console.log("STATUS:", response.status);

        if (!response.ok) {

            const erro = await response.text();

            console.error("ERRO API:", erro);

            alert(`
STATUS: ${response.status}

ERRO:
${erro}
            `);

            return;
        }

        alert("Funcionário deletado com sucesso!");

        carregarFuncionarios();

    } catch (erro) {

        console.error("ERRO GERAL:", erro);

        alert("Erro geral ao deletar.");
    }
}


carregarFuncionarios();