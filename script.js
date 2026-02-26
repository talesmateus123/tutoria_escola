// Configuração da API - altere apenas esta linha para mudar o endereço
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'              // Desenvolvimento
    : `http://${window.location.hostname}:3000`; // Produção (usa o mesmo domínio)

// Estado da aplicação
let alunoAtual = null;
let professores = [];
let turmas = [];
let relatorioAtual = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarTurmas();
    carregarProfessores();
    mostrarAba('votacao');
});

function mostrarAba(aba) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    document.getElementById('abaVotacao').classList.remove('active');
    document.getElementById('abaRelatorio').classList.remove('active');
    
    if (aba === 'votacao') {
        document.getElementById('abaVotacao').classList.add('active');
    } else {
        document.getElementById('abaRelatorio').classList.add('active');
        carregarRelatorio();
    }
}

async function carregarRelatorio() {
    const container = document.getElementById('relatorioContainer');
    container.innerHTML = '<div class="loading">Carregando relatório...</div>';
    
    try {
        const searchTerm = document.getElementById('pesquisaRelatorio').value;
        let url = `${API_URL}/api/relatorio/tutorandos`;
        if (searchTerm && searchTerm.trim() !== '') {
            url += `?search=${encodeURIComponent(searchTerm.trim())}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        relatorioAtual = data;
        await carregarEstatisticas();
        exibirRelatorio(relatorioAtual);
    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        container.innerHTML = `
            <div class="erro">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar relatório: ${error.message}</p>
                <p>Tentando conectar em: ${API_URL}</p>
                <button onclick="carregarRelatorio()" class="btn-atualizar">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
    }
}

async function carregarEstatisticas() {
    try {
        const response = await fetch(`${API_URL}/api/relatorio/estatisticas`);
        const stats = await response.json();
        
        const container = document.getElementById('estatisticasContainer');
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.totalAlunos}</span>
                    <span class="stat-label">Total de Alunos</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.totalProfessores}</span>
                    <span class="stat-label">Total de Professores</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.professoresCompletos}</span>
                    <span class="stat-label">Professores Lotados</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-info">
                    <span class="stat-value">${stats.vagasOcupadas}/${stats.totalVagas}</span>
                    <span class="stat-label">Vagas Ocupadas</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

function exibirRelatorio(relatorio) {
    const container = document.getElementById('relatorioContainer');
    
    if (relatorio.length === 0) {
        container.innerHTML = '<div class="sem-resultados">Nenhum resultado encontrado.</div>';
        return;
    }
    
    let html = '';
    
    relatorio.forEach(professor => {
        const percentual = (professor.totalTutorandos / professor.maxTutorandos) * 100;
        
        html += `
            <div class="professor-relatorio-card">
                <div class="professor-relatorio-header">
                    <img src="${professor.foto}" alt="${professor.nome}" class="professor-relatorio-foto" 
                         onerror="this.src='https://via.placeholder.com/60x60?text=Professor'">
                    <div class="professor-relatorio-info">
                        <h3>${professor.nome}</h3>
                        <div class="professor-relatorio-stats">
                            <span class="stat-badge ${professor.bloqueado ? 'lotado' : 'disponivel'}">
                                ${professor.totalTutorandos}/${professor.maxTutorandos} tutorandos
                            </span>
                            <span class="progress-percent">${Math.round(percentual)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentual}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="tutorandos-lista">
                    <h4>Tutorandos (${professor.totalTutorandos})</h4>
                    ${professor.tutorandos.length > 0 ? `
                        <table class="tutorandos-tabela">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Turma</th>
                                    <th>Data do Voto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${professor.tutorandos.map(tutorando => `
                                    <tr>
                                        <td>${tutorando.alunoNome}</td>
                                        <td>${tutorando.turmaNome || 'Não informada'}</td>
                                        <td>${new Date(tutorando.dataVoto).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="sem-tutorandos">Nenhum tutorando ainda.</p>'}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filtrarRelatorio() {
    carregarRelatorio();
}

function limparPesquisa() {
    document.getElementById('pesquisaRelatorio').value = '';
    carregarRelatorio();
}

async function carregarTurmas() {
    try {
        const response = await fetch(`${API_URL}/api/turmas`);
        turmas = await response.json();
        preencherSelectTurmas();
    } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        mostrarModal(`Erro ao carregar turmas. Verifique conexão com: ${API_URL}`);
    }
}

function preencherSelectTurmas() {
    const select = document.getElementById('turmaSelect');
    select.innerHTML = '<option value="">Selecione sua série</option>';
    
    const turmasPorNivel = {
        'Fundamental': turmas.filter(t => t.nome.includes('º') && !t.nome.includes('1º') && !t.nome.includes('2º') && !t.nome.includes('3º')),
        'Ensino Médio': turmas.filter(t => t.nome.includes('1º') || t.nome.includes('2º') || t.nome.includes('3º'))
    };
    
    for (const [nivel, turmasNivel] of Object.entries(turmasPorNivel)) {
        if (turmasNivel.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = nivel;
            
            turmasNivel.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = turma.nome;
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        }
    }
}

function validarNome(nome) {
    nome = nome.trim();
    
    if (!nome) {
        return { valido: false, mensagem: 'Por favor, digite seu nome!' };
    }
    
    const partes = nome.split(' ').filter(p => p.length > 0);
    
    if (partes.length < 2) {
        return { valido: false, mensagem: 'Por favor, digite seu nome completo (nome e sobrenome)!' };
    }
    
    return { valido: true, nomeFormatado: nome };
}

async function identificarAluno() {
    const nome = document.getElementById('alunoNome').value.trim();
    const turmaId = document.getElementById('turmaSelect').value;

    const validacao = validarNome(nome);
    if (!validacao.valido) {
        mostrarModal(validacao.mensagem);
        document.getElementById('alunoNome').classList.add('error');
        return;
    } else {
        document.getElementById('alunoNome').classList.remove('error');
    }

    if (!turmaId) {
        mostrarModal('Por favor, selecione sua série!');
        document.getElementById('turmaSelect').classList.add('error');
        return;
    } else {
        document.getElementById('turmaSelect').classList.remove('error');
    }

    try {
        const response = await fetch(`${API_URL}/api/aluno/verificar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                alunoNome: nome,
                turmaId: parseInt(turmaId)
            })
        });

        const data = await response.json();
        const turma = turmas.find(t => t.id === parseInt(turmaId));

        alunoAtual = {
            nome: nome,
            turmaId: parseInt(turmaId),
            turmaNome: turma ? turma.nome : 'Turma não encontrada'
        };

        if (data.votou) {
            mostrarModal(`⚠️ Aluno ${nome} da turma ${alunoAtual.turmaNome} já votou!`);
            setTimeout(() => {
                limparCamposEVoltar();
            }, 2000);
        } else {
            document.getElementById('alunoInfo').style.display = 'none';
            document.getElementById('votacaoContainer').style.display = 'block';
            
            document.getElementById('alunoNomeDisplay').textContent = nome;
            document.getElementById('alunoTurmaDisplay').textContent = alunoAtual.turmaNome;
            
            exibirProfessores();
        }
    } catch (error) {
        console.error('Erro ao verificar aluno:', error);
        mostrarModal(`Erro ao verificar aluno. Verifique conexão com: ${API_URL}`);
    }
}

async function carregarProfessores() {
    try {
        const response = await fetch(`${API_URL}/api/professores`);
        professores = await response.json();
    } catch (error) {
        console.error('Erro ao carregar professores:', error);
        mostrarModal(`Erro ao carregar professores. Verifique conexão com: ${API_URL}`);
    }
}

async function exibirProfessores() {
    await carregarProfessores();
    
    const grid = document.getElementById('professoresGrid');
    grid.innerHTML = '';

    professores.forEach(professor => {
        const card = criarCardProfessor(professor);
        grid.appendChild(card);
    });
}

function criarCardProfessor(professor) {
    const card = document.createElement('div');
    card.className = `professor-card ${professor.bloqueado ? 'bloqueado' : ''}`;
    card.id = `professor-${professor.id}`;

    const vagasRestantes = professor.maxTutorandos - professor.tutorandos.length;
    const progresso = (professor.tutorandos.length / professor.maxTutorandos) * 100;

    card.innerHTML = `
        <img src="${professor.foto}" 
             alt="${professor.nome}" 
             class="professor-foto" 
             onerror="this.src='https://via.placeholder.com/200x200?text=${encodeURIComponent(professor.nome)}'">
        <div class="professor-info">
            <h3>${professor.nome}</h3>
            <div class="professor-vagas">
                <span class="${vagasRestantes > 0 ? 'vagas-disponiveis' : 'vagas-esgotadas'}">
                    ${vagasRestantes} de ${professor.maxTutorandos} vagas disponíveis
                </span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progresso}%"></div>
            </div>
            <button 
                class="btn-votar" 
                onclick="votar(${professor.id})"
                ${professor.bloqueado ? 'disabled' : ''}
            >
                ${professor.bloqueado ? 'Esgotado' : 'Votar neste professor'}
            </button>
        </div>
    `;

    return card;
}

async function votar(professorId) {
    if (!alunoAtual) {
        mostrarModal('Você precisa se identificar primeiro!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/votar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                alunoNome: alunoAtual.nome,
                turmaId: alunoAtual.turmaId,
                professorId: professorId
            })
        });

        const data = await response.json();

        if (response.ok) {
            mostrarModal(`✅ Voto registrado com sucesso para ${alunoAtual.nome} da turma ${alunoAtual.turmaNome}!`);
            setTimeout(() => {
                limparCamposEVoltar();
            }, 3000);
        } else {
            mostrarModal('❌ ' + (data.error || 'Erro ao registrar voto'));
            exibirProfessores();
        }
    } catch (error) {
        console.error('Erro ao votar:', error);
        mostrarModal(`Erro ao registrar voto. Verifique conexão com: ${API_URL}`);
    }
}

function limparCamposEVoltar() {
    alunoAtual = null;
    document.getElementById('alunoNome').value = '';
    document.getElementById('turmaSelect').value = '';
    document.getElementById('alunoNome').classList.remove('error');
    document.getElementById('turmaSelect').classList.remove('error');
    document.getElementById('alunoInfo').style.display = 'block';
    document.getElementById('votacaoContainer').style.display = 'none';
    document.getElementById('alunoNome').focus();
}

function sair() {
    limparCamposEVoltar();
}

function mostrarModal(mensagem) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modalMessage');
    
    if (mensagem.includes('✅')) {
        modalMessage.className = 'success-message';
    } else if (mensagem.includes('⚠️') || mensagem.includes('❌')) {
        modalMessage.className = 'warning-message';
    } else {
        modalMessage.className = '';
    }
    
    modalMessage.innerHTML = mensagem;
    modal.style.display = 'flex';
    
    setTimeout(() => {
        fecharModal();
    }, 5000);
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

document.getElementById('alunoNome').addEventListener('input', function() {
    this.classList.remove('error');
});

document.getElementById('turmaSelect').addEventListener('change', function() {
    this.classList.remove('error');
});

setInterval(() => {
    if (document.getElementById('votacaoContainer').style.display === 'block') {
        exibirProfessores();
    }
}, 30000);