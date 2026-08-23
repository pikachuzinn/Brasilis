extends Node
## Teste de fumaça headless — simula uma partida completa (Home -> Categorias
## -> Quiz -> Resultado -> Ranking -> Perfil -> Home) emitindo os mesmos
## sinais que um clique real dispararia, e valida o estado do GameData a
## cada passo.
##
## Roda como uma cena normal (para que os autoloads do projeto — GameData —
## estejam disponíveis, o que não acontece com "godot --script"):
##   godot --headless --path . tools/test_flow.tscn
##
## Não faz parte do jogo; é uma ferramenta de verificação para desenvolvimento.

var falhas: Array[String] = []


func _ready() -> void:
	_apagar_save()
	await _run()


func _apagar_save() -> void:
	var caminho := "user://brasilis_save.json"
	if FileAccess.file_exists(caminho):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(caminho))
		print("(save anterior removido para teste limpo)")
	GameData.jogador = {
		"nome": "", "pontos_totais": 0, "streak_atual": 0,
		"melhor_streak": 0, "total_partidas": 0, "ultima_jogada": "",
	}
	GameData.ranking_local = []


func _assert(cond: bool, msg: String) -> void:
	if cond:
		print("  ✔ %s" % msg)
	else:
		push_error("  ✘ FALHOU: %s" % msg)
		falhas.append(msg)


func _run() -> void:
	print("== Teste de fluxo completo — Desafio Brasilis ==")
	var arvore := get_tree()
	var raiz := arvore.root
	await arvore.process_frame # deixa a própria TestFlow terminar de entrar na árvore

	# ---------- HOME ----------
	var home := (load("res://scenes/home.tscn") as PackedScene).instantiate()
	raiz.add_child(home)
	arvore.current_scene = home
	await arvore.process_frame
	await arvore.process_frame

	_assert(GameData.tem_nome_jogador() == false, "sem nome no primeiro acesso")
	_assert(home.get_node("%PainelNome").visible == true, "painel de nome visível no primeiro acesso")

	home.get_node("%NomeInput").text = "Testador"
	home.get_node("%BtnConfirmarNome").pressed.emit()
	await arvore.process_frame

	_assert(GameData.jogador["nome"] == "Testador", "nome do jogador salvo corretamente")
	_assert(home.get_node("%PainelNome").visible == false, "painel de nome some após confirmar")
	_assert(home.get_node("%StreakLabel").text.find("0") != -1, "streak inicial exibido como 0 dias")

	home.get_node("%BtnJogar").pressed.emit()
	await arvore.process_frame
	await arvore.process_frame

	# ---------- CATEGORIAS ----------
	var categorias: Node = arvore.current_scene
	_assert(categorias.name == "Categorias", "navegação Home -> Categorias")
	var lista := categorias.get_node("%CategoriasContainer")
	_assert(lista.get_child_count() == GameData.categorias.size(), "grid de categorias montado (%d categorias)" % GameData.categorias.size())

	var primeiro_btn: Button = lista.get_child(0)
	var nome_categoria_escolhida: String = String(GameData.categorias[0]["nome"])
	primeiro_btn.pressed.emit()
	await arvore.process_frame
	await arvore.process_frame

	# ---------- QUIZ ----------
	var quiz: Node = arvore.current_scene
	_assert(quiz.name == "Quiz", "navegação Categorias -> Quiz")
	_assert(GameData.categoria_escolhida == nome_categoria_escolhida, "categoria escolhida propagada para a rodada")
	_assert(GameData.total_perguntas_rodada() == 5, "rodada com 5 perguntas")

	var total_perguntas := GameData.total_perguntas_rodada()
	for n in total_perguntas:
		var pergunta: Dictionary = GameData.pergunta_atual()
		var alternativas: Array = pergunta.get("alternativas", [])
		var indice_correto := -1
		for i in alternativas.size():
			if bool(alternativas[i].get("correta", false)):
				indice_correto = i
				break
		_assert(indice_correto != -1, "pergunta %d tem alternativa correta definida" % (n + 1))

		var indice_antes := GameData.indice_pergunta
		var botao: Button = quiz.get_node("%" + ("AltBtn%d" % indice_correto))
		botao.pressed.emit()
		# aguarda a pausa de feedback (PAUSA_FEEDBACK ~1.6s) + troca de cena
		await arvore.create_timer(1.9).timeout
		await arvore.process_frame

		if n < total_perguntas - 1:
			_assert(GameData.indice_pergunta == indice_antes + 1, "avançou para a próxima pergunta (%d)" % (n + 2))

	_assert(GameData.acertos_rodada == total_perguntas, "todas as %d respostas corretas contabilizadas" % total_perguntas)
	_assert(GameData.pontos_rodada >= total_perguntas * 100, "pontuação mínima da rodada atingida (>= %d)" % (total_perguntas * 100))

	await arvore.process_frame
	await arvore.process_frame

	# ---------- RESULTADO ----------
	var resultado: Node = arvore.current_scene
	_assert(resultado.name == "Resultado", "navegação Quiz -> Resultado ao fim da rodada")
	_assert(resultado.get_node("%LblAcertos").text == "%d / %d" % [total_perguntas, total_perguntas], "tela de resultado mostra placar cheio")
	_assert(GameData.jogador["total_partidas"] == 1, "GameData.finalizar_rodada incrementou total_partidas")
	_assert(int(GameData.jogador["pontos_totais"]) == GameData.pontos_rodada, "pontos_totais do jogador bate com a rodada")
	_assert(int(GameData.jogador["streak_atual"]) == 1, "streak_atual vira 1 na primeira partida do dia")

	resultado.get_node("%BtnVerRanking").pressed.emit()
	await arvore.process_frame
	await arvore.process_frame

	# ---------- RANKING ----------
	var ranking: Node = arvore.current_scene
	_assert(ranking.name == "Ranking", "navegação Resultado -> Ranking")
	var ranking_lista := ranking.get_node("%ListaContainer")
	_assert(ranking_lista.get_child_count() == 1, "jogador aparece no ranking local após 1 partida")
	_assert(GameData.ranking_local[0]["nome"] == "Testador", "entrada do ranking tem o nome correto")

	ranking.get_node("%BtnVoltar").pressed.emit()
	await arvore.process_frame
	await arvore.process_frame

	# ---------- HOME (volta) + PERFIL ----------
	var home2: Node = arvore.current_scene
	_assert(home2.name == "Home", "navegação Ranking -> Home")
	home2.get_node("%BtnPerfil").pressed.emit()
	await arvore.process_frame
	await arvore.process_frame

	var perfil: Node = arvore.current_scene
	_assert(perfil.name == "Perfil", "navegação Home -> Perfil")
	_assert(perfil.get_node("%LblNome").text == "Testador", "perfil mostra o nome correto")
	_assert(perfil.get_node("%LblPartidas").text == "1", "perfil mostra 1 partida jogada")
	var conquistas_grid := perfil.get_node("%ConquistasContainer")
	_assert(conquistas_grid.get_child_count() == GameData.CONQUISTAS.size(), "grid de conquistas montado (%d conquistas)" % GameData.CONQUISTAS.size())

	print("\n== Resumo ==")
	if falhas.is_empty():
		print("TODOS OS TESTES PASSARAM")
	else:
		print("%d FALHA(S):" % falhas.size())
		for f in falhas:
			print("  - %s" % f)

	arvore.quit(0 if falhas.is_empty() else 1)
