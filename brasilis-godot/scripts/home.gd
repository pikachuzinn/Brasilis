extends Control
## Tela Inicial — título, indicador de streak e navegação principal.

@onready var streak_label: Label = %StreakLabel
@onready var painel_nome: Control = %PainelNome
@onready var nome_input: LineEdit = %NomeInput
@onready var btn_confirmar_nome: Button = %BtnConfirmarNome
@onready var btn_jogar: Button = %BtnJogar
@onready var btn_ranking: Button = %BtnRanking
@onready var btn_perfil: Button = %BtnPerfil


func _ready() -> void:
	btn_jogar.pressed.connect(_on_jogar_pressed)
	btn_ranking.pressed.connect(_on_ranking_pressed)
	btn_perfil.pressed.connect(_on_perfil_pressed)
	btn_confirmar_nome.pressed.connect(_on_confirmar_nome_pressed)
	nome_input.text_submitted.connect(func(_texto): _on_confirmar_nome_pressed())

	_atualizar_streak()
	painel_nome.visible = not GameData.tem_nome_jogador()


func _atualizar_streak() -> void:
	streak_label.text = "🔥 %d dias" % int(GameData.jogador.get("streak_atual", 0))


func _on_confirmar_nome_pressed() -> void:
	var nome := nome_input.text.strip_edges()
	if nome == "":
		nome = "Jogador"
	GameData.definir_nome_jogador(nome)
	painel_nome.visible = false


func _on_jogar_pressed() -> void:
	GameData.ir_para("res://scenes/categorias.tscn")


func _on_ranking_pressed() -> void:
	GameData.ir_para("res://scenes/ranking.tscn")


func _on_perfil_pressed() -> void:
	GameData.ir_para("res://scenes/perfil.tscn")
