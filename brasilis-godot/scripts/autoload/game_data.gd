extends Node
## GameData — autoload (singleton) registrado em project.godot como "GameData".
##
## Guarda todo o estado do jogo: banco de perguntas (carregado de um JSON local),
## dados do jogador, ranking local e o estado da rodada de quiz em andamento.
## Tudo é 100% local (arquivo em user://) — não há servidor, API ou banco de
## dados remoto, conforme exigido pelas diretrizes do Projeto de Extensão.

const SAVE_PATH := "user://brasilis_save.json"
const PERGUNTAS_PATH := "res://data/perguntas.json"
const PERGUNTAS_POR_RODADA := 5
const TEMPO_POR_PERGUNTA := 30.0

var categorias: Array = []
var perguntas: Array = []

var jogador: Dictionary = {
	"nome": "",
	"pontos_totais": 0,
	"streak_atual": 0,
	"melhor_streak": 0,
	"total_partidas": 0,
	"ultima_jogada": "", # "AAAA-MM-DD"
}

# Cada item: {"nome": String, "pontos": int, "streak": int, "partidas": int}
var ranking_local: Array = []

# ---------- Estado da rodada atual ----------
var categoria_escolhida: String = "Mix"
var perguntas_rodada: Array = []
var indice_pergunta: int = 0
var acertos_rodada: int = 0
var pontos_rodada: int = 0

# Definição das conquistas (id, nome, descrição, ícone, condição)
const CONQUISTAS := [
	{"id": "primeira_vitoria", "nome": "Primeira Vitória", "descricao": "Complete seu primeiro quiz", "icone": "🎯"},
	{"id": "veterano", "nome": "Veterano", "descricao": "Jogue 10 partidas", "icone": "🎮"},
	{"id": "streak_7", "nome": "Dedicado", "descricao": "Mantenha um streak de 7 dias", "icone": "🔥"},
	{"id": "pontuador", "nome": "Pontuador", "descricao": "Alcance 500 pontos", "icone": "💯"},
	{"id": "mestre", "nome": "Mestre", "descricao": "Alcance 1000 pontos", "icone": "👑"},
	{"id": "lenda", "nome": "Lenda", "descricao": "Mantenha um streak de 30 dias", "icone": "⭐"},
]


func _ready() -> void:
	_carregar_perguntas()
	_carregar_save()


func _carregar_perguntas() -> void:
	if not FileAccess.file_exists(PERGUNTAS_PATH):
		push_error("GameData: arquivo de perguntas não encontrado em %s" % PERGUNTAS_PATH)
		return
	var f := FileAccess.open(PERGUNTAS_PATH, FileAccess.READ)
	var texto := f.get_as_text()
	f.close()
	var resultado: Variant = JSON.parse_string(texto)
	if typeof(resultado) != TYPE_DICTIONARY:
		push_error("GameData: JSON de perguntas inválido")
		return
	categorias = resultado.get("categorias", [])
	perguntas = resultado.get("perguntas", [])


func _carregar_save() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
	var texto := f.get_as_text()
	f.close()
	var dados: Variant = JSON.parse_string(texto)
	if typeof(dados) != TYPE_DICTIONARY:
		return
	if dados.has("jogador"):
		for chave in jogador.keys():
			if dados["jogador"].has(chave):
				jogador[chave] = dados["jogador"][chave]
	if dados.has("ranking_local"):
		ranking_local = dados["ranking_local"]


func salvar() -> void:
	var dados := {
		"jogador": jogador,
		"ranking_local": ranking_local,
	}
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	f.store_string(JSON.stringify(dados, "\t"))
	f.close()


func tem_nome_jogador() -> bool:
	return String(jogador.get("nome", "")) != ""


func definir_nome_jogador(nome: String) -> void:
	jogador["nome"] = nome.strip_edges()
	salvar()


# ==================== Rodada de quiz ====================

func categorias_disponiveis() -> Array:
	return categorias


func sortear_perguntas(categoria: String) -> void:
	categoria_escolhida = categoria
	var pool: Array = []
	if categoria == "" or categoria == "Mix":
		pool = perguntas.duplicate()
	else:
		for p in perguntas:
			if p.get("categoria", "") == categoria:
				pool.append(p)
	pool.shuffle()
	var qtd: int = min(PERGUNTAS_POR_RODADA, pool.size())
	perguntas_rodada = pool.slice(0, qtd)
	indice_pergunta = 0
	acertos_rodada = 0
	pontos_rodada = 0


func pergunta_atual() -> Dictionary:
	if indice_pergunta >= 0 and indice_pergunta < perguntas_rodada.size():
		return perguntas_rodada[indice_pergunta]
	return {}


func total_perguntas_rodada() -> int:
	return perguntas_rodada.size()


func calcular_bonus_tempo(tempo_restante: float) -> int:
	if tempo_restante >= 25.0:
		return 50
	elif tempo_restante >= 20.0:
		return 40
	elif tempo_restante >= 15.0:
		return 30
	elif tempo_restante >= 10.0:
		return 20
	elif tempo_restante >= 5.0:
		return 10
	return 0


func registrar_resposta(correta: bool, tempo_restante: float) -> int:
	if not correta:
		return 0
	var bonus := calcular_bonus_tempo(tempo_restante)
	var pontos := 100 + bonus
	acertos_rodada += 1
	pontos_rodada += pontos
	return pontos


func avancar_pergunta() -> bool:
	indice_pergunta += 1
	return indice_pergunta < perguntas_rodada.size()


func finalizar_rodada() -> void:
	jogador["pontos_totais"] = int(jogador.get("pontos_totais", 0)) + pontos_rodada
	jogador["total_partidas"] = int(jogador.get("total_partidas", 0)) + 1
	_atualizar_streak()
	_atualizar_ranking_local()
	salvar()


# ==================== Streak (dias consecutivos, local) ====================

func _hoje_str() -> String:
	var d := Time.get_date_dict_from_system()
	return "%04d-%02d-%02d" % [d.year, d.month, d.day]


func _dias_entre(data_a: String, data_b: String) -> int:
	# Retorna (data_b - data_a) em dias inteiros. data_a == "" => -1 (sem histórico).
	if data_a == "":
		return -1
	var seg_a := Time.get_unix_time_from_datetime_string(data_a + "T00:00:00")
	var seg_b := Time.get_unix_time_from_datetime_string(data_b + "T00:00:00")
	return int(round((seg_b - seg_a) / 86400.0))


func _atualizar_streak() -> void:
	var hoje := _hoje_str()
	var ultima: String = jogador.get("ultima_jogada", "")
	var diff := _dias_entre(ultima, hoje)
	if diff == 0:
		pass # já jogou hoje: mantém o streak atual
	elif diff == 1:
		jogador["streak_atual"] = int(jogador.get("streak_atual", 0)) + 1
	else:
		jogador["streak_atual"] = 1
	jogador["ultima_jogada"] = hoje
	if int(jogador["streak_atual"]) > int(jogador.get("melhor_streak", 0)):
		jogador["melhor_streak"] = jogador["streak_atual"]


# ==================== Ranking local ====================

func _atualizar_ranking_local() -> void:
	var nome: String = jogador.get("nome", "Jogador")
	var idx := -1
	for i in ranking_local.size():
		if ranking_local[i].get("nome", "") == nome:
			idx = i
			break
	var entrada := {
		"nome": nome,
		"pontos": int(jogador["pontos_totais"]),
		"streak": int(jogador["melhor_streak"]),
		"partidas": int(jogador["total_partidas"]),
	}
	if idx >= 0:
		ranking_local[idx] = entrada
	else:
		ranking_local.append(entrada)
	ranking_local.sort_custom(func(a, b): return int(a["pontos"]) > int(b["pontos"]))


func ranking_ordenado() -> Array:
	return ranking_local


# ==================== Conquistas ====================

func conquistas_desbloqueadas() -> Array:
	var resultado: Array = []
	for c in CONQUISTAS:
		var desbloqueada := false
		match c["id"]:
			"primeira_vitoria":
				desbloqueada = int(jogador.get("total_partidas", 0)) >= 1
			"veterano":
				desbloqueada = int(jogador.get("total_partidas", 0)) >= 10
			"streak_7":
				desbloqueada = int(jogador.get("melhor_streak", 0)) >= 7
			"pontuador":
				desbloqueada = int(jogador.get("pontos_totais", 0)) >= 500
			"mestre":
				desbloqueada = int(jogador.get("pontos_totais", 0)) >= 1000
			"lenda":
				desbloqueada = int(jogador.get("melhor_streak", 0)) >= 30
		var item: Dictionary = (c as Dictionary).duplicate()
		item["desbloqueada"] = desbloqueada
		resultado.append(item)
	return resultado


# ==================== Utilidades de navegação ====================

func ir_para(caminho_cena: String) -> void:
	get_tree().change_scene_to_file(caminho_cena)
