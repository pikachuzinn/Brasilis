# Desafio Brasilis — versão Godot 4.x

Quiz educativo sobre cultura, história e geografia do Brasil. Projeto de
Extensão (UniFil) — desenvolvido em **Godot 4.x**, 2D, 100% client-side,
sem backend, banco de dados ou APIs externas, conforme as diretrizes do
documento `[CUBO] Orientações do Projeto de Extensão_ JOGOS.md`.

Esta versão substitui o protótipo web anterior (`frontend/` + `backend/`
Node.js/MongoDB), que não atendia aos requisitos técnicos da extensão
(exigia servidor e banco de dados). O conteúdo de perguntas e o fluxo de
telas foram reaproveitados; a implementação é nova.

## 1. Objetivo

Entregar uma versão funcional e jogável do "Desafio Brasilis" com todas as
mecânicas essenciais implementadas e navegação completa entre as telas,
para a entrega de **Práticas de Extensão II: Desenvolvimento**.

## 2. Escopo (MVP desta entrega)

- Quiz de múltipla escolha (4 alternativas), rodadas de 5 perguntas.
- 3 categorias (Geografia, História, Folclore) + modo Mix.
- Timer de 30s por pergunta com bônus de pontuação por velocidade.
- Feedback visual imediato (certo/errado) e avanço automático.
- Streak de dias consecutivos (estilo Duolingo), 100% local.
- Ranking local (melhores pontuações salvas no dispositivo).
- Perfil com estatísticas e conquistas.
- Nome do jogador local (sem login/senha — não há conta nem servidor).

Fora do escopo desta entrega (ver "Limitações e melhorias futuras"):
diagramas formais (caso de uso), GDD completo, exportação final e
publicação em apps.unifil.tech, relatório de impacto social.

## 3. Estrutura de cenas/arquivos

```
project.godot            # config do projeto (autoload, renderer, viewport)
icon.svg                 # ícone do projeto
data/perguntas.json      # banco de perguntas + categorias (dados do jogo)
assets/images/           # bandeiras, monumentos, personalidades, mapas
scenes/
  home.tscn              # Tela Inicial
  categorias.tscn         # Escolha de categoria
  quiz.tscn               # Mecânica central (pergunta, timer, alternativas)
  resultado.tscn           # Resumo da rodada
  ranking.tscn             # Ranking local
  perfil.tscn               # Estatísticas + conquistas
scripts/
  autoload/game_data.gd   # Singleton "GameData": estado global e persistência
  home.gd, categorias.gd, quiz.gd, resultado.gd, ranking.gd, perfil.gd
tools/
  build_scenes.gd         # gera as .tscn por código (ferramenta de dev)
  test_flow.gd/.tscn      # teste de lógica e navegação (ver seção 7)
  test_clicks.gd/.tscn    # teste de clique real do mouse (ver seção 7)
```

Fluxo de navegação (todas via `GameData.ir_para(caminho)` →
`get_tree().change_scene_to_file()`):

```
Home ──▶ Categorias ──▶ Quiz ──▶ Resultado ──┬──▶ Ranking ──▶ Home
  ▲                                          └──▶ Categorias (jogar de novo)
  ├──▶ Ranking
  └──▶ Perfil
```

## 4. Fluxo de funcionamento

1. **Home**: no primeiro acesso, pede um nome/apelido (salvo localmente).
   Mostra o streak atual e os botões Jogar, Ranking e Perfil.
2. **Categorias**: lista as categorias vindas de `data/perguntas.json` +
   botão "Mix". Ao escolher, `GameData.sortear_perguntas(categoria)` sorteia
   5 perguntas e navega para o Quiz.
3. **Quiz**: exibe uma pergunta por vez (texto e, quando houver, imagem),
   com timer de 30s. Responder corretamente soma 100 pontos + bônus de
   tempo (até +50). Ao errar ou o tempo esgotar, mostra a alternativa
   correta e avança automaticamente. Ao final da 5ª pergunta,
   `GameData.finalizar_rodada()` atualiza pontuação total, streak e
   ranking local, e navega para Resultado.
4. **Resultado**: acertos, pontos, % de aproveitamento e mensagem
   contextual; permite jogar de novo, ver ranking ou voltar ao início.
5. **Ranking / Perfil**: leem diretamente de `GameData` (sem qualquer
   chamada de rede).

## 5. Dependências e configuração

- **Godot Engine 4.x** — suítes de teste executadas com sucesso tanto em
  `4.3-stable` quanto em `4.7.2-stable`. Recomendado usar a versão estável
  mais recente. Não abra num Godot 3.x: a sintaxe não é compatível.
  O `project.godot` está marcado como 4.3 de propósito, para abrir sem
  atrito em qualquer 4.x do grupo (versões mais novas só mostram um aviso
  informativo ao abrir).
- Nenhuma dependência externa (addon, plugin ou API). Sem internet,
  sem servidor, sem `.env`.
- Persistência: `user://brasilis_save.json` (nome do jogador, pontos,
  streak, ranking local). Apagar esse arquivo reseta o progresso.
- Render: `gl_compatibility` (necessário para exportação Web/HTML5 estável).

## 6. Convenções de código

- Scripts e nós em português (consistente com o restante do projeto).
- Estado do jogo inteiramente centralizado em `GameData` (autoload); as
  cenas não se comunicam entre si diretamente, só leem/escrevem em
  `GameData` e chamam `GameData.ir_para(...)` para navegar.
- Nós referenciados nos scripts via **nomes únicos na cena** (`%NomeDoNo`,
  `unique_name_in_owner`), não por caminho relativo — torna os scripts
  resilientes a mudanças de hierarquia visual feitas no editor.

## 7. Checklist de testes

Testado headless (sem interface gráfica) com os binários oficiais do Godot
**4.3** e **4.7.2**. São duas suítes com propósitos diferentes:

**`tools/test_flow.tscn` — lógica e navegação** (33 asserções)
Roda uma partida completa ponta a ponta (Home → nome → Categorias →
Quiz 5/5 → Resultado → Ranking → Home → Perfil) validando estado e UI.
Dispara os sinais `pressed` por código.

**`tools/test_clicks.tscn` — clicabilidade real** (15 asserções)
Injeta eventos de mouse de verdade no viewport, na posição real de cada
botão na tela, e verifica se o clique chega. Existe porque o `test_flow`
sozinho **não pega botão coberto por outro nó**: emitir o sinal por código
pula toda a detecção de mouse do Godot. Foi exatamente esse o bug dos
botões "Voltar" (ver seção 9).

```bash
godot4 --headless --path . tools/test_flow.tscn     # esperado: TODOS OS TESTES PASSARAM
godot4 --headless --path . tools/test_clicks.tscn   # esperado: TODOS OS CLIQUES FUNCIONAM
```

Também validado:

- [x] `tools/build_scenes.gd` gera as 6 cenas sem erros.
- [x] As 14 perguntas com imagem carregam como `Texture2D` válido.
- [x] Streak (mesmo dia mantém, dia seguinte soma 1, dia(s) pulado(s)
      reseta para 1) — validado isoladamente.

**`tools/test_web_export.py` e `tools/test_web_playthrough.py` — build Web exportado**
Requerem Python + Playwright (`pip install playwright && playwright install chromium`).
Sobem um servidor HTTP local servindo `web-build/`, abrem no Chromium e
validam: motor inicializa sem erro JS, canvas aparece, e uma partida
completa por clique real (nome → Jogar → categoria → pergunta) funciona.
Screenshots de cada etapa são salvos na raiz do projeto para inspeção.

```bash
cd web-build && python3 -m http.server 8934 &
cd .. && python3 tools/test_web_export.py
python3 tools/test_web_playthrough.py
```

**Ainda falta testar manualmente**: aparência visual real em diferentes
resoluções de tela e comportamento em touch (mobile) — a validação acima
cobre desktop headless (720×1280).

## 10. Exportação Web e publicação (GitHub Pages)

O build HTML5/Web já foi gerado e validado (ver seção 7). Para regenerá-lo:

```bash
godot4 --headless --path . --export-release "Web" web-build/index.html
```

Requer os *export templates* da mesma versão do Godot instalados
(`~/.local/share/godot/export_templates/<versão>.stable/`) e o preset
`export_presets.cfg` (já versionado neste repositório — abra o projeto no
editor e confira em Project > Export se quiser ajustar algo visualmente).

O preset usa `variant/thread_support=false` de propósito: a variante com
threads exige os cabeçalhos HTTP `Cross-Origin-Opener-Policy` e
`Cross-Origin-Embedder-Policy`, que o GitHub Pages não permite configurar.
Sem threads, o jogo roda em qualquer hospedagem estática simples.

**Publicação**: o conteúdo gerado em `web-build/` é copiado para `/docs`
na raiz do repositório (fora desta pasta `brasilis-godot/`), que é o que o
GitHub Pages efetivamente publica. Ver o passo a passo de ativação no
próprio repositório (Settings → Pages → Source: branch `master`, pasta
`/docs`).

## 8. Armadilha de layout — leia antes de mexer nas cenas

Em Godot, **um `Control` comum nasce com `mouse_filter = STOP`** e captura
cliques em toda a área que ocupa, mesmo sendo invisível. E, entre nós
irmãos, **o que vem depois na árvore é desenhado por cima** e recebe o
clique primeiro.

Foi essa combinação que quebrou os botões "Voltar": eles eram adicionados
ao root *antes* do `MarginContainer` de conteúdo, e um espaçador invisível
de 48px dentro dele ficava exatamente por cima do botão, engolindo o
clique.

Duas regras adotadas no `build_scenes.gd` para evitar a reincidência:

1. **`_botao_voltar(root)` é chamado por último** em cada cena, para que o
   botão seja o último filho do root e fique por cima de tudo.
2. **Nós puramente de layout usam `MOUSE_FILTER_IGNORE`** — helpers
   `_espaco()`, `_margem()` e `_caixa_principal()` já fazem isso. Os filhos
   continuam recebendo clique normalmente; só o wrapper deixa de roubar.

Se você adicionar um botão flutuante novo (ex.: um "?" de ajuda no canto),
adicione-o **depois** do conteúdo e rode o `test_clicks` para confirmar.

## 9. Limitações e melhorias futuras

- **Visual**: layout funcional feito por código (sem arte customizada,
  fontes próprias ou animações). Para as próximas entregas, vale abrir no
  editor e refinar visualmente sobre a estrutura já pronta.
- **Export**: exportação Web/HTML5 concluída e validada (seções 7 e 10).
  Publicação em apps.unifil.tech, se exigida, ainda não foi feita (o
  GitHub Pages cobre a entrega desta etapa).
- **Documentação formal**: GDD completo, diagrama de caso de uso e
  wireframes formais ainda precisam ser produzidos para o portfólio
  (parte da 2ª entrega — se ainda pendente, vale revisar).
- **Ranking**: é local ao dispositivo (por regra da extensão, não pode
  haver ranking online/servidor). Isso é uma limitação técnica esperada,
  não um bug.
- Times/prazos: confira o cronograma real das 4 entregas com o grupo antes
  de decidir o que priorizar a seguir.
