// ===================================
// RANKING.JS - SISTEMA DE RANKING
// ===================================

console.log('✅ ranking.js carregado');
console.log('🔗 API URL:', API_URL);

let filtroAtual = 'all';

// Carregar ranking ao abrir a página
window.addEventListener('DOMContentLoaded', () => {
    console.log('\n========================================');
    console.log('🏆 PÁGINA DE RANKING CARREGADA');
    console.log('========================================\n');
    
    verificarLogin();
    carregarRanking();
    configurarFiltros();
});

// Configurar botões de filtro
function configurarFiltros() {
    console.log('⚙️ Configurando filtros...');
    
    const botoes = document.querySelectorAll('.filter-btn');
    
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('🔄 Filtro alterado:', btn.dataset.filter);
            
            // Remover active de todos
            botoes.forEach(b => b.classList.remove('active'));
            
            // Adicionar active no clicado
            btn.classList.add('active');
            
            // Atualizar filtro
            filtroAtual = btn.dataset.filter;
            
            // Recarregar ranking
            carregarRanking();
        });
    });
    
    console.log('✅ Filtros configurados');
}

// Carregar ranking da API
async function carregarRanking() {
    try {
        console.log('🔄 Buscando ranking da API...');
        console.log('🌐 URL:', `${API_URL}/ranking?limite=10`);
        
        const response = await fetch(`${API_URL}/ranking?limite=10`);
        
        console.log('📦 Resposta recebida:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const ranking = await response.json();
        
        console.log('✅ Ranking carregado:', ranking);
        console.log('📊 Total de jogadores:', ranking.length);
        
        exibirRanking(ranking);
        exibirSuaPosicao(ranking);
        
    } catch (error) {
        console.error('❌ Erro ao carregar ranking:', error);
        console.error('💡 Verifique se a API está rodando em http://localhost:3000');
        
        const container = document.getElementById('rankingList');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar ranking.</p>
                <p>Verifique se a API está rodando.</p>
            </div>
        `;
    }
}

// Exibir ranking na tela
function exibirRanking(ranking) {
    console.log('🎨 Renderizando ranking na tela...');
    
    const container = document.getElementById('rankingList');
    
    if (!container) {
        console.error('❌ Elemento #rankingList não encontrado!');
        return;
    }
    
    if (ranking.length === 0) {
        console.log('⚠️ Ranking vazio');
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-inbox"></i>
                <p>Nenhum jogador no ranking ainda.</p>
                <p>Seja o primeiro a jogar!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    ranking.forEach((jogador, index) => {
        const posicao = index + 1;
        const isTop3 = posicao <= 3;
        
        console.log(`   ${posicao}. ${jogador.email} - ${jogador.pontos_totais || 0} pts`);
        
        const item = document.createElement('div');
        item.className = `ranking-item ${isTop3 ? 'top3' : ''}`;
        
        // Troféu para top 3
        let trofeu = '';
        if (posicao === 1) trofeu = '🥇';
        else if (posicao === 2) trofeu = '🥈';
        else if (posicao === 3) trofeu = '🥉';
        
        item.innerHTML = `
            <span class="rank-pos">${trofeu || posicao}</span>
            <span class="rank-player">${jogador.email.split('@')[0]}</span>
            <span class="rank-points">${jogador.pontos_totais || 0}</span>
            <span class="rank-streak">${jogador.streak_atual || 0} 🔥</span>
            <span class="rank-games">${jogador.total_partidas || 0}</span>
        `;
        
        container.appendChild(item);
    });
    
    console.log('✅ Ranking renderizado com sucesso!');
}

// Exibir posição do usuário logado
function exibirSuaPosicao(ranking) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        console.log('⚠️ Usuário não encontrado no localStorage');
        return;
    }
    
    const posicaoUsuario = ranking.findIndex(j => j.email === usuario.email) + 1;
    
    if (posicaoUsuario > 0) {
        console.log(`🎯 Sua posição: #${posicaoUsuario}`);
        
        const container = document.getElementById('yourPosition');
        container.style.display = 'block';
        container.innerHTML = `
            <i class="fas fa-user-circle"></i>
            Sua posição: <strong>#${posicaoUsuario}</strong> com <strong>${usuario.pontos_totais || 0} pontos</strong>
        `;
    } else {
        console.log('⚠️ Você ainda não está no ranking');
    }
}
