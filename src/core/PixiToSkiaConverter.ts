import * as PIXI from "pixi.js";
import type { Surface, Canvas } from "canvaskit-wasm";
import { GraphicsRenderer } from "../renderers/GraphicsRenderer";
import { SpriteRenderer } from "../renderers/SpriteRenderer";
import { PDFSurface } from "..";
import { CanvasKitWithMakePDF } from "..";

export class PixiToSkiaConverter {
  private graphicsRenderer: GraphicsRenderer | null = null;
  private spriteRenderer: SpriteRenderer | null = null;
  private canvasKit: CanvasKitWithMakePDF | null = null;

  async initCanvasKit(): Promise<void> {
    if (this.canvasKit) return;

    try {
      this.canvasKit = await window.CanvasKitInit({
        locateFile: (file: string) => window.location.pathname + "/canvaskit/" + file,
      });
      this.initRenderers();
    } catch (error) {
      console.error("Failed to initialize CanvasKit:", error);
      throw error;
    }
  }

  createSurface(canvas: HTMLCanvasElement): Surface {
    if (!this.canvasKit) throw new Error("CanvasKit not initialized");

    const surface = this.canvasKit.MakeCanvasSurface(canvas.id);
    if (!surface) throw new Error(`Failed to create surface`);

    return surface;
  }

  getCanvasKit(): CanvasKitWithMakePDF {
    if (!this.canvasKit) throw new Error("CanvasKit not initialized");
    return this.canvasKit;
  }

  initRenderers() {
    if (!this.canvasKit) return;
    this.graphicsRenderer = new GraphicsRenderer(this.canvasKit);
    this.spriteRenderer = new SpriteRenderer(this.canvasKit);
  }

  async renderContainer(
    container: PIXI.Container,
    surface: Surface | PDFSurface,
  ): Promise<void> {
    const canvas = surface.getCanvas();

    canvas.clear(this.canvasKit!.WHITE);

    await this.renderDisplayObject(container, canvas);

    if ("flush" in surface) {
      surface.flush();
    }
  }

  private async renderDisplayObject(
    obj: PIXI.DisplayObject,
    canvas: Canvas,
    parentTransform?: {
      x: number;
      y: number;
      rotation: number;
      scaleX: number;
      scaleY: number;
    },
  ): Promise<void> {
    if (!this.graphicsRenderer || !this.spriteRenderer) return;
    const transform = {
      x: obj.position.x,
      y: obj.position.y,
      rotation: obj.angle,
      scaleX: obj.scale.x,
      scaleY: obj.scale.y,
    };

    if (parentTransform) {
      transform.x += parentTransform.x;
      transform.y += parentTransform.y;
      transform.rotation += parentTransform.rotation;
      transform.scaleX *= parentTransform.scaleX;
      transform.scaleY *= parentTransform.scaleY;
    }

    if (obj instanceof PIXI.Graphics) {
      this.graphicsRenderer.render(obj as PIXI.Graphics, canvas, transform);
    } else if (obj instanceof PIXI.Sprite) {
      await this.spriteRenderer.render(obj as PIXI.Sprite, canvas, transform);
    } else if (obj instanceof PIXI.Container) {
      for (const child of (obj as PIXI.Container).children) {
        await this.renderDisplayObject(child, canvas, transform);
      }
    }
  }
}
