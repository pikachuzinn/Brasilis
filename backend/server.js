const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (imagens)
app.use('/images', express.static('public/images'));


// Conexão com MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function conectarBanco() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await client.connect();
        db = client.db('desafio_brasilis');
        console.log('✅ Conectado ao MongoDB com sucesso!');
        console.log('📦 Banco: desafio_brasilis\n');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

conectarBanco();

// ===================================
// ROTAS
// ===================================

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        mensagem: 'API Desafio Brasilis funcionando!',
        status: 'online',
        endpoints: {
            cadastro: 'POST /api/usuarios/cadastrar',
            login: 'POST /api/usuarios/login',
            perguntas: 'GET /api/perguntas/aleatorias',
            categorias: 'GET /api/categorias',
            ranking: 'GET /api/ranking',
            salvar_partida: 'POST /api/partidas',
            historico: 'GET /api/partidas/usuario/:id',
            atualizar_streak: 'POST /api/usuarios/:id/streak'
        }
    });
});

// Cadastrar usuário
app.post('/api/usuarios/cadastrar', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }
        
        const usuarioExistente = await db.collection('usuarios').findOne({ email });
        
        if (usuarioExistente) {
            return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        
        const novoUsuario = {
            email,
            senha,
            pontos_totais: 0,
            streak_atual: 0,
            melhor_streak: 0,
            total_partidas: 0,
            ultima_jogada: null,
            data_cadastro: new Date()
        };
        
        const resultado = await db.collection('usuarios').insertOne(novoUsuario);
        
        console.log(`✅ Novo usuário cadastrado: ${email}`);
        
        res.status(201).json({ 
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertedId
        });
        
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
});

// Login
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }
        
        const usuario = await db.collection('usuarios').findOne({ email, senha });
        
        if (!usuario) {
            return res.status(401).json({ erro: 'Email ou senha incorretos' });
        }
        
        console.log(`✅ Login realizado: ${email}`);
        
        res.json({ 
            mensagem: 'Login realizado com sucesso!',
            usuario: {
                id: usuario._id,
                email: usuario.email,
                pontos_totais: usuario.pontos_totais || 0,
                streak_atual: usuario.streak_atual || 0,
                melhor_streak: usuario.melhor_streak || 0,
                total_partidas: usuario.total_partidas || 0,
                ultima_jogada: usuario.ultima_jogada || null
            }
        });
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ erro: 'Erro ao fazer login' });
    }
});

/// Buscar perguntas aleatórias (com filtro opcional por categoria)
// ===========================================
//  ROTA: GET /api/perguntas/aleatorias (no server.js)
// ===========================================
app.get('/api/perguntas/aleatorias', async (req, res) => {
  try {
    const quantidade = parseInt(req.query.quantidade) || 10;
    const categoria = req.query.categoria; // Pega o parâmetro 'categoria' da URL

    // --- LOGS ÚTEIS PARA DEPURAR NO TERMINAL DO SERVIDOR ---
    console.log('📩 Cliente pediu perguntas');
    console.log('   ➡️ quantidade:', quantidade);
    console.log('   ➡️ categoria recebida:', categoria); // Mostra a categoria que o backend recebeu

    const filtro = {}; // Objeto para construir o filtro do MongoDB

    // Só aplica o filtro se existir uma categoria válida e não for "Mix"
    if (
      categoria && // <--- CORRIGIDO: AGORA É &amp;&amp;
      categoria.trim() !== '' && // <--- CORRIGIDO: AGORA É &amp;&amp;
      categoria !== 'Mix' && // <--- CORRIGIDO: AGORA É &amp;&amp;
      categoria !== 'null' && // <--- CORRIGIDO: AGORA É &amp;&amp;
      categoria !== 'undefined'
    ) {
      filtro.categoria = categoria.trim(); // Adiciona a categoria ao filtro
      console.log('   ✅ Filtro de categoria aplicado:', filtro.categoria);
    } else {
      console.log('   🚫 Nenhum filtro de categoria aplicado (Modo MIX ou categoria inválida).');
    }

    // Conta o total de perguntas que correspondem ao filtro
    const totalPerguntasComFiltro = await db.collection('perguntas').countDocuments(filtro);
    // Limita a quantidade de perguntas a serem retornadas, sem exceder o total disponível
    const limite = Math.min(quantidade, totalPerguntasComFiltro);

    // Busca as perguntas no MongoDB
    const perguntas = await db.collection('perguntas').aggregate([
      { $match: filtro }, // Filtra as perguntas pela categoria (se houver)
      { $sample: { size: limite } }, // Seleciona aleatoriamente a quantidade desejada
    ]).toArray(); // Adicionado .toArray() para converter o cursor em array

    console.log(`🎯 Retornando ${perguntas.length} perguntas (filtro final:`, filtro, ')');
    res.json(perguntas); // Envia as perguntas como resposta
  } catch (err) {
    console.error('❌ Erro ao buscar perguntas:', err);
    res.status(500).json({ erro: 'Erro ao buscar perguntas' });
  }
});







// Buscar APENAS perguntas com imagens (para debug)
app.get('/api/perguntas/com-imagens', async (req, res) => {
    try {
        const quantidade = parseInt(req.query.quantidade) || 10;
        
        console.log(`\n========================================`);
        console.log(`🖼️  BUSCANDO APENAS PERGUNTAS COM IMAGENS`);
        console.log(`========================================`);
        
        // Buscar APENAS perguntas que têm o campo imagem
        const perguntas = await db.collection('perguntas')
            .find({ 
                imagem: { $exists: true, $ne: null, $ne: '' }
            })
            .limit(quantidade)
            .toArray();
        
        console.log(`✅ ${perguntas.length} perguntas COM IMAGENS encontradas`);
        
        // Mostrar detalhes
        perguntas.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.texto.substring(0, 40)}...`);
            console.log(`      Imagem: ${p.imagem}`);
        });
        
        console.log(`========================================\n`);
        
        res.json(perguntas);
        
    } catch (error) {
        console.error('❌ Erro ao buscar perguntas com imagens:', error);
        res.status(500).json({ erro: 'Erro ao buscar perguntas' });
    }
});





// Buscar categorias
app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await db.collection('categorias').find().toArray();
        
        console.log(`📚 ${categorias.length} categorias enviadas`);
        
        res.json(categorias);
        
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ erro: 'Erro ao buscar categorias' });
    }
});

// Buscar ranking
app.get('/api/ranking', async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        
        const ranking = await db.collection('usuarios')
            .find()
            .sort({ pontos_totais: -1 })
            .limit(limite)
            .project({ senha: 0 })
            .toArray();
        
        console.log(`🏆 Ranking enviado (${ranking.length} usuários)`);
        
        res.json(ranking);
        
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ erro: 'Erro ao buscar ranking' });
    }
});

// Salvar partida
app.post('/api/partidas', async (req, res) => {
    try {
        const { usuario_id, acertos, total_perguntas, pontos } = req.body;
        
        if (!usuario_id || acertos === undefined || !total_perguntas || !pontos) {
            return res.status(400).json({ erro: 'Dados incompletos' });
        }
        
        const partida = {
            usuario_id: new ObjectId(usuario_id),
            acertos,
            total_perguntas,
            pontos,
            data: new Date()
        };
        
        const resultado = await db.collection('partidas').insertOne(partida);
        
        await db.collection('usuarios').updateOne(
            { _id: new ObjectId(usuario_id) },
            { 
                $inc: { 
                    pontos_totais: pontos,
                    total_partidas: 1
                },
                $set: {
                    ultima_jogada: new Date()
                }
            }
        );
        
        console.log(`💾 Partida salva: ${acertos}/${total_perguntas} (${pontos} pts)`);
        
        res.status(201).json({ 
            mensagem: 'Partida salva com sucesso!',
            id: resultado.insertedId
        });
        
    } catch (error) {
        console.error('Erro ao salvar partida:', error);
        res.status(500).json({ erro: 'Erro ao salvar partida' });
    }
});

// Buscar histórico de partidas
app.get('/api/partidas/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const partidas = await db.collection('partidas')
            .find({ usuario_id: new ObjectId(id) })
            .sort({ data: -1 })
            .limit(20)
            .toArray();
        
        console.log(`📜 Histórico enviado (${partidas.length} partidas)`);
        
        res.json(partidas);
        
    } catch (error) {
        console.error('Erro ao buscar partidas:', error);
        res.status(500).json({ erro: 'Erro ao buscar partidas' });
    }
});

// Atualizar streak
app.post('/api/usuarios/:id/streak', async (req, res) => {
    try {
        const { id } = req.params;
        const { streak_atual, melhor_streak } = req.body;
        
        await db.collection('usuarios').updateOne(
            { _id: new ObjectId(id) },
            { 
                $set: { 
                    streak_atual,
                    melhor_streak,
                    ultima_jogada: new Date()
                }
            }
        );
        
        console.log(`🔥 Streak atualizado: ${streak_atual} dias`);
        
        res.json({ mensagem: 'Streak atualizado com sucesso!' });
        
    } catch (error) {
        console.error('Erro ao atualizar streak:', error);
        res.status(500).json({ erro: 'Erro ao atualizar streak' });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('==================================================');
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log('📡 API pronta para receber requisições!');
    console.log('==================================================\n');
});
