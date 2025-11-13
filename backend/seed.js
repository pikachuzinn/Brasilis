const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

// Categorias
const CATEGORIAS = [
    {
        nome: 'Geografia',
        descricao: 'Estados, capitais e biomas do Brasil',
        icone: '🗺️',
        cor: '#4ECDC4'
    },
    {
        nome: 'Historia',
        descricao: 'Eventos históricos do Brasil',
        icone: '📚',
        cor: '#FFD700'
    },
    {
        nome: 'Folclore',
        descricao: 'Lendas e personagens do folclore brasileiro',
        icone: '🎭',
        cor: '#FF6B6B'
    }
];

// Perguntas (45 PERGUNTAS TOTAIS - 15 POR CATEGORIA)
const PERGUNTAS = [
    // ============= GEOGRAFIA (15) =============
    {
        texto: 'Qual o maior bioma brasileiro?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Mata Atlântica', correta: false },
            { letra: 'B', texto: 'Cerrado', correta: false },
            { letra: 'C', texto: 'Amazônia', correta: true },
            { letra: 'D', texto: 'Pantanal', correta: false }
        ]
    },
    {
        texto: 'Qual a capital do estado do Amazonas?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Belém', correta: false },
            { letra: 'B', texto: 'Manaus', correta: true },
            { letra: 'C', texto: 'Porto Velho', correta: false },
            { letra: 'D', texto: 'Rio Branco', correta: false }
        ]
    },
    {
        texto: 'Qual rio atravessa a cidade de São Paulo?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Rio Amazonas', correta: false },
            { letra: 'B', texto: 'Rio Tietê', correta: true },
            { letra: 'C', texto: 'Rio São Francisco', correta: false },
            { letra: 'D', texto: 'Rio Paraná', correta: false }
        ]
    },
    {
        texto: 'Qual é o maior estado brasileiro em extensão territorial?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'São Paulo', correta: false },
            { letra: 'B', texto: 'Minas Gerais', correta: false },
            { letra: 'C', texto: 'Amazonas', correta: true },
            { letra: 'D', texto: 'Bahia', correta: false }
        ]
    },
    {
        texto: 'Qual a capital do Rio Grande do Sul?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Curitiba', correta: false },
            { letra: 'B', texto: 'Porto Alegre', correta: true },
            { letra: 'C', texto: 'Florianópolis', correta: false },
            { letra: 'D', texto: 'Pelotas', correta: false }
        ]
    },
    {
        texto: 'Qual estado brasileiro é conhecido como "Terra da Garoa"?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Rio de Janeiro', correta: false },
            { letra: 'B', texto: 'São Paulo', correta: true },
            { letra: 'C', texto: 'Paraná', correta: false },
            { letra: 'D', texto: 'Santa Catarina', correta: false }
        ]
    },
    {
        texto: 'Qual o menor estado brasileiro?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Sergipe', correta: true },
            { letra: 'B', texto: 'Alagoas', correta: false },
            { letra: 'C', texto: 'Rio de Janeiro', correta: false },
            { letra: 'D', texto: 'Espírito Santo', correta: false }
        ]
    },
    {
        texto: 'Em qual região do Brasil fica o Pantanal?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Norte', correta: false },
            { letra: 'B', texto: 'Nordeste', correta: false },
            { letra: 'C', texto: 'Centro-Oeste', correta: true },
            { letra: 'D', texto: 'Sul', correta: false }
        ]
    },
    {
        texto: 'Qual a capital do Ceará?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Salvador', correta: false },
            { letra: 'B', texto: 'Recife', correta: false },
            { letra: 'C', texto: 'Fortaleza', correta: true },
            { letra: 'D', texto: 'Natal', correta: false }
        ]
    },
    {
        texto: 'Qual estado brasileiro faz fronteira com a Guiana Francesa?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Amazonas', correta: false },
            { letra: 'B', texto: 'Roraima', correta: false },
            { letra: 'C', texto: 'Amapá', correta: true },
            { letra: 'D', texto: 'Pará', correta: false }
        ]
    },
    {
        texto: 'Qual o maior rio totalmente brasileiro?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Rio Amazonas', correta: false },
            { letra: 'B', texto: 'Rio São Francisco', correta: true },
            { letra: 'C', texto: 'Rio Paraná', correta: false },
            { letra: 'D', texto: 'Rio Tocantins', correta: false }
        ]
    },
    {
        texto: 'Qual a capital do Mato Grosso?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Campo Grande', correta: false },
            { letra: 'B', texto: 'Cuiabá', correta: true },
            { letra: 'C', texto: 'Goiânia', correta: false },
            { letra: 'D', texto: 'Brasília', correta: false }
        ]
    },
    {
        texto: 'Qual estado tem o maior litoral do Brasil?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Rio de Janeiro', correta: false },
            { letra: 'B', texto: 'São Paulo', correta: false },
            { letra: 'C', texto: 'Bahia', correta: true },
            { letra: 'D', texto: 'Santa Catarina', correta: false }
        ]
    },
    {
        texto: 'Qual a capital de Pernambuco?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Salvador', correta: false },
            { letra: 'B', texto: 'Fortaleza', correta: false },
            { letra: 'C', texto: 'Recife', correta: true },
            { letra: 'D', texto: 'Maceió', correta: false }
        ]
    },
    {
        texto: 'Qual região brasileira tem mais estados?',
        categoria: 'Geografia',
        alternativas: [
            { letra: 'A', texto: 'Sul', correta: false },
            { letra: 'B', texto: 'Nordeste', correta: true },
            { letra: 'C', texto: 'Norte', correta: false },
            { letra: 'D', texto: 'Centro-Oeste', correta: false }
        ]
    },

    // ============= HISTÓRIA (15) =============
    {
        texto: 'Quem foi o primeiro presidente do Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Getúlio Vargas', correta: false },
            { letra: 'B', texto: 'Juscelino Kubitschek', correta: false },
            { letra: 'C', texto: 'Deodoro da Fonseca', correta: true },
            { letra: 'D', texto: 'Dom Pedro II', correta: false }
        ]
    },
    {
        texto: 'Em que ano foi proclamada a independência do Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: '1808', correta: false },
            { letra: 'B', texto: '1822', correta: true },
            { letra: 'C', texto: '1889', correta: false },
            { letra: 'D', texto: '1500', correta: false }
        ]
    },
    {
        texto: 'Quem assinou a Lei Áurea que aboliu a escravidão no Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Dom Pedro I', correta: false },
            { letra: 'B', texto: 'Princesa Isabel', correta: true },
            { letra: 'C', texto: 'Tiradentes', correta: false },
            { letra: 'D', texto: 'Zumbi dos Palmares', correta: false }
        ]
    },
    {
        texto: 'Em que ano foi proclamada a República no Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: '1822', correta: false },
            { letra: 'B', texto: '1888', correta: false },
            { letra: 'C', texto: '1889', correta: true },
            { letra: 'D', texto: '1891', correta: false }
        ]
    },
    {
        texto: 'Quem foi o líder da Inconfidência Mineira?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Dom Pedro I', correta: false },
            { letra: 'B', texto: 'Tiradentes', correta: true },
            { letra: 'C', texto: 'Zumbi dos Palmares', correta: false },
            { letra: 'D', texto: 'Duque de Caxias', correta: false }
        ]
    },
    {
        texto: 'Qual presidente construiu Brasília?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Getúlio Vargas', correta: false },
            { letra: 'B', texto: 'Juscelino Kubitschek', correta: true },
            { letra: 'C', texto: 'João Goulart', correta: false },
            { letra: 'D', texto: 'Jânio Quadros', correta: false }
        ]
    },
    {
        texto: 'Quem descobriu o Brasil oficialmente?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Cristóvão Colombo', correta: false },
            { letra: 'B', texto: 'Pedro Álvares Cabral', correta: true },
            { letra: 'C', texto: 'Vasco da Gama', correta: false },
            { letra: 'D', texto: 'Fernão de Magalhães', correta: false }
        ]
    },
    {
        texto: 'Em que ano a Lei Áurea foi assinada?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: '1822', correta: false },
            { letra: 'B', texto: '1850', correta: false },
            { letra: 'C', texto: '1888', correta: true },
            { letra: 'D', texto: '1889', correta: false }
        ]
    },
    {
        texto: 'Qual foi a capital do Brasil antes de Brasília?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Salvador', correta: false },
            { letra: 'B', texto: 'Rio de Janeiro', correta: true },
            { letra: 'C', texto: 'São Paulo', correta: false },
            { letra: 'D', texto: 'Ouro Preto', correta: false }
        ]
    },
    {
        texto: 'Quem foi Zumbi dos Palmares?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Um presidente do Brasil', correta: false },
            { letra: 'B', texto: 'Líder do Quilombo dos Palmares', correta: true },
            { letra: 'C', texto: 'Um bandeirante', correta: false },
            { letra: 'D', texto: 'Um imperador', correta: false }
        ]
    },
    {
        texto: 'Em que ano o Brasil foi descoberto?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: '1492', correta: false },
            { letra: 'B', texto: '1500', correta: true },
            { letra: 'C', texto: '1550', correta: false },
            { letra: 'D', texto: '1600', correta: false }
        ]
    },
    {
        texto: 'Quem proclamou a independência do Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Dom João VI', correta: false },
            { letra: 'B', texto: 'Dom Pedro I', correta: true },
            { letra: 'C', texto: 'Dom Pedro II', correta: false },
            { letra: 'D', texto: 'Princesa Isabel', correta: false }
        ]
    },
    {
        texto: 'Qual foi a primeira capital do Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Rio de Janeiro', correta: false },
            { letra: 'B', texto: 'Salvador', correta: true },
            { letra: 'C', texto: 'São Paulo', correta: false },
            { letra: 'D', texto: 'Recife', correta: false }
        ]
    },
    {
        texto: 'Quantos anos durou a escravidão no Brasil?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'Aproximadamente 200 anos', correta: false },
            { letra: 'B', texto: 'Aproximadamente 300 anos', correta: false },
            { letra: 'C', texto: 'Aproximadamente 388 anos', correta: true },
            { letra: 'D', texto: 'Aproximadamente 500 anos', correta: false }
        ]
    },
    {
        texto: 'Qual bandeira foi hasteada na Proclamação da República?',
        categoria: 'Historia',
        alternativas: [
            { letra: 'A', texto: 'A bandeira atual', correta: false },
            { letra: 'B', texto: 'Uma bandeira provisória com 13 listras', correta: true },
            { letra: 'C', texto: 'A bandeira imperial', correta: false },
            { letra: 'D', texto: 'A bandeira de Portugal', correta: false }
        ]
    },

    // ============= FOLCLORE (15) =============
    {
        texto: 'Qual personagem do folclore brasileiro protege as matas?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci-Pererê', correta: false },
            { letra: 'B', texto: 'Curupira', correta: true },
            { letra: 'C', texto: 'Boto Cor-de-Rosa', correta: false },
            { letra: 'D', texto: 'Mula sem Cabeça', correta: false }
        ]
    },
    {
        texto: 'Qual é a lenda do personagem que tem apenas uma perna?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci-Pererê', correta: true },
            { letra: 'B', texto: 'Curupira', correta: false },
            { letra: 'C', texto: 'Iara', correta: false },
            { letra: 'D', texto: 'Caipora', correta: false }
        ]
    },
    {
        texto: 'Qual personagem do folclore vive nas águas dos rios?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Lobisomem', correta: false },
            { letra: 'B', texto: 'Iara', correta: true },
            { letra: 'C', texto: 'Boitatá', correta: false },
            { letra: 'D', texto: 'Cuca', correta: false }
        ]
    },
    {
        texto: 'Qual personagem tem os pés virados para trás?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci', correta: false },
            { letra: 'B', texto: 'Curupira', correta: true },
            { letra: 'C', texto: 'Caipora', correta: false },
            { letra: 'D', texto: 'Lobisomem', correta: false }
        ]
    },
    {
        texto: 'Qual lenda protege a fauna e a flora da floresta?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Cuca', correta: false },
            { letra: 'B', texto: 'Caipora', correta: true },
            { letra: 'C', texto: 'Mula sem Cabeça', correta: false },
            { letra: 'D', texto: 'Boto', correta: false }
        ]
    },
    {
        texto: 'Qual personagem do folclore é uma serpente de fogo?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Boitatá', correta: true },
            { letra: 'B', texto: 'Iara', correta: false },
            { letra: 'C', texto: 'Boto', correta: false },
            { letra: 'D', texto: 'Curupira', correta: false }
        ]
    },
    {
        texto: 'Qual lenda vira lobisomem nas noites de lua cheia?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'O sétimo filho homem', correta: true },
            { letra: 'B', texto: 'O primeiro filho', correta: false },
            { letra: 'C', texto: 'O terceiro filho', correta: false },
            { letra: 'D', texto: 'O quinto filho', correta: false }
        ]
    },
    {
        texto: 'Qual personagem assusta viajantes e solta fogo pelas narinas?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci', correta: false },
            { letra: 'B', texto: 'Curupira', correta: false },
            { letra: 'C', texto: 'Mula sem Cabeça', correta: true },
            { letra: 'D', texto: 'Cuca', correta: false }
        ]
    },
    {
        texto: 'Qual personagem usa um gorro vermelho mágico?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci-Pererê', correta: true },
            { letra: 'B', texto: 'Curupira', correta: false },
            { letra: 'C', texto: 'Caipora', correta: false },
            { letra: 'D', texto: 'Boto', correta: false }
        ]
    },
    {
        texto: 'Qual personagem do folclore se transforma em um rapaz bonito nas festas?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci', correta: false },
            { letra: 'B', texto: 'Boto Cor-de-Rosa', correta: true },
            { letra: 'C', texto: 'Curupira', correta: false },
            { letra: 'D', texto: 'Lobisomem', correta: false }
        ]
    },
    {
        texto: 'Qual personagem adora pregar peças e fazer travessuras?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci-Pererê', correta: true },
            { letra: 'B', texto: 'Iara', correta: false },
            { letra: 'C', texto: 'Curupira', correta: false },
            { letra: 'D', texto: 'Boitatá', correta: false }
        ]
    },
    {
        texto: 'Qual criatura do folclore tem cabeça de jacaré?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Iara', correta: false },
            { letra: 'B', texto: 'Cuca', correta: true },
            { letra: 'C', texto: 'Boto', correta: false },
            { letra: 'D', texto: 'Saci', correta: false }
        ]
    },
    {
        texto: 'Qual personagem do folclore monta um porco do mato?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Saci', correta: false },
            { letra: 'B', texto: 'Caipora', correta: true },
            { letra: 'C', texto: 'Curupira', correta: false },
            { letra: 'D', texto: 'Lobisomem', correta: false }
        ]
    },
    {
        texto: 'Qual lenda é conhecida por atrair os homens com seu canto?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: 'Cuca', correta: false },
            { letra: 'B', texto: 'Iara', correta: true },
            { letra: 'C', texto: 'Mula sem Cabeça', correta: false },
            { letra: 'D', texto: 'Caipora', correta: false }
        ]
    },
    {
        texto: 'Qual o dia em que se comemora o Folclore Brasileiro?',
        categoria: 'Folclore',
        alternativas: [
            { letra: 'A', texto: '15 de agosto', correta: false },
            { letra: 'B', texto: '22 de agosto', correta: true },
            { letra: 'C', texto: '7 de setembro', correta: false },
            { letra: 'D', texto: '12 de outubro', correta: false }
        ]
    }
];

async function popularBanco() {
    try {
        console.log('🔄 Conectando ao MongoDB...');
        await client.connect();
        
        const db = client.db('desafio_brasilis');
        
        // Limpar e inserir categorias
        console.log('🗑️  Limpando categorias antigas...');
        await db.collection('categorias').deleteMany({});
        
        console.log('📚 Inserindo categorias...');
        await db.collection('categorias').insertMany(CATEGORIAS);
        console.log('✅ Categorias inseridas');
        
        // Limpar e inserir perguntas
        console.log('🗑️  Limpando perguntas antigas...');
        await db.collection('perguntas').deleteMany({});
        
        console.log('📝 Inserindo perguntas...');
        const resultado = await db.collection('perguntas').insertMany(PERGUNTAS);
        
        console.log(`✅ ${resultado.insertedCount} perguntas inseridas com sucesso!\n`);
        
        // Estatísticas por categoria
        console.log('📊 ESTATÍSTICAS:');
        const geografia = PERGUNTAS.filter(p => p.categoria === 'Geografia').length;
        const historia = PERGUNTAS.filter(p => p.categoria === 'Historia').length;
        const folclore = PERGUNTAS.filter(p => p.categoria === 'Folclore').length;
        
        console.log(`   🗺️  Geografia: ${geografia} perguntas`);
        console.log(`   📚 História: ${historia} perguntas`);
        console.log(`   🎭 Folclore: ${folclore} perguntas`);
        console.log(`   📝 TOTAL: ${PERGUNTAS.length} perguntas\n`);
        
    } catch (error) {
        console.error('❌ Erro ao popular banco:', error);
    } finally {
        await client.close();
        console.log('👋 Conexão fechada');
    }
}

popularBanco();
