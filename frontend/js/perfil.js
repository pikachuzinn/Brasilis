// ===================================
// PERFIL.JS - PÁGINA DE PERFIL
// ===================================

console.log('✅ perfil.js carregado');
console.log('🔗 API URL:', API_URL);

// Carregar perfil ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
    console.log('\n========================================');
    console.log('👤 PÁGINA DE PERFIL CARREGADA');
    console.log('========================================\n');
    
    verificarLogin();
    carregarPerfil();
    carregarConquistas();
    carregarHistorico();
});

// Carregar dados do perfil
function carregarPerfil() {
    console.log('🔄 Carregando dados do perfil...');
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const jogador = JSON.parse(localStorage.getItem('jogador'));
    
    if (!usuario || !jogador) {
        console.error('❌ Dados do usuário não encontrados!');
        alert('Erro ao carregar perfil. Faça login novamente.');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('👤 Usuário:', usuario);
    console.log('🎮 Jogador:', jogador);
    
    // Exibir email
    document.getElementById('perfilEmail').textContent = usuario.email;
    
    // Exibir estatísticas
    document.getElementById('statPontos').textContent = jogador.pontos_totais || 0;
    document.getElementById('statStreak').textContent = jogador.streak_atual || 0;
    document.getElementById('statPartidas').textContent = jogador.total_partidas || 0;
    document.getElementById('statMelhorStreak').textContent = jogador.melhor_streak || 0;
    
    console.log('✅ Perfil carregado com sucesso!');
}

// Carregar conquistas
function carregarConquistas() {
    console.log('🔄 Carregando conquistas...');
    
    const jogador = JSON.parse(localStorage.getItem('jogador'));
    
    const conquistas = [
        {
            id: 'primeira_vitoria',
            nome: 'Primeira Vitória',
            descricao: 'Complete seu primeiro quiz',
            icone: '🎯',
            desbloqueada: jogador.total_partidas >= 1
        },
        {
            id: 'veterano',
            nome: 'Veterano',
            descricao: 'Jogue 10 partidas',
            icone: '🎮',
            desbloqueada: jogador.total_partidas >= 10
        },
        {
            id: 'streak_7',
            nome: 'Dedicado',
            descricao: 'Mantenha um streak de 7 dias',
            icone: '🔥',
            desbloqueada: jogador.melhor_streak >= 7
        },
        {
            id: 'pontuador',
            nome: 'Pontuador',
            descricao: 'Alcance 500 pontos',
            icone: '💯',
            desbloqueada: jogador.pontos_totais >= 500
        },
        {
            id: 'mestre',
            nome: 'Mestre',
            descricao: 'Alcance 1000 pontos',
            icone: '👑',
            desbloqueada: jogador.pontos_totais >= 1000
        },
        {
            id: 'lenda',
            nome: 'Lenda',
            descricao: 'Mantenha um streak de 30 dias',
            icone: '⭐',
            desbloqueada: jogador.melhor_streak >= 30
        }
    ];
    
    const container = document.getElementById('conquistasGrid');
    container.innerHTML = '';
    
    conquistas.forEach(conquista => {
        console.log(`   ${conquista.icone} ${conquista.nome}: ${conquista.desbloqueada ? '✅' : '🔒'}`);
        
        const div = document.createElement('div');
        div.className = `conquista-card ${conquista.desbloqueada ? 'desbloqueada' : 'bloqueada'}`;
        
        div.innerHTML = `
            <div class="conquista-icone">${conquista.icone}</div>
            <div class="conquista-info">
                <h4 class="conquista-nome">${conquista.nome}</h4>
                <p class="conquista-desc">${conquista.descricao}</p>
            </div>
            ${conquista.desbloqueada ? '<i class="fas fa-check conquista-check"></i>' : '<i class="fas fa-lock conquista-lock"></i>'}
        `;
        
        container.appendChild(div);
    });
    
    console.log('✅ Conquistas carregadas!');
}

// Carregar histórico de partidas
async function carregarHistorico() {
    try {
        console.log('🔄 Carregando histórico de partidas...');
        
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        
        if (!usuario || !usuario.id) {
            throw new Error('ID do usuário não encontrado');
        }
        
        console.log('🌐 URL:', `${API_URL}/partidas/usuario/${usuario.id}`);
        
        const response = await fetch(`${API_URL}/partidas/usuario/${usuario.id}`);
        
        console.log('📦 Resposta recebida:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const partidas = await response.json();
        
        console.log('✅ Histórico carregado:', partidas);
        console.log('📊 Total de partidas:', partidas.length);
        
        exibirHistorico(partidas);
        
    } catch (error) {
        console.error('❌ Erro ao carregar histórico:', error);
        console.error('💡 Verifique se a API está rodando');
        
        document.getElementById('historicoList').innerHTML = `
            <div class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma partida jogada ainda.</p>
            </div>
        `;
    }
}

// Exibir histórico na tela
function exibirHistorico(partidas) {
    console.log('🎨 Renderizando histórico na tela...');
    
    const container = document.getElementById('historicoList');
    
    if (partidas.length === 0) {
        console.log('⚠️ Histórico vazio');
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>Nenhuma partida jogada ainda.</p>
                <p>Comece a jogar para ver seu histórico!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Mostrar apenas as últimas 10 partidas
    const ultimasPartidas = partidas.slice(0, 10);
    
    ultimasPartidas.forEach((partida, index) => {
        const data = new Date(partida.data);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const porcentagem = Math.round((partida.acertos / partida.total_perguntas) * 100);
        
        console.log(`   ${index + 1}. ${dataFormatada} - ${partida.acertos}/${partida.total_perguntas} (${porcentagem}%)`);
        
        const div = document.createElement('div');
        div.className = 'historico-item';
        
        div.innerHTML = `
            <div class="historico-data">
                <i class="fas fa-calendar"></i>
                ${dataFormatada}
            </div>
            <div class="historico-resultado">
                <span class="historico-acertos">${partida.acertos}/${partida.total_perguntas}</span>
                <span class="historico-porcentagem">${porcentagem}%</span>
            </div>
            <div class="historico-pontos">
                <i class="fas fa-star"></i>
                ${partida.pontos} pts
            </div>
        `;
        
        container.appendChild(div);
    });
    
    console.log('✅ Histórico renderizado com sucesso!');
}
