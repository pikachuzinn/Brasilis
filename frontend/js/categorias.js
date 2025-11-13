    // ===================================
    // CATEGORIAS.JS - ESCOLHA DE CATEGORIA
    // ===================================

    // API_URL já está definido em config.js

    console.log('✅ categorias.js carregado');

    // Carregar categorias ao abrir a página
    window.addEventListener('DOMContentLoaded', async () => {
        console.log('\n========================================');
        console.log('📚 CARREGANDO CATEGORIAS');
        console.log('========================================\n');
        
        verificarLogin();
        await carregarCategorias();
    });

    // Carregar categorias da API
async function carregarCategorias() {
    try {
        console.log('🔄 Buscando categorias da API...');
        // CORREÇÃO AQUI: Adicionar /api na URL para buscar categorias
        console.log('🌐 URL:', `${API_URL}/api/categorias`); 

        // CORREÇÃO AQUI: Adicionar /api na URL para buscar categorias
        const response = await fetch(`${API_URL}/api/categorias`); 

        if (!response.ok) {
            throw new Error('Erro ao buscar categorias');
        }

        const categorias = await response.json();
        console.log(`✅ ${categorias.length} categorias carregadas:`, categorias);

        exibirCategorias(categorias);

    } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);

        // Mostrar mensagem de erro
        const grid = document.getElementById('categoriasGrid');
        grid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar categorias.</p>
                <p>Verifique se a API está rodando em http://localhost:3000</p>
                <button class="btn-categoria" onclick="carregarCategorias()">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        `;
    }
}


    // Exibir categorias na tela
    function exibirCategorias(categorias) {
        console.log('🎨 Exibindo categorias na tela...');
        
        const grid = document.getElementById('categoriasGrid');
        grid.innerHTML = '';
        
        categorias.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.nome} - ${cat.icone}`);
            
            const btn = document.createElement('button');
            btn.className = 'btn-categoria';
            btn.onclick = () => iniciarQuiz(cat.nome);
            
            // Definir cor de fundo baseada na categoria
            let corFundo = '#FFFFFF';
            if (cat.cor) {
                // Converter cor hex para rgba com transparência
                corFundo = cat.cor + '20'; // Adiciona 20 de alpha (transparência)
            }
            
            btn.style.background = corFundo;
            btn.style.borderColor = cat.cor || '#BDBDBD';
            
            btn.innerHTML = `
                <span class="categoria-icon">${cat.icone}</span>
                <div class="categoria-info">
                    <span class="categoria-nome">${cat.nome}</span>
                    <span class="categoria-desc">${cat.descricao}</span>
                </div>
            `;
            
            grid.appendChild(btn);
        });
        
        console.log('✅ Categorias exibidas com sucesso!\n');
    }

    // Iniciar quiz com categoria selecionada
    function iniciarQuiz(categoria) {
        console.log(`\n========================================`);
        console.log(`🎮 INICIANDO QUIZ`);
        console.log(`========================================`);
        console.log(`📚 Categoria selecionada: ${categoria}`);
        console.log(`========================================\n`);
        
        // Salvar categoria no localStorage
        localStorage.setItem('categoriaEscolhida', categoria);
        
        console.log('💾 Categoria salva no localStorage');
        console.log('🔍 Verificando se salvou:', localStorage.getItem('categoriaEscolhida'));
        console.log('🔄 Redirecionando para quiz.html...\n');
        
        // Redirecionar para o quiz
        window.location.href = 'quiz.html';
    }

