import { PixiSkiaApp } from './app';
import './styles.css';

// Функция для создания UI
function createUI() {
  const app = document.getElementById('app');
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

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  createUI();
  new PixiSkiaApp();
});


/**
 * Главный файл приложения
 */

// import { CanvasRenderer } from '@pixi/canvas-renderer';
// import * as PIXI from 'pixi.js';
// import { SkiaWrapper } from './skia-wrapper';
// import { SceneManager } from './scene-manager';
// import { EventManager } from './events';

// const CANVAS_WIDTH = 800;
// const CANVAS_HEIGHT = 600;

// let pixiApp: PIXI.Application;
// let skiaWrapper: SkiaWrapper;
// let sceneManager: SceneManager;
// let eventManager: EventManager;
// let statusElement: HTMLElement;
// let sceneNameElement: HTMLElement;
// let objectCountElement: HTMLElement;

// const renderer = new CanvasRenderer()

// async function init(): Promise<void> {
//   console.log('Инициализация приложения...');
//   updateStatus('Загрузка PIXI.js...');

//   statusElement = document.getElementById('status')!;
//   sceneNameElement = document.getElementById('scene-name')!;
//   objectCountElement = document.getElementById('object-count')!;
//   const eventLogElement = document.getElementById('event-log')!;

//   pixiApp = new PIXI.Application({
//     width: CANVAS_WIDTH,
//     height: CANVAS_HEIGHT,
//     backgroundColor: 0xffffff,
//     forceCanvas: true,
//     resolution: window.devicePixelRatio || 1,
//     autoDensity: true,
    
//   });

//   document.getElementById('pixi-canvas')!.appendChild(pixiApp.view as HTMLCanvasElement);
//   updateStatus('Загрузка CanvasKit...');

//   const skiaCanvas = document.getElementById('skia-canvas') as HTMLCanvasElement;
//   skiaWrapper = new SkiaWrapper({
//     canvas: skiaCanvas,
//     width: CANVAS_WIDTH,
//     height: CANVAS_HEIGHT,
//     backgroundColor: '#ffffff',
//   });

//   try {
//     await skiaWrapper.init();
//     updateStatus('Готово');
//   } catch (error) {
//     console.error('Ошибка инициализации CanvasKit:', error);
//     updateStatus('Ошибка загрузки CanvasKit');
//   }

//   sceneManager = new SceneManager();
//   eventManager = new EventManager(pixiApp, eventLogElement);
//   setupButtons();
//   renderCurrentScene();

//   pixiApp.ticker.add(() => {
//     skiaWrapper.render(sceneManager.getCurrentScene());
//     updateObjectCount();
//   });

//   console.log('Приложение инициализировано');
// }

// function setupButtons(): void {
//   document.getElementById('btn-generate')!.addEventListener('click', () => {
//     sceneManager.addRandomShape();
//     renderCurrentScene();
//   });

//   document.getElementById('btn-switch-scene')!.addEventListener('click', () => {
//     sceneManager.nextScene();
//     renderCurrentScene();
//   });

//   document.getElementById('btn-export-pdf')!.addEventListener('click', async () => {
//     await exportToPDF();
//   });

//   document.getElementById('btn-clear')!.addEventListener('click', () => {
//     sceneManager.clearCurrentScene();
//     renderCurrentScene();
//   });
// }

// function renderCurrentScene(): void {
//   const currentScene = sceneManager.getCurrentScene();
//   pixiApp.stage.removeChildren();
//   pixiApp.stage.addChild(currentScene);
//   eventManager.setupInteraction(currentScene);
//   updateSceneName();
//   updateObjectCount();
//   skiaWrapper.render(currentScene);
// }

// async function exportToPDF(): Promise<void> {
//   updateStatus('Экспорт в PDF...');
//   try {
//     const pdfBlob = await skiaWrapper.exportToPDF(sceneManager.getCurrentScene(), CANVAS_WIDTH, CANVAS_HEIGHT);
//     const url = URL.createObjectURL(pdfBlob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'scene-export-' + Date.now() + '.pdf';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//     updateStatus('PDF экспортирован!');
//     setTimeout(() => updateStatus('Готово'), 3000);
//   } catch (error) {
//     console.error('Ошибка экспорта PDF:', error);
//     updateStatus('Ошибка экспорта PDF');
//     alert('PDF backend недоступен. Выполняется экспорт в PNG.');
//     await exportToPNG();
//   }
// }

// async function exportToPNG(): Promise<void> {
//   try {
//     const canvas = pixiApp.view as HTMLCanvasElement;
//     const dataUrl = canvas.toDataURL('image/png');
//     const a = document.createElement('a');
//     a.href = dataUrl;
//     a.download = 'scene-export-' + Date.now() + '.png';
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     updateStatus('PNG экспортирован');
//     setTimeout(() => updateStatus('Готово'), 3000);
//   } catch (error) {
//     console.error('Ошибка экспорта PNG:', error);
//     updateStatus('Ошибка экспорта');
//   }
// }

// function updateStatus(message: string): void {
//   if (statusElement) statusElement.textContent = message;
// }

// function updateSceneName(): void {
//   if (sceneNameElement) sceneNameElement.textContent = sceneManager.getCurrentSceneName();
// }

// function updateObjectCount(): void {
//   if (objectCountElement) objectCountElement.textContent = sceneManager.getObjectCount().toString();
// }

// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', init);
// } else {
//   init();
// }