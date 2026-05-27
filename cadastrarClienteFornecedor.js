const API_BASE_URL = 'https://localhost:7142/api'; // Ajuste para a porta correta da sua API

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clienteForm');
    const cepInput = document.getElementById('CEP');

    // ==========================================
    // 1. ENVIO DO FORMULÁRIO (POST)
    // ==========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Captura o valor do campo unificado CPF/CNPJ e remove pontuações para checar o tamanho
        const docInput = document.getElementById('CPF').value;
        const docNumeros = docInput.replace(/\D/g, ''); 
        
        let cpfParaEnvio = null;
        let cnpjParaEnvio = null;

        // Se tiver 11 ou menos números, assume que é CPF. Se for maior, assume que é CNPJ.
        if (docNumeros.length > 0) {
            if (docNumeros.length <= 11) {
                cpfParaEnvio = docInput;
            } else {
                cnpjParaEnvio = docInput;
            }
        }

        // Monta o objeto DTO mapeando os IDs exatos do seu HTML para as propriedades do C#
        const clienteDto = {
            nome: document.getElementById('Nome').value || null,
            dataNascimento: document.getElementById('DataNascimento').value || null,
            email: document.getElementById('Email').value || null,
            telefone: document.getElementById('Telefone').value || null,
            cpf: cpfParaEnvio,
            cnpj: cnpjParaEnvio,
            cep: document.getElementById('CEP').value || null,
            rua: document.getElementById('Rua').value || null,
            bairro: document.getElementById('Bairro').value || null,
            cidade: document.getElementById('Cidade').value || null,
            estado: document.getElementById('Estado').value || null,
            // Seu ID no HTML está com acento (Número)
            numeroResidencia: document.getElementById('Numero').value || null, 
            complemento: document.getElementById('Complemento').value || null
        };

        const token = localStorage.getItem('token');

        if (!token) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clienteDto)
            });

            if (response.ok) {
                alert('Registro salvo com sucesso!');
                window.location.href = 'ClienteFornecedor.html';
            } else {
                const erroTexto = await response.text();
                alert(`Erro ao cadastrar: ${erroTexto || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível conectar ao servidor backend.');
        }
    });

    // ==========================================
    // 2. BUSCA AUTOMÁTICA DE CEP (VIACEP)
    // ==========================================
    if (cepInput) {
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, ''); // Limpa o CEP (remove traços)

            if (cep.length === 8) {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();

                    if (!data.erro) {
                        // Preenche os campos automaticamente
                        document.getElementById('Rua').value = data.logradouro;
                        document.getElementById('Bairro').value = data.bairro;
                        document.getElementById('Cidade').value = data.localidade;
                        document.getElementById('Estado').value = data.uf;
                        
                        // Joga o cursor para o campo de número da casa
                        document.getElementById('Número').focus();
                    } else {
                        alert('CEP não encontrado.');
                    }
                } catch (error) {
                    console.error('Erro ao buscar o CEP:', error);
                }
            }
        });
    }
});