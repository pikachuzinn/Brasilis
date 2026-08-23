extends SceneTree
## Gerador de cenas — roda uma única vez, headless, para montar os arquivos
## .tscn a partir de código (garante sintaxe válida sem precisar do editor
## gráfico). Uso:
##   godot --headless --path . --script tools/build_scenes.gd
##
## Não faz parte do jogo em si; é uma ferramenta de desenvolvimento.

const COR_FUNDO := Color("1B5E3F")
const COR_FUNDO_CLARO := Color("21734B")
const COR_DESTAQUE := Color("FFD54A")
const COR_TEXTO := Color("F5F5F0")


func _initialize() -> void:
	print("== Gerando cenas do Desafio Brasilis ==")
	_build_home()
	_build_categorias()
	_build_quiz()
	_build_resultado()
	_build_ranking()
	_build_perfil()
	print("== Concluído ==")
	quit()


# ---------------------------------------------------------------------------
# Helpers genéricos
# ---------------------------------------------------------------------------

func _own(node: Node, root: Node) -> void:
	node.owner = root


func _bg(root: Node, cor: Color) -> ColorRect:
	var bg := ColorRect.new()
	bg.name = "Background"
	bg.color = cor
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(bg)
	_own(bg, root)
	return bg


func _label(texto: String, tamanho: int = 18, cor: Color = COR_TEXTO, centralizado: bool = true) -> Label:
	var lbl := Label.new()
	lbl.text = texto
	lbl.add_theme_font_size_override("font_size", tamanho)
	lbl.add_theme_color_override("font_color", cor)
	if centralizado:
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	return lbl


func _botao(texto: String, tamanho: int = 18, altura: float = 56.0) -> Button:
	var btn := Button.new()
	btn.text = texto
	btn.custom_minimum_size = Vector2(0, altura)
	btn.add_theme_font_size_override("font_size", tamanho)
	return btn


func _root_control(nome: String, script_path: String) -> Control:
	var root := Control.new()
	root.name = nome
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var script: Script = load(script_path)
	if script == null:
		push_error("Falha ao carregar script: %s" % script_path)
	else:
		root.set_script(script)
	root.owner = null # é o próprio root, "owner" fica nulo nele mesmo
	return root


func _salvar(root: Node, caminho: String) -> void:
	var pacote := PackedScene.new()
	var erro := pacote.pack(root)
	if erro != OK:
		push_error("Erro ao empacotar cena %s: %d" % [caminho, erro])
		return
	var erro_save := ResourceSaver.save(pacote, caminho)
	if erro_save != OK:
		push_error("Erro ao salvar cena %s: %d" % [caminho, erro_save])
	else:
		print("  ✔ %s" % caminho)


func _add(pai: Node, filho: Node, root: Node, nome_unico: String = "") -> void:
	pai.add_child(filho)
	_own(filho, root)
	if nome_unico != "":
		filho.name = nome_unico
		filho.unique_name_in_owner = true


func _margem(root: Node, margem: int = 32) -> MarginContainer:
	var m := MarginContainer.new()
	m.name = "Margem"
	m.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	# Nó puramente de layout: não pode capturar clique, senão engole o
	# input destinado a botões que estejam atrás dele na árvore.
	m.mouse_filter = Control.MOUSE_FILTER_IGNORE
	for lado in ["left", "top", "right", "bottom"]:
		m.add_theme_constant_override("margin_%s" % lado, margem)
	root.add_child(m)
	_own(m, root)
	return m


## Espaçador vertical. Precisa ser IGNORE: um Control comum nasce com
## mouse_filter = STOP e rouba cliques da área que ocupa.
func _espaco(altura: float) -> Control:
	var e := Control.new()
	e.custom_minimum_size = Vector2(0, altura)
	e.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return e


## Caixa vertical principal da tela (layout puro -> IGNORE).
func _caixa_principal(separacao: int) -> VBoxContainer:
	var caixa := VBoxContainer.new()
	caixa.add_theme_constant_override("separation", separacao)
	caixa.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	caixa.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return caixa


## IMPORTANTE: chamar por ÚLTIMO na montagem da cena. O botão precisa ser o
## último filho do root para ficar desenhado por cima do conteúdo; caso
## contrário o container de layout que vem depois fica na frente dele e o
## clique nunca chega ao botão.
func _botao_voltar(root: Node) -> Button:
	var btn := _botao("← Voltar", 16, 44)
	btn.custom_minimum_size = Vector2(120, 44)
	btn.set_anchors_preset(Control.PRESET_TOP_LEFT)
	btn.position = Vector2(24, 24)
	_add(root, btn, root, "BtnVoltar")
	return btn


# ---------------------------------------------------------------------------
# Home
# ---------------------------------------------------------------------------

func _build_home() -> void:
	var root := _root_control("Home", "res://scripts/home.gd")
	_bg(root, COR_FUNDO)

	# Indicador de streak (canto superior direito)
	var streak := _label("🔥 0 dias", 16, COR_DESTAQUE, false)
	streak.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	streak.position = Vector2(-160, 24)
	streak.size = Vector2(140, 30)
	_add(root, streak, root, "StreakLabel")

	var margem := _margem(root, 40)
	var caixa := _caixa_principal(18)
	caixa.name = "Caixa"
	caixa.alignment = BoxContainer.ALIGNMENT_CENTER
	margem.add_child(caixa)
	_own(caixa, root)

	var titulo := _label("DESAFIO BRASILIS", 34, COR_DESTAQUE)
	caixa.add_child(titulo)
	_own(titulo, root)

	var subtitulo := _label("Teste seus conhecimentos sobre a cultura,\nhistória e geografia do Brasil", 15, COR_TEXTO)
	caixa.add_child(subtitulo)
	_own(subtitulo, root)

	var espaco := _espaco(24)
	caixa.add_child(espaco)
	_own(espaco, root)

	var btn_jogar := _botao("▶  JOGAR", 20)
	_add(caixa, btn_jogar, root, "BtnJogar")

	var btn_ranking := _botao("🏆  RANKING", 18)
	_add(caixa, btn_ranking, root, "BtnRanking")

	var btn_perfil := _botao("👤  PERFIL", 18)
	_add(caixa, btn_perfil, root, "BtnPerfil")

	# Painel de nome (primeiro acesso)
	var painel := PanelContainer.new()
	painel.name = "PainelNome"
	painel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_add(root, painel, root, "PainelNome")

	var fundo_painel := ColorRect.new()
	fundo_painel.color = Color(0, 0, 0, 0.75)
	fundo_painel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	painel.add_child(fundo_painel)
	_own(fundo_painel, root)

	var centro := CenterContainer.new()
	centro.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	painel.add_child(centro)
	_own(centro, root)

	var caixa_nome_fundo := PanelContainer.new()
	caixa_nome_fundo.custom_minimum_size = Vector2(320, 0)
	centro.add_child(caixa_nome_fundo)
	_own(caixa_nome_fundo, root)

	var caixa_nome := VBoxContainer.new()
	caixa_nome.add_theme_constant_override("separation", 14)
	caixa_nome_fundo.add_child(caixa_nome)
	_own(caixa_nome, root)

	var lbl_pergunta_nome := _label("Como podemos te chamar?", 18, COR_TEXTO)
	caixa_nome.add_child(lbl_pergunta_nome)
	_own(lbl_pergunta_nome, root)

	var nome_input := LineEdit.new()
	nome_input.placeholder_text = "Seu nome ou apelido"
	nome_input.max_length = 20
	_add(caixa_nome, nome_input, root, "NomeInput")

	var btn_confirmar := _botao("Começar", 18)
	_add(caixa_nome, btn_confirmar, root, "BtnConfirmarNome")

	_salvar(root, "res://scenes/home.tscn")


# ---------------------------------------------------------------------------
# Categorias
# ---------------------------------------------------------------------------

func _build_categorias() -> void:
	var root := _root_control("Categorias", "res://scripts/categorias.gd")
	_bg(root, COR_FUNDO)

	var margem := _margem(root, 32)
	var caixa := _caixa_principal(14)
	margem.add_child(caixa)
	_own(caixa, root)

	var espaco_topo := _espaco(48)
	caixa.add_child(espaco_topo)
	_own(espaco_topo, root)

	var titulo := _label("ESCOLHA A CATEGORIA", 24, COR_DESTAQUE)
	caixa.add_child(titulo)
	_own(titulo, root)

	var subtitulo := _label("Selecione uma categoria ou jogue com perguntas de todas!", 14, COR_TEXTO)
	caixa.add_child(subtitulo)
	_own(subtitulo, root)

	var rolagem := ScrollContainer.new()
	rolagem.size_flags_vertical = Control.SIZE_EXPAND_FILL
	caixa.add_child(rolagem)
	_own(rolagem, root)

	var lista := VBoxContainer.new()
	lista.add_theme_constant_override("separation", 12)
	lista.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_add(rolagem, lista, root, "CategoriasContainer")

	var btn_mix := _botao("🎲  MIX — Todas as Categorias", 16, 70)
	_add(caixa, btn_mix, root, "BtnMix")

	_botao_voltar(root) # por último: precisa ficar por cima do conteúdo
	_salvar(root, "res://scenes/categorias.tscn")


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------

func _build_quiz() -> void:
	var root := _root_control("Quiz", "res://scripts/quiz.gd")
	_bg(root, COR_FUNDO)

	var margem := _margem(root, 28)
	var caixa := _caixa_principal(10)
	margem.add_child(caixa)
	_own(caixa, root)

	# Cabeçalho: número da pergunta + categoria
	var cabecalho := HBoxContainer.new()
	caixa.add_child(cabecalho)
	_own(cabecalho, root)

	var lbl_numero := _label("Pergunta 1 de 5", 14, COR_TEXTO, false)
	lbl_numero.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_add(cabecalho, lbl_numero, root, "LblNumeroPergunta")

	var lbl_categoria := _label("Geral", 14, COR_DESTAQUE, false)
	lbl_categoria.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_add(cabecalho, lbl_categoria, root, "LblCategoriaAtual")

	# Barra de progresso da rodada
	var barra_progresso := ProgressBar.new()
	barra_progresso.max_value = 5
	barra_progresso.value = 1
	barra_progresso.show_percentage = false
	barra_progresso.custom_minimum_size = Vector2(0, 10)
	_add(caixa, barra_progresso, root, "BarraProgresso")

	# Timer visual
	var linha_tempo := HBoxContainer.new()
	linha_tempo.add_theme_constant_override("separation", 8)
	caixa.add_child(linha_tempo)
	_own(linha_tempo, root)

	var lbl_tempo := _label("30", 16, COR_DESTAQUE, false)
	lbl_tempo.custom_minimum_size = Vector2(32, 0)
	_add(linha_tempo, lbl_tempo, root, "LblTempo")

	var barra_tempo := ProgressBar.new()
	barra_tempo.max_value = 30
	barra_tempo.value = 30
	barra_tempo.show_percentage = false
	barra_tempo.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	barra_tempo.custom_minimum_size = Vector2(0, 10)
	_add(linha_tempo, barra_tempo, root, "BarraTempo")

	# Timer (nó lógico, 1s)
	var timer := Timer.new()
	_add(caixa, timer, root, "Timer")

	# Imagem da pergunta (opcional)
	var imagem := TextureRect.new()
	imagem.custom_minimum_size = Vector2(0, 180)
	imagem.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	imagem.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	imagem.visible = false
	_add(caixa, imagem, root, "ImagemPergunta")

	# Texto da pergunta
	var painel_pergunta := PanelContainer.new()
	painel_pergunta.custom_minimum_size = Vector2(0, 90)
	caixa.add_child(painel_pergunta)
	_own(painel_pergunta, root)

	var lbl_pergunta := _label("Texto da pergunta", 18, COR_TEXTO)
	_add(painel_pergunta, lbl_pergunta, root, "LblPergunta")

	# Alternativas
	var rolagem_alt := ScrollContainer.new()
	rolagem_alt.size_flags_vertical = Control.SIZE_EXPAND_FILL
	caixa.add_child(rolagem_alt)
	_own(rolagem_alt, root)

	var alternativas := VBoxContainer.new()
	alternativas.add_theme_constant_override("separation", 10)
	alternativas.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	rolagem_alt.add_child(alternativas)
	_own(alternativas, root)

	for i in range(4):
		var btn := _botao("Alternativa %d" % (i + 1), 15, 54)
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.autowrap_mode = TextServer.AUTOWRAP_WORD
		_add(alternativas, btn, root, "AltBtn%d" % i)

	# Placar
	var placar := HBoxContainer.new()
	caixa.add_child(placar)
	_own(placar, root)

	var lbl_acertos := _label("Acertos: 0", 14, COR_TEXTO, false)
	lbl_acertos.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_add(placar, lbl_acertos, root, "LblAcertos")

	var lbl_pontos := _label("Pontos: 0", 14, COR_DESTAQUE, false)
	lbl_pontos.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_add(placar, lbl_pontos, root, "LblPontos")

	_salvar(root, "res://scenes/quiz.tscn")


# ---------------------------------------------------------------------------
# Resultado
# ---------------------------------------------------------------------------

func _build_resultado() -> void:
	var root := _root_control("Resultado", "res://scripts/resultado.gd")
	_bg(root, COR_FUNDO)

	var centro := CenterContainer.new()
	centro.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(centro)
	_own(centro, root)

	var caixa := VBoxContainer.new()
	caixa.custom_minimum_size = Vector2(320, 0)
	caixa.add_theme_constant_override("separation", 14)
	centro.add_child(caixa)
	_own(caixa, root)

	var lbl_titulo := _label("🏆 Excelente!", 26, COR_DESTAQUE)
	_add(caixa, lbl_titulo, root, "LblTitulo")

	var lbl_acertos := _label("0 / 5", 32, COR_TEXTO)
	_add(caixa, lbl_acertos, root, "LblAcertos")

	var lbl_pontos := _label("0 pontos", 18, COR_DESTAQUE)
	_add(caixa, lbl_pontos, root, "LblPontos")

	var lbl_porcentagem := _label("0%", 16, COR_TEXTO)
	_add(caixa, lbl_porcentagem, root, "LblPorcentagem")

	var lbl_mensagem := _label("Mensagem de incentivo", 14, COR_TEXTO)
	_add(caixa, lbl_mensagem, root, "LblMensagem")

	var espaco := _espaco(12)
	caixa.add_child(espaco)
	_own(espaco, root)

	var btn_jogar_novamente := _botao("🔄  Jogar Novamente", 16)
	_add(caixa, btn_jogar_novamente, root, "BtnJogarNovamente")

	var btn_ver_ranking := _botao("🏆  Ver Ranking", 16)
	_add(caixa, btn_ver_ranking, root, "BtnVerRanking")

	var btn_voltar_home := _botao("🏠  Início", 16)
	_add(caixa, btn_voltar_home, root, "BtnVoltarHome")

	_salvar(root, "res://scenes/resultado.tscn")


# ---------------------------------------------------------------------------
# Ranking
# ---------------------------------------------------------------------------

func _build_ranking() -> void:
	var root := _root_control("Ranking", "res://scripts/ranking.gd")
	_bg(root, COR_FUNDO)

	var margem := _margem(root, 32)
	var caixa := _caixa_principal(14)
	margem.add_child(caixa)
	_own(caixa, root)

	var espaco_topo := _espaco(48)
	caixa.add_child(espaco_topo)
	_own(espaco_topo, root)

	var titulo := _label("🏆 RANKING LOCAL", 24, COR_DESTAQUE)
	_add(caixa, titulo, root)

	var lbl_vazio := _label("Ninguém no ranking ainda.\nJogue uma rodada para aparecer aqui!", 14, COR_TEXTO)
	lbl_vazio.visible = false
	_add(caixa, lbl_vazio, root, "LblVazio")

	var rolagem := ScrollContainer.new()
	rolagem.size_flags_vertical = Control.SIZE_EXPAND_FILL
	caixa.add_child(rolagem)
	_own(rolagem, root)

	var lista := VBoxContainer.new()
	lista.add_theme_constant_override("separation", 8)
	lista.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_add(rolagem, lista, root, "ListaContainer")

	_botao_voltar(root) # por último: precisa ficar por cima do conteúdo
	_salvar(root, "res://scenes/ranking.tscn")


# ---------------------------------------------------------------------------
# Perfil
# ---------------------------------------------------------------------------

func _build_perfil() -> void:
	var root := _root_control("Perfil", "res://scripts/perfil.gd")
	_bg(root, COR_FUNDO)

	var margem := _margem(root, 32)
	var caixa := _caixa_principal(16)
	margem.add_child(caixa)
	_own(caixa, root)

	var espaco_topo := _espaco(48)
	caixa.add_child(espaco_topo)
	_own(espaco_topo, root)

	var lbl_nome := _label("Jogador", 22, COR_DESTAQUE)
	_add(caixa, lbl_nome, root, "LblNome")

	# Grade de estatísticas
	var grade := GridContainer.new()
	grade.columns = 2
	grade.add_theme_constant_override("h_separation", 10)
	grade.add_theme_constant_override("v_separation", 10)
	caixa.add_child(grade)
	_own(grade, root)

	var pares := [
		["🏆 Pontos Totais", "LblPontos"],
		["🔥 Streak Atual", "LblStreak"],
		["🎮 Partidas", "LblPartidas"],
		["⭐ Melhor Streak", "LblMelhorStreak"],
	]
	for par in pares:
		var cartao := PanelContainer.new()
		cartao.custom_minimum_size = Vector2(0, 70)
		cartao.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		grade.add_child(cartao)
		_own(cartao, root)

		var caixa_cartao := VBoxContainer.new()
		cartao.add_child(caixa_cartao)
		_own(caixa_cartao, root)

		var lbl_valor := _label("0", 22, COR_DESTAQUE)
		_add(caixa_cartao, lbl_valor, root, par[1])

		var lbl_rotulo := _label(par[0], 11, COR_TEXTO)
		caixa_cartao.add_child(lbl_rotulo)
		_own(lbl_rotulo, root)

	var titulo_conquistas := _label("🏅 Conquistas", 18, COR_DESTAQUE)
	_add(caixa, titulo_conquistas, root)

	var rolagem := ScrollContainer.new()
	rolagem.size_flags_vertical = Control.SIZE_EXPAND_FILL
	caixa.add_child(rolagem)
	_own(rolagem, root)

	var grade_conquistas := GridContainer.new()
	grade_conquistas.columns = 3
	grade_conquistas.add_theme_constant_override("h_separation", 8)
	grade_conquistas.add_theme_constant_override("v_separation", 8)
	grade_conquistas.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_add(rolagem, grade_conquistas, root, "ConquistasContainer")

	_botao_voltar(root) # por último: precisa ficar por cima do conteúdo
	_salvar(root, "res://scenes/perfil.tscn")
