// Captura os elementos do Modal no HTML
const modalDetalhes = document.getElementById('modalDetalhes');
const modalConteudo = document.getElementById('modalConteudo');

// Esta é a função chamada pelo listarClientes.js ao clicar em "Detalhes"
async function abrirModalDetalhes(id, tipo) {
    const token = localStorage.getItem('token');
    
    // Define a URL da API baseada no tipo correto
    const endpoint = tipo === 'cliente' 
        ? `https://time7-api.azurewebsites.net/api/Clientes/${id}` 
        : `https://time7-api.azurewebsites.net/api/Fornecedores/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const dados = await response.json();
            
            // Monta o HTML interno com dados, lixeira e botões
            preencherModal(dados, tipo);
            
            // Exibe o modal na tela
            modalDetalhes.style.display = 'flex'; 
        } else {
            alert('Não foi possível carregar os detalhes do registro.');
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
        alert('Falha de conexão com a API.');
    }
}

// Renderiza as informações estruturadas dentro do Modal
function preencherModal(dados, tipo) {
    const titulo = tipo === 'cliente' ? 'Detalhes do Cliente' : 'Detalhes do Fornecedor';
    const documento = dados.cpf || dados.cnpj || 'Não informado';
    const tipoDocumento = dados.cpf ? 'CPF' : 'CNPJ';

    let dataNascimentoFormatada = 'N/A';
    if (tipo === 'cliente' && dados.dataNascimento) {
        dataNascimentoFormatada = new Date(dados.dataNascimento).toLocaleDateString('pt-BR');
    }

    modalConteudo.innerHTML = `
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #333; padding-bottom: 10px;">
            <h2 style="color: #7bcf9c; margin: 0; font-size: 1.6rem; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-address-card"></i> ${titulo}
            </h2>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; color: #e0e0e0; font-size: 0.95rem; margin-bottom: 30px;">
            <div><strong style="color: #7bcf9c;">ID:</strong> #${dados.id || '-'}</div>
            <div><strong style="color: #7bcf9c;">Nome:</strong> ${dados.nome || '-'}</div>
            
            ${tipo === 'cliente' ? `<div><strong style="color: #7bcf9c;">Data de Nascimento:</strong> ${dataNascimentoFormatada}</div>` : ''}
            <div><strong style="color: #7bcf9c;">${tipoDocumento}:</strong> ${documento}</div>
            
            <div><strong style="color: #7bcf9c;">Telefone:</strong> ${dados.telefone || '-'}</div>
            <div><strong style="color: #7bcf9c;">Email:</strong> ${dados.email || '-'}</div>
            
            <div><strong style="color: #7bcf9c;">CEP:</strong> ${dados.cep || '-'}</div>
            <div><strong style="color: #7bcf9c;">Rua:</strong> ${dados.rua || '-'}</div>
            
            <div><strong style="color: #7bcf9c;">Bairro:</strong> ${dados.bairro || '-'}</div>
            <div><strong style="color: #7bcf9c;">Número:</strong> ${dados.numeroResidencia || 'S/N'}</div>
            
            <div><strong style="color: #7bcf9c;">Cidade:</strong> ${dados.cidade || '-'}</div>
            <div><strong style="color: #7bcf9c;">Estado:</strong> ${dados.estado || '-'}</div>
            
            <div style="grid-column: span 2;"><strong style="color: #7bcf9c;">Complemento:</strong> ${dados.complemento || 'Nenhum'}</div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #333; padding-top: 20px;">
            <button onclick="window.editarRegistro(${dados.id}, '${tipo}')" 
                    style="background-color: #7bcf9c; color: #000; border: none; padding: 10px 30px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: opacity 0.2s;"
                    onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                Editar
            </button>
            <button onclick="window.fecharModalDetalhes()" 
                    style="background-color: #7bcf9c; color: #000; border: none; padding: 10px 30px; border-radius: 20px; font-weight: bold; cursor: pointer; transition: opacity 0.2s;"
                    onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                Fechar
            </button>
        </div>
    `;
}

// Função para fechar o modal
function fecharModalDetalhes() {
    modalDetalhes.style.display = 'none';
}

// ✏️ AÇÃO DO BOTÃO EDITAR (Redireciona para a página correta)
function editarRegistro(id, tipo) {
    // Salva as informações no navegador para a outra página saber quem deve ser editado
    localStorage.setItem('idEdicao', id);
    localStorage.setItem('tipoEdicao', tipo);
    
    // Fecha o modal de detalhes
    fecharModalDetalhes();

    // Redireciona o usuário para a página onde o formulário realmente existe
    window.location.href = 'cadastrarCliente.html';
}

// Torna as funções visíveis globalmente para o HTML
window.abrirModalDetalhes = abrirModalDetalhes;
window.fecharModalDetalhes = fecharModalDetalhes;
window.editarRegistro = editarRegistro;

// Fecha o modal se o usuário clicar na área escura de fora
window.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) {
        fecharModalDetalhes();
    }
});

function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./index.html");
}