const formCliente = document.getElementById("clienteForm");
const apiURL = "http://localhost:5187/api/Clientes";

// CADASTRAR CLIENTE
async function cadastrarCliente(event) {
    event.preventDefault();

    const cliente = {
        nome: document.getElementById("Nome").value,
        cpf: document.getElementById("CPF").value,
        telefone: document.getElementById("Telefone").value,
        email: document.getElementById("Email").value,
        dataNascimento: document.getElementById("DataNascimento").value,
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cliente)
        });

        console.log("Resposta da API:", resposta);

        if (!resposta.ok) {
            const erro = await resposta.text();
            throw new Error(erro || "Erro ao cadastrar cliente.");
        }

        const dados = await resposta.json();

        console.log("Cliente cadastrado com sucesso:", dados);

        alert("Cliente cadastrado com sucesso!");

        formCliente.reset();

        // Atualiza a lista após cadastrar
        await buscarClientes();

    } catch (error) {
        console.error("Erro ao cadastrar cliente:", error);
        alert("Erro ao cadastrar cliente.");
    }
}

// LISTAR CLIENTES
async function buscarClientes() {
    try {
        const resposta = await fetch(apiURL);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar clientes.");
        }

        const clientes = await resposta.json();

        console.log("Clientes encontrados:", clientes);

        const tabela = document.getElementById("listaClientes");

        if (!tabela) return;

        tabela.innerHTML = "";

        clientes.forEach(cliente => {
            tabela.innerHTML += `
                <tr>
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.email}</td>
                    <td>
                        <button onclick="verDetalhes(${cliente.id})">
                            Ver Detalhes
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Erro ao buscar clientes:", error);
    }
}

// VER DETALHES
async function verDetalhes(id) {
    try {
        const resposta = await fetch(`${apiURL}/${id}`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar detalhes do cliente.");
        }

        const cliente = await resposta.json();

        alert(`
Nome: ${cliente.nome}
CPF: ${cliente.cpf}
Telefone: ${cliente.telefone}
Email: ${cliente.email}
Data Nascimento: ${cliente.dataNascimento}
CEP: ${cliente.cep}
Cidade: ${cliente.cidade}
Rua: ${cliente.rua}
Bairro: ${cliente.bairro}
Número: ${cliente.numero}
Estado: ${cliente.estado}
Complemento: ${cliente.complemento}
        `);

    } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        alert("Erro ao carregar os detalhes.");
    }
}

// EVENTO DO FORMULÁRIO
formCliente.addEventListener("submit", cadastrarCliente);

// CARREGA A LISTA AO ABRIR A PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    buscarClientes();
});