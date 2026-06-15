import * as PIXI from "pixi.js-legacy";
import { Surface } from "canvaskit-wasm";
import { PixiToSkiaConverter } from "./core/PixiToSkiaConverter";
import { PDFExporter } from "./core/PDFExporter";
import { EventMapper } from "./events/EventMapper";

import {
  pixiAppConfig,
  colors,
  WIDTH,
  HEIGHT,
  consoleCSSGreen,
  consoleCSSRed,
} from "./config";
export class PixiSkiaApp {
  private pixiApp!: PIXI.Application;
  private converter: PixiToSkiaConverter | null = null;
  private pdfExporter: PDFExporter | null = null;
  private mainContainer: PIXI.Container;
  private skiaCanvas: HTMLCanvasElement;
  private isSkiaReady = false;
  private surface: Surface | null = null;

  constructor() {
    this.mainContainer = new PIXI.Container();
    this.skiaCanvas = document.createElement("canvas");
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.initPixi();
      this.createTestScene();
      await this.initSkia();
      this.setupUI();
    } catch (error) {
      console.log("%c", consoleCSSRed);
      console.error(error);
      this.updateStatus("Ошибка инициализации приложения");
    }
  }

  private async initPixi(): Promise<void> {
    this.pixiApp = new PIXI.Application(pixiAppConfig);

    const pixiContainer = document.getElementById("pixi-canvas");
    if (pixiContainer) {
      pixiContainer.appendChild(this.pixiApp.view as HTMLCanvasElement);
    }

    this.pixiApp.stage.addChild(this.mainContainer);
  }

  private async initSkia(): Promise<void> {
    this.skiaCanvas.width = WIDTH;
    this.skiaCanvas.height = HEIGHT;
    this.skiaCanvas.id = "skia-main-canvas";
    this.skiaCanvas.style.width = `${WIDTH}px`;
    this.skiaCanvas.style.height = `${HEIGHT}px`;

    const skiaContainer = document.getElementById("skia-canvas");
    if (skiaContainer) {
      skiaContainer.appendChild(this.skiaCanvas);
    }

    // Инициализация Skia
    this.converter = new PixiToSkiaConverter();
    await this.converter.initCanvasKit();
    this.surface = this.converter.createSurface(this.skiaCanvas);
    const canvasKit = this.converter.getCanvasKit();

    this.pdfExporter = new PDFExporter(canvasKit, this.converter);

    // Маппинг событий
    const eventMapper = new EventMapper(this.skiaCanvas);

    eventMapper.setupPixiEvents(this.pixiApp.stage);

    this.isSkiaReady = true;
    await this.renderToSkia();
    console.log("%cSkia initialized", consoleCSSGreen);
  }

  private createTestScene(): void {
    const subContainer = new PIXI.Container();
    const g1 = new PIXI.Graphics();
    const g2 = new PIXI.Graphics();
    const g3 = new PIXI.Graphics();
    const g4 = new PIXI.Graphics();

    g1.beginFill("#ff000077").drawEllipse(0, 0, 200, 100).endFill();
    g1.position.set(200, 100);
    g1.angle = 30;
    g1.eventMode = "static";
    g1.on("pointerdown", () => console.log("🔴 g1 pointerdown!"));
    g1.on("pointerup", () => console.log("🟢 g1 pointerup!"));

    g2.beginFill("#0000ffaa").drawRect(-50, -75, 100, 150).endFill();
    g2.position.set(120, 60);
    g2.angle = 15;
    g2.scale.set(1.5, 1.7);
    g2.eventMode = "static";
    g2.on("pointerdown", () => console.log("🔵 g2 pointerdown!"));
    g2.on("pointerup", () => console.log("🟢 g2 pointerup!"));

    g3.lineStyle(10, "#121212", 1).moveTo(0, 0).lineTo(150, 100);
    g3.angle = -20;

    g4.lineStyle(10, "#ffff00", 1).moveTo(0, 70).lineTo(150, -30);
    g4.angle = 20;

    subContainer.position.set(75, 50);
    subContainer.addChild(g3, g4);
    this.pixiApp.stage.addChild(subContainer, g1, g2);

    console.log("%cTest scene created", consoleCSSGreen);
  }

  private async renderToSkia(): Promise<void> {
    if (!this.converter || !this.isSkiaReady) {
      return;
    }
    if (!this.surface) {
      this.surface = this.converter.createSurface(this.skiaCanvas);
    }

    await this.converter.renderContainer(this.pixiApp.stage, this.surface);
  }

  private addRandomShape(): void {
    const randomGraphics = new PIXI.Graphics();

    const color = colors[Math.floor(Math.random() * colors.length)];
    const type = Math.floor(Math.random() * 4);

    const alpha = 0.5 + Math.random() * 0.5;

    randomGraphics.beginFill(color, alpha);

    if (type === 0) {
      const height = 40 + Math.random() * 60;
      const width = 40 + Math.random() * 100;
      randomGraphics.drawRect(0, 0, width, height);
      console.log(`➕ Добавлен прямоугольник ${color}`);
    } else if (type === 1) {
      const radius = 30 + Math.random() * 40;
      randomGraphics.drawCircle(0, 0, radius);
      console.log(`➕ Добавлен круг ${color}`);
    } else if (type === 2) {
      const pointsRandomNumber = Math.ceil(Math.random() * 10);
      const pointsFinalNumber = pointsRandomNumber > 4 ? pointsRandomNumber : 5;
      const path = new Array(pointsFinalNumber).fill(null).reduce(function (
        acc,
        _,
        index,
        arr,
      ) {
        const randomX = Math.random();
        const integerX = Math.ceil(randomX * 10);
        const randomY = Math.random();
        const integerY = Math.ceil(randomY * 10);
        const { x: prevX, y: prevY } = acc[index - 1] ?? {
          x: integerX * 10,
          y: integerY * 10,
        };
        const x = prevX + 10 * integerX;
        const isStart = (arr.length - 1) / 2 > index;
        const y = isStart ? prevY + 10 * integerY : prevY - 10 * integerY;
        acc.push({ x, y });
        return acc;
      }, []);

      randomGraphics.drawPolygon(path);
      console.log(`➕ Добавлен полигон ${color}`);
    } else {
      const width = 60 + Math.random() * 80;
      const height = 40 + Math.random() * 60;
      randomGraphics.drawEllipse(0, 0, width, height);
      console.log(`➕ Добавлен эллипс ${color}`);
    }

    randomGraphics.endFill();
    if (type === 2) {
      randomGraphics.position.set(
        Math.random() * (WIDTH - 100),
        Math.random() * (HEIGHT - 100),
      );
    } else {
      randomGraphics.position.set(
        Math.random() * WIDTH,
        Math.random() * HEIGHT,
      );
    }

    randomGraphics.angle = Math.random() * 360;
    randomGraphics.eventMode = "static";
    randomGraphics.on("pointerdown", () =>
      console.log("✨ Random shape clicked!"),
    );
    randomGraphics.on("pointerup", () =>
      console.log("✨ Random shape released!"),
    );

    this.pixiApp.stage.addChild(randomGraphics);
    this.renderToSkia();
  }

  private async exportToPDF(): Promise<void> {
    if (!this.pdfExporter) {
      console.error("PDF экспортер не инициализирован");
      return;
    }

    try {
      const exportBtn = document.querySelector(
        "#export-pdf",
      ) as HTMLButtonElement;
      if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.textContent = "⏳ Экспорт...";
      }

      await this.pdfExporter.export(
        this.pixiApp.stage,
        WIDTH,
        HEIGHT,
        `skia-${new Date().toLocaleString()}.pdf`,
      );

      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = "📄 Экспорт в PDF";
      }
    } catch (error) {
      console.log("%cОшибка экспорта PDF:", consoleCSSRed);
      console.error(error);
      this.updateStatus("❌ Ошибка экспорта PDF");

      const exportBtn = document.querySelector(
        "#export-pdf",
      ) as HTMLButtonElement;
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.textContent = "📄 Экспорт в PDF";
      }
    }
  }

  private async loadExternalPNG(file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    const texture = await PIXI.Texture.fromURL(url);
    const sprite = new PIXI.Sprite(texture);

    sprite.position.set(Math.random() * WIDTH, Math.random() * HEIGHT);
    sprite.anchor.set(0.5);
    sprite.angle = Math.random() * 360;
    sprite.scale.set(0.5 + Math.random(), 0.5 + Math.random());
    sprite.interactive = true;
    sprite.on("pointerdown", () => console.log("PNG sprite clicked!"));
    sprite.on("pointerup", () => console.log("PNG sprite released!"));

    this.mainContainer.addChild(sprite);
    this.pixiApp.stage.addChild(sprite);
    await this.renderToSkia();

    URL.revokeObjectURL(url);
    console.log("PNG file loaded and rendered!");
  }

  private setupUI(): void {
    const addButton = document.querySelector("#add-shape") as HTMLButtonElement;
    const exportButton = document.querySelector(
      "#export-pdf",
    ) as HTMLButtonElement;

    if (addButton) {
      addButton.onclick = () => this.addRandomShape();
    }

    if (exportButton) {
      exportButton.onclick = () => this.exportToPDF();
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png";
    fileInput.style.display = "none";
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        await this.loadExternalPNG(file);
      }
    };

    const loadPNGButton = document.createElement("button");
    loadPNGButton.textContent = "📁 Загрузить PNG спрайт";
    loadPNGButton.style.background = "#4ecdc4";
    loadPNGButton.onclick = () => fileInput.click();

    document.body.appendChild(fileInput);
    document.body.appendChild(loadPNGButton);
  }

  private updateStatus(message: string): void {
    const statusEl = document.querySelector("#status-message");
    if (statusEl) {
      statusEl.textContent = message;
    }
    console.log(message);
  }
}
