import  * as PIXI from 'pixi.js';
import type { CanvasKit, Surface, Canvas } from 'canvaskit-wasm';
import { GraphicsRenderer } from '../renderers/GraphicsRenderer';
import { SpriteRenderer } from '../renderers/SpriteRenderer';
import { PDFSurface } from '../types';

export class PixiToSkiaConverter {
  private graphicsRenderer: GraphicsRenderer;
  private spriteRenderer: SpriteRenderer;
  private canvasKit: CanvasKit;
  private canvas: Canvas | null = null;

  constructor(canvasKit: CanvasKit) {
    this.canvasKit = canvasKit;
    this.graphicsRenderer = new GraphicsRenderer(canvasKit);
    this.spriteRenderer = new SpriteRenderer(canvasKit);
  }

  async renderContainer(container: PIXI.Container, surface: Surface | PDFSurface): Promise<void> {
   
    
    const canvas = surface.getCanvas();
    console.log('surface', surface)
    // Очищаем белым цветом
    canvas.clear(this.canvasKit.WHITE);
    
    await this.renderDisplayObject(container, canvas);
    
    if ('flush' in surface) {
      surface.flush();
    }
  }

  private async renderDisplayObject(
    obj: PIXI.DisplayObject, 
    canvas: Canvas,
    parentTransform?: { x: number; y: number; rotation: number; scaleX: number; scaleY: number }
  ): Promise<void> {
    // Вычисляем трансформацию текущего объекта
    const transform = {
      x: obj.position.x,
      y: obj.position.y,
      rotation: obj.angle,
      scaleX: obj.scale.x,
      scaleY: obj.scale.y
    };
    
    // Комбинируем с родительской трансформацией

    console.log('parent transform', parentTransform)
    if (parentTransform) {
      transform.x += parentTransform.x;
      transform.y += parentTransform.y;
      transform.rotation += parentTransform.rotation;
      transform.scaleX *= parentTransform.scaleX;
      transform.scaleY *= parentTransform.scaleY;
    }

    console.log('transform', transform)
    // Рендерим в зависимости от типа объекта
    console.log('>>>>>name', obj.constructor.name);
    if (obj instanceof PIXI.Graphics) {
      this.graphicsRenderer.render(obj as PIXI.Graphics, canvas, transform);
    } else if (obj instanceof PIXI.Sprite) {
      await this.spriteRenderer.render(obj as PIXI.Sprite, canvas, transform);
    } else if (obj instanceof PIXI.Container) {
      for (const child of (obj as PIXI.Container).children) {
        console.log('>>>child', child.constructor.name);
        await this.renderDisplayObject(child, canvas, transform);
      }
    }
  }

  dispose(): void {
    this.spriteRenderer.clearCache();
  }
}