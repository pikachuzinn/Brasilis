extends Control
## Mecânica central do jogo: exibe 5 perguntas da rodada sorteada por
## Categorias, com timer de 30s (bônus de pontos por velocidade), feedback
## visual imediato e avanço automático. Ao final, delega a GameData e segue
## para a tela de Resultado.

const TEMPO_TOTAL := 30
const PAUSA_FEEDBACK := 1.6

@onready var lbl_numero: Label = %LblNumeroPergunta
@onready var lbl_categoria: Label = %LblCategoriaAtual
@onready var barra_progresso: ProgressBar = %BarraProgresso
@onready var lbl_tempo: Label = %LblTempo
@onready var barra_tempo: ProgressBar = %BarraTempo
@onready var lbl_pergunta: Label = %LblPergunta
@onready var imagem_pergunta: TextureRect = %ImagemPergunta
@onready var lbl_acertos: Label = %LblAcertos
@onready var lbl_pontos: Label = %LblPontos
@onready var timer: Timer = %Timer
@onready var botoes_alternativa: Array[Button] = [%AltBtn0, %AltBtn1, %AltBtn2, %AltBtn3]

var tempo_restante: int = TEMPO_TOTAL
var respondida: bool = false


func _ready() -> void:
	timer.wait_time = 1.0
	timer.one_shot = false
	timer.timeout.connect(_on_timer_tick)
	for i in botoes_alternativa.size():
		botoes_alternativa[i].pressed.connect(_on_alternativa_pressed.bind(i))

	if GameData.total_perguntas_rodada() == 0:
		GameData.ir_para("res://scenes/categorias.tscn")
		return

	_mostrar_pergunta()


func _mostrar_pergunta() -> void:
	respondida = false
	var pergunta := GameData.pergunta_atual()
	if pergunta.is_empty():
		_finalizar_quiz()
		return

	lbl_numero.text = "Pergunta %d de %d" % [GameData.indice_pergunta + 1, GameData.total_perguntas_rodada()]
	lbl_categoria.text = String(pergunta.get("categoria", ""))
	barra_progresso.max_value = GameData.total_perguntas_rodada()
	barra_progresso.value = GameData.indice_pergunta + 1
	lbl_pergunta.text = String(pergunta.get("texto", ""))

	var caminho_imagem: String = String(pergunta.get("imagem", ""))
	if caminho_imagem != "" and ResourceLoader.exists(caminho_imagem):
		imagem_pergunta.texture = load(caminho_imagem)
		imagem_pergunta.visible = true
	else:
		imagem_pergunta.texture = null
		imagem_pergunta.visible = false

	var alternativas: Array = pergunta.get("alternativas", [])
	for i in botoes_alternativa.size():
		var btn := botoes_alternativa[i]
		btn.disabled = false
		btn.modulate = Color.WHITE
		if i < alternativas.size():
			var a: Dictionary = alternativas[i]
			btn.text = "%s)  %s" % [a.get("letra", ""), a.get("texto", "")]
			btn.visible = true
		else:
			btn.visible = false

	_atualizar_placar()

	tempo_restante = TEMPO_TOTAL
	_atualizar_tempo_visual()
	timer.start()


func _atualizar_placar() -> void:
	lbl_acertos.text = "Acertos: %d" % GameData.acertos_rodada
	lbl_pontos.text = "Pontos: %d" % GameData.pontos_rodada


func _on_timer_tick() -> void:
	tempo_restante -= 1
	_atualizar_tempo_visual()
	if tempo_restante <= 0:
		timer.stop()
		respondida = true
		_travar_botoes()
		_marcar_correta()
		await get_tree().create_timer(PAUSA_FEEDBACK).timeout
		_ir_para_proxima()


func _atualizar_tempo_visual() -> void:
	lbl_tempo.text = str(max(tempo_restante, 0))
	barra_tempo.max_value = TEMPO_TOTAL
	barra_tempo.value = max(tempo_restante, 0)
	if tempo_restante <= 5:
		barra_tempo.modulate = Color(0.9, 0.25, 0.25)
	elif tempo_restante <= 10:
		barra_tempo.modulate = Color(0.95, 0.7, 0.15)
	else:
		barra_tempo.modulate = Color(0.25, 0.75, 0.45)


func _on_alternativa_pressed(indice: int) -> void:
	if respondida:
		return
	respondida = true
	timer.stop()
	_travar_botoes()

	var pergunta := GameData.pergunta_atual()
	var alternativas: Array = pergunta.get("alternativas", [])
	var escolhida: Dictionary = alternativas[indice]
	var correta := bool(escolhida.get("correta", false))

	GameData.registrar_resposta(correta, float(tempo_restante))

	if correta:
		botoes_alternativa[indice].modulate = Color(0.35, 0.85, 0.45)
	else:
		botoes_alternativa[indice].modulate = Color(0.9, 0.35, 0.35)
	_marcar_correta()
	_atualizar_placar()

	await get_tree().create_timer(PAUSA_FEEDBACK).timeout
	_ir_para_proxima()


func _marcar_correta() -> void:
	var pergunta := GameData.pergunta_atual()
	var alternativas: Array = pergunta.get("alternativas", [])
	for i in alternativas.size():
		if bool(alternativas[i].get("correta", false)):
			botoes_alternativa[i].modulate = Color(0.35, 0.85, 0.45)


func _travar_botoes() -> void:
	for btn in botoes_alternativa:
		btn.disabled = true


func _ir_para_proxima() -> void:
	if not is_inside_tree():
		return
	if GameData.avancar_pergunta():
		_mostrar_pergunta()
	else:
		_finalizar_quiz()


func _finalizar_quiz() -> void:
	timer.stop()
	GameData.finalizar_rodada()
	GameData.ir_para("res://scenes/resultado.tscn")
