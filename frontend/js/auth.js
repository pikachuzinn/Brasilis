// ===================================
// SISTEMA DE AUTENTICAÇÃO (COM API)
// ===================================

// API_URL já está definido em config.js

console.log('✅ auth.js carregado');

// Validar força da senha
function validarSenhaForte(senha) {
    console.log('🔐 Validando força da senha...');
    
    // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const valida = regex.test(senha);
    
    if (valida) {
        console.log('✅ Senha forte!');
    } else {
        console.log('❌ Senha fraca! Deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número');
    }
    
    return valida;
}

// Cadastrar usuário (AGORA COM API)
async function cadastrarUsuario(email, senha) {
    try {
        console.log('🔄 Iniciando cadastro...');
        console.log('📧 Email:', email);
        console.log('🔐 Senha:', '*'.repeat(senha.length));
        
        const response = await fetch(`${API_URL}/usuarios/cadastrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        console.log('📦 Resposta da API:', data);
        
        if (response.ok) {
            console.log('✅ Usuário cadastrado com sucesso!');
            console.log('🆔 ID do usuário:', data.id);
            return true;
        } else {
            console.error('❌ Erro ao cadastrar:', data.erro);
            alert(data.erro || 'Erro ao cadastrar');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao conectar com o servidor:', error);
        console.error('💡 Verifique se a API está rodando em http://localhost:3000');
        alert('Erro ao conectar com o servidor. Verifique se a API está rodando em http://localhost:3000');
        return false;
    }
}

// Validar login (AGORA COM API)
async function validarLogin(email, senha) {
    try {
        console.log('🔄 Fazendo login:', email);
        console.log('🔐 Senha:', '*'.repeat(senha.length));
        
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        console.log('📦 Resposta da API:', data);
        
        if (response.ok) {
            console.log('✅ Login realizado com sucesso!');
            console.log('👤 Dados do usuário:', data.usuario);
            
            // Salvar dados do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('usuarioLogado', email);
            
            console.log('💾 Dados salvos no localStorage');
            console.log('   - usuario:', localStorage.getItem('usuario'));
            console.log('   - usuarioLogado:', localStorage.getItem('usuarioLogado'));
            
            // Inicializar dados do jogador
            const jogador = {
                email: data.usuario.email,
                pontos_totais: data.usuario.pontos_totais || 0,
                streak_atual: data.usuario.streak_atual || 0,
                melhor_streak: data.usuario.melhor_streak || 0,
                total_partidas: data.usuario.total_partidas || 0,
                ultima_jogada: data.usuario.ultima_jogada || null
            };
            
            localStorage.setItem('jogador', JSON.stringify(jogador));
            
            console.log('💾 Dados do jogador salvos:', jogador);
            console.log('   📊 Pontos totais:', jogador.pontos_totais);
            console.log('   🔥 Streak atual:', jogador.streak_atual);
            console.log('   ⭐ Melhor streak:', jogador.melhor_streak);
            console.log('   🎮 Total de partidas:', jogador.total_partidas);
            
            return true;
        } else {
            console.error('❌ Erro no login:', data.erro);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro ao fazer login:', error);
        console.error('💡 Verifique se a API está rodando em http://localhost:3000');
        alert('Erro ao conectar com o servidor. Verifique se a API está rodando em http://localhost:3000');
        return false;
    }
}

// Verificar se está logado
function verificarLogin() {
    console.log('🔍 Verificando se usuário está logado...');
    
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const usuario = localStorage.getItem('usuario');
    const jogador = localStorage.getItem('jogador');
    
    console.log('📦 Dados do localStorage:');
    console.log('   - usuarioLogado:', usuarioLogado);
    console.log('   - usuario:', usuario ? JSON.parse(usuario) : null);
    console.log('   - jogador:', jogador ? JSON.parse(jogador) : null);
    
    if (!usuarioLogado) {
        console.log('❌ Usuário não está logado!');
        console.log('🔄 Redirecionando para login.html...');
        window.location.href = 'login.html';
    } else {
        console.log('✅ Usuário está logado:', usuarioLogado);
    }
}

// Fazer logout
function logout() {
    console.log('👋 Fazendo logout...');
    
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    console.log('👤 Usuário que está saindo:', usuarioLogado);
    
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('usuario');
    localStorage.removeItem('jogador');
    
    console.log('🗑️ Dados removidos do localStorage');
    console.log('🔄 Redirecionando para login.html...');
    
    window.location.href = 'login.html';
}

// Log inicial
console.log('✅ auth.js carregado com sucesso!');
console.log('🔗 API URL:', API_URL);
