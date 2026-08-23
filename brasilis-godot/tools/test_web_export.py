"""
Teste do build Web exportado, via Playwright/Chromium headless.
Abre index.html servido localmente, espera o Godot inicializar,
captura erros de console e tira um screenshot para inspeção visual.

Uso: python3 tools/test_web_export.py
"""
import sys
import time
from playwright.sync_api import sync_playwright

URL = "http://localhost:8934/index.html"
SCREENSHOT = "/home/claude/brasilis-godot/web-build-screenshot.png"

erros = []
logs = []

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
    page = browser.new_page(viewport={"width": 720, "height": 1280})

    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda exc: erros.append(str(exc)))

    print(f"Abrindo {URL} ...")
    page.goto(URL, wait_until="load", timeout=30000)

    # Godot leva um tempo para baixar o .wasm (39MB) e o .pck (4.7MB) e inicializar.
    print("Aguardando inicialização do motor (canvas + primeiros frames)...")
    time.sleep(12)

    canvas_existe = page.evaluate("!!document.querySelector('canvas')")
    print(f"Canvas presente no DOM: {canvas_existe}")

    page.screenshot(path=SCREENSHOT)
    print(f"Screenshot salvo em {SCREENSHOT}")

    browser.close()

print("\n== Logs de console (últimas 40 linhas) ==")
for l in logs[-40:]:
    print(l)

print(f"\n== Erros de página JS: {len(erros)} ==")
for e in erros:
    print(f"  ✘ {e}")

if not canvas_existe:
    print("\nFALHOU: canvas não encontrado no DOM.")
    sys.exit(1)

if erros:
    print("\nATENÇÃO: houve erros JS de página (ver acima) — inspecionar antes de considerar OK.")
    sys.exit(1)

print("\nOK: canvas presente, sem erros JS de página.")
