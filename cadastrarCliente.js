const formHotel = document.getElementById("clienteForm");
const apiURL = "http://localhost:5187/api/Clientes";

async function cadastrarCliente(event) {
    event.preventDefault();
    const nome = document.getElementById("Nome").value;
    const cpf = document.getElementById("CPF").value;
    const telefone = document.getElementById("Telefone").value;
    const email = document.getElementById("Email").value;
    const dataNascimento = document.getElementById("DataNascimento").value;
    const cep = document.getElementById("CEP").value;
    const cidade = document.getElementById("Cidade").value;
    const rua = document.getElementById("Rua").value;
    const bairro = document.getElementById("Bairro").value;
    const numero = document.getElementById("Número").value;
    const etado = document.getElementById("Estado").value;
    const complemento = document.getElementById("Complemento").value;
    
    try{
        const resposta = await fetch(apiURL,{
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                nome: nome,
                cidade: cidade,
                qtdEstrelas: qtdEstrelas
            })
        });
        console.log(resposta.body)
        console.log("Resposta da API:", resposta);
        if(!resposta.ok){
            throw new Error ("Erro ao cadastrar o hotel.")
        }
        const dados = await resposta.json;
        console.log("Hotel cadastrado com sucesso:", dados)
        formHotel.reset();
        await buscarHotel();
    } catch(error){
        console.log("Erro ao cadastrar hotel.", error);
    }
}
formHotel.addEventListener("submit", cadastrarHotel)