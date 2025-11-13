const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

// Perguntas com imagens REAIS (URLs RELATIVAS)
const PERGUNTAS_COM_IMAGENS = [
    // ===================================
    // BANDEIRAS DOS ESTADOS
    // ===================================
    {
        texto: 'Qual estado brasileiro tem esta bandeira?',
        categoria: 'Geografia',
        imagem: '/images/bandeiras/sao-paulo.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Rio de Janeiro', correta: false },
            { letra: 'B', texto: 'São Paulo', correta: true },
            { letra: 'C', texto: 'Minas Gerais', correta: false },
            { letra: 'D', texto: 'Bahia', correta: false }
        ]
    },
    {
        texto: 'Esta é a bandeira de qual estado?',
        categoria: 'Geografia',
        imagem: '/images/bandeiras/rio-de-janeiro.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'São Paulo', correta: false },
            { letra: 'B', texto: 'Espírito Santo', correta: false },
            { letra: 'C', texto: 'Rio de Janeiro', correta: true },
            { letra: 'D', texto: 'Paraná', correta: false }
        ]
    },
    {
        texto: 'Identifique o estado pela bandeira:',
        categoria: 'Geografia',
        imagem: '/images/bandeiras/minas-gerais.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Goiás', correta: false },
            { letra: 'B', texto: 'Minas Gerais', correta: true },
            { letra: 'C', texto: 'Mato Grosso', correta: false },
            { letra: 'D', texto: 'Tocantins', correta: false }
        ]
    },
    {
        texto: 'Qual estado possui esta bandeira?',
        categoria: 'Geografia',
        imagem: '/images/bandeiras/bahia.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Pernambuco', correta: false },
            { letra: 'B', texto: 'Ceará', correta: false },
            { letra: 'C', texto: 'Bahia', correta: true },
            { letra: 'D', texto: 'Sergipe', correta: false }
        ]
    },
    {
        texto: 'Esta bandeira pertence a qual estado?',
        categoria: 'Geografia',
        imagem: '/images/bandeiras/amazonas.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Pará', correta: false },
            { letra: 'B', texto: 'Amazonas', correta: true },
            { letra: 'C', texto: 'Acre', correta: false },
            { letra: 'D', texto: 'Rondônia', correta: false }
        ]
    },

    // ===================================
    // MONUMENTOS BRASILEIROS
    // ===================================
    {
        texto: 'Qual é este famoso monumento brasileiro?',
        categoria: 'Geografia',
        imagem: '/images/monumentos/cristo-redentor.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Pão de Açúcar', correta: false },
            { letra: 'B', texto: 'Cristo Redentor', correta: true },
            { letra: 'C', texto: 'Corcovado', correta: false },
            { letra: 'D', texto: 'Maracanã', correta: false }
        ]
    },
    {
        texto: 'Identifique este monumento:',
        categoria: 'Geografia',
        imagem: '/images/monumentos/congresso-nacional.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Palácio do Planalto', correta: false },
            { letra: 'B', texto: 'Supremo Tribunal Federal', correta: false },
            { letra: 'C', texto: 'Congresso Nacional', correta: true },
            { letra: 'D', texto: 'Catedral de Brasília', correta: false }
        ]
    },
    {
        texto: 'Qual é este ponto turístico brasileiro?',
        categoria: 'Geografia',
        imagem: '/images/monumentos/teatro-amazonas.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Teatro Municipal do Rio', correta: false },
            { letra: 'B', texto: 'Teatro Amazonas', correta: true },
            { letra: 'C', texto: 'Teatro Municipal de São Paulo', correta: false },
            { letra: 'D', texto: 'Theatro São Pedro', correta: false }
        ]
    },

    // ===================================
    // PERSONALIDADES HISTÓRICAS
    // ===================================
    {
        texto: 'Quem é esta personalidade histórica brasileira?',
        categoria: 'Historia',
        imagem: '/images/personalidades/tiradentes.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Dom Pedro I', correta: false },
            { letra: 'B', texto: 'Tiradentes', correta: true },
            { letra: 'C', texto: 'Duque de Caxias', correta: false },
            { letra: 'D', texto: 'Getúlio Vargas', correta: false }
        ]
    },
    {
        texto: 'Identifique esta figura histórica:',
        categoria: 'Historia',
        imagem: '/images/personalidades/princesa-isabel.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Princesa Isabel', correta: true },
            { letra: 'B', texto: 'Maria Leopoldina', correta: false },
            { letra: 'C', texto: 'Maria Quitéria', correta: false },
            { letra: 'D', texto: 'Anita Garibaldi', correta: false }
        ]
    },
    {
        texto: 'Quem é este importante líder brasileiro?',
        categoria: 'Historia',
        imagem: '/images/personalidades/zumbi.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Zumbi dos Palmares', correta: true },
            { letra: 'B', texto: 'Ganga Zumba', correta: false },
            { letra: 'C', texto: 'Dandara', correta: false },
            { letra: 'D', texto: 'Henrique Dias', correta: false }
        ]
    },

    // ===================================
    // MAPAS DO BRASIL
    // ===================================
    {
        texto: 'Qual região do Brasil está destacada no mapa?',
        categoria: 'Geografia',
        imagem: '/images/mapas/regiao-norte.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Região Norte', correta: true },
            { letra: 'B', texto: 'Região Nordeste', correta: false },
            { letra: 'C', texto: 'Região Centro-Oeste', correta: false },
            { letra: 'D', texto: 'Região Sul', correta: false }
        ]
    },
    {
        texto: 'Identifique a região destacada:',
        categoria: 'Geografia',
        imagem: '/images/mapas/regiao-nordeste.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Região Norte', correta: false },
            { letra: 'B', texto: 'Região Nordeste', correta: true },
            { letra: 'C', texto: 'Região Sudeste', correta: false },
            { letra: 'D', texto: 'Região Sul', correta: false }
        ]
    },
    {
        texto: 'Qual estado está destacado no mapa?',
        categoria: 'Geografia',
        imagem: '/images/mapas/estado-sao-paulo.png',
        tipo: 'imagem',
        alternativas: [
            { letra: 'A', texto: 'Rio de Janeiro', correta: false },
            { letra: 'B', texto: 'Minas Gerais', correta: false },
            { letra: 'C', texto: 'São Paulo', correta: true },
            { letra: 'D', texto: 'Paraná', correta: false }
        ]
    }
];

async function adicionarPerguntasComImagens() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await client.connect();

        const db = client.db('desafio_brasilis');

        // Limpar perguntas antigas com imagens
        console.log('🗑️  Removendo perguntas antigas com imagens...');
        await db.collection('perguntas').deleteMany({ tipo: 'imagem' });

        console.log('📝 Inserindo perguntas com imagens REAIS...');
        const resultado = await db.collection('perguntas').insertMany(PERGUNTAS_COM_IMAGENS);

        console.log(`✅ ${resultado.insertedCount} perguntas com imagens inseridas!\n`);

        console.log('🖼️  Perguntas com imagens adicionadas:');
        PERGUNTAS_COM_IMAGENS.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.texto} (${p.categoria})`);
            console.log(`      Imagem: ${p.imagem}`);
        });

    } catch (error) {
        console.error('❌ Erro ao adicionar perguntas:', error);
    } finally {
        await client.close();
        console.log('\n👋 Conexão fechada');
    }
}

adicionarPerguntasComImagens();
