document.addEventListener("DOMContentLoaded", async () => {
    // 1. VERIFICA SE ESTÁ NO MODO EDIÇÃO ASSIM QUE A PÁGINA CARREGA
    const idEdicao = localStorage.getItem('idEdicao');
    const tipoEdicao = localStorage.getItem('tipoEdicao');

    

    if (idEdicao && tipoEdicao) {
        // Padroniza para minúsculo para evitar falhas de validação
        const tipoEdicaoLower = tipoEdicao.toLowerCase();

        // Altera o visual da página para indicar Edição
        const tituloH2 = document.querySelector('.titulo h2');
        const btnSubmit = document.getElementById('cadastrarFuncionario');
        
        if (tituloH2) tituloH2.innerHTML = 'Editar Registro';
        if (btnSubmit) btnSubmit.innerText = 'Salvar Alterações';

        // Busca os dados atuais na API para preencher o formulário
        const token = localStorage.getItem('token');
        const endpoint = tipoEdicaoLower === 'cliente' 
            ? `http://localhost:5187/api/Clientes/${idEdicao}` 
            : `http://localhost:5187/api/Fornecedores/${idEdicao}`;

        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const dados = await response.json();

                // Preenche os campos do formulário com o que já estava cadastrado
                document.getElementById('tipo').value = tipoEdicao;
                document.getElementById('Nome').value = dados.nome || '';
                document.getElementById('Telefone').value = dados.telefone || '';
                document.getElementById('Email').value = dados.email || '';
                document.getElementById('CEP').value = dados.cep || '';
                document.getElementById('Cidade').value = dados.cidade || '';
                document.getElementById('Rua').value = dados.rua || '';
                document.getElementById('Bairro').value = dados.bairro || '';
                document.getElementById('Numero').value = dados.numeroResidencia || '';
                document.getElementById('Estado').value = dados.estado || '';
                document.getElementById('Complemento').value = dados.complemento || '';

                // Separação de campos exclusivos por tipo
                if (tipoEdicaoLower === 'cliente') {
                    document.getElementById('CPF').value = dados.cpf || '';
                    if (dados.dataNascimento) {
                        document.getElementById('DataNascimento').value = dados.dataNascimento.split('T')[0];
                    }
                } else {
                    document.getElementById('CPF').value = dados.cnpj || '';
                    const dataGroup = document.getElementById('dataNascimentoGroup');
                    if (dataGroup) dataGroup.style.display = 'none';
                }
            } else {
                console.error("Erro na API ao buscar dados. Código:", response.status);
                alert('Atenção: Não foi possível carregar os dados antigos da API. Verifique se o seu backend aceita requisições GET para este ID.');
            }
        } catch (error) {
            console.error('Erro de conexão ao buscar dados:', error);
        }
    }
});

// 2. ESCUTA O ENVIO DO FORMULÁRIO (SALVAR ALTERAÇÕES)
document.getElementById('clienteForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o recarregamento da página

    const idEdicao = localStorage.getItem('idEdicao');
    const tipoEdicao = localStorage.getItem('tipoEdicao');
    const tipoSelecionado = document.getElementById('tipo').value;

    // Padroniza as variáveis de escolha para letras minúsculas
    const tipoSelecionadoLower = tipoSelecionado ? tipoSelecionado.toLowerCase() : '';
    const tipoEdicaoLower = tipoEdicao ? tipoEdicao.toLowerCase() : '';

    // Coleta as informações digitadas nos inputs
    const dados = {
        nome: document.getElementById('Nome').value,
        telefone: document.getElementById('Telefone').value,
        email: document.getElementById('Email').value,
        cep: document.getElementById('CEP').value,
        cidade: document.getElementById('Cidade').value,
        rua: document.getElementById('Rua').value,
        bairro: document.getElementById('Bairro').value,
        numeroResidencia: parseInt(document.getElementById('Numero').value) || 0,
        estado: document.getElementById('Estado').value,
        complemento: document.getElementById('Complemento').value
    };

    if (tipoSelecionadoLower === 'cliente') {
        dados.cpf = document.getElementById('CPF').value;
        dados.dataNascimento = document.getElementById('DataNascimento').value || null;
    } else {
        dados.cnpj = document.getElementById('CPF').value;
    }

    const token = localStorage.getItem('token');
    let url = '';
    let method = '';

    // BLOCO DE DECISÃO: SE TIVER ID NA MEMÓRIA, FAZ PUT (NÃO FAZ POST!)
    if (idEdicao) {
        method = 'PUT';
        const tipoFinalLower = tipoEdicaoLower || tipoSelecionadoLower;
        url = tipoFinalLower === 'cliente' 
            ? `http://localhost:5187/api/Clientes/${idEdicao}`
            : `http://localhost:5187/api/Fornecedores/${idEdicao}`;
        
        // Algumas APIs em C# exigem o ID também dentro do objeto enviado
        dados.id = parseInt(idEdicao); 
    } else {
        // Se não tiver ID, aí sim comporta-se como um novo cadastro (POST)
        method = 'POST';
        url = tipoSelecionadoLower === 'cliente' 
            ? `http://localhost:5187/api/Clientes`
            : `http://localhost:5187/api/Fornecedores`;
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            alert(idEdicao ? 'Alterações salvas com sucesso!' : 'Cadastro realizado com sucesso!');
            
            // Muito importante: Limpa a memória para que o próximo "+ Cadastrar" venha em branco
            localStorage.removeItem('idEdicao');
            localStorage.removeItem('tipoEdicao');
            
            // Retorna para a tela de listagem
            window.location.href = 'ClienteFornecedor.html';
        } else {
            const erroDetalhado = await response.json().catch(() => null);
            console.error("Erro retornado do servidor:", erroDetalhado);
            alert('Erro ao salvar as alterações no servidor. Verifique os dados preenchidos.');
        }
    } catch (error) {
        console.error('Erro na requisição HTTP:', error);
        alert('Erro de comunicação com o servidor.');
    }
});

function efetuarLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("./index.html");
}