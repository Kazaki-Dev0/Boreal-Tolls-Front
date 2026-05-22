const API_URL = "http://localhost:5187/api/Funcionarios";

async function carregarFuncionarios() {

    const token = localStorage.getItem("token");

    console.log("TOKEN:", token);

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {

            const erro = await response.text();

            console.error("Status:", response.status);
            console.error("Resposta:", erro);

            throw new Error(`Erro ${response.status}`);
        }

        const funcionarios = await response.json();

        const grid = document.querySelector(".employee-grid");

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
                                R$ ${Number(funcionario.salario).toLocaleString(
                                    "pt-BR",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )}
                            </td>
                        </tr>

                        <tr>
                            <td>Departamento</td>
                            <td>${funcionario.departamento}</td>
                        </tr>

                    </table>

                </div>
            `;
        });

    } catch (erro) {

        console.error("Erro:", erro);

        document.querySelector(".employee-grid").innerHTML = `
            <p style="color:red;">
                Erro ao carregar funcionários.
            </p>
        `;
    }
}

carregarFuncionarios();
