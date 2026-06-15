# Pixi.js + Skia (CanvasKit) — Экспорт в PDF

Приложение на TypeScript, объединяющее pixi.js и Skia (canvaskit) для рендера и экспорта в PDF.

## Возможности

- Рендер PIXI.Container через Skia (CanvasKit) с поддержкой трансформаций
- Поддержка PIXI.Graphics (drawRect, drawCircle, drawEllipse, moveTo, lineTo)
- Поддержка PIXI.Sprite (PNG изображения)
- Векторный экспорт в PDF через Skia PDF backend
- Интерактивность — события pointerDown/pointerUp
- Управление сценами — переключение, генерация фигур

## Установка и запуск

npm install
npm run dev

Приложение откроется на http://localhost:3000

## Сборка

npm run build
