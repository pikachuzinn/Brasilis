extends Node
## Teste de CLIQUE REAL — complementa o test_flow.gd.
##
## Diferença crucial: o test_flow.gd emite o sinal "pressed" por código, o
## que PULA toda a detecção de mouse do Godot. Um botão coberto por outro nó
## passa naquele teste e mesmo assim fica impossível de clicar no jogo.
## Aqui os eventos de mouse são injetados de verdade no viewport, na posição
## real do botão na tela.
##
## Cada botão é testado numa instância NOVA da cena, porque clicar num botão
## de navegação troca a cena e invalidaria as verificações seguintes.
##
## Uso: godot --headless --path . tools/test_clicks.tscn

var falhas: Array[String] = []


func _ready() -> void:
	await _run()


func _assert(cond: bool, msg: String) -> void:
	if cond:
		print("  ✔ %s" % msg)
	else:
		push_error("  ✘ FALHOU: %s" % msg)
		falhas.append(msg)


func _preparar_estado() -> void:
	GameData.jogador = {
		"nome": "Testador", "pontos_totais": 500, "streak_atual": 2,
		"melhor_streak": 3, "total_partidas": 4, "ultima_jogada": "",
	}
	GameData.ranking_local = [{"nome": "Testador", "pontos": 500, "streak": 3, "partidas": 4}]
	GameData.sortear_perguntas("Mix")


## Instancia a cena isolada (fora de current_scene, para que uma eventual
## troca de cena disparada pelo clique não destrua o que estamos medindo).
func _abrir(caminho: String) -> Control:
	var arvore := get_tree()
	var cena: Control = (load(caminho) as PackedScene).instantiate()
	arvore.root.add_child(cena)
	# tamanho explícito: sem isso o Control raiz fica 0x0 fora de current_scene
	cena.size = arvore.root.get_visible_rect().size
	await arvore.process_frame
	await arvore.process_frame
	return cena


## Injeta pressionar+soltar do botão esquerdo do mouse no centro do alvo.
## in_local_coords=true é obrigatório: em headless a janela tem tamanho
## (0,0) e a conversão janela->viewport jogaria o clique para fora da tela,
## fazendo TODO botão parecer quebrado.
func _clicar(alvo: Vector2) -> void:
	var arvore := get_tree()
	for pressionado in [true, false]:
		var ev := InputEventMouseButton.new()
		ev.button_index = MOUSE_BUTTON_LEFT
		ev.pressed = pressionado
		ev.position = alvo
		ev.global_position = alvo
		arvore.root.push_input(ev, true)
		await arvore.process_frame
	await arvore.process_frame


## Percorre a árvore e devolve o Control mais "por cima" que contém o ponto
## e que captura mouse. Usado para explicar quem roubou o clique.
func _interceptador(raiz: Node, ponto: Vector2) -> Control:
	var achados: Array[Control] = []
	_coletar(raiz, ponto, achados)
	return achados[achados.size() - 1] if not achados.is_empty() else null


func _coletar(no: Node, ponto: Vector2, saida: Array[Control]) -> void:
	if no is Control:
		var c := no as Control
		if c.visible and c.mouse_filter != Control.MOUSE_FILTER_IGNORE \
				and c.get_global_rect().has_point(ponto):
			saida.append(c)
	for filho in no.get_children():
		_coletar(filho, ponto, saida)


## Desliga os handlers reais do botão. Sem isso, um clique BEM-SUCEDIDO num
## botão de navegação dispara change_scene_to_file(), que libera a cena atual
## — inclusive este próprio nó de teste — e a suíte morre no meio. O que
## queremos medir aqui é só uma coisa: o clique do mouse chega ao botão?
func _isolar(btn: Button) -> void:
	for con in btn.pressed.get_connections():
		btn.pressed.disconnect(con["callable"])


## Abre a cena, clica no botão indicado e verifica se o clique chegou.
func _testar_botao(caminho: String, seletor: String, rotulo: String) -> void:
	_preparar_estado()
	var cena := await _abrir(caminho)
	var btn: Button = cena.get_node(seletor)
	if btn == null:
		_assert(false, "%s: botão não encontrado (%s)" % [rotulo, seletor])
		cena.queue_free()
		return

	_isolar(btn)
	var recebeu := [false]
	btn.pressed.connect(func(): recebeu[0] = true)
	var ponto: Vector2 = btn.get_global_rect().get_center()
	await _clicar(ponto)

	_assert(recebeu[0], rotulo)
	if not recebeu[0]:
		var ladrao := _interceptador(cena, ponto)
		if ladrao != null and ladrao != btn:
			print("      ↳ clique interceptado por: %s (%s) mouse_filter=%d rect=%s" % [
				ladrao.name, ladrao.get_class(), ladrao.mouse_filter, str(ladrao.get_global_rect())])
		else:
			print("      ↳ nenhum nó por cima; verificar posição/tamanho do botão: %s" % str(btn.get_global_rect()))

	if is_instance_valid(cena):
		cena.queue_free()
	await get_tree().process_frame


## Variante para botões criados dinamicamente por script (categorias).
func _testar_filho(caminho: String, seletor_container: String, indice: int, rotulo: String) -> void:
	_preparar_estado()
	var cena := await _abrir(caminho)
	var cont: Node = cena.get_node(seletor_container)
	if cont == null or cont.get_child_count() <= indice:
		_assert(false, "%s: filho %d não existe" % [rotulo, indice])
		cena.queue_free()
		return

	var btn: Button = cont.get_child(indice)
	_isolar(btn)
	var recebeu := [false]
	btn.pressed.connect(func(): recebeu[0] = true)
	var ponto: Vector2 = btn.get_global_rect().get_center()
	await _clicar(ponto)

	_assert(recebeu[0], rotulo)
	if not recebeu[0]:
		var ladrao := _interceptador(cena, ponto)
		if ladrao != null and ladrao != btn:
			print("      ↳ clique interceptado por: %s (%s) mouse_filter=%d" % [
				ladrao.name, ladrao.get_class(), ladrao.mouse_filter])

	if is_instance_valid(cena):
		cena.queue_free()
	await get_tree().process_frame


func _run() -> void:
	print("== Teste de clique real (mouse) — Desafio Brasilis ==")
	await get_tree().process_frame

	print("\n-- Botões Voltar --")
	await _testar_botao("res://scenes/categorias.tscn", "%BtnVoltar", "Categorias: Voltar clicável")
	await _testar_botao("res://scenes/ranking.tscn", "%BtnVoltar", "Ranking: Voltar clicável")
	await _testar_botao("res://scenes/perfil.tscn", "%BtnVoltar", "Perfil: Voltar clicável")

	print("\n-- Home --")
	await _testar_botao("res://scenes/home.tscn", "%BtnJogar", "Home: JOGAR clicável")
	await _testar_botao("res://scenes/home.tscn", "%BtnRanking", "Home: RANKING clicável")
	await _testar_botao("res://scenes/home.tscn", "%BtnPerfil", "Home: PERFIL clicável")

	print("\n-- Categorias --")
	await _testar_botao("res://scenes/categorias.tscn", "%BtnMix", "Categorias: MIX clicável")
	await _testar_filho("res://scenes/categorias.tscn", "%CategoriasContainer", 0, "Categorias: 1ª categoria clicável")

	print("\n-- Quiz --")
	for i in range(4):
		await _testar_botao("res://scenes/quiz.tscn", "%%AltBtn%d" % i, "Quiz: alternativa %d clicável" % (i + 1))

	print("\n-- Resultado --")
	await _testar_botao("res://scenes/resultado.tscn", "%BtnJogarNovamente", "Resultado: Jogar Novamente clicável")
	await _testar_botao("res://scenes/resultado.tscn", "%BtnVerRanking", "Resultado: Ver Ranking clicável")
	await _testar_botao("res://scenes/resultado.tscn", "%BtnVoltarHome", "Resultado: Início clicável")

	print("\n== Resumo ==")
	if falhas.is_empty():
		print("TODOS OS CLIQUES FUNCIONAM")
	else:
		print("%d FALHA(S) DE CLIQUE:" % falhas.size())
		for f in falhas:
			print("  - %s" % f)

	get_tree().quit(0 if falhas.is_empty() else 1)
