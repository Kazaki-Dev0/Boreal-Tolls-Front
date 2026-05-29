const apiUrlClientes = 'http://localhost:5187/api/Clientes';
const apiUrlFornecedores = 'http://localhost:5187/api/Fornecedores';
const tabelaBody = document.getElementById('tabelaClientesBody');
const inputBusca = document.getElementById('inputBusca');

let dadosOriginais = []; 

// Configuração do cabeçalho com o Token JWT
const obterHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Função principal para carregar os dados
async function carregarRegistros() {
    try {
        const [resClientes, resFornecedores] = await Promise.all([
            fetch(apiUrlClientes, { headers: obterHeaders() }),
            fetch(apiUrlFornecedores, { headers: obterHeaders() })
        ]);

        if (!resClientes.ok || !resFornecedores.ok) {
            throw new Error('Falha ao buscar dados da API. Verifique sua autenticação.');
        }

        const clientes = await resClientes.json();
        const fornecedores = await resFornecedores.json();

        const clientesFormatados = clientes.map(c => ({ ...c, tipoRegistro: 'Cliente' }));
        const fornecedoresFormatados = fornecedores.map(f => ({ ...f, tipoRegistro: 'Fornecedor' }));
        
        dadosOriginais = [...clientesFormatados, ...fornecedoresFormatados];
        dadosOriginais.sort((a, b) => a.id - b.id);

        renderizarTabela(dadosOriginais);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#ff6b6b;">Erro ao carregar registros. Faça login novamente.</td></tr>`;
    }
}

// Renderiza a tabela no HTML
function renderizarTabela(dados) {
    tabelaBody.innerHTML = '';

    if (dados.length === 0) {
        tabelaBody.innerHTML = `<tr class="empty-row"><td colspan="6" style="text-align:center;">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    dados.forEach(item => {
        const documento = item.cpf || item.cnpj || 'Não informado';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td>
                ${item.nome}
                <br>
                <small style="color: #7bcf9c; font-size: 0.8em;">${item.tipoRegistro}</small>
            </td>
            <td>${documento}</td>
            <td>${item.email || '-'}</td>
            <td>${item.telefone || '-'}</td>
            <td>
                <div style="display: flex; gap: 40px; align-items: center;">
                    <button class="btn-detail" onclick="verDetalhes(${item.id}, '${item.tipoRegistro}')">
                        Detalhes
                    </button>
                    <button style="background: none; border: none; cursor: pointer; color: #ff6b6b; font-size: 1.2rem; transition: transform 0.2s;" 
                            onclick="excluirRegistro(${item.id}, '${item.tipoRegistro}')" 
                            onmouseover="this.style.transform='scale(1.2)'" 
                            onmouseout="this.style.transform='scale(1)'"
                            title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });
}

// =================================================================
// FUNÇÃO: Excluir Registro
// =================================================================
async function excluirRegistro(id, tipo) {
    // Pede confirmação antes de deletar
    const confirmacao = confirm(`Tem certeza que deseja excluir o ${tipo} de ID #${id}? Esta ação não pode ser desfeita.`);
    if (!confirmacao) return;

    const token = localStorage.getItem('token');
    const url = tipo === 'Cliente' 
        ? `http://localhost:5187/api/Clientes/${id}`
        : `http://localhost:5187/api/Fornecedores/${id}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert(`${tipo} excluído com sucesso!`);
            carregarRegistros(); // Recarrega a tabela automaticamente para sumir com a linha
        } else {
            const erro = await response.text();
            console.error("Erro retornado:", erro);
            alert(`Erro ao excluir o ${tipo}. Ele pode ter vínculos no sistema ou o servidor recusou a requisição.`);
        }
    } catch (error) {
        console.error('Erro na requisição HTTP:', error);
        alert('Erro de comunicação com o servidor ao tentar excluir.');
    }
}
// =================================================================

// Filtro de busca focado APENAS em ID e Nome
inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().trim();
    
    const dadosFiltrados = dadosOriginais.filter(item => {
        const idMatch = item.id && item.id.toString().includes(termo);
        const nomeMatch = item.nome && item.nome.toLowerCase().includes(termo);
        return idMatch || nomeMatch;
    });

    renderizarTabela(dadosFiltrados);
});

// Abre o modal de detalhes
function verDetalhes(id, tipo) {
    const tipoTratado = tipo.toLowerCase(); 
    if (typeof abrirModalDetalhes === 'function') {
        abrirModalDetalhes(id, tipoTratado);
    } else {
        console.error("A função abrirModalDetalhes não foi encontrada.");
    }
}

// Inicia a aplicação
document.addEventListener('DOMContentLoaded', carregarRegistros);