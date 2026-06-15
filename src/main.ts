import { PixiSkiaApp } from "./app";
import "./styles.css";

// Функция для создания UI
function createUI() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div class="app-container">
      <h1>🎨 Pixi.js + Skia PDF Renderer</h1>
      <div class="subtitle">
        <span class="status"></span>
        Векторный рендеринг с экспортом в PDF
      </div>
      
      <div class="canvases">
        <div class="canvas-wrapper">
          <h3>Pixi.js Canvas <small>(forceCanvas=true)</small></h3>
          <div id="pixi-canvas"></div>
        </div>
        <div class="canvas-wrapper">
          <h3>Skia Canvas <small>(через CanvasKit)</small></h3>
          <div id="skia-canvas"></div>
        </div>
      </div>
      
      <div class="controls">
        <button id="add-shape">➕ Сгенерировать случайную фигуру</button>
        <button id="export-pdf">📄 Экспорт в PDF</button>
      </div>
      
      <div class="info">
        💡 <strong>Интерактивность:</strong> Кликайте на фигуры для проверки событий pointerdown/pointerup<br>
        📊 <strong>Статистика:</strong> Каждая новая фигура добавляется и в Pixi, и в Skia<br>
        📄 <strong>PDF:</strong> Экспортирует полностью векторную графику (кроме Sprite)
        <div id="status-message" style="margin-top: 10px; font-size: 0.9rem;"></div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  createUI();
  new PixiSkiaApp();
});
