import type * as PIXI from 'pixi.js';
import type { CanvasKit, Canvas, Image } from 'canvaskit-wasm';

export class SpriteRenderer {
  private imageCache: Map<string, Image> = new Map();

  constructor(private canvasKit: CanvasKit) {}

  async render(sprite: PIXI.Sprite, skCanvas: Canvas, transform?: {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  }): Promise<void> {
    if (!sprite.texture || !sprite.texture.valid) return;

    skCanvas.save();
    
    // Применяем трансформации
    if (transform) {
      skCanvas.translate(transform.x, transform.y);
      skCanvas.rotate(transform.rotation * Math.PI / 180, 0, 0);
      skCanvas.scale(transform.scaleX, transform.scaleY);
    }

    // Получаем изображение
    const image = await this.getImageFromSprite(sprite);
    if (image) {
      const width = sprite.width;
      const height = sprite.height;
      skCanvas.drawImage(image, -width/2, -height/2);
    }
    
    skCanvas.restore();
  }

  private async getImageFromSprite(sprite: PIXI.Sprite): Promise<Image | null> {
    const texture = sprite.texture;
    const baseTexture = texture.baseTexture;
    const cacheKey = baseTexture.imageUrl || baseTexture.resource?.url || 'default';
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Получаем canvas из текстуры Pixi
    const source = baseTexture.resource?.source as HTMLImageElement | HTMLCanvasElement;
    if (!source) return null;

    try {
      // Создаем Image из источника
      const image = await this.canvasKit.MakeImageFromCanvasImageSource(source);
      if (image) {
        this.imageCache.set(cacheKey, image);
        return image;
      }
    } catch (error) {
      console.warn('Failed to load image:', error);
    }
    
    return null;
  }

  clearCache(): void {
    this.imageCache.forEach(img => img.delete());
    this.imageCache.clear();
  }
}