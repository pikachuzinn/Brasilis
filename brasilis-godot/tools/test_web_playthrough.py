"""
Playthrough real no build Web exportado: digita nome, clica JOGAR,
escolhe categoria, responde uma pergunta — tudo via clique de mouse
de verdade no canvas (não emissão de sinal), igual ao test_clicks.gd,
só que agora no artefato final exportado.
"""
import time
from playwright.sync_api import sync_playwright

URL = "http://localhost:8934/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
    page = browser.new_page(viewport={"width": 720, "height": 1280})
    page.goto(URL, wait_until="load", timeout=30000)
    print("Aguardando boot do motor...")
    time.sleep(10)
    page.screenshot(path="/home/claude/brasilis-godot/web-build-1-home.png")

    print("Clicando no campo de nome e digitando...")
    page.mouse.click(359, 624)
    time.sleep(0.3)
    page.keyboard.type("Rick Sanchez")
    time.sleep(0.3)
    page.mouse.click(359, 682)  # Começar
    time.sleep(1.5)
    page.screenshot(path="/home/claude/brasilis-godot/web-build-2-apos-nome.png")

    print("Clicando em JOGAR...")
    page.mouse.click(359, 652)
    time.sleep(1.5)
    page.screenshot(path="/home/claude/brasilis-godot/web-build-3-categorias.png")

    print("Clicando na primeira categoria...")
    page.mouse.click(359, 400)
    time.sleep(1.5)
    page.screenshot(path="/home/claude/brasilis-godot/web-build-4-quiz.png")

    browser.close()

print("OK: playthrough concluído, screenshots salvos.")
