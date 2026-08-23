extends Control
## Tela de Perfil — estatísticas do jogador e conquistas, tudo lido do
## save local (GameData.jogador).

@onready var btn_voltar: Button = %BtnVoltar
@onready var lbl_nome: Label = %LblNome
@onready var lbl_pontos: Label = %LblPontos
@onready var lbl_streak: Label = %LblStreak
@onready var lbl_partidas: Label = %LblPartidas
@onready var lbl_melhor_streak: Label = %LblMelhorStreak
@onready var conquistas_container: Container = %ConquistasContainer


func _ready() -> void:
	btn_voltar.pressed.connect(func(): GameData.ir_para("res://scenes/home.tscn"))
	_carregar_dados()
	_montar_conquistas()


func _carregar_dados() -> void:
	var j := GameData.jogador
	lbl_nome.text = String(j.get("nome", "Jogador"))
	lbl_pontos.text = str(int(j.get("pontos_totais", 0)))
	lbl_streak.text = str(int(j.get("streak_atual", 0)))
	lbl_partidas.text = str(int(j.get("total_partidas", 0)))
	lbl_melhor_streak.text = str(int(j.get("melhor_streak", 0)))


func _montar_conquistas() -> void:
	for filho in conquistas_container.get_children():
		filho.queue_free()

	for c in GameData.conquistas_desbloqueadas():
		var painel := PanelContainer.new()
		painel.custom_minimum_size = Vector2(0, 96)
		var caixa := VBoxContainer.new()
		caixa.alignment = BoxContainer.ALIGNMENT_CENTER
		painel.add_child(caixa)

		var lbl_icone := Label.new()
		lbl_icone.text = String(c.get("icone", ""))
		lbl_icone.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl_icone.add_theme_font_size_override("font_size", 28)
		caixa.add_child(lbl_icone)

		var lbl_nome_c := Label.new()
		lbl_nome_c.text = String(c.get("nome", ""))
		lbl_nome_c.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		caixa.add_child(lbl_nome_c)

		var lbl_desc := Label.new()
		lbl_desc.text = String(c.get("descricao", ""))
		lbl_desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl_desc.autowrap_mode = TextServer.AUTOWRAP_WORD
		lbl_desc.add_theme_font_size_override("font_size", 12)
		caixa.add_child(lbl_desc)

		painel.modulate = Color(1, 1, 1, 1) if bool(c.get("desbloqueada", false)) else Color(1, 1, 1, 0.35)
		conquistas_container.add_child(painel)
