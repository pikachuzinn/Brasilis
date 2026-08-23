extends Control
## Tela de resultado — resumo da rodada (acertos, pontos, aproveitamento) e
## navegação para jogar novamente, ver ranking ou voltar à Home.

@onready var lbl_titulo: Label = %LblTitulo
@onready var lbl_acertos: Label = %LblAcertos
@onready var lbl_pontos: Label = %LblPontos
@onready var lbl_porcentagem: Label = %LblPorcentagem
@onready var lbl_mensagem: Label = %LblMensagem
@onready var btn_jogar_novamente: Button = %BtnJogarNovamente
@onready var btn_ver_ranking: Button = %BtnVerRanking
@onready var btn_voltar_home: Button = %BtnVoltarHome


func _ready() -> void:
	var acertos := GameData.acertos_rodada
	var total := GameData.total_perguntas_rodada()
	var pontos := GameData.pontos_rodada
	var porcentagem := 0
	if total > 0:
		porcentagem = int(round(float(acertos) / float(total) * 100.0))

	lbl_acertos.text = "%d / %d" % [acertos, total]
	lbl_pontos.text = "%d pontos" % pontos
	lbl_porcentagem.text = "%d%%" % porcentagem

	if porcentagem >= 80:
		lbl_titulo.text = "🏆 Excelente!"
		lbl_mensagem.text = "Você mandou muito bem! Continue assim!"
	elif porcentagem >= 60:
		lbl_titulo.text = "⭐ Muito Bom!"
		lbl_mensagem.text = "Bom trabalho! Continue praticando!"
	else:
		lbl_titulo.text = "💪 Continue Tentando!"
		lbl_mensagem.text = "Não desista! A prática leva à perfeição!"

	btn_jogar_novamente.pressed.connect(func(): GameData.ir_para("res://scenes/categorias.tscn"))
	btn_ver_ranking.pressed.connect(func(): GameData.ir_para("res://scenes/ranking.tscn"))
	btn_voltar_home.pressed.connect(func(): GameData.ir_para("res://scenes/home.tscn"))
