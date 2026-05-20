// Configurações Iniciais
const apiURL = "http://localhost:5187/api/Produtos";
const formProduto = document.getElementById("productForm"); // Captura o ID correto do seu HTML

// Função para obter o Token JWT salvo no navegador
function obterToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

// Função Principal de Cadastro
async function cadastrarProduto(event) {
    event.preventDefault(); // Impede a página de recarregar
    
    // 1. Captura os valores digitados no formulário HTML
    const urlImagem = document.getElementById("urlImagem").value; 
    const nome = document.getElementById("nome").value;
    const marca = document.getElementById("marca").value;
    const valor = document.getElementById("valor").value;
    const categoria = document.getElementById("categoria").value; 
    const fornecedor = document.getElementById("fornecedor").value;
    const qtdMinima = document.getElementById("qtd_minima").value;
    const qtdAtual = document.getElementById("qtd_atual").value; 
    const descricao = document.getElementById("descricao").value;
    
    try {
        const token = obterToken();

        // 2. Monta o objeto (Payload) com as chaves exatas que o C# espera
        const payload = {
            UrlImg: urlImagem, 
            nome: nome,
            marca: marca,
            valor: parseFloat(valor) || 0.0,
            Descricao: descricao, // CORREÇÃO: 'D' maiúsculo para o C# validar corretamente
            categoriaId: parseInt(categoria) || 1, // Convertido para número para não quebrar o banco
            fornecedorId: parseInt(fornecedor) || 1, // Convertido para número
            qtdMinimaEstoque: parseInt(qtdMinima) || 0,
            qtdEstoque: parseInt(qtdAtual) || 0 
        };

        // 3. Envia os dados para a API
        const resposta = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        // 4. Tratamento de Erros do Servidor
        if (!resposta.ok) {
            const erroDetalhado = await resposta.text();
            console.error("Detalhes da rejeição do Backend:", erroDetalhado);
            alert(`Falha no cadastro (Erro ${resposta.status}). Verifique o console.`);
            return;
        }
        
        // 5. Cadastro efetuado com sucesso
        const dados = await resposta.json(); 
        console.log("Sucesso no backend:", dados);
        
        formProduto.reset(); // Limpa a tela
        alert("Produto cadastrado com sucesso!");
        
        // Atualiza a listagem caso a função exista no seu projeto
        if (typeof buscarProduto === "function") {
            await buscarProduto();
        }
        
    } catch (error) {
        console.error("Falha de comunicação:", error);
        alert("Erro de rede ao tentar contactar o servidor.");
    }
}

// Vincula o evento de clique no botão (Submit) à função de cadastro
if (formProduto) {
    formProduto.addEventListener("submit", cadastrarProduto);
}