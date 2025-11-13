// ===================================
// SISTEMA DE STREAK (DIAS CONSECUTIVOS)
// ===================================

/**
 * Atualiza o streak do jogador baseado na última jogada
 * @returns {Object} - { streak: número, mensagem: string }
 */
function atualizarStreak() {
    // Buscar dados do jogador
    const dados = JSON.parse(localStorage.getItem('jogador')) || {
        streak_atual: 0,
        melhor_streak: 0,
        ultima_jogada: null
    };
    
    // Data de hoje (sem horas)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Data da última jogada (se existir)
    const ultimaJogada = dados.ultima_jogada ? new Date(dados.ultima_jogada) : null;
    
    if (ultimaJogada) {
        ultimaJogada.setHours(0, 0, 0, 0);
        
        // Calcular diferença em dias
        const diferencaDias = Math.floor((hoje - ultimaJogada) / (1000 * 60 * 60 * 24));
        
        if (diferencaDias === 0) {
            // Já jogou hoje - não altera o streak
            return { 
                streak: dados.streak_atual, 
                mensagem: "Você já jogou hoje! Continue amanhã para manter o streak." 
            };
            
        } else if (diferencaDias === 1) {
            // Jogou ontem - continua o streak
            dados.streak_atual += 1;
            
            // Atualizar melhor streak se necessário
            if (dados.streak_atual > dados.melhor_streak) {
                dados.melhor_streak = dados.streak_atual;
            }
            
            dados.ultima_jogada = hoje.toISOString();
            localStorage.setItem('jogador', JSON.stringify(dados));
            
            return { 
                streak: dados.streak_atual, 
                mensagem: `Parabéns! Você manteve o streak: ${dados.streak_atual} dias consecutivos! 🔥` 
            };
            
        } else {
            // Pulou um ou mais dias - reseta o streak
            dados.streak_atual = 1;
            dados.ultima_jogada = hoje.toISOString();
            localStorage.setItem('jogador', JSON.stringify(dados));
            
            return { 
                streak: 1, 
                mensagem: "Streak resetado. Comece novamente! 💪" 
            };
        }
        
    } else {
        // Primeira jogada do usuário
        dados.streak_atual = 1;
        dados.melhor_streak = 1;
        dados.ultima_jogada = hoje.toISOString();
        localStorage.setItem('jogador', JSON.stringify(dados));
        
        return { 
            streak: 1, 
            mensagem: "Primeiro dia do seu streak! Continue jogando todos os dias! 🎯" 
        };
    }
}

/**
 * Busca o streak atual do jogador
 * @returns {number} - Número de dias consecutivos
 */
function obterStreakAtual() {
    const dados = JSON.parse(localStorage.getItem('jogador')) || { streak_atual: 0 };
    return dados.streak_atual;
}

/**
 * Busca o melhor streak do jogador
 * @returns {number} - Melhor sequência de dias
 */
function obterMelhorStreak() {
    const dados = JSON.parse(localStorage.getItem('jogador')) || { melhor_streak: 0 };
    return dados.melhor_streak;
}

/**
 * Verifica se o jogador já jogou hoje
 * @returns {boolean} - true se já jogou, false se não jogou
 */
function jaJogouHoje() {
    const dados = JSON.parse(localStorage.getItem('jogador'));
    
    if (!dados || !dados.ultima_jogada) {
        return false;
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const ultimaJogada = new Date(dados.ultima_jogada);
    ultimaJogada.setHours(0, 0, 0, 0);
    
    return hoje.getTime() === ultimaJogada.getTime();
}

/**
 * Reseta o streak do jogador (útil para testes)
 */
function resetarStreak() {
    const dados = JSON.parse(localStorage.getItem('jogador'));
    if (dados) {
        dados.streak_atual = 0;
        dados.ultima_jogada = null;
        localStorage.setItem('jogador', JSON.stringify(dados));
    }
}

/**
 * Exibe o streak na interface
 * @param {string} elementId - ID do elemento HTML onde exibir
 */
function exibirStreak(elementId) {
    const streak = obterStreakAtual();
    const elemento = document.getElementById(elementId);
    
    if (elemento) {
        elemento.textContent = streak;
        
        // Adicionar classe visual se streak > 0
        if (streak > 0) {
            elemento.classList.add('streak-ativo');
        } else {
            elemento.classList.remove('streak-ativo');
        }
    }
}

/**
 * Calcula quantos dias faltam para quebrar o streak
 * @returns {number} - Dias restantes (0 se já quebrou)
 */
function diasParaQuebrarStreak() {
    const dados = JSON.parse(localStorage.getItem('jogador'));
    
    if (!dados || !dados.ultima_jogada) {
        return 0;
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const ultimaJogada = new Date(dados.ultima_jogada);
    ultimaJogada.setHours(0, 0, 0, 0);
    
    const diferencaDias = Math.floor((hoje - ultimaJogada) / (1000 * 60 * 60 * 24));
    
    if (diferencaDias === 0) {
        return 1; // Jogou hoje, tem 1 dia para jogar amanhã
    } else if (diferencaDias === 1) {
        return 0; // Precisa jogar hoje
    } else {
        return 0; // Já quebrou
    }
}

/**
 * Retorna uma mensagem motivacional baseada no streak
 * @returns {string} - Mensagem motivacional
 */
function obterMensagemMotivacional() {
    const streak = obterStreakAtual();  
    
    if (streak === 0) {
        return "Comece seu streak hoje! 🚀";
    } else if (streak === 1) {
        return "Primeiro dia! Continue amanhã! 💪";
    } else if (streak < 7) {
        return `${streak} dias! Você está indo bem! 🔥`;
    } else if (streak < 30) {
        return `${streak} dias consecutivos! Incrível! 🏆`;
    } else {
        return `${streak} dias! Você é uma lenda! 👑`;
    }
}

// Exportar funções (se estiver usando módulos ES6)
// export { atualizarStreak, obterStreakAtual, obterMelhorStreak, jaJogouHoje, resetarStreak, exibirStreak };
