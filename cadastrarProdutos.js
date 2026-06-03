async function carregarDadosParaEdicao(id) {
    try {
        const token = obterToken();
        const resposta = await fetch(`${apiURL}/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!resposta.ok) {
            alert("Erro ao buscar dados do produto para edição.");
            return;
        }

        const produto = await resposta.json();

        document.getElementById("urlImagem").value = produto.urlImg || produto.UrlImg || "";
        document.getElementById("nome").value = produto.nome || produto.Nome || "";
        document.getElementById("marca").value = produto.marca || produto.Marca || "";
        document.getElementById("valor").value = produto.valor || produto.Valor || "";
        document.getElementById("categoria").value = produto.categoriaId || produto.CategoriaId || "";
        document.getElementById("fornecedor").value = produto.fornecedorId || produto.FornecedorId || "";
        document.getElementById("qtd_minima").value = produto.qtdMinimaEstoque || produto.QtdMinimaEstoque || 0;
        
        document.getElementById("qtd_atual").value = produto.quantidadeEstoque ?? produto.qtdEstoque ?? produto.QuantidadeEstoque ?? produto.QtdEstoque ?? 0;
        
        document.getElementById("descricao").value = produto.descricao || produto.Descricao || "";

    } catch (error) {
        console.error("Erro ao carregar edição:", error);
        alert("Falha de conexão ao tentar carregar o produto.");
    }
}

async function salvarProduto(event) {
    event.preventDefault(); 
    
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

        const payload = {
            UrlImg: urlImagem, 
            nome: nome,
            marca: marca,
            valor: parseFloat(valor) || 0.0,
            Descricao: descricao, 
            categoriaId: parseInt(categoria) || 1, 
            fornecedorId: parseInt(fornecedor) || 1, 
            qtdMinimaEstoque: parseInt(qtdMinima) || 0,
            qtdEstoque: parseInt(qtdAtual) || 0,
            quantidadeEstoque: parseInt(qtdAtual) || 0 
        };

        if (modoEdicao) {
            payload.id = parseInt(produtoId);
        }

        const urlDestino = modoEdicao ? `${apiURL}/${produtoId}` : apiURL;
        const metodoHttP = modoEdicao ? "PUT" : "POST";

        const resposta = await fetch(urlDestino, {
            method: metodoHttP,
            headers: {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
            const erroDetalhado = await resposta.text();
            console.error("Detalhes da rejeição do Backend:", erroDetalhado);
            alert(`Falha na requisição (Erro ${resposta.status}). Verifique o console.`);
            return;
        }
        
        if (modoEdicao) {
            alert("Produto atualizado com sucesso!");
            window.location.href = "./produtos.html"; 
        } else {
            alert("Produto cadastrado com sucesso!");
            formProduto.reset(); 
        }
        
    } catch (error) {
        console.error("Falha de comunicação:", error);
        alert("Erro de rede ao tentar contactar o servidor.");
    }
}
function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./index.html");
}