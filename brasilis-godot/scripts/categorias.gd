extends Control
## Tela de seleção de categoria — monta os botões a partir de GameData.categorias
## e inicia uma rodada de quiz (5 perguntas) ao escolher.

@onready var btn_voltar: Button = %BtnVoltar
@onready var categorias_container: Container = %CategoriasContainer
@onready var btn_mix: Button = %BtnMix


func _ready() -> void:
	btn_voltar.pressed.connect(func(): GameData.ir_para("res://scenes/home.tscn"))
	btn_mix.pressed.connect(func(): _iniciar_quiz("Mix"))
	_montar_categorias()


func _montar_categorias() -> void:
	for filho in categorias_container.get_children():
		filho.queue_free()

	for cat in GameData.categorias_disponiveis():
		var btn := Button.new()
		btn.text = "%s  %s\n%s" % [cat.get("icone", ""), cat.get("nome", ""), cat.get("descricao", "")]
		btn.custom_minimum_size = Vector2(0, 84)
		btn.autowrap_mode = TextServer.AUTOWRAP_WORD
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.pressed.connect(_iniciar_quiz.bind(cat.get("nome", "")))
		categorias_container.add_child(btn)


func _iniciar_quiz(categoria: String) -> void:
	GameData.sortear_perguntas(categoria)
	GameData.ir_para("res://scenes/quiz.tscn")
