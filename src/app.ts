import * as PIXI from 'pixi.js-legacy';
import { SkiaWrapper } from './core/SkiaWrapper';
import { PixiToSkiaConverter } from './core/PixiToSkiaConverter';
import { PDFExporter } from './core/PDFExporter';
import { EventMapper } from './events/EventMapper';
import { Surface } from 'canvaskit-wasm';


const renderer = await PIXI.autoDetectRenderer();

export class PixiSkiaApp {
  private pixiApp!: PIXI.Application;
  private skiaWrapper: SkiaWrapper;
  private converter: PixiToSkiaConverter | null = null;
  private pdfExporter: PDFExporter | null = null;
  private mainContainer: PIXI.Container;
  private skiaCanvas: HTMLCanvasElement;
  private isSkiaReady = false;
  private renderer: PIXI.Renderer
  private surface: Surface | null = null;

  constructor() {
    this.mainContainer = new PIXI.Container();
    this.skiaWrapper = new SkiaWrapper();
    this.skiaCanvas = document.createElement('canvas');
    this.init();
    this.renderer = new PIXI.Renderer();
  }

  private async init(): Promise<void> {
    try {
      await this.initPixi();
      await this.initSkia();
      this.createTestScene();
      this.setupUI();
      this.updateStatus('✅ Приложение готово к работе');
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      this.updateStatus('❌ Ошибка инициализации приложения');
    }
  }

  private async initPixi(): Promise<void> {
    this.pixiApp = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0xffffff,
      forceCanvas: true,
      antialias: true
    });
    
    const pixiContainer = document.getElementById('pixi-canvas');
    if (pixiContainer) {
      pixiContainer.appendChild(this.pixiApp.view as HTMLCanvasElement);
    }
    
    this.pixiApp.stage.addChild(this.mainContainer);
    console.log('✅ Pixi.js initialized');
  }

  private async initSkia(): Promise<void> {
    // Настройка Skia канваса
    this.skiaCanvas.width = 800;
    this.skiaCanvas.height = 600;
    this.skiaCanvas.id = 'skia-main-canvas';
    this.skiaCanvas.style.width = '800px';
    this.skiaCanvas.style.height = '600px';
    
    const skiaContainer = document.getElementById('skia-canvas');
    if (skiaContainer) {
      skiaContainer.appendChild(this.skiaCanvas);
    }
    
    // Инициализация Skia
    await this.skiaWrapper.init();
    this.surface = this.skiaWrapper.createSurface(this.skiaCanvas, 800, 600);
    this.converter = new PixiToSkiaConverter(this.skiaWrapper.getCanvasKit());
    this.pdfExporter = new PDFExporter(this.skiaWrapper.getCanvasKit(), this.converter);
    
    // Маппинг событий
    const eventMapper = new EventMapper(this.skiaCanvas);
    eventMapper.setupPixiEvents(this.mainContainer);
    
    this.isSkiaReady = true;
    await this.renderToSkia();
    console.log('✅ Skia initialized');
  }

  private createTestScene(): void {
    const subContainer = new PIXI.Container();
    const g1 = new PIXI.Graphics();
    const g2 = new PIXI.Graphics();
    const g3 = new PIXI.Graphics();
    const g4 = new PIXI.Graphics();

    // Фигура 1: красный эллипс
    g1.beginFill('#ff0000').drawEllipse(0, 0, 200, 100).endFill();
    g1.position.set(200, 100);
    g1.angle = 30;
    g1.eventMode = 'static';
    g1.on('pointerdown', () => console.log('🔴 g1 pointerdown!'));
    g1.on('pointerup', () => console.log('🟢 g1 pointerup!'));

    // Фигура 2: синий прямоугольник
    g2.beginFill('#0000ff').drawRect(-50, -75, 100, 150).endFill();
    g2.position.set(120, 60);
    g2.angle = 15;
    g2.scale.set(1.5, 1.7);
    g2.eventMode = 'static';
    g2.on('pointerdown', () => console.log('🔵 g2 pointerdown!'));
    g2.on('pointerup', () => console.log('🟢 g2 pointerup!'));

    // Линия 3: белая
    g3.lineStyle(10, '#ffffff', 1)
      .moveTo(0, 0)
      .lineTo(150, 100);
    g3.angle = -20;

    // Линия 4: желтая
    g4.lineStyle(10, '#ffff00', 1)
      .moveTo(0, 70)
      .lineTo(150, -30);
    g4.angle = 20;

    subContainer.position.set(75, 50);
    subContainer.addChild(g3, g4);
    this.mainContainer.addChild(subContainer, g1, g2);
    
    console.log('✅ Test scene created');
  }

  private async renderToSkia(): Promise<void> {
    if (!this.converter || !this.isSkiaReady) {
      console.log('here we are')
      return;
    }
    if (!this.surface) {
      this.surface = this.skiaWrapper.createSurface(this.skiaCanvas, 800, 600);
    }
    // await this.converter.renderContainer(this.mainContainer, surface);
    await this.converter.renderContainer(this.pixiApp.stage, this.surface)
  }

  private addRandomShape(): void {
    const randomGraphics = new PIXI.Graphics();
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#ff0066'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const type = Math.floor(Math.random() * 3);
    const alpha = 0.5 + Math.random() * 0.5;
    
    randomGraphics.beginFill(color, alpha);
    
    if (type === 0) {
      const size = 40 + Math.random() * 60;
      randomGraphics.drawRect(-size/2, -size/2, size, size);
      console.log(`➕ Добавлен прямоугольник ${color}`);
    } else if (type === 1) {
      const radius = 30 + Math.random() * 40;
      randomGraphics.drawCircle(0, 0, radius);
      console.log(`➕ Добавлен круг ${color}`);
    } else {
      const width = 60 + Math.random() * 80;
      const height = 40 + Math.random() * 60;
      randomGraphics.drawEllipse(0, 0, width, height);
      console.log(`➕ Добавлен эллипс ${color}`);
    }
    
    randomGraphics.endFill();
    randomGraphics.position.set(Math.random() * 800, Math.random() * 600);
    randomGraphics.angle = Math.random() * 360;
    randomGraphics.eventMode = 'static';
    randomGraphics.on('pointerdown', () => console.log('✨ Random shape clicked!'));
    randomGraphics.on('pointerup', () => console.log('✨ Random shape released!'));
    
    // this.mainContainer.addChild(randomGraphics);
    this.pixiApp.stage.addChild(randomGraphics);
    
    console.log('main container', this.mainContainer.children.length, this.mainContainer.constructor);
    console.log('main pixi', this.pixiApp.stage.children.length, this.pixiApp.stage.constructor)
    this.renderToSkia();
  }

  private async exportToPDF(): Promise<void> {
    if (!this.pdfExporter) {
      console.error('PDF экспортер не инициализирован');
      return;
    }
    
    try {
      const exportBtn = document.querySelector('#export-pdf') as HTMLButtonElement;
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = '⏳ Экспорт...';
      }
      
      await this.pdfExporter.export(this.mainContainer, 800, 600, `skia-${new Date().toLocaleString()}.pdf`);
      
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = '📄 Экспорт в PDF';
      }
    } catch (error) {
      console.error('Ошибка экспорта PDF:', error);
      this.updateStatus('❌ Ошибка экспорта PDF');
      
      const exportBtn = document.querySelector('#export-pdf') as HTMLButtonElement;
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = '📄 Экспорт в PDF';
      }
    }
  }

  private setupUI(): void {
    const addButton = document.querySelector('#add-shape') as HTMLButtonElement;
    const exportButton = document.querySelector('#export-pdf') as HTMLButtonElement;
    
    if (addButton) {
      addButton.onclick = () => this.addRandomShape();
    }
    
    if (exportButton) {
      exportButton.onclick = () => this.exportToPDF();
    }
  }

  private updateStatus(message: string): void {
    const statusEl = document.querySelector('#status-message');
    if (statusEl) {
      statusEl.textContent = message;
    }
    console.log(message);
  }
}