const API_URL = "https://time7-api.azurewebsites.net/api/Funcionarios";

const form = document.getElementById("formFuncionario");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const funcionario = {
        nome: document.getElementById("nome").value,
        rg: document.getElementById("rg").value,
        cpf: document.getElementById("cpf").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        dataNascimento: document.getElementById("dataNascimento").value,
        departamento: document.getElementById("departamento").value,
        cargo: document.getElementById("cargo").value,
        salario: parseFloat(document.getElementById("salario").value),
        cep: document.getElementById("cep").value,
        rua: document.getElementById("rua").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value,
        complemento: document.getElementById("complemento").value
    };

    try {

        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(funcionario)
        });

        if (!response.ok) {
            throw new Error("Erro ao cadastrar funcionário");
        }

        alert("Funcionário cadastrado com sucesso!");

        form.reset();

        window.location.href = "funcionarios.html";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao cadastrar funcionário");
    }
});
function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./index.html");
}