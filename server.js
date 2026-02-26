const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Arquivo para simular banco de dados
const DB_FILE = path.join(__dirname, 'db.json');

// Função para inicializar o banco de dados se não existir
function inicializarBanco() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            professores: [
                {
                    id: 1,
                    nome: "Diretora Ana Maria",
                    foto: "/images/Diretora Ana Maria.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 2,
                    nome: "Professor Alan",
                    foto: "/images/Professor Alan.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 3,
                    nome: "Professor Alex",
                    foto: "/images/Professor Alex.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 4,
                    nome: "Professor Jeferson",
                    foto: "/images/Professor Jeferson.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 5,
                    nome: "Professor Johnnys",
                    foto: "/images/Professor Johnnys.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 6,
                    nome: "Professora Aglaisse",
                    foto: "/images/Professora Aglaisse.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 7,
                    nome: "Professora Antoninha",
                    foto: "/images/Professora Antoninha.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 8,
                    nome: "Professora Carla",
                    foto: "/images/Professora Carla.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 9,
                    nome: "Professora Karla",
                    foto: "/images/Professora Karla.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 10,
                    nome: "Professora Aglaisse",
                    foto: "/images/Professora Aglaisse.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                },
                {
                    id: 11,
                    nome: "Professora Rhaissa",
                    foto: "/images/Professora Rhaissa.jpeg",
                    tutorandos: [],
                    maxTutorandos: 10,
                    bloqueado: false
                }
            ],
            turmas: [
                { "id": 1, "nome": "5º Ano A" },
                { "id": 2, "nome": "5º Ano B" },
                { "id": 3, "nome": "6º Ano A" },
                { "id": 4, "nome": "6º Ano B" },
                { "id": 5, "nome": "7º Ano A" },
                { "id": 6, "nome": "7º Ano B" },
                { "id": 7, "nome": "8º Ano A" },
                { "id": 8, "nome": "8º Ano B" },
                { "id": 9, "nome": "9º Ano A" },
                { "id": 10, "nome": "9º Ano B" },
                { "id": 11, "nome": "1º Ano A" },
                { "id": 12, "nome": "1º Ano B" },
                { "id": 13, "nome": "2º Ano A" },
                { "id": 14, "nome": "2º Ano B" },
                { "id": 15, "nome": "3º Ano A" },
                { "id": 16, "nome": "3º Ano B" }
            ],
            alunos: [],
            votos: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('Banco de dados inicializado com sucesso!');
    }
}

// Inicializar banco de dados
inicializarBanco();

// Ler dados do banco
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler banco de dados:', error);
        return { professores: [], turmas: [], alunos: [], votos: [] };
    }
};

// Escrever dados no banco
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Erro ao escrever banco de dados:', error);
    }
};

// Rota raiz - serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para obter todas as turmas
app.get('/api/turmas', (req, res) => {
    try {
        const db = readDB();
        res.json(db.turmas || []);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar turmas' });
    }
});

// Rota para obter todos os professores
app.get('/api/professores', (req, res) => {
    try {
        const db = readDB();
        res.json(db.professores || []);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar professores' });
    }
});

// Rota para obter professor específico
app.get('/api/professores/:id', (req, res) => {
    try {
        const db = readDB();
        const professor = db.professores.find(p => p.id === parseInt(req.params.id));
        if (professor) {
            res.json(professor);
        } else {
            res.status(404).json({ error: 'Professor não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar professor' });
    }
});

// Rota para obter relatório completo de tutorandos por professor
app.get('/api/relatorio/tutorandos', (req, res) => {
    try {
        const db = readDB();
        const { search } = req.query;
        
        let relatorio = db.professores.map(professor => {
            const tutorandosOrdenados = [...(professor.tutorandos || [])].sort((a, b) => 
                a.alunoNome.localeCompare(b.alunoNome)
            );
            
            return {
                id: professor.id,
                nome: professor.nome,
                foto: professor.foto,
                totalTutorandos: professor.tutorandos ? professor.tutorandos.length : 0,
                maxTutorandos: professor.maxTutorandos,
                bloqueado: professor.bloqueado || false,
                tutorandos: tutorandosOrdenados
            };
        });
        
        if (search && search.trim() !== '') {
            const termoBusca = search.toLowerCase().trim();
            relatorio = relatorio.filter(professor => 
                professor.nome.toLowerCase().includes(termoBusca) ||
                (professor.tutorandos || []).some(t => 
                    (t.alunoNome && t.alunoNome.toLowerCase().includes(termoBusca)) ||
                    (t.turmaNome && t.turmaNome.toLowerCase().includes(termoBusca))
                )
            );
        }
        
        relatorio.sort((a, b) => a.nome.localeCompare(b.nome));
        res.json(relatorio);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
});

// Rota para obter estatísticas gerais
app.get('/api/relatorio/estatisticas', (req, res) => {
    try {
        const db = readDB();
        
        const totalAlunos = db.alunos ? db.alunos.length : 0;
        const totalProfessores = db.professores ? db.professores.length : 0;
        const professoresCompletos = db.professores ? db.professores.filter(p => 
            p.tutorandos && p.tutorandos.length >= p.maxTutorandos
        ).length : 0;
        const totalVagas = db.professores ? db.professores.reduce((acc, p) => acc + p.maxTutorandos, 0) : 0;
        const vagasOcupadas = totalAlunos;
        
        const alunosPorTurma = {};
        if (db.alunos) {
            db.alunos.forEach(aluno => {
                if (!alunosPorTurma[aluno.turmaNome]) {
                    alunosPorTurma[aluno.turmaNome] = 0;
                }
                alunosPorTurma[aluno.turmaNome]++;
            });
        }
        
        res.json({
            totalAlunos,
            totalProfessores,
            professoresCompletos,
            totalVagas,
            vagasOcupadas,
            vagasDisponiveis: totalVagas - vagasOcupadas,
            alunosPorTurma
        });
    } catch (error) {
        console.error('Erro ao gerar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao gerar estatísticas' });
    }
});

// Rota para registrar voto
app.post('/api/votar', (req, res) => {
    try {
        const { alunoNome, turmaId, professorId } = req.body;
        const db = readDB();
        
        const alunoId = `${alunoNome.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
        
        const alunoExistente = db.alunos.find(a => 
            a.nome.toLowerCase() === alunoNome.toLowerCase() && 
            a.turmaId === turmaId
        );
        
        if (alunoExistente) {
            return res.status(400).json({ error: 'Aluno desta turma já votou' });
        }
        
        const professor = db.professores.find(p => p.id === professorId);
        if (!professor) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }
        
        if (professor.bloqueado) {
            return res.status(400).json({ error: 'Professor já atingiu o limite de tutorandos' });
        }
        
        if (professor.tutorandos.length >= professor.maxTutorandos) {
            professor.bloqueado = true;
            writeDB(db);
            return res.status(400).json({ error: 'Professor atingiu o limite de tutorandos' });
        }
        
        const turma = db.turmas.find(t => t.id === turmaId);
        
        const novoAluno = {
            id: alunoId,
            nome: alunoNome,
            turmaId: turmaId,
            turmaNome: turma ? turma.nome : 'Turma não encontrada',
            professorId: professorId,
            dataVoto: new Date().toISOString()
        };
        
        if (!db.alunos) db.alunos = [];
        db.alunos.push(novoAluno);
        
        if (!professor.tutorandos) professor.tutorandos = [];
        professor.tutorandos.push({
            alunoId: alunoId,
            alunoNome: alunoNome,
            turmaId: turmaId,
            turmaNome: turma ? turma.nome : 'Turma não encontrada',
            dataVoto: new Date().toISOString()
        });
        
        if (professor.tutorandos.length >= professor.maxTutorandos) {
            professor.bloqueado = true;
        }
        
        if (!db.votos) db.votos = [];
        db.votos.push({
            alunoId,
            alunoNome,
            turmaId,
            professorId,
            data: new Date().toISOString()
        });
        
        writeDB(db);
        
        res.json({ 
            success: true, 
            message: 'Voto registrado com sucesso',
            professor: professor,
            aluno: novoAluno
        });
    } catch (error) {
        console.error('Erro ao registrar voto:', error);
        res.status(500).json({ error: 'Erro interno ao registrar voto' });
    }
});

// Rota para verificar se aluno já votou
app.post('/api/aluno/verificar', (req, res) => {
    try {
        const { alunoNome, turmaId } = req.body;
        const db = readDB();
        
        const aluno = db.alunos.find(a => 
            a.nome.toLowerCase() === alunoNome.toLowerCase() && 
            a.turmaId === turmaId
        );
        
        if (aluno) {
            const professor = db.professores.find(p => p.id === aluno.professorId);
            res.json({ 
                votou: true, 
                aluno: {
                    ...aluno,
                    professorNome: professor ? professor.nome : 'Professor não encontrado'
                }
            });
        } else {
            res.json({ votou: false, aluno: null });
        }
    } catch (error) {
        console.error('Erro ao verificar aluno:', error);
        res.status(500).json({ error: 'Erro ao verificar aluno' });
    }
});

// Rota para resetar votos (para testes)
app.post('/api/reset', (req, res) => {
    try {
        const db = readDB();
        db.professores.forEach(p => {
            p.tutorandos = [];
            p.bloqueado = false;
        });
        db.alunos = [];
        db.votos = [];
        writeDB(db);
        res.json({ success: true, message: 'Sistema resetado' });
    } catch (error) {
        console.error('Erro ao resetar sistema:', error);
        res.status(500).json({ error: 'Erro ao resetar sistema' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Pastas disponíveis:`);
    console.log(`- Imagens: http://localhost:${PORT}/images/`);
    console.log(`- Assets: http://localhost:${PORT}/assets/`);
});