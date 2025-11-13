// ===================================
// LÓGICA DO QUIZ (COM API E TIMER)
// ===================================

// API_URL já está definido em config.js
// Certifique-se que config.js é carregado antes de quiz.js no seu HTML

let perguntasRodada = [];
let perguntaAtual = 0;
let acertosRodada = 0;
let categoriaAtual = "Geral";
let pontosRodada = 0; // Para acumular os pontos da rodada

// Variáveis para o Timer
let tempoRestante = 30;
let timerInterval = null;
const TEMPO_TOTAL_PERGUNTA = 30; // Tempo padrão para cada pergunta (em segundos)
const TEMPO_AVANCO_AUTOMATICO = 2000; // 2 segundos para avançar após resposta/tempo esgotado

console.log('✅ quiz.js carregado');

// Referências aos elementos do DOM para o Timer e Placar
const timerDisplay = document.getElementById('timerDisplay');
const timerBar = document.getElementById('timerBar');
const timerContainer = document.getElementById('timerContainer'); // Para o indicador de bônus
const acertosTexto = document.getElementById('acertosTexto'); // Elemento para exibir acertos
const pontosTexto = document.getElementById('pontosTexto');   // Elemento para exibir pontos
const streakAtualSpan = document.getElementById('streakAtual'); // Elemento para exibir o streak

// Função para decodificar entidades HTML de forma robusta
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    let decodedText = text;
    let previousDecodedText = '';
    // Loop para decodificar múltiplas camadas de entidades HTML
    while (decodedText !== previousDecodedText) {
        previousDecodedText = decodedText;
        textArea.innerHTML = decodedText;
        decodedText = textArea.value;
    }
    return decodedText;
}

// ---------- Carrega perguntas ----------
async function buscarPerguntas() {
    try {
        const categoriaEscolhida = localStorage.getItem('categoriaEscolhida');
        console.log('📚 Categoria escolhida (do localStorage):', categoriaEscolhida);

        // A API_URL agora é 'http://localhost:3000', então adicionamos '/api' aqui.
        let url = `${API_URL}/api/perguntas/aleatorias?quantidade=10`;

        // CORREÇÃO AQUI: Usar &amp;&amp; (dois "e" comerciais) e &amp; (um "e" comercial) para a URL
        if (
            categoriaEscolhida && // <--- CORRIGIDO: AGORA É &amp;&amp;
            categoriaEscolhida.trim() !== '' && // <--- CORRIGIDO: AGORA É &amp;&amp;
            categoriaEscolhida !== 'Mix' && // <--- CORRIGIDO: AGORA É &amp;&amp;
            categoriaEscolhida !== 'null' && // <--- CORRIGIDO: AGORA É &amp;&amp;
            categoriaEscolhida !== 'undefined'
        ) {
            // CORREÇÃO AQUI: AQUI DEVE SER APENAS &amp; (um "e" comercial) para separar os parâmetros
            url += `&amp;categoria=${encodeURIComponent(categoriaEscolhida)}`;
            console.log('🎯 Filtrando por categoria:', categoriaEscolhida);
        } else {
            console.log('🎲 Modo MIX — todas as categorias');
        }

        console.log('🌐 Requisição à URL:', url); // Log da URL final

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao buscar perguntas: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const perguntas = await response.json();
        console.log(`✅ ${perguntas.length} perguntas carregadas`);
        return perguntas;
    } catch (err) {
        console.error('❌ Erro ao buscar perguntas:', err);
        alert('Erro ao carregar perguntas da API. Verifique o console para mais detalhes.');
        return [];
    }
}




// Inicializar quiz
window.addEventListener('DOMContentLoaded', async () => {
    console.log('\n========================================');
    console.log('🎮 INICIANDO QUIZ');
    console.log('========================================\n');

    verificarLogin();

    perguntasRodada = await buscarPerguntas();

    if (perguntasRodada.length > 0) {
        console.log(`📝 Total de perguntas: ${perguntasRodada.length}`);
        exibirPergunta();
        atualizarStreakDisplay();
    } else {
        console.error('❌ Nenhuma pergunta disponível!');
        alert('Nenhuma pergunta disponível!');
        window.location.href = 'home.html';
    }
});

// Exibir pergunta
function exibirPergunta() {
    if (perguntaAtual >= perguntasRodada.length) {
        finalizarQuiz();
        return;
    }

    const pergunta = perguntasRodada[perguntaAtual];

    // Iniciar o timer para a nova pergunta
    pararTimer(); // Garante que qualquer timer anterior seja parado
    iniciarTimer();

    console.log(`\n📝 Exibindo pergunta ${perguntaAtual + 1}/${perguntasRodada.length}`);
    console.log(`   Categoria: ${pergunta.categoria}`);
    console.log(`   Texto: ${pergunta.texto}`);

    document.getElementById('numeroPergunta').textContent = `Pergunta ${perguntaAtual + 1} de ${perguntasRodada.length}`;
    document.getElementById('categoriaNome').textContent = pergunta.categoria; // Exibe a categoria da pergunta atual

    const progresso = ((perguntaAtual + 1) / perguntasRodada.length) * 100;
    document.getElementById('progressoBar').style.width = `${progresso}%`;

    const textoPerguntaElement = document.getElementById('textoPergunta');
    if (pergunta.imagem) {
        textoPerguntaElement.innerHTML = `
            <i class="fas fa-image"></i> ${decodeHtmlEntities(pergunta.texto)}
        `;
    } else {
        textoPerguntaElement.innerHTML = decodeHtmlEntities(pergunta.texto);
    }

    const imagemContainer = document.getElementById('imagemPerguntaContainer');
    if (imagemContainer) {
        imagemContainer.innerHTML = '';
        if (pergunta.imagem) {
            console.log(`   🖼️  Imagem: ${pergunta.imagem}`);
            const imgElement = document.createElement('img');
            imgElement.src = `${API_URL}${pergunta.imagem}`;
            imgElement.alt = 'Imagem da pergunta';
            imgElement.className = 'pergunta-imagem';
            imgElement.onclick = () => abrirImagemModal(`${API_URL}${pergunta.imagem}`);
            imagemContainer.appendChild(imgElement);
            imagemContainer.style.display = 'block';
        } else {
            imagemContainer.style.display = 'none';
        }
    }

    const alternativasContainer = document.getElementById('alternativasContainer');
    alternativasContainer.innerHTML = '';

    if (pergunta.alternativas && Array.isArray(pergunta.alternativas)) {
        pergunta.alternativas.forEach(alt => {
            const btn = document.createElement('button');
            btn.className = 'alternativa-btn';
            btn.onclick = () => selecionarResposta(alt.letra);

            btn.innerHTML = `
                <span class="alternativa-letra">${alt.letra}</span>
                <span class="alternativa-texto">${decodeHtmlEntities(alt.texto)}</span>
            `;

            alternativasContainer.appendChild(btn);
        });
    } else {
        console.error("Erro: A pergunta atual não possui alternativas válidas.", pergunta);
        setTimeout(() => proximaPergunta(), TEMPO_AVANCO_AUTOMATICO); // Avanço automático
    }

    console.log('✅ Pergunta exibida');

    if (acertosTexto) acertosTexto.textContent = acertosRodada;
    if (pontosTexto) pontosTexto.textContent = pontosRodada;
}

// ===================================
// FUNÇÕES DO TIMER
// ===================================

function iniciarTimer() {
    tempoRestante = TEMPO_TOTAL_PERGUNTA;
    atualizarDisplayTimer();

    if (timerInterval) {
        clearInterval(timerInterval); // Limpa qualquer timer anterior
    }

    timerInterval = setInterval(() => {
        tempoRestante--;
        atualizarDisplayTimer();

        if (tempoRestante <= 0) {
            tempoEsgotado();
        }
    }, 1000);
}

function pararTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function atualizarDisplayTimer() {
    if (!timerDisplay || !timerBar) return;

    timerDisplay.textContent = tempoRestante;

    const porcentagem = (tempoRestante / TEMPO_TOTAL_PERGUNTA) * 100;
    timerBar.style.width = `${porcentagem}%`;

    console.log(`Timer: ${tempoRestante}s, Barra: ${porcentagem.toFixed(2)}%`); 

    // Remove classes de aviso/perigo antes de adicionar novamente
    timerDisplay.classList.remove('warning', 'danger');
    timerBar.classList.remove('warning', 'danger');

    if (tempoRestante <= 5) {
        timerDisplay.classList.add('danger');
        timerBar.classList.add('danger');
    } else if (tempoRestante <= 10) {
        timerDisplay.classList.add('warning');
        timerBar.classList.add('warning');
    }
}

function tempoEsgotado() {
    pararTimer();

    const botoes = document.querySelectorAll('.alternativa-btn');
    botoes.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
    });

    const pergunta = perguntasRodada[perguntaAtual];
    if (pergunta && pergunta.alternativas && Array.isArray(pergunta.alternativas)) {
        const alternativaCorreta = pergunta.alternativas.find(alt => alt.correta);
        if (alternativaCorreta) {
            botoes.forEach(btn => {
                const letraElement = btn.querySelector('.alternativa-letra');
                if (letraElement && letraElement.textContent === alternativaCorreta.letra) {
                    btn.classList.add('correta');
                }
            });
        }
    }

    setTimeout(() => proximaPergunta(), TEMPO_AVANCO_AUTOMATICO);
}

function calcularBonus() {
    if (tempoRestante >= 25) return 50;
    if (tempoRestante >= 20) return 40;
    if (tempoRestante >= 15) return 30;
    if (tempoRestante >= 10) return 20;
    if (tempoRestante >= 5) return 10;
    return 0;
}

function mostrarBonusIndicador(bonus) {
    if (bonus === 0 || !timerContainer) return;

    const indicator = document.createElement('div');
    indicator.className = 'bonus-indicator';
    indicator.textContent = `+${bonus} pts bônus! ⚡`;

    timerContainer.parentNode.insertBefore(indicator, timerContainer.nextSibling);

    setTimeout(() => {
        indicator.remove();
    }, 2000);
}

// ===================================
// FEEDBACK VISUAL (FUNÇÃO mostrarFeedback MANTIDA, MAS NÃO CHAMADA)
// ===================================

function mostrarFeedback(correto, mensagem) {
    // Esta função não será mais chamada, mas é mantida aqui caso queira reativar
    const feedback = document.createElement('div');
    feedback.className = `feedback ${correto ? 'feedback-correto' : 'feedback-incorreto'}`;
    feedback.textContent = mensagem;

    const quizContent = document.querySelector('.quiz-content');
    const quizBody = document.querySelector('.quiz-body');
    if (quizContent && quizBody) {
        quizContent.insertBefore(feedback, quizBody);
    } else {
        document.body.appendChild(feedback);
    }

    setTimeout(() => feedback.remove(), 3000);
}

// Selecionar resposta
function selecionarResposta(letraSelecionada) {
    pararTimer(); // Para o timer ao selecionar a resposta
    console.log(`👆 Resposta selecionada: ${letraSelecionada}`);

    const pergunta = perguntasRodada[perguntaAtual];
    const alternativaCorreta = pergunta.alternativas.find(a => a.correta);
    const alternativaSelecionada = pergunta.alternativas.find(a => a.letra === letraSelecionada);

    const botoes = document.querySelectorAll('.alternativa-btn');
    botoes.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    });

    botoes.forEach(btn => {
        const letraElement = btn.querySelector('.alternativa-letra');
        const letra = letraElement ? letraElement.textContent : '';

        if (letra === letraSelecionada) {
            if (alternativaSelecionada.correta) {
                console.log('✅ Resposta correta!');
                btn.classList.add('correta');
                acertosRodada++;

                const pontosBase = 100;
                const bonusTempo = calcularBonus(); // Calcula bônus de tempo
                const pontosGanhos = pontosBase + bonusTempo;
                pontosRodada += pontosGanhos;
                mostrarBonusIndicador(bonusTempo); // Mostra o indicador de bônus
            } else {
                console.log('❌ Resposta incorreta');
                btn.classList.add('errada');
            }
        }

        if (letraElement && alternativaCorreta && letraElement.textContent === alternativaCorreta.letra) {
            btn.classList.add('correta');
        }
    });

    console.log(`📊 Acertos até agora: ${acertosRodada}/${perguntaAtual + 1}`);
    if (acertosTexto) acertosTexto.textContent = acertosRodada;
    if (pontosTexto) pontosTexto.textContent = pontosRodada;

    setTimeout(() => proximaPergunta(), TEMPO_AVANCO_AUTOMATICO);
}

// Próxima pergunta
function proximaPergunta() {
    perguntaAtual++;

    if (perguntaAtual < perguntasRodada.length) {
        console.log(`🔄 Avançando para pergunta ${perguntaAtual + 1}`);
        exibirPergunta();
    } else {
        console.log('🏁 Quiz finalizado!');
        finalizarQuiz();
    }
}

// Finalizar quiz
async function finalizarQuiz() {
    pararTimer(); // Garante que o timer pare ao finalizar o quiz
    console.log('\n========================================');
    console.log('🏁 FINALIZANDO QUIZ');
    console.log('========================================\n');

    const pontos = pontosRodada;
    const porcentagem = Math.round((acertosRodada / perguntasRodada.length) * 100);

    console.log(`📊 Resultado Final:`);
    console.log(`   Acertos: ${acertosRodada}/${perguntasRodada.length}`);
    console.log(`   Pontos: ${pontos}`);
    console.log(`   Aproveitamento: ${porcentagem}%`);

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (usuario && usuario.id) {
        try {
            console.log('💾 Salvando partida na API...');

            await fetch(`${API_URL}/partidas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    pontos: pontos,
                    acertos: acertosRodada,
                    total_perguntas: perguntasRodada.length
                })
            });

            console.log('✅ Partida salva na API');

            const dadosJogador = JSON.parse(localStorage.getItem('jogador'));
            if (dadosJogador) {
                dadosJogador.pontos_totais = (dadosJogador.pontos_totais || 0) + pontos;
                dadosJogador.total_partidas = (dadosJogador.total_partidas || 0) + 1;
                localStorage.setItem('jogador', JSON.stringify(dadosJogador));
            } else {
                console.warn('⚠️ Objeto "jogador" não encontrado no localStorage. Criando um novo.');
                localStorage.setItem('jogador', JSON.stringify({
                    pontos_totais: pontos,
                    total_partidas: 1,
                    streak_atual: 0,
                    melhor_streak: 0
                }));
            }

            console.log('✅ Dados atualizados no localStorage');

            await atualizarStreak();

        } catch (error) {
            console.error('❌ Erro ao salvar partida:', error);
        }
    }

    mostrarResultado(acertosRodada, perguntasRodada.length, pontos, porcentagem);
}

// Mostrar resultado
function mostrarResultado(acertos, total, pontos, porcentagem) {
    console.log('🎉 Exibindo modal de resultado');

    document.getElementById('resultadoAcertos').textContent = `${acertos}/${total}`;
    document.getElementById('resultadoPontos').textContent = pontos;
    document.getElementById('resultadoPorcentagem').textContent = `${porcentagem}%`;

    const icone = document.getElementById('resultadoIcone');
    const titulo = document.getElementById('resultadoTitulo');
    const mensagem = document.getElementById('resultadoMensagem');

    if (porcentagem >= 80) {
        icone.className = 'fas fa-trophy resultado-icone sucesso';
        titulo.textContent = 'Excelente!';
        mensagem.textContent = 'Você mandou muito bem! Continue assim!';
    } else if (porcentagem >= 60) {
        icone.className = 'fas fa-star resultado-icone medio';
        titulo.textContent = 'Muito Bom!';
        mensagem.textContent = 'Bom trabalho! Continue praticando!';
    } else {
        icone.className = 'fas fa-medal resultado-icone baixo';
        titulo.textContent = 'Continue Tentando!';
        mensagem.textContent = 'Não desista! A prática leva à perfeição!';
    }

    document.getElementById('resultadoModal').style.display = 'flex';
}

// ===================================
// ATUALIZAR STREAK (INTEGRADO COM API)
// ===================================

async function atualizarStreak() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.id) {
        console.log('Usuário não logado. Streak não atualizado.');
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let ultimaJogada = null;
    if (usuario.ultima_jogada) {
        ultimaJogada = new Date(usuario.ultima_jogada);
        ultimaJogada.setHours(0, 0, 0, 0);
    }

    let novaStreak = usuario.streak_atual || 0;
    let melhorStreak = usuario.melhor_streak || 0;

    if (ultimaJogada) {
        const diffTime = Math.abs(hoje - ultimaJogada);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            novaStreak++;
        } else if (diffDays > 1) {
            novaStreak = 1;
        } else {
            // Já jogou no mesmo dia, mantém a streak atual
        }
    } else {
        novaStreak = 1;
    }

    if (novaStreak > melhorStreak) {
        melhorStreak = novaStreak;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/${usuario.id}/streak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                streak_atual: novaStreak,
                melhor_streak: melhorStreak,
                ultima_jogada: hoje.toISOString()
            })
        });

        if (response.ok) {
            console.log(`🔥 Streak atualizado para: ${novaStreak} dias (Melhor: ${melhorStreak})`);
            usuario.streak_atual = novaStreak;
            usuario.melhor_streak = melhorStreak;
            usuario.ultima_jogada = hoje.toISOString();
            localStorage.setItem('usuario', JSON.stringify(usuario));

            const jogador = JSON.parse(localStorage.getItem('jogador'));
            if (jogador) {
                jogador.streak_atual = novaStreak;
                jogador.melhor_streak = melhorStreak;
                jogador.ultima_jogada = hoje.toISOString();
                localStorage.setItem('jogador', JSON.stringify(jogador));
            }

            if (streakAtualSpan) {
                streakAtualSpan.textContent = novaStreak;
            }
        } else {
            console.error('Erro ao atualizar streak:', await response.text());
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar streak:', error);
    }
}

// Jogar novamente
function jogarNovamente() {
    console.log('🔄 Reiniciando quiz...');
    window.location.reload();
}

// Ver ranking
function verRanking() {
    console.log('🏆 Redirecionando para ranking...');
    window.location.href = 'ranking.html';
}

// NOVO: Função para voltar para a página de categorias
function voltarCategorias() {
    console.log('🏠 Voltando para a seleção de categorias...');
    window.location.href = 'categorias.html';
}

// REMOVIDO: Função voltarHome()
// function voltarHome() {
//     console.log('🏠 Voltando para home...');
//     window.location.href = 'home.html';
// }

// Atualizar display do streak (chamado no início do quiz)
function atualizarStreakDisplay() {
    const dados = JSON.parse(localStorage.getItem('jogador')) || { streak_atual: 0 };
    if (streakAtualSpan) {
        streakAtualSpan.textContent = dados.streak_atual;
    }
}

// Abrir modal com imagem ampliada
function abrirImagemModal(src) {
    console.log('🖼️ Abrindo imagem em tela cheia');
    const modal = document.getElementById('imagemModal');
    const img = document.getElementById('imagemModalImg');

    if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
    }
}

// Fechar modal de imagem
function fecharImagemModal() {
    console.log('❌ Fechando modal de imagem');
    const modal = document.getElementById('imagemModal');
    const img = document.getElementById('imagemModalImg');
    if (modal) modal.style.display = 'none';
    if (img) img.src = '';
}

console.log('✅ quiz.js carregado com sucesso!');
