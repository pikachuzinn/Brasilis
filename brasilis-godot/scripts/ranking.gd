extends Control
## Ranking local — melhores pontuações salvas no dispositivo (user://),
## sem servidor nem conta online.

@onready var btn_voltar: Button = %BtnVoltar
@onready var lista_container: Container = %ListaContainer
@onready var lbl_vazio: Label = %LblVazio


func _ready() -> void:
	btn_voltar.pressed.connect(func(): GameData.ir_para("res://scenes/home.tscn"))
	_montar_ranking()


func _montar_ranking() -> void:
	for filho in lista_container.get_children():
		filho.queue_free()

	var ranking := GameData.ranking_ordenado()
	lbl_vazio.visible = ranking.is_empty()

	var medalhas := ["🥇", "🥈", "🥉"]
	for i in ranking.size():
		var item: Dictionary = ranking[i]
		var linha := HBoxContainer.new()
		linha.add_theme_constant_override("separation", 12)

		var lbl_pos := Label.new()
		lbl_pos.text = (medalhas[i] if i < 3 else "%dº" % (i + 1))
		lbl_pos.custom_minimum_size = Vector2(48, 0)
		linha.add_child(lbl_pos)

		var lbl_nome := Label.new()
		lbl_nome.text = String(item.get("nome", "Jogador"))
		lbl_nome.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		linha.add_child(lbl_nome)

		var lbl_pontos := Label.new()
		lbl_pontos.text = "%d pts" % int(item.get("pontos", 0))
		lbl_pontos.custom_minimum_size = Vector2(80, 0)
		linha.add_child(lbl_pontos)

		var lbl_streak := Label.new()
		lbl_streak.text = "🔥%d" % int(item.get("streak", 0))
		lbl_streak.custom_minimum_size = Vector2(56, 0)
		linha.add_child(lbl_streak)

		lista_container.add_child(linha)
